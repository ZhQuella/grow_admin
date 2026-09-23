export type SystemMenuApiScope = 'system' | 'platform'

const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL || '/api'

export function resolveSystemMenuRequest(
  scope: SystemMenuApiScope,
  systemUrl: string,
  platformUrl: string,
) {
  const url = scope === 'platform' ? platformUrl : systemUrl
  return scope === 'platform'
    ? { url, baseURL: platformApiUrl }
    : { url }
}
