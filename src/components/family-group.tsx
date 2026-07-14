import { ReactNode } from "react"
import cx from "clsx"
import { Delta, Library } from "../lib/ncu"

export interface DecoratedLibrary {
  lib: Library
  included: boolean
  userSkipped: boolean
  filtered: boolean
  filterReason: string | null
  matchesFilter: boolean
}

interface FamilyGroupProps {
  groupKey: string
  label: string | null
  items: DecoratedLibrary[]
  collapsed: boolean
  onToggleCollapse: (groupKey: string) => void
  onBulk: (groupKey: string, action: "include" | "skip") => void
  children: ReactNode
}

// Collapsible band of cards that share a family (@types, react-*, eslint-*,
// etc). Header surfaces count, delta breakdown, and per-family bulk actions.
// The "__other" and "__all" keys render without a header so ungrouped
// packages don't grow a chrome they don't earn.
export default function FamilyGroup({
  groupKey,
  label,
  items,
  collapsed,
  onToggleCollapse,
  onBulk,
  children,
}: FamilyGroupProps) {
  const isHeaderless = groupKey === "__other" || groupKey === "__all"
  const isScope = !!label && label.startsWith("@")
  const total = items.length
  const included = items.filter((d) => d.included).length
  const counts = items.reduce<Partial<Record<Delta, number>>>((acc, d) => {
    acc[d.lib.delta] = (acc[d.lib.delta] || 0) + 1
    return acc
  }, {})
  return (
    <section
      className={cx("family", {
        "is-collapsed": collapsed,
        "is-headerless": isHeaderless,
      })}
      data-family={groupKey}
    >
      {!isHeaderless && (
        <header className="family-head">
          <button
            type="button"
            className="family-disclose"
            onClick={() => onToggleCollapse(groupKey)}
            aria-expanded={!collapsed}
            title={collapsed ? `Expand ${label}` : `Collapse ${label}`}
          >
            <span className="chev" aria-hidden="true">
              ▸
            </span>
            <span className="family-label">
              {label}
              {isScope && <span className="family-wild">{"/*"}</span>}
            </span>
            <span className="family-count">{total}</span>
          </button>
          <div className="family-deltas">
            {counts.major ? (
              <span className="chip major" title={`${counts.major} major`}>
                {counts.major} major
              </span>
            ) : null}
            {counts.minor ? (
              <span className="chip minor" title={`${counts.minor} minor`}>
                {counts.minor} minor
              </span>
            ) : null}
            {counts.patch ? (
              <span className="chip patch" title={`${counts.patch} patch`}>
                {counts.patch} patch
              </span>
            ) : null}
            <span className="family-included">
              {included}/{total} included
            </span>
          </div>
          <div className="family-bulk">
            <button
              className="ghost-btn"
              onClick={() => onBulk(groupKey, "include")}
              title={`Include all in ${label}`}
            >
              include all
            </button>
            <button
              className="ghost-btn"
              onClick={() => onBulk(groupKey, "skip")}
              title={`Skip all in ${label}`}
            >
              skip all
            </button>
          </div>
        </header>
      )}
      {!collapsed && <div className="lib-grid family-grid">{children}</div>}
    </section>
  )
}
