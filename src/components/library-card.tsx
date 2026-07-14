import { KeyboardEvent, MouseEvent } from "react"
import cx from "clsx"
import { Library } from "../lib/ncu"

interface LibraryCardProps {
  lib: Library
  included: boolean
  filtered: boolean
  filterReason: string | null
  onToggle: (include: boolean) => void
}

// Diff-style card: name + delta chip, from/to version rows, Include/Skip.
export default function LibraryCard({
  lib,
  included,
  filtered,
  filterReason,
  onToggle,
}: LibraryCardProps) {
  // Short prerelease tag (rc, alpha, beta, dev…) surfaced on the new-version row.
  const toTag = (lib.toVersion.pre || "").split(/[.\-+]/)[0] || ""
  const clickable = !filtered
  const handleToggle = () => onToggle(!included)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      handleToggle()
    }
  }
  // Don't fire the card toggle if the user is selecting text.
  const onCardClick = () => {
    if (!clickable) return
    const sel = window.getSelection?.()?.toString()
    if (sel && sel.length > 0) return
    handleToggle()
  }
  return (
    <div
      className={cx("lib", included ? "is-included" : "is-skipped", {
        filtered,
        "is-clickable": clickable,
      })}
      data-testid="library"
      data-lib={lib.name}
      title={
        filtered
          ? (filterReason ?? undefined)
          : `Click to ${included ? "skip" : "include"} ${lib.name}`
      }
      role={clickable ? "button" : undefined}
      aria-pressed={clickable ? included : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={onCardClick}
      onKeyDown={clickable ? onKey : undefined}
    >
      <div className="lib-head">
        <div className="lib-name" title={lib.name}>
          {lib.name}
        </div>
        <span className={`chip ${lib.delta}`}>{lib.delta}</span>
      </div>

      <div className="lib-diff">
        <div className="lib-diff-row from">
          <span className="gutter" aria-hidden="true">
            −
          </span>
          <span className="ver-label">from</span>
          <span className="ver">{lib.fromVersion.display}</span>
        </div>
        <div className="lib-diff-row to">
          <span className="gutter" aria-hidden="true">
            +
          </span>
          <span className="ver-label">to</span>
          <span className="ver">{lib.toVersion.display}</span>
          {toTag && /^(rc|alpha|beta|dev|next|canary|pre)$/i.test(toTag) && (
            <span className="pre-tag" title="prerelease">
              {toTag.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      <div className="lib-foot">
        {/* The toggle stays visible as a state indicator and a redundant
            affordance, but stops propagation so it doesn't double-toggle. */}
        <div
          className="toggle"
          role="group"
          aria-label={`Include or skip ${lib.name}`}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-pressed={included}
            onClick={(e) => {
              e.stopPropagation()
              if (!included) onToggle(true)
            }}
          >
            Include
          </button>
          <button
            type="button"
            aria-pressed={!included}
            onClick={(e) => {
              e.stopPropagation()
              if (included) onToggle(false)
            }}
          >
            Skip
          </button>
        </div>
        {filtered && filterReason && (
          <span className="foot-reason" title={filterReason}>
            {filterReason}
          </span>
        )}
      </div>
    </div>
  )
}
