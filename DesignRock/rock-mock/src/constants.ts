/** Mock 接口统一前缀，与生产环境 /api 区分 */
export const MOCK_API_PREFIX = '/mock';

/** 生成 Mock 接口完整路径 */
export function mockUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${MOCK_API_PREFIX}${normalized}`;
}
