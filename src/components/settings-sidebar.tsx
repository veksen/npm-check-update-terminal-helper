import { CommitMode, Joiner } from "../lib/ncu"
import { Density, Theme, THEME_META, DENSITIES } from "../theme"

export type UpgradeVersion = "major" | "minor" | "patch"
export type BulkAction = "skip-major" | "skip-types" | "invert" | "reset"

interface SettingsSidebarProps {
  upgradeVersion: UpgradeVersion
  setUpgradeVersion: (v: UpgradeVersion) => void
  filter: string
  setFilter: (v: string) => void
  deep: boolean
  setDeep: (v: boolean) => void
  bumpLockfile: boolean
  setBumpLockfile: (v: boolean) => void
  joiner: Joiner
  setJoiner: (v: Joiner) => void
  groupingOn: boolean
  setGroupingOn: (v: boolean) => void
  commitMode: CommitMode
  setCommitMode: (v: CommitMode) => void
  onBulkAction: (kind: BulkAction) => void
  skippedCount: number
  totalCount: number
  theme: Theme
  setTheme: (v: Theme) => void
  density: Density
  setDensity: (v: Density) => void
}

const COMMIT_MODES: { v: CommitMode; label: string; hint: string }[] = [
  {
    v: "package",
    label: "one per package",
    hint: "one commit per dep — atomic, slow",
  },
  {
    v: "family",
    label: "one per family",
    hint: "related deps bump in lockstep",
  },
  {
    v: "bundle",
    label: "one for all",
    hint: "a single commit with everything",
  },
]

// Upgrade ceiling, filter, grouping, commit strategy, bulk actions,
// run options, chaining, summary, appearance.
export default function SettingsSidebar({
  upgradeVersion,
  setUpgradeVersion,
  filter,
  setFilter,
  deep,
  setDeep,
  bumpLockfile,
  setBumpLockfile,
  joiner,
  setJoiner,
  groupingOn,
  setGroupingOn,
  commitMode,
  setCommitMode,
  onBulkAction,
  skippedCount,
  totalCount,
  theme,
  setTheme,
  density,
  setDensity,
}: SettingsSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="side-sec">
        <h3>Upgrade ceiling</h3>
        <div className="seg" role="radiogroup" aria-label="Upgrade ceiling">
          {(["major", "minor", "patch"] as const).map((v) => (
            <button
              key={v}
              role="radio"
              aria-selected={upgradeVersion === v}
              data-testid={`radio-${v}`}
              onClick={() => setUpgradeVersion(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="hint">
          Only allows bumps up to this delta. Higher-delta packages stay visible
          but auto-skip.
        </div>
      </div>

      <div className="side-sec">
        <h3>Filter</h3>
        <input
          type="text"
          className="filter-input"
          placeholder="filter by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-testid="filter-by-name"
        />
      </div>

      <div className="side-sec">
        <h3>Grouping</h3>
        <label className="check-row">
          <input
            type="checkbox"
            checked={groupingOn}
            onChange={(e) => setGroupingOn(e.target.checked)}
          />
          Group by family
        </label>
        <div className="hint">
          Folds <code>@types/*</code>, <code>react-*</code>,{" "}
          <code>eslint-*</code>, etc. into collapsible bands.
        </div>
      </div>

      <div className="side-sec">
        <h3>Commit strategy</h3>
        <div className="commit-mode">
          {COMMIT_MODES.map((opt) => (
            <label
              key={opt.v}
              className={`commit-opt ${commitMode === opt.v ? "is-on" : ""}`}
            >
              <input
                type="radio"
                name="commit-mode"
                value={opt.v}
                checked={commitMode === opt.v}
                onChange={() => setCommitMode(opt.v)}
              />
              <span className="commit-opt-label">{opt.label}</span>
              <span className="commit-opt-hint">{opt.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="side-sec">
        <h3>Bulk actions</h3>
        <div className="bulk">
          <button onClick={() => onBulkAction("skip-major")}>
            ⊘ Skip all majors
          </button>
          <button onClick={() => onBulkAction("skip-types")}>
            ⊘ Skip @types/*
          </button>
          <button onClick={() => onBulkAction("invert")}>
            ↕ Invert selection
          </button>
          <button onClick={() => onBulkAction("reset")}>
            ↻ Reset (include all)
          </button>
        </div>
      </div>

      <div className="side-sec">
        <h3>Run options</h3>
        <label className="check-row">
          <input
            type="checkbox"
            checked={deep}
            onChange={(e) => setDeep(e.target.checked)}
            data-testid="deep"
          />
          Recursive (<code>--deep</code>)
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={bumpLockfile}
            onChange={(e) => setBumpLockfile(e.target.checked)}
            data-testid="bump-lockfile"
          />
          Rebuild lockfile after
        </label>
      </div>

      <div className="side-sec">
        <h3>Chain on</h3>
        <div className="seg" role="radiogroup" aria-label="Command chaining">
          <button
            aria-selected={joiner === "&&"}
            data-testid="joiner-and"
            onClick={() => setJoiner("&&")}
          >
            &amp;&amp;
          </button>
          <button
            aria-selected={joiner === ";"}
            data-testid="joiner-semi"
            onClick={() => setJoiner(";")}
          >
            ;
          </button>
        </div>
        <div className="hint">
          <code>&amp;&amp;</code> stops on first failure (recommended).{" "}
          <code>;</code> keeps going and matches the legacy behavior.
        </div>
      </div>

      <div className="side-sec">
        <h3>Summary</h3>
        <div className="kvs">
          <span>
            <b>{totalCount - skippedCount}</b> included
          </span>
          <span>
            <b>{skippedCount}</b> skipped
          </span>
          <span>
            <b>{totalCount}</b> total
          </span>
        </div>
      </div>

      <div className="side-sec">
        <h3>Appearance</h3>
        <div className="seg" role="radiogroup" aria-label="Theme">
          {(Object.keys(THEME_META) as Theme[]).map((v) => (
            <button
              key={v}
              role="radio"
              aria-selected={theme === v}
              title={THEME_META[v].blurb}
              onClick={() => setTheme(v)}
            >
              {THEME_META[v].label}
            </button>
          ))}
        </div>
        <div className="seg" role="radiogroup" aria-label="Density">
          {DENSITIES.map((v) => (
            <button
              key={v}
              role="radio"
              aria-selected={density === v}
              onClick={() => setDensity(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
