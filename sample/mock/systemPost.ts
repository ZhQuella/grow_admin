import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  createPostRecord,
  ensurePersonAssignments,
  findDept,
  findPost,
  getDeptName,
  isDeptSelectable,
  nextPostId,
  personStore,
  postStore,
  type PostRecord,
} from './orgStore'

const POST_TYPES = new Set(['formal', 'contractor', 'intern', 'management', ''])

function now() {
  return new Date().toISOString()
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function parseEnabled(value: unknown) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function parseBoolean(value: unknown) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function numberOr(value: unknown, fallback: number) {
  const next = Number(value)
  return Number.isFinite(next) && next >= 0 ? next : fallback
}

function assignmentsOf(postId: string) {
  return personStore.flatMap((person) => ensurePersonAssignments(person)
    .filter((item) => item.postId === postId)
    .map((assignment) => ({ person, assignment })))
}

function postStats(post: PostRecord) {
  const rows = assignmentsOf(post.id)
  const active = rows.filter(({ assignment }) => assignment.status === 'active')
  const occupying = active.filter(({ assignment }) => assignment.occupyHeadcount)
  const occupied = occupying.length
  const headcount = post.formalHeadcount + post.contractorHeadcount
  return {
    formalOccupied: active.filter(({ person, assignment }) =>
      assignment.type === 'primary' && person.employeeType === 'full_time').length,
    contractorOccupied: active.filter(({ person, assignment }) =>
      assignment.type === 'primary' && person.employeeType === 'contractor').length,
    partTimeOccupied: active.filter(({ assignment }) => assignment.type === 'part_time').length,
    internOccupied: active.filter(({ person, assignment }) =>
      assignment.type === 'primary' && person.employeeType === 'intern').length,
    occupied,
    vacancy: Math.max(0, headcount - occupied),
    overstaffed: Math.max(0, occupied - headcount),
    activePersonCount: active.length,
  }
}

function toListItem(post: PostRecord) {
  const stats = postStats(post)
  return {
    id: post.id,
    name: post.name,
    code: post.code,
    deptId: post.deptId,
    deptName: getDeptName(post.deptId),
    postType: post.postType,
    formalHeadcount: post.formalHeadcount,
    contractorHeadcount: post.contractorHeadcount,
    partTimeHeadcount: post.partTimeHeadcount,
    internHeadcount: post.internHeadcount,
    formalOccupied: stats.formalOccupied,
    contractorOccupied: stats.contractorOccupied,
    partTimeOccupied: stats.partTimeOccupied,
    internOccupied: stats.internOccupied,
    occupied: stats.occupied,
    vacancy: stats.vacancy,
    overstaffed: stats.overstaffed,
    activePersonCount: stats.activePersonCount,
    enabled: post.enabled,
    sort: post.sort,
    updatedAt: post.updatedAt,
  }
}

function toDetail(post: PostRecord) {
  const rows = assignmentsOf(post.id)
  return {
    ...toListItem(post),
    duty: post.duty,
    requirement: post.requirement,
    remark: post.remark,
    createdAt: post.createdAt,
    members: rows
      .filter(({ assignment }) => assignment.status === 'active')
      .map(({ person, assignment }) => ({
        assignmentId: assignment.id,
        userId: person.userId,
        name: person.name,
        employeeNo: person.employeeNo,
        assignmentType: assignment.type,
        primary: assignment.type === 'primary',
        startDate: assignment.startDate,
        occupyHeadcount: assignment.occupyHeadcount,
        employeeStatus: person.employeeStatus,
        employeeType: person.employeeType,
      })),
    history: rows
      .filter(({ assignment }) => assignment.status === 'ended')
      .map(({ person, assignment }) => ({
        assignmentId: assignment.id,
        userId: person.userId,
        name: person.name,
        employeeNo: person.employeeNo,
        assignmentType: assignment.type,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        occupyHeadcount: assignment.occupyHeadcount,
      })),
  }
}

function parseSave(body: unknown) {
  const payload = (body || {}) as Recordable<any>
  return {
    payload,
    name: text(payload.name),
    code: text(payload.code),
    deptId: text(payload.deptId),
    postType: text(payload.postType),
    formalHeadcount: numberOr(payload.formalHeadcount, 0),
    contractorHeadcount: numberOr(payload.contractorHeadcount, 0),
    partTimeHeadcount: numberOr(payload.partTimeHeadcount, 0),
    internHeadcount: numberOr(payload.internHeadcount, 0),
    duty: text(payload.duty),
    requirement: text(payload.requirement),
    sort: numberOr(payload.sort, 10),
    remark: text(payload.remark),
  }
}

function validateSave(input: ReturnType<typeof parseSave>, currentId?: string) {
  if (!input.deptId) return '请选择所属部门'
  if (!isDeptSelectable(input.deptId)) return '所属部门必须为启用状态'
  if (!input.name) return '请填写岗位名称'
  if (!input.code) return '请填写岗位编码'
  if (input.postType && !POST_TYPES.has(input.postType)) return '岗位类型无效'
  const duplicated = postStore.find((item) =>
    item.deptId === input.deptId
    && item.code.toLowerCase() === input.code.toLowerCase()
    && item.id !== currentId,
  )
  if (duplicated) return '同一部门下岗位编码不可重复'
  return ''
}

function hasNameDuplicate(deptId: string, name: string, currentId?: string) {
  return postStore.some((item) =>
    item.deptId === deptId
    && item.name === name
    && item.id !== currentId,
  )
}

function applySave(post: PostRecord, input: ReturnType<typeof parseSave>) {
  post.name = input.name
  post.code = input.code
  post.deptId = input.deptId
  post.postType = POST_TYPES.has(input.postType) ? input.postType as PostRecord['postType'] : ''
  post.formalHeadcount = input.formalHeadcount
  post.contractorHeadcount = input.contractorHeadcount
  post.partTimeHeadcount = input.partTimeHeadcount
  post.internHeadcount = input.internHeadcount
  post.duty = input.duty
  post.requirement = input.requirement
  post.sort = input.sort
  post.remark = input.remark
  post.updatedAt = now()
  personStore.forEach((person) => {
    ensurePersonAssignments(person)
      .filter((assignment) => assignment.status === 'active' && assignment.postId === post.id)
      .forEach((assignment) => {
        assignment.postName = post.name
        assignment.jobTitle = ''
        assignment.jobCode = ''
        if (assignment.type === 'primary') {
          person.post = post.name
          person.jobTitle = ''
          person.jobCode = ''
        }
      })
  })
}

function filterPosts(payload: Recordable<any>) {
  const deptId = text(payload.deptId)
  const name = text(payload.name).toLowerCase()
  const code = text(payload.code).toLowerCase()
  const enabled = parseEnabled(payload.enabled)
  const overstaffed = parseBoolean(payload.overstaffed)
  return postStore.filter((item) => {
    if (findDept(item.deptId)?.deleted) return false
    if (deptId && item.deptId !== deptId) return false
    if (name && !item.name.toLowerCase().includes(name)) return false
    if (code && !item.code.toLowerCase().includes(code)) return false
    if (enabled !== undefined && item.enabled !== enabled) return false
    if (overstaffed !== undefined) {
      const stats = postStats(item)
      if (overstaffed && stats.overstaffed <= 0) return false
      if (!overstaffed && stats.overstaffed > 0) return false
    }
    return true
  }).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'))
}

export default [
  {
    url: mockUrl('/system/posts'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const deptId = text((body as Recordable<any>)?.deptId)
      const titles = postStore.filter((item) =>
        item.enabled && (!deptId || item.deptId === deptId) && !findDept(item.deptId)?.deleted,
      )
      return resultSuccess(
        titles.map((item) => {
          const stats = postStats(item)
          return {
            id: item.id,
            name: item.name,
            code: item.code,
            deptId: item.deptId,
            enabled: item.enabled,
            headcount: item.formalHeadcount + item.contractorHeadcount,
            occupied: stats.occupied,
          }
        }),
      )
    },
  },
  {
    url: mockUrl('/system/posts/page'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      const filtered = filterPosts(payload)
      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/system/posts/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const input = parseSave(body)
      const error = validateSave(input)
      if (error) return resultError(error)
      const post = createPostRecord({
        id: nextPostId(),
        name: input.name,
        code: input.code,
        deptId: input.deptId,
        postType: POST_TYPES.has(input.postType) ? input.postType as PostRecord['postType'] : '',
        formalHeadcount: input.formalHeadcount,
        contractorHeadcount: input.contractorHeadcount,
        partTimeHeadcount: input.partTimeHeadcount,
        internHeadcount: input.internHeadcount,
        duty: input.duty,
        requirement: input.requirement,
        sort: input.sort,
        remark: input.remark,
        enabled: true,
      })
      postStore.push(post)
      return resultSuccess({
        ...toListItem(post),
        nameDuplicated: hasNameDuplicate(post.deptId, post.name, post.id),
      }, { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/system/post'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const input = parseSave(body)
      const id = text(input.payload.id)
      const post = findPost(id)
      if (!post) return resultError('岗位不存在')
      const error = validateSave(input, id)
      if (error) return resultError(error)
      if (input.deptId !== post.deptId && postStats(post).activePersonCount > 0) {
        return resultError('岗位已有有效任职人员，请通过部门迁移或人员调岗变更所属部门')
      }
      applySave(post, input)
      return resultSuccess({
        ...toListItem(post),
        nameDuplicated: hasNameDuplicate(post.deptId, post.name, post.id),
      }, { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/post/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const post = findPost(text((body as Recordable<any>)?.id))
      if (!post) return resultError('岗位不存在')
      return resultSuccess(toDetail(post))
    },
  },
  {
    url: mockUrl('/system/post/enabled'),
    method: 'put',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const post = findPost(text(payload.id))
      if (!post) return resultError('岗位不存在')
      const enabled = Boolean(payload.enabled)
      if (!enabled && postStats(post).activePersonCount > 0) {
        return resultError('该岗位下存在有效任职人员，请先调岗、离职或结束任职关系。')
      }
      post.enabled = enabled
      post.enabledBeforeCascade = enabled
      post.updatedAt = now()
      return resultSuccess(toListItem(post), { message: enabled ? '已启用' : '已停用' })
    },
  },
] as MockMethod[]
