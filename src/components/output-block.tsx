import { Block, blockKey } from "../lib/ncu"

interface OutputBlockProps {
  block: Block
  onCopy: (text: string, key: string) => void
  flashedKey: string | null
}

// Single OR multi-package command block with per-block copy.
export default function OutputBlock({
  block,
  onCopy,
  flashedKey,
}: OutputBlockProps) {
  const isLockfile = block.kind === "lockfile"
  const { isMulti, isBundle, libs } = block

  let title: string
  let subtitle: string | undefined
  if (isLockfile) {
    title = "Rebuild lockfile"
  } else if (isBundle) {
    title = "Bundle"
    subtitle = `${libs.length} packages in one commit`
  } else if (isMulti) {
    title = block.family || libs[0].name
    subtitle = `${libs.length} packages`
  } else {
    const lib = libs[0]
    title = lib.name
    subtitle = `${lib.fromVersion.display} → ${lib.toVersion.display}`
  }
  const key = blockKey(block)
  const flashed = flashedKey === key

  return (
    <div className="block" data-testid="output-block" data-name={key}>
      <div className="block-hd">
        <div className="title">
          <span style={{ opacity: 0.6 }}># </span>
          <b>{title}</b>
          {subtitle && (
            <span style={{ opacity: 0.7 }}>
              {"\u00A0\u00A0"}
              {subtitle}
            </span>
          )}
          {!isLockfile && (
            <span className={`chip ${block.delta}`} style={{ marginLeft: 8 }}>
              {block.delta}
            </span>
          )}
        </div>
        <button className="copy-btn" onClick={() => onCopy(block.text, key)}>
          {flashed ? "✓ copied" : "⧉ copy"}
        </button>
      </div>
      {(isMulti || isBundle) && (
        <ul className="block-libs">
          {libs.map((lib) => (
            <li key={lib.name}>
              <span className={`chip ${lib.delta}`}>{lib.delta}</span>
              <span className="block-libs-name">{lib.name}</span>
              <span className="block-libs-vers">
                {lib.fromVersion.display} → <b>{lib.toVersion.display}</b>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="block-body">
        {block.lines.map((ln, i) => {
          const last = i === block.lines.length - 1
          return (
            <div className="ln" key={i}>
              {i === 0 && <span className="ln-prefix">$</span>}
              {i > 0 && <span className="ln-prefix ln-cont">{"  "}</span>}
              <span className="ln-cmd">{ln}</span>
              {!last && (
                <span className="ln-tail">
                  {block.joiner === ";" ? ";" : ` ${block.joiner}`}
                  {" \\"}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
