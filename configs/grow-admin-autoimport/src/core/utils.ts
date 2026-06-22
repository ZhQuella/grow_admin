export const DISABLE_COMMENT = '/* @grow-admin-plugins/unplugin-auto-import disabled */'
export function shouldTransform(code: string) {
  if (code.includes(DISABLE_COMMENT))
    return false
  return true
}