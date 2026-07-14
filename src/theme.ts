export type Theme = "terminal" | "clean" | "midnight" | "editorial"
export type Density = "compact" | "balanced" | "comfortable"

export const THEME_META: Record<Theme, { label: string; blurb: string }> = {
  terminal: { label: "Terminal", blurb: "dark · mono everywhere · IDE-feel" },
  clean: { label: "Clean", blurb: "light neutral · GitHub-ish" },
  midnight: { label: "Midnight", blurb: "dark counterpart to Clean" },
  editorial: {
    label: "Editorial",
    blurb: "cream · serif display · sharp rules",
  },
}

export const DENSITIES: Density[] = ["compact", "balanced", "comfortable"]
