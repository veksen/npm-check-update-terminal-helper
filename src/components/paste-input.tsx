import { useEffect, useRef } from "react"
import { ParseError } from "../lib/ncu"

interface PasteInputProps {
  value: string
  onChange: (value: string) => void
  errors: ParseError[]
  deep: boolean
  onLoadSample: () => void
  onClear: () => void
}

// Full-width textarea with terminal chrome and empty-state coaching.
export default function PasteInput({
  value,
  onChange,
  errors,
  deep,
  onLoadSample,
  onClear,
}: PasteInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Cmd/Ctrl+V anywhere focuses the textarea so the paste lands here.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        if (document.activeElement !== ref.current) {
          ref.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const empty = !value.trim()
  return (
    <div className="paste" data-testid="paste-card">
      <div className="paste-head">
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <div className="name">
          ~/your-project $ npx npm-check-updates{deep ? " --deep" : ""}
        </div>
        <div className="actions">
          {!empty && (
            <button className="ghost-btn" onClick={onClear} title="Clear input">
              clear
            </button>
          )}
          {empty && (
            <button className="ghost-btn" onClick={onLoadSample}>
              load sample
            </button>
          )}
        </div>
      </div>
      {errors.length > 0 && (
        <div className="parse-errs" data-testid="parse-errors">
          <strong>
            Couldn&apos;t parse {errors.length}{" "}
            {errors.length === 1 ? "line" : "lines"}:
          </strong>
          {errors.slice(0, 3).map((er, i) => (
            <div key={i}>
              <span style={{ opacity: 0.7 }}>line {er.line}: </span>
              <code>{er.content.trim() || "(empty)"}</code> — {er.message}
            </div>
          ))}
          {errors.length > 3 && (
            <div style={{ opacity: 0.7 }}>… and {errors.length - 3} more</div>
          )}
        </div>
      )}
      <div className="paste-body">
        <textarea
          ref={ref}
          className="paste-textarea"
          spellCheck={false}
          autoCorrect="off"
          data-testid="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {empty && (
          <div className="paste-empty">
            <div className="paste-empty-inner">
              <div className="cmd">$ npx npm-check-updates</div>
              <pre>{`  react        ^16.8.6  →  ^17.0.1
  typescript   ^3.5.3   →  ^4.1.2
  vite         ^5.4.0   →  ^7.0.0`}</pre>
              <div className="hint">
                Paste the output here. Press <b>⌘V</b> from anywhere.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
