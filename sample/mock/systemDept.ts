import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  createPostRecord,
  deptList,
  ensurePersonAssignments,
  findDept,
  findPerson,
  findPost,
  getDeptName,
  nextDeptId,
  nextHistoryId,
  nextPostId,
  personStore,
  postStore,
  type DeptRecord,
  type PersonRecord,
} from './orgStore'

const POST_TYPES = new Set(['formal', 'contractor', 'intern', 'management'])

function now() {
  return new Date().toISOString()
}

function today() {
  return now().slice(0, 10)
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function ids(value: unknown) {
  return Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))] : []
}

function descendants(rootId: string, includeRoot = true) {
  const result: DeptRecord[] = []
  const walk = (id: string) => {
    const dept = findDept(id)
    if (!dept) return
    result.push(dept)
    deptList.filter((item) => item.parentId === id && !item.deleted).forEach((item) => walk(item.id))
  }
  walk(rootId)
  return includeRoot ? result : result.slice(1)
}

function activeAssignments(deptIds: Set<string>) {
  return personStore.flatMap((person) => ensurePersonAssignments(person)
    .filter((assignment) => assignment.status === 'active' && deptIds.has(assignment.deptId))
    .map((assignment) => ({ person, assignment })))
}

function toPersonRef(person: PersonRecord, assignment: ReturnType<typeof ensurePersonAssignments>[number]) {
  return {
    assignmentId: assignment.id,
    userId: person.userId,
    name: person.name,
    employeeNo: person.employeeNo,
    employeeStatus: person.employeeStatus,
    assignmentType: assignment.type,
    deptId: assignment.deptId,
    deptName: assignment.deptName || getDeptName(assignment.deptId),
    postId: assignment.postId,
    postName: assignment.postName,
  }
}

function managerInfo(dept: DeptRecord) {
  const person = findPerson(dept.managerId)
  const post = findPost(dept.managerPostId)
  return {
    managerName: person?.name || '',
    managerPostName: post?.name || '',
  }
}

function directPeopleCount(id: string) {
  return new Set(activeAssignments(new Set([id])).map(({ person }) => person.userId)).size
}

function toNode(dept: DeptRecord) {
  const manager = managerInfo(dept)
  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    parentId: dept.parentId === 'd-root' ? null : dept.parentId,
    parentName: dept.parentId === 'd-root' ? '' : getDeptName(dept.parentId || ''),
    status: dept.status,
    sort: dept.sort,
    description: dept.description,
    managerType: dept.managerType,
    managerId: dept.managerId,
    managerPostId: dept.managerPostId,
    ...manager,
    directChildCount: deptList.filter((item) => item.parentId === dept.id && !item.deleted).length,
    directPostCount: postStore.filter((item) => item.deptId === dept.id).length,
    directPersonCount: directPeopleCount(dept.id),
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
  }
}

function toDetail(dept: DeptRecord) {
  return {
    ...toNode(dept),
    descendantCount: descendants(dept.id, false).length,
    managerHistory: dept.managerHistory.map((item) => ({ ...item })),
  }
}

function tree(includeDisabled: boolean) {
  const available = deptList.filter((item) =>
    item.id !== 'd-root' && !item.deleted && (includeDisabled || item.status === 'enabled'),
  )
  const walk = (parentId: string): any[] => available
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort || a.createdAt.localeCompare(b.createdAt))
    .map((item) => {
      const children = walk(item.id)
      return { ...toNode(item), ...(children.length ? { children } : {}) }
    })
  return walk('d-root')
}

function closeManager(dept: DeptRecord, reason: string) {
  if (!dept.managerId) return
  const person = findPerson(dept.managerId)
  const post = findPost(dept.managerPostId)
  dept.managerHistory.unshift({
    id: `dm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    personId: dept.managerId,
    personName: person?.name || dept.managerId,
    postId: dept.managerPostId || undefined,
    postName: post?.name,
    startedAt: dept.updatedAt,
    endedAt: now(),
    reason,
  })
  dept.managerType = ''
  dept.managerId = ''
  dept.managerPostId = ''
}

function validateManager(deptId: string, managerId: string, postId = '') {
  if (!managerId) return ''
  const person = findPerson(managerId)
  if (!person || person.employeeStatus !== 'formal') return '负责人必须是正式人员'
  const assignment = ensurePersonAssignments(person).find((item) =>
    item.status === 'active' && item.deptId === deptId && (!postId || item.postId === postId),
  )
  if (!assignment) return postId ? '负责人必须在所选岗位存在有效任职' : '负责人必须在当前部门存在有效任职'
  return ''
}

function applyManager(dept: DeptRecord, payload: Recordable<any>) {
  const managerId = text(payload.managerId)
  const managerType = managerId && payload.managerType === 'post' ? 'post' : managerId ? 'person' : ''
  const managerPostId = managerType === 'post' ? text(payload.managerPostId) : ''
  const error = validateManager(dept.id, managerId, managerPostId)
  if (error) return error
  if (dept.managerId && (dept.managerId !== managerId || dept.managerPostId !== managerPostId)) {
    closeManager(dept, '编辑部门负责人')
  }
  dept.managerType = managerType
  dept.managerId = managerId
  dept.managerPostId = managerPostId
  return ''
}

function validateParent(dept: DeptRecord | null, parentId: string) {
  const parent = findDept(parentId)
  if (!parent || parent.deleted || parent.status !== 'enabled') return '上级部门必须为启用部门'
  if (!dept) return ''
  if (parentId === dept.id || descendants(dept.id).some((item) => item.id === parentId)) {
    return '上级部门不能是当前部门或其下级部门'
  }
  return ''
}

function syncPrimary(person: PersonRecord) {
  const primary = ensurePersonAssignments(person).find((item) => item.type === 'primary' && item.status === 'active')
  if (!primary) return
  person.deptId = primary.deptId
  person.mainDeptId = primary.deptId
  person.post = primary.postName
  person.jobCode = primary.jobCode || person.jobCode
  person.jobTitle = primary.jobTitle || primary.postName
  person.jobGrade = primary.jobGrade || person.jobGrade
}

function addHistory(person: PersonRecord, title: string, summary: string) {
  person.history.push({
    id: nextHistoryId(),
    type: 'transfer',
    title,
    summary,
    effectiveDate: today(),
    operator: '当前用户',
    createdAt: now(),
  })
  person.updatedAt = now()
}

function moveAssignment(person: PersonRecord, assignmentId: string, deptId: string, postId: string, reason: string) {
  const assignment = ensurePersonAssignments(person).find((item) => item.id === assignmentId)
  const dept = findDept(deptId)
  const post = findPost(postId)
  if (!assignment || !dept || !post || post.deptId !== deptId || !post.enabled) return '目标部门或岗位无效'
  assignment.deptId = deptId
  assignment.deptName = dept.name
  assignment.postId = postId
  assignment.postName = post.name
  assignment.jobTitle = ''
  assignment.jobCode = ''
  assignment.reason = reason
  syncPrimary(person)
  addHistory(person, '部门调整', `${reason}：调整至 ${dept.name} / ${post.name}`)
  return ''
}

function endAssignment(person: PersonRecord, assignmentId: string, reason: string) {
  const assignment = ensurePersonAssignments(person).find((item) => item.id === assignmentId)
  if (!assignment) return
  assignment.status = 'ended'
  assignment.endDate = today()
  assignment.reason = reason
  addHistory(person, assignment.type === 'primary' ? '主职结束' : '兼职结束', reason)
}

function applyStopDecisions(scope: Set<string>, value: unknown, apply = true) {
  const decisionMap = new Map(
    (Array.isArray(value) ? value : []).map((item: Recordable<any>) => [text(item.assignmentId), item]),
  )
  for (const { person, assignment } of activeAssignments(scope)) {
    const decision = decisionMap.get(assignment.id)
    if (!decision) return `请处理 ${person.name} 的${assignment.type === 'primary' ? '主职' : '兼职'}去向`
    const action = text(decision.action)
    if (action === 'end' && assignment.type === 'part_time') continue
    if (action !== 'move') return '主职必须迁移，兼职可迁移或结束'
    const targetDeptId = text(decision.targetDeptId)
    if (scope.has(targetDeptId)) return '目标部门必须在停用范围外'
    const targetDept = findDept(targetDeptId)
    if (!targetDept || targetDept.deleted || targetDept.status !== 'enabled') return '目标部门必须为启用部门'
    const post = findPost(text(decision.targetPostId))
    if (!post || !post.enabled || post.deptId !== targetDeptId) return '目标部门或岗位无效'
  }
  if (!apply) return ''
  for (const { person, assignment } of activeAssignments(scope)) {
    const decision = decisionMap.get(assignment.id)!
    if (text(decision.action) === 'end') {
      endAssignment(person, assignment.id, text(decision.reason) || '部门停用')
    } else {
      moveAssignment(
        person,
        assignment.id,
        text(decision.targetDeptId),
        text(decision.targetPostId),
        text(decision.reason) || '部门停用',
      )
    }
  }
  return ''
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/system/departments/tree'),
    method: 'post',
    response: ({ body }) => resultSuccess(tree((body as Recordable<any>)?.includeDisabled !== false)),
  },
  {
    url: mockUrl('/system/department/detail'),
    method: 'post',
    response: ({ body }) => {
      const dept = findDept(text((body as Recordable<any>)?.id))
      return dept && !dept.deleted ? resultSuccess(toDetail(dept)) : resultError('部门不存在')
    },
  },
  {
    url: mockUrl('/system/department/related'),
    method: 'post',
    response: ({ body }) => {
      const id = text((body as Recordable<any>)?.id)
      const dept = findDept(id)
      if (!dept || dept.deleted) return resultError('部门不存在')
      return resultSuccess({
        posts: postStore.filter((item) => item.deptId === id).map((item) => ({
          ...item,
          activePersonCount: activeAssignments(new Set([id])).filter(({ assignment }) => assignment.postId === item.id).length,
        })),
        people: activeAssignments(new Set([id])).map(({ person, assignment }) => toPersonRef(person, assignment)),
        children: deptList.filter((item) => item.parentId === id && !item.deleted).map(toNode),
      })
    },
  },
  {
    url: mockUrl('/system/department/create'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = text(payload.name)
      const code = text(payload.code)
      const parentId = text(payload.parentId) || 'd-root'
      if (!name) return resultError('请填写部门名称')
      if (!code) return resultError('请填写部门编码')
      if (deptList.some((item) => !item.deleted && item.code.toLowerCase() === code.toLowerCase())) return resultError('部门编码已存在')
      const parentError = validateParent(null, parentId)
      if (parentError) return resultError(parentError)
      const stamp = now()
      const dept: DeptRecord = {
        id: nextDeptId(), name, code, parentId, status: 'enabled', sort: Number(payload.sort) || 0,
        description: text(payload.description), deleted: false, managerType: '', managerId: '', managerPostId: '',
        managerHistory: [], createdAt: stamp, updatedAt: stamp,
      }
      deptList.push(dept)
      return resultSuccess(toDetail(dept), { message: '新增成功' })
    },
  },
  {
    url: mockUrl('/system/department'),
    method: 'put',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const name = text(payload.name)
      const code = text(payload.code)
      if (!name || !code) return resultError('部门名称和编码不能为空')
      if (deptList.some((item) => item.id !== dept.id && !item.deleted && item.code.toLowerCase() === code.toLowerCase())) return resultError('部门编码已存在')
      const parentId = text(payload.parentId) || 'd-root'
      const parentError = validateParent(dept, parentId)
      if (parentError) return resultError(parentError)
      const managerError = applyManager(dept, payload)
      if (managerError) return resultError(managerError)
      dept.name = name
      dept.code = code
      dept.parentId = parentId
      dept.sort = Number(payload.sort) || 0
      dept.description = text(payload.description)
      dept.updatedAt = now()
      for (const person of personStore) {
        ensurePersonAssignments(person).forEach((item) => {
          if (item.deptId === dept.id && item.status === 'active') item.deptName = name
        })
      }
      return resultSuccess(toDetail(dept), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/department/stop-impact'),
    method: 'post',
    response: ({ body }) => {
      const dept = findDept(text((body as Recordable<any>)?.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const departments = descendants(dept.id).filter((item) => item.status === 'enabled')
      const scope = new Set(departments.map((item) => item.id))
      return resultSuccess({
        departments: departments.map(toNode),
        posts: postStore.filter((item) => scope.has(item.deptId) && item.enabled).map((item) => ({
          ...item,
          activePersonCount: activeAssignments(scope).filter(({ assignment }) => assignment.postId === item.id).length,
        })),
        assignments: activeAssignments(scope).map(({ person, assignment }) => toPersonRef(person, assignment)),
      })
    },
  },
  {
    url: mockUrl('/system/department/stop'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted || dept.status !== 'enabled') return resultError('仅启用部门可停用')
      const departments = descendants(dept.id).filter((item) => item.status === 'enabled')
      const scope = new Set(departments.map((item) => item.id))
      const decisionError = applyStopDecisions(scope, payload.decisions)
      if (decisionError) return resultError(decisionError)
      for (const item of departments) {
        item.status = 'disabled'
        closeManager(item, '部门停用')
        item.updatedAt = now()
      }
      postStore.filter((item) => scope.has(item.deptId)).forEach((item) => {
        item.enabledBeforeCascade = item.enabled
        item.enabled = false
      })
      return resultSuccess(toDetail(dept), { message: '部门已停用' })
    },
  },
  {
    url: mockUrl('/system/department/enable-impact'),
    method: 'post',
    response: ({ body }) => {
      const dept = findDept(text((body as Recordable<any>)?.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      return resultSuccess({ departments: descendants(dept.id).filter((item) => item.status === 'disabled').map(toNode) })
    },
  },
  {
    url: mockUrl('/system/department/enable'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const selected = new Set(ids(payload.departmentIds))
      selected.add(dept.id)
      for (const id of selected) {
        const item = findDept(id)
        if (!item || item.deleted || !descendants(dept.id).some((row) => row.id === id)) return resultError('启用范围无效')
        const parent = findDept(item.parentId || '')
        if (parent && parent.id !== 'd-root' && parent.status !== 'enabled' && !selected.has(parent.id)) return resultError('请先勾选上级部门')
      }
      for (const id of selected) {
        const item = findDept(id)!
        item.status = 'enabled'
        item.updatedAt = now()
        postStore.filter((post) => post.deptId === id && post.enabledBeforeCascade).forEach((post) => { post.enabled = true })
      }
      return resultSuccess(toDetail(dept), { message: '部门已启用' })
    },
  },
  {
    url: mockUrl('/system/department/migrate'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const parentId = text(payload.parentId) || 'd-root'
      const error = validateParent(dept, parentId)
      if (error) return resultError(error)
      dept.parentId = parentId
      dept.updatedAt = now()
      return resultSuccess(toDetail(dept), { message: '迁移成功' })
    },
  },
  {
    url: mockUrl('/system/department/merge-impact'),
    method: 'post',
    response: ({ body }) => {
      const dept = findDept(text((body as Recordable<any>)?.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const direct = new Set([dept.id])
      return resultSuccess({
        source: toDetail(dept),
        posts: postStore.filter((item) => item.deptId === dept.id).map((item) => ({
          ...item,
          activePersonCount: activeAssignments(direct).filter(({ assignment }) => assignment.postId === item.id).length,
        })),
        assignments: activeAssignments(direct).map(({ person, assignment }) => toPersonRef(person, assignment)),
        children: deptList.filter((item) => item.parentId === dept.id && !item.deleted).map(toNode),
      })
    },
  },
  {
    url: mockUrl('/system/department/merge'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const source = findDept(text(payload.sourceId))
      const target = findDept(text(payload.targetId))
      if (!source || !target || source.deleted || target.deleted || target.status !== 'enabled') return resultError('源部门或目标部门无效')
      if (source.id === target.id || descendants(source.id).some((item) => item.id === target.id)) return resultError('目标部门不能是源部门或其下级部门')
      const mappings = Array.isArray(payload.postMappings) ? payload.postMappings : []
      const sourcePosts = postStore.filter((item) => item.deptId === source.id)
      const newCodes = new Set<string>()
      for (const sourcePost of sourcePosts) {
        const raw = mappings.find((item: Recordable<any>) => text(item.sourcePostId) === sourcePost.id) as Recordable<any> | undefined
        if (!raw) return resultError(`请完成岗位 ${sourcePost.name} 的映射`)
        if (raw.action === 'create') {
          const next = (raw.targetPost || {}) as Recordable<any>
          const name = text(next.name)
          const code = text(next.code)
          if (!name || !code) return resultError('请完整填写新岗位名称和编码')
          if (text(next.postType) && !POST_TYPES.has(text(next.postType))) return resultError('新岗位类型无效')
          const normalizedCode = code.toLowerCase()
          if (postStore.some((post) => post.deptId === target.id && post.code.toLowerCase() === normalizedCode)
            || newCodes.has(normalizedCode)) return resultError(`目标部门下岗位编码「${code}」已存在`)
          newCodes.add(normalizedCode)
        } else {
          const targetPost = findPost(text(raw.targetPostId))
          if (!targetPost || targetPost.deptId !== target.id || !targetPost.enabled) return resultError('目标岗位无效')
        }
      }
      if (payload.managerAction === 'replace' && source.managerId) {
        const manager = findPerson(source.managerId)
        const hasEligibleAssignment = manager && ensurePersonAssignments(manager).some((item) =>
          item.status === 'active' && (item.deptId === source.id || item.deptId === target.id),
        )
        if (!manager || manager.employeeStatus !== 'formal' || !hasEligibleAssignment) {
          return resultError('源负责人迁移后不符合目标部门负责人条件')
        }
      }
      const selectedChildren = new Set(ids(payload.childIds))
      const directChildIds = new Set(deptList.filter((item) => item.parentId === source.id && !item.deleted).map((item) => item.id))
      if ([...selectedChildren].some((id) => !directChildIds.has(id))) return resultError('子部门迁移范围无效')
      if (payload.stopSource === true) {
        const movedScope = new Set<string>()
        selectedChildren.forEach((id) => descendants(id).forEach((item) => movedScope.add(item.id)))
        const remainingScope = new Set(descendants(source.id)
          .filter((item) => item.id !== source.id && !movedScope.has(item.id))
          .map((item) => item.id))
        const decisionError = applyStopDecisions(remainingScope, payload.stopDecisions, false)
        if (decisionError) return resultError(decisionError)
        const decisionMap = new Map<string, Recordable<any>>()
        for (const item of (Array.isArray(payload.stopDecisions) ? payload.stopDecisions : [])) {
          decisionMap.set(text(item.assignmentId), item)
        }
        if (activeAssignments(remainingScope).some(({ assignment }) =>
          text(decisionMap.get(assignment.id)?.targetDeptId) === source.id,
        )) return resultError('目标部门必须在停用范围外')
      }
      const mappingResult = new Map<string, string>()
      for (const raw of mappings) {
        const item = raw as Recordable<any>
        const sourcePost = findPost(text(item.sourcePostId))
        if (!sourcePost || sourcePost.deptId !== source.id) return resultError('岗位映射无效')
        if (item.action === 'create') {
          const next = (item.targetPost || {}) as Recordable<any>
          const name = text(next.name)
          const id = nextPostId()
          postStore.push(createPostRecord({
            id,
            name,
            code: text(next.code),
            deptId: target.id,
            postType: POST_TYPES.has(text(next.postType)) ? text(next.postType) as typeof sourcePost.postType : '',
            formalHeadcount: Math.max(0, Number(next.formalHeadcount || 0)),
            contractorHeadcount: Math.max(0, Number(next.contractorHeadcount || 0)),
            partTimeHeadcount: Math.max(0, Number(next.partTimeHeadcount || 0)),
            duty: text(next.duty),
            requirement: text(next.requirement),
            sort: Math.max(0, Number(next.sort || 0)),
            remark: text(next.remark),
          }))
          mappingResult.set(sourcePost.id, id)
        } else {
          const targetPost = findPost(text(item.targetPostId))
          if (!targetPost || targetPost.deptId !== target.id || !targetPost.enabled) return resultError('目标岗位无效')
          mappingResult.set(sourcePost.id, targetPost.id)
        }
      }
      for (const { person, assignment } of activeAssignments(new Set([source.id]))) {
        const targetPostId = mappingResult.get(assignment.postId)
        if (!targetPostId) return resultError(`请完成岗位 ${assignment.postName} 的映射`)
        const error = moveAssignment(person, assignment.id, target.id, targetPostId, '部门合并')
        if (error) return resultError(error)
      }
      deptList.filter((item) => item.parentId === source.id && selectedChildren.has(item.id)).forEach((item) => {
        item.parentId = target.id
        item.updatedAt = now()
      })
      if (payload.managerAction === 'replace' && source.managerId) {
        const managerError = validateManager(target.id, source.managerId)
        if (managerError) return resultError(`源负责人不符合目标部门负责人条件：${managerError}`)
        closeManager(target, '部门合并替换负责人')
        target.managerType = 'person'
        target.managerId = source.managerId
        target.managerPostId = ''
      }
      closeManager(source, payload.managerAction === 'replace' ? '部门合并并替换目标负责人' : '部门合并取消源负责人')
      if (payload.stopSource === true) {
        const remaining = descendants(source.id).filter((item) => item.status === 'enabled')
        const scope = new Set(remaining.map((item) => item.id))
        const decisionError = applyStopDecisions(scope, payload.stopDecisions)
        if (decisionError) return resultError(decisionError)
        remaining.forEach((item) => { item.status = 'disabled'; closeManager(item, '部门合并后停用'); item.updatedAt = now() })
        postStore.filter((item) => scope.has(item.deptId)).forEach((item) => {
          item.enabledBeforeCascade = item.enabled
          item.enabled = false
        })
      }
      target.updatedAt = now()
      source.updatedAt = now()
      return resultSuccess(toDetail(target), { message: '合并成功' })
    },
  },
  {
    url: mockUrl('/system/department/delete-impact'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted) return resultError('部门不存在')
      const hasChildren = deptList.some((item) => item.parentId === dept.id && !item.deleted)
      const departments = payload.cascade === true ? descendants(dept.id) : [dept]
      const scope = new Set(departments.map((item) => item.id))
      const allAssignments = personStore.flatMap((person) => ensurePersonAssignments(person).filter((item) => scope.has(item.deptId)))
      return resultSuccess({
        departments: departments.map(toNode),
        assignments: activeAssignments(scope).map(({ person, assignment }) => toPersonRef(person, assignment)),
        historyAssignmentCount: allAssignments.length,
        hasChildren,
      })
    },
  },
  {
    url: mockUrl('/system/department/delete'),
    method: 'post',
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const dept = findDept(text(payload.id))
      if (!dept || dept.deleted || dept.status !== 'disabled') return resultError('仅停用部门可删除')
      const directChildren = deptList.filter((item) => item.parentId === dept.id && !item.deleted)
      if (directChildren.length && payload.cascade !== true) return resultError('部门存在下级部门，请勾选同时删除下级部门')
      const departments = payload.cascade === true ? descendants(dept.id) : [dept]
      if (departments.some((item) => item.status !== 'disabled')) return resultError('删除范围内仍有启用部门')
      const scope = new Set(departments.map((item) => item.id))
      if (payload.cancelAssignments === true) {
        for (const { person, assignment } of activeAssignments(scope)) endAssignment(person, assignment.id, '部门删除')
      }
      departments.forEach((item) => {
        closeManager(item, '部门删除')
        item.deleted = true
        item.updatedAt = now()
      })
      postStore.filter((item) => scope.has(item.deptId)).forEach((item) => { item.enabled = false })
      return resultSuccess({ id: dept.id }, { message: '删除成功' })
    },
  },
]

export default mocks
