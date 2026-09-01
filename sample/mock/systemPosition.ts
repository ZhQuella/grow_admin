import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  findPosition,
  ensurePersonAssignments,
  nextPositionId,
  personStore,
  positionStore,
  type PositionRecord,
} from './orgStore'

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

function referringAssignments(position: Pick<PositionRecord, 'id' | 'name'>) {
  return personStore.flatMap((person) => ensurePersonAssignments(person)
    .filter((assignment) => assignment.status === 'active'
      && (assignment.jobGradeId === position.id
        || (!assignment.jobGradeId && assignment.jobGrade === position.name)))
    .map((assignment) => ({ person, assignment })))
}

function toListItem(item: PositionRecord) {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    level: item.level,
    sort: item.sort,
    enabled: item.enabled,
    description: item.description,
    assignmentCount: referringAssignments(item).length,
    updatedAt: item.updatedAt,
  }
}

function toImpact(item: PositionRecord) {
  const assignments = referringAssignments(item)
  return {
    assignmentCount: assignments.length,
    assignments: assignments.map(({ person, assignment }) => ({
      assignmentId: assignment.id,
      userId: person.userId,
      personName: person.name,
      deptName: assignment.deptName,
      postName: assignment.postName,
    })),
  }
}

function parsePayload(body: unknown) {
  const payload = (body || {}) as Recordable<any>
  const name = text(payload.name)
  const code = text(payload.code)
  const level = Number(payload.level)
  const sort = Number(payload.sort ?? 10)
  const description = text(payload.description)
  return { name, code, level, sort, description, payload }
}

function validateSave(input: ReturnType<typeof parsePayload>, currentId?: string) {
  if (!input.name) return '请填写名称'
  if (!input.code) return '请填写编码'
  if (!Number.isFinite(input.level) || input.level < 1) return '请填写有效层级'
  const duplicated = positionStore.find((item) =>
    item.code.toLowerCase() === input.code.toLowerCase() && item.id !== currentId,
  )
  if (duplicated) return '编码已存在'
  return ''
}

function applySave(item: PositionRecord, input: ReturnType<typeof parsePayload>) {
  const previousName = item.name
  item.name = input.name
  item.code = input.code
  item.level = input.level
  item.sort = Number.isFinite(input.sort) ? input.sort : 10
  item.description = input.description
  item.updatedAt = now()
  personStore.forEach((person) => {
    ensurePersonAssignments(person)
      .filter((assignment) => assignment.status === 'active'
        && (assignment.jobGradeId === item.id
          || (!assignment.jobGradeId && assignment.jobGrade === previousName)))
      .forEach((assignment) => {
        assignment.jobGradeId = item.id
        assignment.jobGrade = item.name
        if (assignment.type === 'primary') person.jobGrade = item.name
      })
  })
}

export default [
  {
    url: mockUrl('/system/positions/page'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = text(payload.name).toLowerCase()
      const code = text(payload.code).toLowerCase()
      const enabled = parseEnabled(payload.enabled)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      const filtered = positionStore.filter((item) => {
        if (name && !item.name.toLowerCase().includes(name)) return false
        if (code && !item.code.toLowerCase().includes(code)) return false
        if (enabled !== undefined && item.enabled !== enabled) return false
        return true
      }).sort((a, b) => a.sort - b.sort || a.level - b.level || a.name.localeCompare(b.name, 'zh-CN'))
      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/system/positions/options'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const includeId = text(payload.includeId)
      const enabledOnly = payload.enabled !== false
      const list = positionStore.filter((item) => item.enabled || item.id === includeId || !enabledOnly)
      return resultSuccess(list.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        level: item.level,
        enabled: item.enabled,
      })))
    },
  },
  {
    url: mockUrl('/system/positions'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const input = parsePayload(body)
      const error = validateSave(input)
      if (error) return resultError(error)
      const item: PositionRecord = {
        id: nextPositionId(),
        name: input.name,
        code: input.code,
        level: input.level,
        sort: Number.isFinite(input.sort) ? input.sort : 10,
        description: input.description,
        enabled: true,
        createdAt: now(),
        updatedAt: now(),
      }
      positionStore.push(item)
      return resultSuccess(toListItem(item), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/system/position'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const input = parsePayload(body)
      const id = text(input.payload.id)
      const item = findPosition(id)
      if (!item) return resultError('职级不存在')
      const error = validateSave(input, id)
      if (error) return resultError(error)
      applySave(item, input)
      return resultSuccess(toListItem(item), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/position/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const item = findPosition(text((body as Recordable<any>)?.id))
      if (!item) return resultError('职级不存在')
      return resultSuccess(toListItem(item))
    },
  },
  {
    url: mockUrl('/system/position/impact'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const item = findPosition(text((body as Recordable<any>)?.id))
      if (!item) return resultError('职级不存在')
      return resultSuccess(toImpact(item))
    },
  },
  {
    url: mockUrl('/system/position/enabled'),
    method: 'put',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findPosition(text(payload.id))
      if (!item) return resultError('职级不存在')
      item.enabled = Boolean(payload.enabled)
      item.updatedAt = now()
      return resultSuccess(toListItem(item), { message: item.enabled ? '已启用' : '已停用' })
    },
  },
  {
    url: mockUrl('/system/position/delete'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const item = findPosition(text((body as Recordable<any>)?.id))
      if (!item) return resultError('职级不存在')
      if (item.enabled) return resultError('启用中的职级不能删除，请先停用')
      if (referringAssignments(item).length) return resultError('该职级仍被有效任职引用，无法删除')
      const index = positionStore.findIndex((row) => row.id === item.id)
      if (index >= 0) positionStore.splice(index, 1)
      return resultSuccess({ id: item.id }, { message: '删除成功' })
    },
  },
] as MockMethod[]
