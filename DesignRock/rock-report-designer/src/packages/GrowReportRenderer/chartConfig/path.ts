/** chartConfig 路径读写（modelKey 支持 a.b.c，含数组下标） */

export function getByPath(source: Record<string, any> | null | undefined, path: string): any {
  if (!source || !path) return undefined
  const keys = path.split('.')
  let cur: any = source
  for (const key of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[key]
  }
  return cur
}

function cloneContainer(next: unknown, nextKey: string): any {
  if (Array.isArray(next)) return [...next]
  if (next && typeof next === 'object') return { ...(next as Record<string, any>) }
  // 下一层是数字下标时，预创建数组
  if (/^\d+$/.test(nextKey)) return []
  return {}
}

export function setByPath<T extends Record<string, any>>(
  source: T,
  path: string,
  value: any,
): T {
  const keys = path.split('.')
  if (!keys.length) return source

  const root: Record<string, any> = Array.isArray(source)
    ? [...(source as any)]
    : { ...source }
  let cur = root

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextKey = keys[i + 1]
    const next = cur[key]
    cur[key] = cloneContainer(next, nextKey)
    cur = cur[key]
  }

  const lastKey = keys[keys.length - 1]
  if (Array.isArray(cur) && /^\d+$/.test(lastKey)) {
    cur[Number(lastKey)] = value
  } else {
    cur[lastKey] = value
  }
  return root as T
}
