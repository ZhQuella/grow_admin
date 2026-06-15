import { getImageUrl as resolveImageUrl } from '@grow-admin-rock/utils'

export function getImageUrl(name: string): string {
  return resolveImageUrl(name, import.meta.url)
}
