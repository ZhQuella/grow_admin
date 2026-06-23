export function normalizeTabPath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/** 为每个 tab 实例生成唯一的 keep-alive 缓存名 */
export function resolveTabCacheName(fullPath: string, componentName: string): string {
  const pathKey = normalizeTabPath(fullPath).replace(/^\//, '').replace(/\//g, '__')
  return `${componentName}__${pathKey}`
}
