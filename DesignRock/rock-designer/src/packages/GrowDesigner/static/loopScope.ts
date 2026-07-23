/** 循环作用域：从结构树收集祖先 GrowLoop 的 item/index 变量名 */

import { findParentByUUID } from '@grow-admin-rock/utils'

export type LoopScopeInfo = {
  uuid: string
  itemKey: string
  indexKey: string
}

const normalizeKey = (value: unknown, fallback: string) => {
  const text = String(value ?? '').trim()
  return text || fallback
}

/** 自近到远：先内层循环，再外层 */
export const collectAncestorLoopScopes = (
  structures: unknown[] | undefined,
  uuid: string | undefined,
  renderArgument: Record<string, any> | undefined,
  propsMap: Record<string, any> | undefined,
): LoopScopeInfo[] => {
  if (!uuid || !Array.isArray(structures)) return []
  const scopes: LoopScopeInfo[] = []
  let currentUuid = uuid
  let parent = findParentByUUID(structures as any[], currentUuid)
  while (parent?.uuid) {
    const tag = renderArgument?.[parent.uuid]?.elTagName
    if (tag === 'GrowLoop') {
      const raw = propsMap?.[parent.uuid] || {}
      scopes.push({
        uuid: parent.uuid,
        itemKey: normalizeKey(raw.itemKey, 'item'),
        indexKey: normalizeKey(raw.indexKey, 'index'),
      })
    }
    currentUuid = parent.uuid
    parent = findParentByUUID(structures as any[], currentUuid)
  }
  return scopes
}

/** 合并父 state 与当前循环项，写入目标 reactive 对象 */
export const applyLoopScopeToState = (
  target: Record<string, unknown>,
  parentState: Record<string, unknown> | null | undefined,
  extra: Record<string, unknown>,
) => {
  const next: Record<string, unknown> = {
    ...(parentState || {}),
    ...extra,
  }
  for (const key of Object.keys(target)) {
    if (!(key in next)) Reflect.deleteProperty(target, key)
  }
  Object.assign(target, next)
}
