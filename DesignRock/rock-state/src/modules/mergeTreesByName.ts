/**
 * 按 sort 升序排列菜单/路由树（缺省 sort 视为 0）。
 */
export function sortTreesBySort<T extends { sort?: number, children?: T[] }>(
  list: T[] = [],
): T[] {
  return [...list]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((item) => ({
      ...item,
      children: item.children?.length ? sortTreesBySort(item.children) : item.children,
    }))
}

/**
 * 前后端菜单/路由树按 name 合集合并。
 * - 先铺前端，再叠后端
 * - 同名节点整条采用后端数据，children 递归合集
 * - 合并后按 sort 排序
 */
export function mergeTreesByName<T extends { name: string, sort?: number, children?: T[] }>(
  frontList: T[] = [],
  backList: T[] = [],
): T[] {
  const result: T[] = []
  const indexByName = new Map<string, number>()

  for (const item of frontList) {
    const name = String(item.name)
    indexByName.set(name, result.length)
    result.push({
      ...item,
      children: item.children ? [...item.children] : undefined,
    })
  }

  for (const item of backList) {
    const name = String(item.name)
    const existingIndex = indexByName.get(name)
    if (existingIndex === undefined) {
      indexByName.set(name, result.length)
      result.push({
        ...item,
        children: item.children ? [...item.children] : undefined,
      })
      continue
    }

    const existing = result[existingIndex]
    result[existingIndex] = {
      ...item,
      children: mergeTreesByName(existing.children ?? [], item.children ?? []),
    }
  }

  return sortTreesBySort(result)
}
