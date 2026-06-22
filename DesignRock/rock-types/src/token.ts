/**
 * Authentication schemes
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
 */
export type AuthenticationSchemes =
  'Basic'
  | 'Bearer'
  | 'Digest'
  | 'HOBA'
  | 'Mutual'
  | 'Negotiate / NTLM'
  | 'VAPID'
  | 'SCRAM'
  | 'AWS4-HMAC-SHA256'

/**
 * Authentication token 数据结构
 */
export interface AuthenticationToken {
  accessToken: string;
  refreshToken?: string;
  tokenType?: AuthenticationSchemes;
  tenantList?: any[];
}