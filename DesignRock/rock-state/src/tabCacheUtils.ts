/** 规范化 tab 路径：去除 query/hash 与末尾斜杠 */
export function normalizeTabPath(path: string): string {
  const pathOnly = path.split('?')[0]?.split('#')[0] ?? path
  return pathOnly.replace(/\/+$/, '') || '/'
}

/** 为每个 tab 实例生成唯一的 keep-alive 缓存名 */
export function resolveTabCacheName(fullPath: string, componentName: string): string {
  const pathKey = normalizeTabPath(fullPath).replace(/^\//, '').replace(/\//g, '__')
  return `${componentName}__${pathKey}`
}
