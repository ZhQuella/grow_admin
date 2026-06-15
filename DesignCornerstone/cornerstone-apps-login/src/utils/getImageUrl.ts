export function getImageUrl(name: string): string {
  return new URL(`../assets/images/${name}`, import.meta.url).href
}
