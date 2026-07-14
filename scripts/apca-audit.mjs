#!/usr/bin/env node
// APCA contrast audit for src/themes.css.
//
// Parses every [data-theme] block and checks each text role against the
// surfaces it actually renders on, using APCA Lc (the WCAG 3 contrast
// method — see scripts/apca.mjs). Exits non-zero on any failure, so it can
// gate CI:
//
//   node scripts/apca-audit.mjs
//
// Targets (absolute Lc): informational text >= 75, micro labels that are
// redundant with other cues (uppercase tags, strikethrough old versions,
// badge chips) >= 60, primary code/content text >= 90.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { apcaContrast, alphaBlend, parseColor } from "./apca.mjs"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const css = readFileSync(join(root, "src/themes.css"), "utf8")

// Pull the CSS custom props out of each [data-theme="…"] block.
const themes = {}
for (const m of css.matchAll(/\[data-theme="([\w-]+)"\]\s*\{([^}]+)\}/g)) {
  const [, name, body] = m
  if (themes[name]) continue // later blocks are component overrides
  const vars = {}
  for (const v of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars[v[1]] = v[2].trim()
  }
  themes[name] = vars
}

const hex = (rgb) =>
  "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")
const flat = (fg, base) => hex(alphaBlend(parseColor(fg), parseColor(base)))
const lc = (fg, bg) => Math.abs(apcaContrast(fg, bg))

let failures = 0
for (const [name, t] of Object.entries(themes)) {
  const surfaces = {
    bg: t["bg"],
    "bg-alt": t["bg-alt"],
    panel: t["panel"],
    "panel-2": t["panel-2"],
    "code-bg": t["code-bg"],
  }

  const checks = []
  // Text roles on every surface they appear on.
  for (const [sName, s] of Object.entries(surfaces)) {
    checks.push([`text on ${sName}`, t["text"], s, 90])
    checks.push([`text-dim on ${sName}`, t["text-dim"], s, 75])
    checks.push([`text-mute on ${sName}`, t["text-mute"], s, 75])
  }
  // Chips (10px/600 badges, redundant with the version diff) on their
  // translucent backgrounds composited over the panels they sit on.
  for (const kind of ["patch", "minor", "major"]) {
    for (const base of [t["panel"], t["panel-2"], t["bg"]]) {
      checks.push([
        `chip-${kind} over ${base}`,
        t[`chip-${kind}-fg`],
        flat(t[`chip-${kind}-bg`], base),
        60,
      ])
    }
  }
  // Accent surfaces (primary button, selected segments, step numbers).
  checks.push(["accent-ink on accent", t["accent-ink"], t["accent"], 75])
  checks.push(["bg on text (inverted)", t["bg"], t["text"], 75])

  const bad = checks.filter(([, fg, bg, target]) => lc(fg, bg) < target)
  if (bad.length === 0) {
    console.log(`✓ ${name}: ${checks.length} pairs pass`)
  } else {
    failures += bad.length
    console.log(`✗ ${name}:`)
    for (const [label, fg, bg, target] of bad) {
      console.log(
        `    ${label}: Lc ${lc(fg, bg).toFixed(1)} < ${target}  (${fg} on ${bg})`
      )
    }
  }
}

if (failures) {
  console.log(`\n${failures} failing pairs`)
  process.exit(1)
}
