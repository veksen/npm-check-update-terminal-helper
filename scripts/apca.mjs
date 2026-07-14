// APCA (Accessible Perceptual Contrast Algorithm) — core math.
//
// This is a clean reimplementation of the published APCA-W3 algorithm
// (the "0.0.98G-4g" / version 0.1.9 constants). APCA is authored by
// Andrew Somers / Myndex and contributed to W3C/AGWG for WCAG 3 under the
// W3C license: https://github.com/Myndex/apca-w3
//
// The constants below are the published algorithm parameters — they are not
// tunable. Changing them produces non-conformant scores. APCA returns a signed
// "Lc" (Lightness contrast) value, roughly -108..+106:
//   positive Lc -> dark text on a lighter background (normal polarity)
//   negative Lc -> light text on a darker background (reverse polarity)
// The magnitude is what matters for readability; see references/apca-levels.md.

const SA98G = {
  mainTRC: 2.4, // sRGB transfer-curve exponent
  sRco: 0.2126729, // sRGB -> luminance coefficients
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56, // exponents, normal polarity (dark text / light bg)
  normTXT: 0.57,
  revTXT: 0.62, // exponents, reverse polarity (light text / dark bg)
  revBG: 0.65,
  blkThrs: 0.022, // soft-clamp threshold for near-black luminance
  blkClmp: 1.414,
  scaleBoW: 1.14, // output scalers
  scaleWoB: 1.14,
  loBoWoffset: 0.027, // low-contrast clip offsets
  loWoBoffset: 0.027,
  loClip: 0.1, // contrasts below this clip to 0
  deltaYmin: 0.0005, // minimum luminance delta before we trust the result
}

// Linearize an sRGB [r,g,b] triple (0..255) to relative luminance Y.
export function sRGBtoY([r, g, b]) {
  const lin = (c) => Math.pow(c / 255, SA98G.mainTRC)
  return SA98G.sRco * lin(r) + SA98G.sGco * lin(g) + SA98G.sBco * lin(b)
}

// Core APCA contrast from two luminance (Y) values. Returns signed Lc * 100.
export function APCAcontrast(txtY, bgY) {
  // Out-of-range or non-finite inputs are meaningless — return 0 (no contrast).
  if (
    !Number.isFinite(txtY) ||
    !Number.isFinite(bgY) ||
    Math.min(txtY, bgY) < 0 ||
    Math.max(txtY, bgY) > 1.1
  ) {
    return 0
  }

  // Soft-clamp luminances that sit below the near-black threshold. This keeps
  // very dark colors from over-reporting contrast against pure black.
  const clampBlk = (Y) =>
    Y > SA98G.blkThrs ? Y : Y + Math.pow(SA98G.blkThrs - Y, SA98G.blkClmp)
  txtY = clampBlk(txtY)
  bgY = clampBlk(bgY)

  // Ignore differences smaller than perceptual noise.
  if (Math.abs(bgY - txtY) < SA98G.deltaYmin) return 0

  let sapc
  let output

  if (bgY > txtY) {
    // Normal polarity: darker text on a lighter background.
    sapc =
      (Math.pow(bgY, SA98G.normBG) - Math.pow(txtY, SA98G.normTXT)) *
      SA98G.scaleBoW
    output = sapc < SA98G.loClip ? 0 : sapc - SA98G.loBoWoffset
  } else {
    // Reverse polarity: lighter text on a darker background.
    sapc =
      (Math.pow(bgY, SA98G.revBG) - Math.pow(txtY, SA98G.revTXT)) *
      SA98G.scaleWoB
    output = sapc > -SA98G.loClip ? 0 : sapc + SA98G.loWoBoffset
  }

  return output * 100
}

// Parse a color string into [r, g, b, a] (a in 0..1). Supports #hex (3/4/6/8
// digits) and rgb()/rgba() — the two forms getComputedStyle and design tokens
// actually produce. Accepts an existing [r,g,b] or [r,g,b,a] array unchanged.
export function parseColor(input) {
  if (Array.isArray(input)) {
    const [r, g, b, a = 1] = input
    return [r, g, b, a]
  }
  const s = String(input).trim().toLowerCase()

  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("")
    }
    if (h.length !== 6 && h.length !== 8) {
      throw new Error(`Invalid hex color: ${input}`)
    }
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return [r, g, b, a]
  }

  const rgb = s.match(/^rgba?\(([^)]+)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean)
    const chan = (p) =>
      p.endsWith("%")
        ? Math.round((parseFloat(p) / 100) * 255)
        : Math.round(parseFloat(p))
    const r = chan(parts[0])
    const g = chan(parts[1])
    const b = chan(parts[2])
    const a =
      parts[3] == null
        ? 1
        : parts[3].endsWith("%")
          ? parseFloat(parts[3]) / 100
          : parseFloat(parts[3])
    return [r, g, b, a]
  }

  throw new Error(`Unsupported color format: ${input}`)
}

// Alpha-composite a foreground color over an opaque background (source-over).
// fg may carry alpha; bg is treated as opaque. Returns an opaque [r,g,b].
export function alphaBlend(fg, bg) {
  const [fr, fg_, fb, fa = 1] = parseColor(fg)
  const [br, bg_, bb] = parseColor(bg)
  const mix = (f, b) => Math.round(f * fa + b * (1 - fa))
  return [mix(fr, br), mix(fg_, bg_), mix(fb, bb)]
}

// High-level helper: APCA Lc for a text color against a background color.
// If the text color is translucent it is first composited over the background.
// Returns Lc rounded to one decimal place (the precision APCA tooling reports).
export function apcaContrast(textColor, bgColor) {
  const bg = parseColor(bgColor)
  if (bg[3] < 1) {
    throw new Error(
      "Background color is translucent — composite it over a known base first " +
        "(use alphaBlend, or browser-contrast.js for live elements)."
    )
  }
  const bgRGB = [bg[0], bg[1], bg[2]]
  const txt = parseColor(textColor)
  const txtRGB = txt[3] < 1 ? alphaBlend(txt, bgRGB) : [txt[0], txt[1], txt[2]]
  const lc = APCAcontrast(sRGBtoY(txtRGB), sRGBtoY(bgRGB))
  return Math.round(lc * 10) / 10
}
