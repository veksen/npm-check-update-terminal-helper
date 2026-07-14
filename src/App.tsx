/// <reference types="vite-plugin-svgr/client" />

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildBlocks,
  blockKey,
  joinerSep,
  parseNcuOutput,
  CommitMode,
  Delta,
  Joiner,
  PackageManager,
  PM_META,
  SAMPLE_INPUT,
} from "./lib/ncu"
import { Density, Theme } from "./theme"
import { useLocalStorage } from "./useLocalStorage"
import { useCopy } from "./useCopy"
import PasteInput from "./components/paste-input"
import LibraryCard from "./components/library-card"
import FamilyGroup, { DecoratedLibrary } from "./components/family-group"
import SettingsSidebar, {
  UpgradeVersion,
  BulkAction,
} from "./components/settings-sidebar"
import OutputBlock from "./components/output-block"
import GitHub from "./github.svg?react"

const RANK: Record<Delta, number> = { patch: 1, minor: 2, major: 3 }

// The skip list lives under both keys: `skippedLibs` (current) and
// `ignoredLibs` (legacy). They're semantically identical — the inversion was
// in the old UI, not in storage — so returning users keep their list and a
// rollback wouldn't surprise anyone.
function useSkippedLibs(): [
  string[],
  (update: (prev: string[]) => string[]) => void,
] {
  const [skipped, setSkipped] = useState<string[]>(() => {
    try {
      const next = window.localStorage.getItem("skippedLibs")
      if (next !== null) return JSON.parse(next)
      const legacy = window.localStorage.getItem("ignoredLibs")
      if (legacy !== null) return JSON.parse(legacy)
    } catch (error) {
      console.error(error)
    }
    return []
  })
  const set = useCallback((update: (prev: string[]) => string[]) => {
    setSkipped((prev) => {
      const value = update(prev)
      try {
        window.localStorage.setItem("skippedLibs", JSON.stringify(value))
        window.localStorage.setItem("ignoredLibs", JSON.stringify(value))
      } catch (error) {
        console.error(error)
      }
      return value
    })
  }, [])
  return [skipped, set]
}

interface Group {
  key: string
  label: string | null
  items: DecoratedLibrary[]
}

function App() {
  const [input, setInput] = useLocalStorage("ncuInput", "")
  const [skippedLibs, setSkippedLibs] = useSkippedLibs()
  const [upgradeVersion, setUpgradeVersion] = useLocalStorage<UpgradeVersion>(
    "upgradeVersion",
    "major"
  )
  const [filter, setFilter] = useState("")
  const [deep, setDeep] = useLocalStorage("deep", false)
  const [bumpLockfile, setBumpLockfile] = useLocalStorage("bumpLockfile", false)
  const [pm, setPm] = useLocalStorage<PackageManager>("packageManager", "npm")
  const [joiner, setJoiner] = useLocalStorage<Joiner>("joiner", "&&")
  const [groupingOn, setGroupingOn] = useLocalStorage("groupByFamily", true)
  const [collapsedFamilies, setCollapsedFamilies] = useLocalStorage<string[]>(
    "collapsedFamilies",
    []
  )
  const [commitMode, setCommitMode] = useLocalStorage<CommitMode>(
    "commitMode",
    "package"
  )
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "clean")
  const [density, setDensity] = useLocalStorage<Density>("density", "compact")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.setAttribute("data-density", density)
  }, [theme, density])

  const parsed = useMemo(() => parseNcuOutput(input), [input])
  const libs = parsed.libraries
  const errors = parsed.errors

  const filterLower = filter.trim().toLowerCase()
  const ceilingRank = RANK[upgradeVersion]

  const decorated = useMemo<DecoratedLibrary[]>(
    () =>
      libs.map((lib) => {
        const matchesFilter =
          !filterLower || lib.name.toLowerCase().includes(filterLower)
        const ceilingOk = RANK[lib.delta] <= ceilingRank
        const userSkipped = skippedLibs.includes(lib.name)
        const filterReason = !matchesFilter
          ? "Hidden by filter"
          : !ceilingOk
            ? `Exceeds ${upgradeVersion} ceiling (${lib.delta} bump)`
            : null
        const included = !userSkipped && !filterReason
        return {
          lib,
          included,
          userSkipped,
          filtered: !!filterReason,
          filterReason,
          matchesFilter,
        }
      }),
    [libs, filterLower, ceilingRank, skippedLibs, upgradeVersion]
  )

  const visible = useMemo(
    () => decorated.filter((d) => d.matchesFilter),
    [decorated]
  )
  const included = useMemo(
    () => decorated.filter((d) => d.included).map((d) => d.lib),
    [decorated]
  )

  // Group visible cards by family (or render as a single flat group).
  const groups = useMemo<Group[]>(() => {
    if (!groupingOn) {
      return [{ key: "__all", label: null, items: visible }]
    }
    // Demote single-member families into __other so the page doesn't fragment.
    const counts = new Map<string, number>()
    visible.forEach((d) => {
      const f = d.lib.family || "__other"
      counts.set(f, (counts.get(f) || 0) + 1)
    })
    const order: string[] = []
    const map = new Map<string, DecoratedLibrary[]>()
    visible.forEach((d) => {
      const raw = d.lib.family || "__other"
      const key =
        raw !== "__other" && (counts.get(raw) || 0) < 2 ? "__other" : raw
      if (!map.has(key)) {
        map.set(key, [])
        order.push(key)
      }
      map.get(key)!.push(d)
    })
    const otherIdx = order.indexOf("__other")
    if (otherIdx >= 0) {
      order.splice(otherIdx, 1)
      order.push("__other")
    }
    return order.map((key) => ({
      key,
      label: key === "__other" ? "Other" : key,
      items: map.get(key)!,
    }))
  }, [visible, groupingOn])

  const blocks = useMemo(
    () => buildBlocks(included, { pm, deep, bumpLockfile, joiner, commitMode }),
    [included, pm, deep, bumpLockfile, joiner, commitMode]
  )

  // Master "Copy all" — chain blocks together with the same continuation
  // syntax so the entire script pastes as a single multi-line command.
  const allText = useMemo(() => {
    if (!blocks.length) return ""
    return blocks
      .map((b, i) =>
        i < blocks.length - 1 ? `${b.text}${joinerSep(joiner)} \\` : b.text
      )
      .join("\n")
  }, [blocks, joiner])
  const oneLiner = useMemo(
    // Strip backslash-newline continuations and collapse to a true one-liner.
    () => allText.replace(/\s*\\\n\s*/g, " "),
    [allText]
  )

  const setIncluded = useCallback(
    (name: string, includeNow: boolean) => {
      setSkippedLibs((prev) =>
        includeNow
          ? prev.filter((n) => n !== name)
          : [...new Set([...prev, name])]
      )
    },
    [setSkippedLibs]
  )

  const handleBulk = useCallback(
    (kind: BulkAction) => {
      if (kind === "reset") return setSkippedLibs(() => [])
      if (kind === "invert") {
        const all = libs.map((l) => l.name)
        return setSkippedLibs((prev) => all.filter((n) => !prev.includes(n)))
      }
      if (kind === "skip-major") {
        const adds = libs.filter((l) => l.delta === "major").map((l) => l.name)
        return setSkippedLibs((prev) => [...new Set([...prev, ...adds])])
      }
      if (kind === "skip-types") {
        const adds = libs
          .filter((l) => l.name.startsWith("@types/"))
          .map((l) => l.name)
        return setSkippedLibs((prev) => [...new Set([...prev, ...adds])])
      }
    },
    [libs, setSkippedLibs]
  )

  const handleFamilyBulk = useCallback(
    (familyKey: string, action: "include" | "skip") => {
      const names = libs
        .filter((l) => (l.family || "__other") === familyKey)
        .map((l) => l.name)
      if (action === "skip") {
        setSkippedLibs((prev) => [...new Set([...prev, ...names])])
      } else {
        setSkippedLibs((prev) => prev.filter((n) => !names.includes(n)))
      }
    },
    [libs, setSkippedLibs]
  )

  const toggleFamilyCollapse = useCallback(
    (familyKey: string) => {
      setCollapsedFamilies((prev) =>
        prev.includes(familyKey)
          ? prev.filter((k) => k !== familyKey)
          : [...prev, familyKey]
      )
    },
    [setCollapsedFamilies]
  )

  const { copy, flash } = useCopy()

  const majorCount = decorated.filter((d) => d.lib.delta === "major").length
  const minorCount = decorated.filter((d) => d.lib.delta === "minor").length
  const patchCount = decorated.filter((d) => d.lib.delta === "patch").length
  const commitCount = blocks.filter((b) => b.kind !== "lockfile").length

  return (
    <div className="app">
      <header className="app-hd">
        <div className="brand">
          <a
            className="brand-mark"
            href="https://www.npmjs.com/package/npm-check-updates"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="brand-mark-glyph" aria-hidden="true">
              ↑
            </span>
            <span>ncu</span>
          </a>
          <div className="brand-text">
            <h1 className="brand-title">npm-check-updates helper</h1>
            <div className="brand-sub">
              Paste <code>ncu</code> output → get a runnable upgrade script with
              one commit per package, family, or batch.
            </div>
          </div>
        </div>
        <div className="hd-right">
          <div className="hd-stats">
            <div className="hd-stat">
              <b>{libs.length}</b>
              <span>detected</span>
            </div>
            <div className="hd-stat">
              <b>{included.length}</b>
              <span>included</span>
            </div>
            <div className="hd-stat">
              <b>{commitCount}</b>
              <span>{commitCount === 1 ? "commit" : "commits"}</span>
            </div>
          </div>
          <div className="pmbar">
            <label>Package manager</label>
            <div className="seg" role="radiogroup" aria-label="Package manager">
              {(Object.keys(PM_META) as PackageManager[]).map((key) => (
                <button
                  key={key}
                  role="radio"
                  data-testid={`radio-${key}`}
                  aria-selected={pm === key}
                  onClick={() => setPm(key)}
                >
                  {PM_META[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Step 1: Paste ── */}
      <div className="step">
        <span className="step-num">1</span>
        <h2>Paste ncu output</h2>
        <span className="step-meta">
          {libs.length} parsed
          {errors.length ? ` · ${errors.length} errors` : ""}
        </span>
      </div>
      <PasteInput
        value={input}
        onChange={setInput}
        errors={errors}
        deep={deep}
        onLoadSample={() => setInput(SAMPLE_INPUT)}
        onClear={() => setInput("")}
      />

      {/* ── Step 2: Review ── */}
      <div className="step">
        <span className="step-num">2</span>
        <h2>
          Review{" "}
          {libs.length > 0
            ? `${included.length} of ${libs.length} upgrades`
            : "upgrades"}
        </h2>
        {libs.length > 0 && (
          <span className="step-meta">
            {majorCount} major · {minorCount} minor · {patchCount} patch
          </span>
        )}
      </div>

      <div className="review">
        {libs.length === 0 ? (
          <div className="review-empty">
            Paste your <code>npx npm-check-updates</code> output above to see
            detected upgrades.
          </div>
        ) : (
          <div className="family-stack">
            {groups.map((g) => {
              const isOther = g.key === "__other" || g.key === "__all"
              const collapsed = collapsedFamilies.includes(g.key) && !isOther
              return (
                <FamilyGroup
                  key={g.key}
                  groupKey={g.key}
                  label={g.label}
                  items={g.items}
                  collapsed={collapsed}
                  onToggleCollapse={toggleFamilyCollapse}
                  onBulk={handleFamilyBulk}
                >
                  {g.items.map(
                    ({ lib, included: inc, filtered, filterReason }) => (
                      <LibraryCard
                        key={lib.name}
                        lib={lib}
                        included={inc}
                        filtered={filtered}
                        filterReason={filterReason}
                        onToggle={(v) => setIncluded(lib.name, v)}
                      />
                    )
                  )}
                </FamilyGroup>
              )
            })}
          </div>
        )}
        <SettingsSidebar
          upgradeVersion={upgradeVersion}
          setUpgradeVersion={setUpgradeVersion}
          filter={filter}
          setFilter={setFilter}
          deep={deep}
          setDeep={setDeep}
          bumpLockfile={bumpLockfile}
          setBumpLockfile={setBumpLockfile}
          joiner={joiner}
          setJoiner={setJoiner}
          groupingOn={groupingOn}
          setGroupingOn={setGroupingOn}
          commitMode={commitMode}
          setCommitMode={setCommitMode}
          onBulkAction={handleBulk}
          skippedCount={libs.length - included.length}
          totalCount={libs.length}
          theme={theme}
          setTheme={setTheme}
          density={density}
          setDensity={setDensity}
        />
      </div>

      {/* ── Step 3: Run ── */}
      <div className="run-head">
        <span className="step-num">3</span>
        <h2>Run</h2>
        <span className="total-tag">
          {blocks.length} {blocks.length === 1 ? "block" : "blocks"} ·{" "}
          {PM_META[pm].label}
        </span>
        <div className="run-actions">
          <button
            className="primary-btn"
            disabled={!blocks.length}
            onClick={() => copy(allText, "__all")}
            data-testid="copy-all"
          >
            {flash === "__all" ? "✓ copied" : "⧉ Copy all"}
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="review-empty">
          Include at least one library above to generate commands.
        </div>
      ) : (
        <>
          <div className="blocks">
            {blocks.map((b, idx) => (
              <OutputBlock
                key={`${blockKey(b)}-${idx}`}
                block={b}
                onCopy={copy}
                flashedKey={flash}
              />
            ))}
          </div>
          <details className="disclosure">
            <summary>Show as one-liner</summary>
            <pre data-testid="output">{oneLiner}</pre>
          </details>
        </>
      )}

      <footer className="app-ft">
        <a
          href="https://github.com/veksen/npm-check-update-terminal-helper"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub aria-hidden="true" />
          <span>Source on GitHub</span>
        </a>
      </footer>
    </div>
  )
}

export default App
