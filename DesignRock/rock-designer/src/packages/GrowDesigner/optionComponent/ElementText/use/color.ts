/** 颜色解析：hex / rgba ↔ { hex, alpha } */

export type ParsedColor = { hex: string; alpha: number }

export const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha))

export const expandHex = (hex: string) => {
  let value = hex.trim()
  if (!value.startsWith('#')) value = `#${value}`
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  if (/^#[0-9a-fA-F]{4}$/.test(value)) {
    value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}${value[4]}${value[4]}`
  }
  return value.toUpperCase()
}

export const hexToRgb = (hex: string) => {
  const normalized = expandHex(hex)
  if (!/^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
    a: normalized.length === 9 ? parseInt(normalized.slice(7, 9), 16) / 255 : 1,
  }
}

export const parseColor = (value: unknown): ParsedColor | null => {
  if (value == null || value === '') return null
  const raw = String(value).trim()
  if (!raw) return null

  const rgbaMatch = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  )
  if (rgbaMatch) {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()
    let alpha = 1
    if (rgbaMatch[4] != null) {
      alpha = String(rgbaMatch[4]).endsWith('%')
        ? Number(rgbaMatch[4].replace('%', '')) / 100
        : Number(rgbaMatch[4])
    }
    return {
      hex: `#${toHex(Number(rgbaMatch[1]))}${toHex(Number(rgbaMatch[2]))}${toHex(Number(rgbaMatch[3]))}`,
      alpha: clampAlpha(alpha),
    }
  }

  const expanded = expandHex(raw)
  const rgb = hexToRgb(expanded)
  if (!rgb) return null
  return { hex: `#${expanded.slice(1, 7)}`, alpha: clampAlpha(rgb.a) }
}

export const toCssColor = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return ''
  const a = clampAlpha(alpha)
  if (a >= 1) return hex.toUpperCase()
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.round(a * 1000) / 1000})`
}
