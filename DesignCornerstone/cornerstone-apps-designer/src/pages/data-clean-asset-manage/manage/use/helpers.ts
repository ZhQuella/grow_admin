export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}
