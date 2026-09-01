import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultSuccess } from '@grow-admin-rock/mock/util'
import { findAccountByPersonId } from './accountStore'
import {
  collectDeptIds,
  deptList,
  ensurePersonAssignments,
  findDept,
  findPerson,
  getDeptName,
  personStore,
  postStore,
  type PersonRecord,
  type PostRecord,
} from './orgStore'
import type {
  OrgChartAssignment,
  OrgChartDept,
  OrgChartLink,
  OrgChartMode,
  OrgChartNode,
  OrgChartPerson,
  OrgChartPost,
  OrgChartResult,
} from '../../DesignCornerstone/cornerstone-apps-system/src/types/systemOrgChart'

function text(value: unknown) {
  return String(value ?? '').trim()
}

function asBool(value: unknown) {
  return value === true || value === 'true'
}

function postStats(post: PostRecord) {
  const occupied = personStore.reduce((count, person) => {
    const hit = ensurePersonAssignments(person).some((item) =>
      item.postId === post.id && item.status === 'active' && item.occupyHeadcount)
    return count + (hit ? 1 : 0)
  }, 0)
  const headcount = post.formalHeadcount + post.contractorHeadcount
  return {
    occupied,
    vacancy: Math.max(0, headcount - occupied),
    overstaffed: Math.max(0, occupied - headcount),
    headcount,
  }
}

function toDept(id: string, personCount: number, postCount: number): OrgChartDept | null {
  const dept = findDept(id)
  if (!dept || dept.deleted) return null
  const parent = dept.parentId ? findDept(dept.parentId) : undefined
  const manager = findPerson(dept.managerId)
  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    parentId: dept.parentId,
    parentName: parent?.name || '',
    status: dept.status,
    managerName: manager?.name || '',
    personCount,
    postCount,
    sort: dept.sort,
  }
}

function toPerson(person: PersonRecord): OrgChartPerson {
  const assignments = ensurePersonAssignments(person).filter((item) => item.status === 'active')
  const primary = assignments.find((item) => item.type === 'primary') || assignments[0]
  const account = findAccountByPersonId(person.userId)
  const collaborators = (person.collaboratorIds || [])
    .map((id) => findPerson(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  return {
    id: person.userId,
    name: person.name,
    employeeNo: person.employeeNo,
    employeeStatus: person.employeeStatus,
    deptId: primary?.deptId || person.mainDeptId || person.deptId,
    deptName: getDeptName(primary?.deptId || person.mainDeptId || person.deptId),
    postId: primary?.postId || '',
    postName: primary?.postName || person.post,
    jobGrade: primary?.jobGrade || person.jobGrade,
    supervisorId: primary?.supervisorId || person.supervisorId || '',
    supervisorName: findPerson(primary?.supervisorId || person.supervisorId)?.name || '',
    collaboratorIds: collaborators.map((item) => item.userId),
    collaboratorNames: collaborators.map((item) => item.name),
    accountEnabled: account ? account.enabled : null,
    primarySupervisor: Boolean(primary?.supervisorId || person.supervisorId),
    assignments: assignments.map((item): OrgChartAssignment => ({
      assignmentId: item.id,
      postId: item.postId,
      postName: item.postName,
      deptId: item.deptId,
      deptName: item.deptName || getDeptName(item.deptId),
      jobGrade: item.jobGrade || '',
      assignmentType: item.type,
      primary: item.type === 'primary',
    })),
  }
}

function toPost(post: PostRecord): OrgChartPost {
  const stats = postStats(post)
  return {
    id: post.id,
    name: post.name,
    deptId: post.deptId,
    deptName: getDeptName(post.deptId),
    jobGrade: '',
    headcount: stats.headcount,
    occupied: stats.occupied,
    vacancy: stats.vacancy,
    overstaffed: stats.overstaffed,
  }
}

function wouldCycle(from: string, to: string, parentOf: Map<string, string>) {
  let cursor = from
  const seen = new Set<string>()
  while (cursor) {
    if (cursor === to) return true
    if (seen.has(cursor)) return true
    seen.add(cursor)
    cursor = parentOf.get(cursor) || ''
  }
  return false
}

function buildGraph(payload: Recordable<any>): OrgChartResult {
  const mode: OrgChartMode = payload.mode === 'report' || payload.mode === 'mixed' ? payload.mode : 'dept'
  const scopeId = text(payload.deptId)
  const postId = text(payload.postId)
  const status = text(payload.employeeStatus)
  const includeResigned = asBool(payload.includeResigned)
  const includeRetired = asBool(payload.includeRetired)
  const includeDisabledPeople = asBool(payload.includeDisabledPeople)
  const includeDisabledDepts = asBool(payload.includeDisabledDepts)

  const scope = scopeId ? collectDeptIds(scopeId) : null
  const depts = deptList
    .filter((item) => !item.deleted)
    .filter((item) => !scope || scope.has(item.id))
    .filter((item) => includeDisabledDepts || item.status === 'enabled')
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'))
  const deptIds = new Set(depts.map((item) => item.id))

  const people = personStore.filter((person) => {
    if (person.employeeStatus === 'resigned' && !includeResigned) return false
    if (person.employeeStatus === 'retired' && !includeRetired) return false
    if (status && person.employeeStatus !== status) return false
    const account = findAccountByPersonId(person.userId)
    if (account && !account.enabled && !includeDisabledPeople) return false
    const assignments = ensurePersonAssignments(person).filter((item) => item.status === 'active')
    const deptHit = assignments.some((item) => deptIds.has(item.deptId))
      || deptIds.has(person.mainDeptId)
      || deptIds.has(person.deptId)
    if (!deptHit) return false
    if (postId && !assignments.some((item) => item.postId === postId)) return false
    return true
  })

  const personMap = new Map(people.map((item) => [item.userId, toPerson(item)]))
  const deptPersonCount = new Map<string, number>()
  const deptPostCount = new Map<string, number>()
  for (const person of personMap.values()) {
    deptPersonCount.set(person.deptId, (deptPersonCount.get(person.deptId) || 0) + 1)
  }
  const posts = postStore
    .filter((item) => deptIds.has(item.deptId) && item.enabled)
    .map((item) => {
      deptPostCount.set(item.deptId, (deptPostCount.get(item.deptId) || 0) + 1)
      return toPost(item)
    })

  const deptRecords = depts
    .map((item) => toDept(item.id, deptPersonCount.get(item.id) || 0, deptPostCount.get(item.id) || 0))
    .filter((item): item is OrgChartDept => Boolean(item))

  const nodes: OrgChartNode[] = []
  const links: OrgChartLink[] = []
  const parentOf = new Map<string, string>()

  if (mode !== 'report') {
    for (const dept of deptRecords) {
      const id = `dept:${dept.id}`
      const parentId = dept.parentId && deptIds.has(dept.parentId) ? `dept:${dept.parentId}` : ''
      nodes.push({
        id,
        kind: 'dept',
        refId: dept.id,
        name: dept.name,
        parentId,
        disabled: dept.status === 'disabled',
      })
      if (parentId) {
        parentOf.set(id, parentId)
        links.push({ source: parentId, target: id, kind: 'dept' })
      }
    }
  }

  if (mode !== 'dept') {
    for (const person of personMap.values()) {
      const id = `person:${person.id}`
      let parentId = ''
      const supervisorId = person.supervisorId && personMap.has(person.supervisorId)
        ? person.supervisorId
        : person.collaboratorIds.find((item) => personMap.has(item)) || ''
      if (mode === 'report') {
        if (supervisorId && !wouldCycle(`person:${supervisorId}`, id, parentOf)) {
          parentId = `person:${supervisorId}`
        }
      } else if (deptIds.has(person.deptId)) {
        parentId = `dept:${person.deptId}`
      }
      nodes.push({
        id,
        kind: 'person',
        refId: person.id,
        name: person.name,
        parentId,
        disabled: person.accountEnabled === false,
      })
      if (parentId) parentOf.set(id, parentId)
      if (mode === 'mixed' && parentId.startsWith('dept:')) {
        links.push({ source: parentId, target: id, kind: 'member' })
      }
      if (supervisorId && personMap.has(supervisorId) && !wouldCycle(`person:${supervisorId}`, id, parentOf)) {
        links.push({ source: `person:${supervisorId}`, target: id, kind: 'report' })
        if (mode === 'report' && parentId === `person:${supervisorId}`) {
          /* layout parent already set */
        }
      }
      for (const collabId of person.collaboratorIds) {
        if (!personMap.has(collabId) || collabId === supervisorId) continue
        links.push({ source: `person:${collabId}`, target: id, kind: 'collab' })
      }
    }
  }

  return {
    mode,
    nodes,
    links,
    depts: deptRecords,
    people: [...personMap.values()],
    posts,
  }
}

export default [
  {
    url: mockUrl('/system/org-chart'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => resultSuccess(buildGraph((body || {}) as Recordable<any>)),
  },
] as MockMethod[]
