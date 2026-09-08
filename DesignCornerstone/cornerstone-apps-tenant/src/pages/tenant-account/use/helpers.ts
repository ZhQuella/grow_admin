import { driverRef } from '@grow-admin-rock/components'

export function formatTime(value?: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function createTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const values = new Uint32Array(8)
  globalThis.crypto?.getRandomValues?.(values)
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

export async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) {
    throw new Error('表单未就绪')
  }
  const result = await form.validate()
  if (result === false) {
    throw new Error('校验未通过')
  }
}
