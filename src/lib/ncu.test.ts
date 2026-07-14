import { describe, it, expect } from "vitest"
import {
  assignFamilies,
  buildBlocks,
  extractVersion,
  parseNcuOutput,
  semverDelta,
  Library,
} from "./ncu"

describe("extractVersion", () => {
  it("strips range prefixes", () => {
    expect(extractVersion("^1.2.3")?.display).toEqual("1.2.3")
    expect(extractVersion("~1.2.3")?.display).toEqual("1.2.3")
  })

  it("supports partial versions", () => {
    expect(extractVersion("^4")).toMatchObject({ major: 4, minor: 0, patch: 0 })
    expect(extractVersion("^4.1")).toMatchObject({
      major: 4,
      minor: 1,
      patch: 0,
    })
    expect(extractVersion("^4.1")?.display).toEqual("4.1")
  })

  it("supports prerelease suffixes", () => {
    const v = extractVersion("7.0.0-dev.20260510.1")
    expect(v).toMatchObject({ major: 7, minor: 0, patch: 0 })
    expect(v?.pre).toEqual("dev.20260510.1")
  })

  it("unwraps npm: aliases, including scoped ones", () => {
    expect(extractVersion("npm:rolldown-vite@7.2.5")?.display).toEqual("7.2.5")
    expect(extractVersion("npm:@scope/pkg@1.2.3")?.display).toEqual("1.2.3")
  })

  it("rejects non-versions", () => {
    expect(extractVersion("found")).toBeNull()
    expect(extractVersion("")).toBeNull()
  })
})

describe("semverDelta", () => {
  const v = (s: string) => extractVersion(s)

  it("classifies deltas", () => {
    expect(semverDelta(v("1.0.0"), v("2.0.0"))).toEqual("major")
    expect(semverDelta(v("1.0.0"), v("1.1.0"))).toEqual("minor")
    expect(semverDelta(v("1.0.0"), v("1.0.1"))).toEqual("patch")
    expect(semverDelta(v("4"), v("4"))).toEqual("patch")
  })
})

describe("assignFamilies", () => {
  const lib = (name: string): Library => ({
    name,
    from: "1.0.0",
    to: "1.0.1",
    fromVersion: extractVersion("1.0.0")!,
    toVersion: extractVersion("1.0.1")!,
    delta: "patch",
    family: null,
  })

  it("groups @types with the typed package", () => {
    const libs = assignFamilies([lib("react"), lib("@types/react")])
    expect(libs.map((l) => l.family)).toEqual(["react", "react"])
  })

  it("resolves scoped @types (double underscore) to the scope", () => {
    const libs = assignFamilies([lib("@types/babel__core")])
    expect(libs[0].family).toEqual("@babel")
  })

  it("groups scoped packages by scope", () => {
    const libs = assignFamilies([
      lib("@radix-ui/react-dialog"),
      lib("@radix-ui/react-popover"),
    ])
    expect(libs.map((l) => l.family)).toEqual(["@radix-ui", "@radix-ui"])
  })

  it("groups plugins with their tool", () => {
    const libs = assignFamilies([lib("eslint"), lib("eslint-plugin-react")])
    expect(libs.map((l) => l.family)).toEqual(["eslint", "eslint"])
  })

  it("leaves standalone packages without a family", () => {
    const libs = assignFamilies([lib("axios"), lib("react")])
    expect(libs.map((l) => l.family)).toEqual([null, null])
  })
})

describe("parseNcuOutput", () => {
  it("skips noise lines without errors", () => {
    const { libraries, errors } = parseNcuOutput(`Checking package.json
[====================] 21/21 100%

 react  ^16.8.6  →  ^17.0.1

Run npx npm-check-updates -u to upgrade`)
    expect(errors).toHaveLength(0)
    expect(libraries.map((l) => l.name)).toEqual(["react"])
  })

  it("reports malformed rows individually", () => {
    const { libraries, errors } = parseNcuOutput(` react  ^16.8.6  →  ^17.0.1
 broken  ^1.0.0  →`)
    expect(libraries).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(errors[0].line).toEqual(2)
  })

  it("dedupes by name, last wins", () => {
    const { libraries } = parseNcuOutput(` react  ^16.0.0  →  ^17.0.0
 react  ^16.0.0  →  ^18.0.0`)
    expect(libraries).toHaveLength(1)
    expect(libraries[0].toVersion.display).toEqual("18.0.0")
  })
})

describe("buildBlocks", () => {
  const libs = () =>
    parseNcuOutput(` react       ^16.8.6  →  ^17.0.1
 react-dom   ^16.8.6  →  ^17.0.1
 typescript  ^3.5.3   →  ^4.1.2`).libraries

  const opts = {
    pm: "npm" as const,
    deep: false,
    bumpLockfile: false,
    joiner: "&&" as const,
    commitMode: "package" as const,
  }

  it("builds one block per package by default", () => {
    const blocks = buildBlocks(libs(), opts)
    expect(blocks).toHaveLength(3)
    expect(blocks[0].lines[0]).toEqual("npx npm-check-updates -u react")
    expect(blocks[0].text).toEqual(
      `npx npm-check-updates -u react && \\\nnpm i && \\\ngit add -A && \\\ngit commit -m "chore(deps): bump react to 17.0.1"`
    )
  })

  it("names small family commits after their members", () => {
    const blocks = buildBlocks(libs(), { ...opts, commitMode: "family" })
    expect(blocks).toHaveLength(2)
    expect(blocks[0].lines[3]).toEqual(
      'git commit -m "chore(deps): bump react, react-dom"'
    )
  })

  it("appends a lockfile block when asked", () => {
    const blocks = buildBlocks(libs(), { ...opts, bumpLockfile: true })
    expect(blocks).toHaveLength(4)
    expect(blocks[3].kind).toEqual("lockfile")
    expect(blocks[3].lines[0]).toEqual("rm package-lock.json")
  })
})
