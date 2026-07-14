import { useCallback, useRef, useState } from "react"

// Copy-to-clipboard with a short "✓ copied" flash keyed by label.
export function useCopy() {
  const [flash, setFlash] = useState<string | null>(null)
  const tRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const copy = useCallback((text: string, label = "all") => {
    try {
      navigator.clipboard?.writeText(text)
    } catch {
      // best-effort
    }
    setFlash(label)
    clearTimeout(tRef.current)
    tRef.current = setTimeout(() => setFlash(null), 1400)
  }, [])
  return { copy, flash }
}
