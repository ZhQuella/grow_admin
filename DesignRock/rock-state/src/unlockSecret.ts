export async function hashUnlockSecret(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password)
  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
