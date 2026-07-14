// ncu output parser + command builder.
// Parses `npx npm-check-updates` output into {name, from, to, delta} entries,
// detects package "families" (react + react-dom + @types/react, @scope/*,
// eslint-plugin-*, …), and chunks the included libraries into commit blocks.

export type Delta = "patch" | "minor" | "major"

export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  pre: string
  display: string
}

export interface Library {
  name: string
  from: string
  to: string
  fromVersion: ParsedVersion
  toVersion: ParsedVersion
  delta: Delta
  family: string | null
}

export interface ParseError {
  line: number
  content: string
  message: string
}

export interface ParseResult {
  libraries: Library[]
  errors: ParseError[]
}

export type PackageManager = "npm" | "yarn" | "yarnb" | "pnpm" | "bun"
export type CommitMode = "package" | "family" | "bundle"
export type Joiner = "&&" | ";"

export const PM_META: Record<
  PackageManager,
  { label: string; install: string; lockfile: string }
> = {
  npm: { label: "npm", install: "npm i", lockfile: "package-lock.json" },
  yarn: { label: "yarn", install: "yarn", lockfile: "yarn.lock" },
  yarnb: {
    label: "yarn berry",
    install: "yarn install",
    lockfile: "yarn.lock",
  },
  pnpm: { label: "pnpm", install: "pnpm install", lockfile: "pnpm-lock.yaml" },
  bun: { label: "bun", install: "bun install", lockfile: "bun.lockb" },
}

const NOISE_PATTERNS = [
  /^Run npx npm-check-updates/i,
  /^Checking\b/i,
  /^All dependencies match/i,
  /^No dependencies\./i,
  /^Not found/i,
  /^\s*\[=+\]?\s*\d/, // progress bar lines
  /^\s*$/,
]

const ARROW = /(?:→|->|=>)/

export function extractVersion(raw: string): ParsedVersion | null {
  if (!raw) return null
  let v = String(raw).trim()
  // npm: alias form, e.g. npm:rolldown-vite@7.2.5 or npm:@scope/pkg@1.2.3
  const npmM = v.match(/^npm:(.+)@([^@]+)$/)
  if (npmM) v = npmM[2]
  v = v.replace(/^[\^~>=<\s]+/, "")
  // Minor/patch are optional so partial ranges like ^4 and ^4.1 still parse.
  const m = v.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?([-+].*)?$/)
  if (!m) return null
  return {
    major: +m[1],
    minor: +(m[2] ?? 0),
    patch: +(m[3] ?? 0),
    pre: (m[4] || "").replace(/^[-+]/, ""),
    display: v,
  }
}

export function semverDelta(
  from: ParsedVersion | null,
  to: ParsedVersion | null
): Delta {
  if (!from || !to) return "patch"
  if (to.major !== from.major) return "major"
  if (to.minor !== from.minor) return "minor"
  if (to.patch !== from.patch) return "patch"
  return "patch"
}

export function parseNcuOutput(text: string): ParseResult {
  if (!text) return { libraries: [], errors: [] }
  const lines = String(text).split("\n")
  const byName = new Map<string, Library>()
  const errors: ParseError[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (NOISE_PATTERNS.some((re) => re.test(line.trim()))) continue
    if (!ARROW.test(line)) continue

    const parts = line.trim().split(/\s+/)
    const arrowIdx = parts.findIndex((p) => ARROW.test(p))
    if (arrowIdx < 1 || arrowIdx >= parts.length - 1) {
      errors.push({
        line: i + 1,
        content: line,
        message: "Expected `name  from  →  to`",
      })
      continue
    }
    const name =
      parts
        .slice(0, arrowIdx - 1)
        .join(" ")
        .trim() || parts[0]
    const fromRaw = parts[arrowIdx - 1]
    const toRaw = parts[arrowIdx + 1]

    const fromVersion = extractVersion(fromRaw)
    const toVersion = extractVersion(toRaw)
    if (!fromVersion || !toVersion) {
      errors.push({
        line: i + 1,
        content: line,
        message: "Could not parse version numbers",
      })
      continue
    }

    byName.set(name, {
      name,
      from: fromRaw,
      to: toRaw,
      fromVersion,
      toVersion,
      delta: semverDelta(fromVersion, toVersion),
      family: null,
    })
  }

  return { libraries: assignFamilies([...byName.values()]), errors }
}

// ─────────────────────────────────────────────────────────────────────────
// Family detection: groups related packages that typically move together.
//
//   react, react-dom, @types/react   → family "react"
//   @radix-ui/dialog, @radix-ui/...  → family "@radix-ui"  (scope grouping)
//   eslint, eslint-plugin-react      → family "eslint"     (plugin convention)
//   axios (alone)                    → null                (→ "Other")
//
// `@types/X` is not its own family — it's a wrapper. Unwrap to the typed
// package's name and compute family from there.
// ─────────────────────────────────────────────────────────────────────────
export function assignFamilies(libs: Library[]): Library[] {
  // @types/X → X. Scoped types use double-underscore: @types/foo__bar → @foo/bar.
  const baseOf = (name: string): string => {
    if (name.startsWith("@types/")) {
      let inner = name.slice("@types/".length)
      if (inner.includes("__")) inner = "@" + inner.replace("__", "/")
      return inner
    }
    return name
  }

  // First token of a base name (for shared-prefix detection).
  // For scoped non-@types packages, the "token" is the scope itself.
  const firstTokenOf = (name: string): string => {
    const scopeM = name.match(/^(@[^/]+)\//)
    if (scopeM) return scopeM[1]
    return name.split(/[-.]/)[0]
  }

  // Count first tokens across the *resolved bases*, so @types/react
  // contributes to the "react" count even when the base name differs.
  const counts = new Map<string, number>()
  const bases = libs.map((l) => baseOf(l.name))
  for (const base of bases) {
    const tok = firstTokenOf(base)
    counts.set(tok, (counts.get(tok) || 0) + 1)
  }

  libs.forEach((lib, i) => {
    const base = bases[i]

    // Scoped (non-@types) package: family is the scope.
    const scopeM = base.match(/^(@[^/]+)\//)
    if (scopeM) {
      lib.family = scopeM[1]
      return
    }

    // Plugin / config / preset / loader naming convention:
    // `eslint-plugin-react` → "eslint", `babel-preset-env` → "babel".
    const pluginM = base.match(
      /^([a-z]{2,})-(?:plugin|config|preset|loader|transform|reporter)(?:[-.]|$)/i
    )
    if (pluginM) {
      lib.family = pluginM[1].toLowerCase()
      return
    }

    // Shared first token (must have 2+ members to count).
    const tok = firstTokenOf(base)
    if ((counts.get(tok) || 0) >= 2 && tok.length >= 2) {
      lib.family = tok
      return
    }

    lib.family = null
  })

  return libs
}

export interface Block {
  kind: "packages" | "lockfile"
  libs: Library[]
  family: string | null
  isMulti: boolean
  isBundle: boolean
  delta: Delta
  lines: string[]
  text: string
  joiner: Joiner
}

export interface BuildOptions {
  pm: PackageManager
  deep: boolean
  bumpLockfile: boolean
  joiner: Joiner
  commitMode: CommitMode
}

export function blockKey(block: Block): string {
  if (block.kind === "lockfile") return "__lockfile"
  if (block.isBundle) return "__bundle"
  if (block.isMulti) return `__family:${block.family || block.libs[0].name}`
  return block.libs[0].name
}

const DELTA_RANK: Record<Delta, number> = { patch: 1, minor: 2, major: 3 }

// `;` attaches to the command like punctuation; `&&` stands apart.
export const joinerSep = (joiner: Joiner): string =>
  joiner === ";" ? ";" : ` ${joiner}`

export function buildBlocks(libs: Library[], opts: BuildOptions): Block[] {
  const { pm, deep, bumpLockfile, joiner, commitMode } = opts
  const meta = PM_META[pm] || PM_META.npm
  const deepFlag = deep ? " --deep" : ""

  // Backslash-newline continuations: visually multi-line, pastes as one
  // logical command in bash/zsh/fish. The joiner (&& or ;) sits before the
  // backslash so semantics still chain on success/regardless of failure.
  const sep = joinerSep(joiner)
  const toText = (lines: string[]): string =>
    lines
      .map((ln, i) => (i < lines.length - 1 ? `${ln}${sep} \\` : ln))
      .join("\n")

  // Chunk the included libs into commit blocks:
  //   'package' — one block per lib (atomic, matches the legacy behavior)
  //   'family'  — one block per family; standalone libs stay solo
  //   'bundle'  — one block for everything included
  interface Chunk {
    family: string | null
    libs: Library[]
    bundle?: boolean
  }
  let chunks: Chunk[]
  if (commitMode === "bundle" && libs.length > 0) {
    chunks = [{ family: null, libs: [...libs], bundle: true }]
  } else if (commitMode === "family") {
    const order: string[] = []
    const map = new Map<string, Chunk>()
    for (const lib of libs) {
      const key = lib.family || `__solo:${lib.name}`
      if (!map.has(key)) {
        map.set(key, { family: lib.family, libs: [] })
        order.push(key)
      }
      map.get(key)!.libs.push(lib)
    }
    chunks = order.map((k) => map.get(k)!)
  } else {
    chunks = libs.map((lib) => ({ family: null, libs: [lib] }))
  }

  const peakDelta = (chunkLibs: Library[]): Delta =>
    chunkLibs.reduce<Delta>(
      (peak, l) => (DELTA_RANK[l.delta] > DELTA_RANK[peak] ? l.delta : peak),
      "patch"
    )

  const blocks: Block[] = chunks.map((chunk) => {
    const { family, libs: chunkLibs, bundle } = chunk
    const isMulti = chunkLibs.length > 1
    const names = chunkLibs.map((l) => l.name).join(" ")

    let commitMsg: string
    if (bundle) {
      commitMsg = `chore(deps): bump ${chunkLibs.length} packages`
    } else if (!isMulti) {
      const lib = chunkLibs[0]
      commitMsg = `chore(deps): bump ${lib.name} to ${lib.toVersion.display}`
    } else if (chunkLibs.length <= 3) {
      commitMsg = `chore(deps): bump ${chunkLibs.map((l) => l.name).join(", ")}`
    } else {
      commitMsg = `chore(deps): bump ${family} family (${chunkLibs.length} packages)`
    }

    const lines = [
      `npx npm-check-updates -u ${names}${deepFlag}`,
      meta.install,
      `git add -A`,
      `git commit -m "${commitMsg}"`,
    ]
    return {
      kind: "packages",
      libs: chunkLibs,
      family,
      isMulti,
      isBundle: !!bundle,
      delta: peakDelta(chunkLibs),
      lines,
      text: toText(lines),
      joiner,
    }
  })

  if (bumpLockfile && blocks.length) {
    const lines = [
      `rm ${meta.lockfile}`,
      meta.install,
      `git add -A`,
      `git commit -m "chore(deps): bump lockfile"`,
    ]
    blocks.push({
      kind: "lockfile",
      libs: [],
      family: null,
      isMulti: false,
      isBundle: false,
      delta: "patch",
      lines,
      text: toText(lines),
      joiner,
    })
  }
  return blocks
}

export const SAMPLE_INPUT = `Checking package.json
[====================] 21/21 100%

 react                 ^16.8.6                    →   ^17.0.1
 react-dom             ^16.8.6                    →   ^17.0.1
 react-router          ^5.3.0                     →   ^6.20.0
 @types/react          ^16.9.0                    →   ^17.0.0
 @types/react-dom      ^16.9.0                    →   ^17.0.0
 @types/node           ^18.0.0                    →   ^22.0.0
 lodash                ^4.17.0                    →   ^4.17.21
 @types/lodash         ^4.14.0                    →   ^4.17.0
 @radix-ui/react-dialog  ^1.0.4                   →   ^1.1.2
 @radix-ui/react-popover ^1.0.5                   →   ^1.1.2
 eslint                ^8.0.0                     →   ^9.0.0
 eslint-plugin-react   ^7.32.0                    →   ^7.34.0
 eslint-plugin-import  ^2.27.0                    →   ^2.29.0
 typescript            ^3.5.3                     →   ^4.1.2
 vite                  ^5.4.0                     →   ^7.0.0
 storybook             ^7.6.20                    →   ^9.0.0-alpha.32
 prettier              ^2.8.0                     →   ^3.0.0
 zod                   ^3.20.0                    →   ^3.22.4
 framer-motion         ^10.16.0                   →   ^11.0.0
 axios                 ^1.5.0                     →   ^1.7.0

Run npx npm-check-updates -u to upgrade`
