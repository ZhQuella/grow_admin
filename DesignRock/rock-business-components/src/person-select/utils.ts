import { MOCK_DEPTS, MOCK_PERSONS, MOCK_ROLES } from './mock'
import type { DeptItem, PersonItem, RoleItem } from './types'

const ROOT_ID = 'd-root'

export function getDeptById(id: string): DeptItem | undefined {
  return MOCK_DEPTS.find((d) => d.id === id)
}

export function getChildDepts(parentId: string | null = ROOT_ID): DeptItem[] {
  return MOCK_DEPTS.filter((d) => d.parentId === parentId && d.id !== ROOT_ID)
}

/** 当前节点及全部子孙部门 id */
export function collectDescendantDeptIds(deptId: string): string[] {
  const ids = [deptId]
  const walk = (parentId: string) => {
    for (const child of getChildDepts(parentId)) {
      ids.push(child.id)
      walk(child.id)
    }
  }
  walk(deptId)
  return ids
}

export function getPersonsByDept(deptId: string): PersonItem[] {
  const scope = new Set(collectDescendantDeptIds(deptId))
  return MOCK_PERSONS.filter((p) => scope.has(p.deptId))
}

export function getDeptPersonCount(deptId: string): number {
  return getPersonsByDept(deptId).length
}

export function getPersonsByRole(roleId: string): PersonItem[] {
  return MOCK_PERSONS.filter((p) => p.roleIds.includes(roleId))
}

export function getRolePersonCount(roleId: string): number {
  return getPersonsByRole(roleId).length
}

export function getAllRoles(): RoleItem[] {
  return MOCK_ROLES
}

export function getPersonById(userId: string): PersonItem | undefined {
  return MOCK_PERSONS.find((p) => p.userId === userId)
}

export function getPersonsByIds(userIds: string[]): PersonItem[] {
  const set = new Set(userIds)
  return MOCK_PERSONS.filter((p) => set.has(p.userId))
}

export function searchPersonsByName(keyword: string, scope?: PersonItem[]): PersonItem[] {
  const list = scope ?? MOCK_PERSONS
  const q = keyword.trim().toLowerCase()
  if (!q) return list
  return list.filter((p) => p.name.toLowerCase().includes(q))
}

/** 从 root 到当前部门的面包屑（不含虚拟「全部」节点本身时可含 root） */
export function getDeptBreadcrumb(deptId: string): DeptItem[] {
  const chain: DeptItem[] = []
  let cur = getDeptById(deptId)
  while (cur) {
    chain.unshift(cur)
    cur = cur.parentId ? getDeptById(cur.parentId) : undefined
  }
  if (!chain.length) {
    const root = getDeptById(ROOT_ID)
    if (root) chain.push(root)
  }
  return chain
}

export function hasChildDepts(deptId: string): boolean {
  return getChildDepts(deptId).length > 0
}

export { ROOT_ID }

/** 集合运算：并入 / 移除 userId */
export function addUserIds(current: Set<string>, ids: string[]) {
  ids.forEach((id) => current.add(id))
}

export function removeUserIds(current: Set<string>, ids: string[]) {
  ids.forEach((id) => current.delete(id))
}

export function isAllSelected(selected: Set<string>, ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => selected.has(id))
}

export function isPartialSelected(selected: Set<string>, ids: string[]): boolean {
  if (!ids.length) return false
  const hit = ids.filter((id) => selected.has(id)).length
  return hit > 0 && hit < ids.length
}
