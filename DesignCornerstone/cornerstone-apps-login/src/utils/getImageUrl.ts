const images = import.meta.glob('../assets/images/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function getImageUrl(name: string): string {
  return images[`../assets/images/${name}`] ?? ''
}
