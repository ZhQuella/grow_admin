import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  collectDeptIds,
  findPerson,
  getDeptName,
  nextEmployeeNo,
  nextEmergencyId,
  nextFamilyId,
  nextHistoryId,
  nextPersonId,
  personStore,
  type HistoryRecord,
  type PersonRecord,
} from './orgStore'
import { findAccountByPersonId } from './accountStore'

const EMPLOYEE_TYPES = new Set(['full_time', 'intern', 'part_time', 'contractor'])

const EMPLOYEE_STATUSES = new Set([
  'pending',
  'probation',
  'formal',
  'disabled',
  'resigned',
  'retired',
  'rehired',
])

function now() {
  return new Date().toISOString()
}

function today() {
  return now().slice(0, 10)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function pickText(value: unknown) {
  return String(value ?? '').trim()
}

function yearsAndMonths(from?: string, to?: string) {
  if (!from) return ''
  const start = new Date(from)
  const end = to ? new Date(to) : new Date()
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return ''
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  if (months < 0) return ''
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (!years && !rest) return '不足1个月'
  if (!years) return `${rest}个月`
  if (!rest) return `${years}年`
  return `${years}年${rest}个月`
}

function calcAge(birthDate?: string) {
  if (!birthDate) return ''
  const start = new Date(birthDate)
  if (Number.isNaN(start.getTime())) return ''
  const end = new Date()
  let age = end.getFullYear() - start.getFullYear()
  const md = end.getMonth() * 32 + end.getDate()
  const sd = start.getMonth() * 32 + start.getDate()
  if (md < sd) age -= 1
  return age >= 0 ? String(age) : ''
}

function parseIdCard(idNumber: string) {
  const id = idNumber.trim()
  if (!/^\d{17}[\dXx]$/.test(id)) return null
  const birth = `${id.slice(6, 10)}-${id.slice(10, 12)}-${id.slice(12, 14)}`
  const gender = Number(id.slice(16, 17)) % 2 === 1 ? 'male' : 'female'
  return { birthDate: birth, gender }
}

function lastEvent(person: PersonRecord) {
  const item = person.history[person.history.length - 1]
  return {
    lastEventTitle: item?.title || '',
    lastEventAt: item?.createdAt || person.updatedAt,
  }
}

function reportsTo(person: PersonRecord, bossId: string) {
  if (person.supervisorId === bossId || person.collaboratorIds?.includes(bossId)) return true
  return (person.assignments || []).some((row) =>
    row.supervisorId === bossId || row.collaboratorIds?.includes(bossId),
  )
}

function ensureAssignments(person: PersonRecord) {
  if (person.assignments?.length) return person.assignments
  if (!person.deptId) return []
  const ended = person.employeeStatus === 'resigned' || person.employeeStatus === 'retired'
  const assignment = {
    id: `as_${person.userId}`,
    deptId: person.deptId,
    deptName: getDeptName(person.deptId),
    postId: `post_${person.deptId}_${person.post || 'default'}`,
    postName: person.post,
    type: 'primary' as const,
    startDate: person.entryDate,
    endDate: ended ? person.resignDate || person.retireDate || '' : '',
    status: (ended ? 'ended' : 'active') as 'active' | 'ended',
    occupyHeadcount: true,
    supervisorId: person.supervisorId || '',
    collaboratorIds: person.collaboratorIds || [],
  }
  person.assignments = [assignment]
  return person.assignments
}

function personAccount(person: PersonRecord) {
  const account = findAccountByPersonId(person.userId)
  if (!account) return null
  return {
    accountId: account.accountId,
    username: account.username,
    enabled: account.enabled,
    lastLoginAt: account.lastLoginAt,
    roles: account.roleIds.map((id) => ({ id, name: id, code: id })),
  }
}

function toListItem(person: PersonRecord) {
  const event = lastEvent(person)
  const account = personAccount(person)
  const primary = ensureAssignments(person).find((item) => item.type === 'primary' && item.status === 'active')
    || ensureAssignments(person)[0]
  return {
    userId: person.userId,
    name: person.name,
    employeeNo: person.employeeNo,
    email: person.email,
    mobile: person.mobile,
    deptId: primary?.deptId || person.deptId,
    deptName: primary?.deptName || getDeptName(person.deptId),
    post: primary?.postName || person.post,
    postId: primary?.postId,
    employeeType: person.employeeType,
    employeeStatus: person.employeeStatus,
    previousStatus: person.previousStatus,
    supervisorName: findPerson(primary?.supervisorId || person.supervisorId)?.name || '',
    accountId: account?.accountId,
    accountUsername: account?.username,
    accountEnabled: account?.enabled,
    hasAccount: Boolean(account),
    entryDate: person.entryDate,
    resignDate: person.resignDate,
    lastEventTitle: event.lastEventTitle,
    lastEventAt: event.lastEventAt,
    updatedAt: person.updatedAt,
  }
}

function toDetail(person: PersonRecord) {
  const parsed = person.idNumber ? parseIdCard(person.idNumber) : null
  const birthDate = person.birthDate || parsed?.birthDate || ''
  const gender = person.gender || parsed?.gender || ''
  const endDate = person.employeeStatus === 'resigned' ? person.resignDate : undefined
  return {
    ...toListItem(person),
    mainDeptId: person.mainDeptId,
    mainDeptName: getDeptName(person.mainDeptId),
    supervisorId: person.supervisorId,
    supervisorName: findPerson(person.supervisorId)?.name || '',
    collaboratorIds: person.collaboratorIds || [],
    collaborators: (person.collaboratorIds || [])
      .map((id) => ({ userId: id, name: findPerson(id)?.name || id, relation: 'collaborator' as const }))
      .filter((item) => item.name),
    subordinates: personStore
      .filter((item) => reportsTo(item, person.userId))
      .map((item) => ({ userId: item.userId, name: item.name, relation: 'primary' as const })),
    assignments: clone(ensureAssignments(person)).map((row) => ({
      ...row,
      supervisorName: findPerson(row.supervisorId || '')?.name || '',
      collaboratorNames: (row.collaboratorIds || [])
        .map((id) => findPerson(id)?.name || '')
        .filter(Boolean),
    })),
    account: personAccount(person),
    idType: person.idType || 'id_card',
    extension: person.extension,
    officeLocation: person.officeLocation,
    remark: person.remark,
    jobCode: person.jobCode,
    jobTitle: person.jobTitle,
    probationMonths: person.probationMonths,
    probationStart: person.probationStart || '',
    probationEnd: person.probationEnd || '',
    actualConfirmDate: person.actualConfirmDate,
    plannedConfirmDate: person.plannedConfirmDate,
    retireDate: person.retireDate || '',
    jobGrade: person.jobGrade,
    tenureText: yearsAndMonths(person.entryDate, endDate),
    ageText: calcAge(birthDate),
    workYearsText: yearsAndMonths(person.firstWorkDate, endDate),
    idName: person.idName,
    idNumber: person.idNumber,
    birthDate,
    gender,
    ethnicity: person.ethnicity,
    idAddress: person.idAddress,
    idValidFrom: person.idValidFrom,
    idValidTo: person.idValidTo,
    maritalStatus: person.maritalStatus,
    firstWorkDate: person.firstWorkDate,
    hukouType: person.hukouType,
    address: person.address,
    politicalStatus: person.politicalStatus,
    socialSecurityNo: person.socialSecurityNo,
    providentFundNo: person.providentFundNo,
    hometown: person.hometown,
    education: person.education,
    school: person.school,
    graduateDate: person.graduateDate,
    major: person.major,
    bankCardNo: person.bankCardNo,
    bankName: person.bankName,
    contractCompany: person.contractCompany,
    contractType: person.contractType,
    firstContractStart: person.firstContractStart,
    firstContractEnd: person.firstContractEnd,
    currentContractStart: person.currentContractStart,
    currentContractEnd: person.currentContractEnd,
    contractTerm: person.contractTerm,
    renewCount: person.renewCount,
    emergencyName: person.emergencyName,
    emergencyRelation: person.emergencyRelation,
    emergencyPhone: person.emergencyPhone,
    emergencyContacts: clone(person.emergencyContacts || []),
    familyMembers: clone(person.familyMembers),
    materials: clone(person.materials),
    history: clone(person.history),
  }
}

function pushHistory(person: PersonRecord, item: Omit<HistoryRecord, 'id' | 'createdAt' | 'operator'> & { operator?: string }) {
  person.history.push({
    id: nextHistoryId(),
    operator: item.operator || '当前用户',
    createdAt: now(),
    ...item,
  })
}

function applyDept(person: PersonRecord, deptId: string) {
  if (!deptId) return '请选择部门'
  if (!getDeptName(deptId)) return '部门不存在'
  person.deptId = deptId
  return ''
}

function normalizeEmergency(list: unknown, fallback?: PersonRecord) {
  if (Array.isArray(list) && list.length) {
    return list.map((item) => {
      const row = (item || {}) as Recordable<any>
      return {
        id: pickText(row.id) || nextEmergencyId(),
        name: pickText(row.name),
        relation: pickText(row.relation),
        phone: pickText(row.phone),
      }
    }).filter((item) => item.name || item.relation || item.phone)
  }
  if (fallback?.emergencyName || fallback?.emergencyRelation || fallback?.emergencyPhone) {
    return [{
      id: nextEmergencyId(),
      name: fallback.emergencyName || '',
      relation: fallback.emergencyRelation || '',
      phone: fallback.emergencyPhone || '',
    }]
  }
  return [] as PersonRecord['emergencyContacts']
}

function normalizeFamily(list: unknown) {
  if (!Array.isArray(list)) return [] as PersonRecord['familyMembers']
  return list.map((item) => {
    const row = (item || {}) as Recordable<any>
    return {
      id: pickText(row.id) || nextFamilyId(),
      name: pickText(row.name),
      relation: pickText(row.relation),
      gender: pickText(row.gender),
      birthday: pickText(row.birthday),
      phone: pickText(row.phone),
    }
  }).filter((item) => item.name || item.relation || item.phone)
}

function applyPayload(person: PersonRecord, payload: Recordable<any>, isCreate: boolean) {
  const name = pickText(payload.name)
  const email = pickText(payload.email)
  const employeeNo = pickText(payload.employeeNo)
  const assignments = Array.isArray(payload.assignments) ? payload.assignments : []
  const primary = assignments.find((item: Recordable<any>) => item.type === 'primary' && item.status !== 'ended')
  const deptId = pickText(payload.deptId) || pickText(primary?.deptId)
  const entryDate = pickText(payload.entryDate)
  const employeeType = pickText(payload.employeeType) || 'full_time'
  const employeeStatus = pickText(payload.employeeStatus) || 'pending'
  if (!name) return '请填写姓名'
  if (!email) return '请填写邮箱'
  if (!employeeNo) return '请填写工号'
  if (!deptId) return '请选择部门或添加主职'
  if (!entryDate) return '请选择入职时间'
  if (!EMPLOYEE_TYPES.has(employeeType)) return '员工类型无效'
  if (isCreate && !EMPLOYEE_STATUSES.has(employeeStatus)) return '员工状态无效'
  if (personStore.some((item) => item.employeeNo === employeeNo && item.userId !== person.userId)) {
    return '工号已存在'
  }
  if (personStore.some((item) => item.email === email && item.userId !== person.userId)) {
    return '邮箱已存在'
  }

  const deptError = applyDept(person, deptId)
  if (deptError) return deptError

  const mainDeptId = pickText(payload.mainDeptId) || deptId
  if (!getDeptName(mainDeptId)) return '主部门不存在'

  const supervisorId = pickText(payload.supervisorId)
  if (supervisorId && supervisorId === person.userId) return '直属主管不能是本人'
  if (supervisorId && !findPerson(supervisorId)) return '直属主管不存在'

  person.name = name
  person.email = email
  person.employeeNo = employeeNo
  person.mainDeptId = mainDeptId
  person.supervisorId = supervisorId
  person.post = pickText(payload.post)
  person.mobile = pickText(payload.mobile)
  person.extension = pickText(payload.extension)
  person.officeLocation = pickText(payload.officeLocation)
  person.remark = pickText(payload.remark)
  person.entryDate = entryDate
  person.jobCode = pickText(payload.jobCode)
  person.jobTitle = pickText(payload.jobTitle) || person.post
  person.employeeType = employeeType as PersonRecord['employeeType']
  if (isCreate) {
    person.employeeStatus = employeeStatus as PersonRecord['employeeStatus']
  }
  person.collaboratorIds = Array.isArray(payload.collaboratorIds) ? payload.collaboratorIds.map(String) : person.collaboratorIds || []
  person.assignments = assignments.length
    ? assignments.map((item: Recordable<any>) => ({
        id: pickText(item.id) || `as_${Date.now().toString(36)}`,
        deptId: pickText(item.deptId),
        deptName: getDeptName(pickText(item.deptId)),
        postId: pickText(item.postId),
        postName: pickText(item.postName) || pickText(item.post),
        jobCode: pickText(item.jobCode),
        jobTitle: pickText(item.jobTitle),
        jobGrade: pickText(item.jobGrade),
        type: item.type === 'part_time' ? 'part_time' : 'primary',
        startDate: pickText(item.startDate),
        endDate: pickText(item.endDate),
        status: item.status === 'ended' ? 'ended' : 'active',
        occupyHeadcount: item.type !== 'part_time',
        supervisorId: pickText(item.supervisorId),
        collaboratorIds: Array.isArray(item.collaboratorIds) ? item.collaboratorIds.map(String) : [],
      }))
    : ensureAssignments(person)
  const nextPrimary = person.assignments.find((item) => item.type === 'primary' && item.status === 'active')
  if (nextPrimary) {
    person.deptId = nextPrimary.deptId
    person.mainDeptId = nextPrimary.deptId
    person.post = nextPrimary.postName
    person.jobCode = nextPrimary.jobCode || pickText(payload.jobCode)
    person.jobTitle = nextPrimary.jobTitle || nextPrimary.postName || pickText(payload.jobTitle)
    person.jobGrade = nextPrimary.jobGrade || pickText(payload.jobGrade)
    person.supervisorId = nextPrimary.supervisorId || ''
    person.collaboratorIds = nextPrimary.collaboratorIds || []
  }
  person.idType = pickText(payload.idType) || person.idType || 'id_card'
  person.probationMonths = pickText(payload.probationMonths)
  person.probationStart = pickText(payload.probationStart)
  person.probationEnd = pickText(payload.probationEnd)
  person.actualConfirmDate = pickText(payload.actualConfirmDate)
  person.plannedConfirmDate = pickText(payload.plannedConfirmDate)
  person.retireDate = pickText(payload.retireDate)
  person.jobGrade = pickText(payload.jobGrade)
  person.idName = pickText(payload.idName) || name
  person.idNumber = pickText(payload.idNumber)
  const parsed = person.idNumber ? parseIdCard(person.idNumber) : null
  person.birthDate = pickText(payload.birthDate) || parsed?.birthDate || ''
  person.gender = pickText(payload.gender) || parsed?.gender || ''
  person.ethnicity = pickText(payload.ethnicity)
  person.idAddress = pickText(payload.idAddress)
  person.idValidFrom = pickText(payload.idValidFrom)
  person.idValidTo = pickText(payload.idValidTo)
  person.maritalStatus = pickText(payload.maritalStatus)
  person.firstWorkDate = pickText(payload.firstWorkDate)
  person.hukouType = pickText(payload.hukouType)
  person.address = pickText(payload.address)
  person.politicalStatus = pickText(payload.politicalStatus)
  person.socialSecurityNo = pickText(payload.socialSecurityNo)
  person.providentFundNo = pickText(payload.providentFundNo)
  person.hometown = pickText(payload.hometown)
  person.education = pickText(payload.education)
  person.school = pickText(payload.school)
  person.graduateDate = pickText(payload.graduateDate)
  person.major = pickText(payload.major)
  person.bankCardNo = pickText(payload.bankCardNo)
  person.bankName = pickText(payload.bankName)
  person.contractCompany = pickText(payload.contractCompany)
  person.contractType = pickText(payload.contractType)
  person.firstContractStart = pickText(payload.firstContractStart)
  person.firstContractEnd = pickText(payload.firstContractEnd)
  person.currentContractStart = pickText(payload.currentContractStart)
  person.currentContractEnd = pickText(payload.currentContractEnd)
  person.contractTerm = pickText(payload.contractTerm)
  person.renewCount = pickText(payload.renewCount)
  person.emergencyContacts = normalizeEmergency(payload.emergencyContacts, {
    emergencyName: pickText(payload.emergencyName),
    emergencyRelation: pickText(payload.emergencyRelation),
    emergencyPhone: pickText(payload.emergencyPhone),
  } as PersonRecord)
  const firstEmergency = person.emergencyContacts[0]
  person.emergencyName = firstEmergency?.name || pickText(payload.emergencyName)
  person.emergencyRelation = firstEmergency?.relation || pickText(payload.emergencyRelation)
  person.emergencyPhone = firstEmergency?.phone || pickText(payload.emergencyPhone)
  person.familyMembers = normalizeFamily(payload.familyMembers)
  person.materials = payload.materials && typeof payload.materials === 'object' ? clone(payload.materials) : person.materials
  person.updatedAt = now()
  return ''
}

function emptyRecord(): PersonRecord {
  const stamp = now()
  return {
    userId: nextPersonId(),
    name: '',
    email: '',
    deptId: '',
    mainDeptId: '',
    supervisorId: '',
    post: '',
    mobile: '',
    employeeNo: nextEmployeeNo(),
    extension: '',
    officeLocation: '',
    remark: '',
    entryDate: today(),
    resignDate: '',
    jobCode: '',
    jobTitle: '',
    employeeType: 'full_time',
    employeeStatus: 'formal',
    probationMonths: '3',
    actualConfirmDate: '',
    plannedConfirmDate: '',
    jobGrade: '',
    roleIds: [],
    idName: '',
    idNumber: '',
    birthDate: '',
    gender: '',
    ethnicity: '汉族',
    idAddress: '',
    idValidFrom: '',
    idValidTo: '',
    maritalStatus: '',
    firstWorkDate: '',
    hukouType: '',
    address: '',
    politicalStatus: '',
    socialSecurityNo: '',
    providentFundNo: '',
    hometown: '',
    education: '',
    school: '',
    graduateDate: '',
    major: '',
    bankCardNo: '',
    bankName: '',
    contractCompany: '',
    contractType: '',
    firstContractStart: '',
    firstContractEnd: '',
    currentContractStart: '',
    currentContractEnd: '',
    contractTerm: '',
    renewCount: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    emergencyContacts: [],
    familyMembers: [],
    materials: {},
    history: [],
    createdAt: stamp,
    updatedAt: stamp,
  }
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/system/persons/page'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const keyword = pickText(payload.keyword).toLowerCase()
      const name = pickText(payload.name).toLowerCase()
      const employeeNo = pickText(payload.employeeNo).toLowerCase()
      const mobile = pickText(payload.mobile)
      const post = pickText(payload.post).toLowerCase()
      const deptId = pickText(payload.deptId)
      const status = pickText(payload.employeeStatus)
      const type = pickText(payload.employeeType)
      const hasAccount = payload.hasAccount
      const page = Math.max(1, Number(payload.page) || 1)
      const pageSize = Math.max(1, Number(payload.pageSize) || 10)
      const deptIds = deptId ? collectDeptIds(deptId) : null

      const filtered = personStore.filter((item) => {
        const assignments = ensureAssignments(item)
        const inDept = assignments.some((row) => deptIds?.has(row.deptId)) || (deptIds?.has(item.deptId) ?? false)
        if (deptIds && !inDept) return false
        if (status && item.employeeStatus !== status) return false
        if (type && item.employeeType !== type) return false
        if (name && !item.name.toLowerCase().includes(name)) return false
        if (employeeNo && !item.employeeNo.toLowerCase().includes(employeeNo)) return false
        if (mobile && !item.mobile.includes(mobile)) return false
        if (post && !`${item.post} ${assignments.map((row) => row.postName).join(' ')}`.toLowerCase().includes(post)) return false
        if (hasAccount === true && !findAccountByPersonId(item.userId)) return false
        if (hasAccount === false && findAccountByPersonId(item.userId)) return false
        if (keyword) {
          const blob = `${item.name} ${item.employeeNo} ${item.email} ${item.mobile} ${item.post}`.toLowerCase()
          if (!blob.includes(keyword)) return false
        }
        return true
      })

      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/system/person/detail'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const person = findPerson(pickText((body as Recordable<any>)?.userId))
      if (!person) return resultError('人员不存在')
      return resultSuccess(toDetail(person))
    },
  },
  {
    url: mockUrl('/system/person/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const person = emptyRecord()
      const error = applyPayload(person, (body || {}) as Recordable<any>, true)
      if (error) return resultError(error)
      pushHistory(person, {
        type: 'create',
        title: '新增',
        summary: pickText((body as Recordable<any>)?.remark) || `建档 ${getDeptName(person.deptId)}，岗位 ${person.post || '-'}`,
        effectiveDate: person.entryDate,
      })
      personStore.unshift(person)
      return resultSuccess(toDetail(person), { message: '新增成功' })
    },
  },
  {
    url: mockUrl('/system/person'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      const error = applyPayload(person, payload, false)
      if (error) return resultError(error)
      pushHistory(person, {
        type: 'update',
        title: '编辑',
        summary: pickText(payload.remark),
        effectiveDate: today(),
      })
      return resultSuccess(toDetail(person), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/person/delete'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const userId = pickText((body as Recordable<any>)?.userId)
      const index = personStore.findIndex((item) => item.userId === userId)
      if (index < 0) return resultError('人员不存在')
      if (personStore[index].employeeStatus !== 'resigned') {
        return resultError('在职人员不能删除，请先办理离职')
      }
      const [removed] = personStore.splice(index, 1)
      return resultSuccess({ userId: removed.userId }, { message: '删除成功' })
    },
  },
  {
    url: mockUrl('/system/person/history'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const person = findPerson(pickText((body as Recordable<any>)?.userId))
      if (!person) return resultError('人员不存在')
      return resultSuccess(clone(person.history).reverse())
    },
  },
  {
    url: mockUrl('/system/person/transfer'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus === 'resigned' || person.employeeStatus === 'retired') {
        return resultError('当前状态不能调岗')
      }
      const remark = pickText(payload.remark)
      const transferType = pickText(payload.transferType) || 'primary'
      const assignments = ensureAssignments(person)
      const deptId = pickText(payload.deptId)
      const postId = pickText(payload.postId)
      const post = pickText(payload.post)
      const effectiveDate = pickText(payload.effectiveDate) || today()
      const assignmentId = pickText(payload.assignmentId)
      if (transferType !== 'part_time_end' && (!deptId || !getDeptName(deptId))) return resultError('请选择有效部门')

      if (transferType === 'primary') {
        const current = assignments.find((item) => item.type === 'primary' && item.status === 'active')
        if (current) {
          current.status = 'ended'
          current.endDate = effectiveDate
        }
        assignments.push({
          id: `as_${Date.now().toString(36)}`,
          deptId,
          deptName: getDeptName(deptId),
          postId: postId || `post_${deptId}_${post || 'default'}`,
          postName: post,
          type: 'primary',
          startDate: effectiveDate,
          endDate: '',
          status: 'active',
          occupyHeadcount: true,
        })
        person.deptId = deptId
        person.mainDeptId = deptId
        person.post = post
      } else if (transferType === 'part_time_add') {
        assignments.push({
          id: `as_${Date.now().toString(36)}`,
          deptId,
          deptName: getDeptName(deptId),
          postId: postId || `post_${deptId}_${post || 'default'}`,
          postName: post,
          type: 'part_time',
          startDate: effectiveDate,
          endDate: '',
          status: 'active',
          occupyHeadcount: false,
        })
      } else if (transferType === 'part_time_change') {
        const current = assignments.find((item) => item.id === assignmentId)
        if (current) {
          current.status = 'ended'
          current.endDate = effectiveDate
        }
        assignments.push({
          id: `as_${Date.now().toString(36)}`,
          deptId,
          deptName: getDeptName(deptId),
          postId: postId || `post_${deptId}_${post || 'default'}`,
          postName: post,
          type: 'part_time',
          startDate: effectiveDate,
          endDate: '',
          status: 'active',
          occupyHeadcount: false,
        })
      } else if (transferType === 'part_time_end') {
        const current = assignments.find((item) => item.id === assignmentId)
        if (current) {
          current.status = 'ended'
          current.endDate = effectiveDate
        }
      }
      person.assignments = assignments
      person.updatedAt = now()
      pushHistory(person, {
        type: transferType === 'primary' ? 'transfer' : transferType,
        title: '调岗',
        summary: remark,
        effectiveDate,
      })
      return resultSuccess(toDetail(person), { message: '调岗成功' })
    },
  },
  {
    url: mockUrl('/system/person/confirm'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus !== 'probation' && person.employeeStatus !== 'pending') {
        return resultError('仅待入职或试用人员可转正')
      }
      const remark = pickText(payload.remark)
      const targetStatus = pickText(payload.targetStatus) === 'probation' ? 'probation' : 'formal'
      person.employeeStatus = targetStatus
      person.probationStart = pickText(payload.probationStart) || person.probationStart
      person.probationEnd = pickText(payload.probationEnd) || person.probationEnd
      if (targetStatus === 'formal') {
        person.actualConfirmDate = pickText(payload.actualConfirmDate) || today()
      }
      person.updatedAt = now()
      pushHistory(person, {
        type: 'confirm',
        title: '转正',
        summary: remark,
        effectiveDate: person.actualConfirmDate || today(),
      })
      return resultSuccess(toDetail(person), { message: '转正成功' })
    },
  },
  {
    url: mockUrl('/system/person/resign'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus === 'resigned' || person.employeeStatus === 'retired') {
        return resultError('当前状态不能离职')
      }
      const remark = pickText(payload.remark)
      const resignDate = pickText(payload.resignDate) || today()
      person.employeeStatus = 'resigned'
      person.resignDate = resignDate
      ensureAssignments(person).forEach((item) => {
        if (item.status === 'active') {
          item.status = 'ended'
          item.endDate = resignDate
        }
      })
      const account = findAccountByPersonId(person.userId)
      if (account) account.enabled = false
      person.updatedAt = now()
      pushHistory(person, {
        type: 'resign',
        title: '离职',
        summary: remark,
        effectiveDate: resignDate,
        extra: { reason: pickText(payload.reason) },
      })
      return resultSuccess(toDetail(person), { message: '离职办理成功' })
    },
  },
  {
    url: mockUrl('/system/person/reinstate'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus !== 'resigned') return resultError('仅离职人员可复职')
      const remark = pickText(payload.remark)
      const deptId = pickText(payload.deptId) || person.deptId
      const post = pickText(payload.post) || person.post
      const effectiveDate = pickText(payload.effectiveDate) || today()
      if (!getDeptName(deptId)) return resultError('部门不存在')
      person.deptId = deptId
      person.mainDeptId = deptId
      person.post = post
      person.jobTitle = post
      person.employeeStatus = pickText(payload.employeeStatus) === 'probation' ? 'probation' : 'formal'
      person.entryDate = effectiveDate
      person.resignDate = ''
      person.updatedAt = now()
      pushHistory(person, {
        type: 'reinstate',
        title: '复职',
        summary: `复职至 ${getDeptName(deptId)}，岗位 ${post || '-'}`,
        effectiveDate,
        extra: { remark },
      })
      return resultSuccess(toDetail(person), { message: '复职成功' })
    },
  },
  {
    url: mockUrl('/system/person/disable'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => changeStatus(body, 'disabled', 'disable', '停用'),
  },
  {
    url: mockUrl('/system/person/enable'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus !== 'disabled') return resultError('仅停用人员可启用')
      const remark = pickText(payload.remark)
      const next = pickText(payload.employeeStatus) === 'probation' ? 'probation' : 'formal'
      person.employeeStatus = next
      person.updatedAt = now()
      pushHistory(person, {
        type: 'enable',
        title: '启用',
        summary: remark,
        effectiveDate: pickText(payload.effectiveDate) || today(),
      })
      return resultSuccess(toDetail(person), { message: '启用成功' })
    },
  },
  {
    url: mockUrl('/system/person/retire'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => changeStatus(body, 'retired', 'retire', '退休'),
  },
  {
    url: mockUrl('/system/person/rehire'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const person = findPerson(pickText(payload.userId))
      if (!person) return resultError('人员不存在')
      if (person.employeeStatus !== 'resigned' && person.employeeStatus !== 'retired') {
        return resultError('仅离职或退休人员可返聘')
      }
      const remark = pickText(payload.remark)
      const deptId = pickText(payload.deptId)
      const post = pickText(payload.post)
      const effectiveDate = pickText(payload.effectiveDate) || today()
      if (!getDeptName(deptId)) return resultError('请选择部门')
      ensureAssignments(person).forEach((item) => {
        if (item.status === 'active') {
          item.status = 'ended'
          item.endDate = effectiveDate
        }
      })
      person.assignments = [
        ...(person.assignments || []),
        {
          id: `as_${Date.now().toString(36)}`,
          deptId,
          deptName: getDeptName(deptId),
          postId: pickText(payload.postId) || `post_${deptId}_${post || 'default'}`,
          postName: post,
          type: pickText(payload.assignmentType) === 'part_time' ? 'part_time' : 'primary',
          startDate: effectiveDate,
          endDate: '',
          status: 'active',
          occupyHeadcount: pickText(payload.assignmentType) !== 'part_time',
        },
      ]
      person.deptId = deptId
      person.mainDeptId = deptId
      person.post = post
      person.supervisorId = pickText(payload.supervisorId) || person.supervisorId
      person.employeeStatus = 'rehired'
      person.updatedAt = now()
      const accountId = pickText(payload.accountId)
      if (accountId) {
        const account = findAccountByPersonId(person.userId)
        if (account && account.accountId === accountId) account.enabled = true
      }
      pushHistory(person, {
        type: 'rehire',
        title: '返聘',
        summary: remark,
        effectiveDate,
      })
      return resultSuccess(toDetail(person), { message: '返聘成功' })
    },
  },
  {
    url: mockUrl('/system/posts'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const deptId = pickText((body as Recordable<any>)?.deptId)
      const titles = new Map<string, { id: string; name: string; deptId: string }>()
      personStore.forEach((person) => {
        ensureAssignments(person).forEach((item) => {
          if (deptId && item.deptId !== deptId) return
          const id = item.postId || `post_${item.deptId}_${item.postName || 'default'}`
          titles.set(id, { id, name: item.postName || '职员', deptId: item.deptId })
        })
        if (!deptId || person.deptId === deptId) {
          const id = `post_${person.deptId}_${person.post || 'default'}`
          titles.set(id, { id, name: person.post || '职员', deptId: person.deptId })
        }
      })
      if (deptId && !titles.size) {
        titles.set(`post_${deptId}_default`, { id: `post_${deptId}_default`, name: '职员', deptId })
      }
      return resultSuccess(
        [...titles.values()].map((item) => ({
          ...item,
          enabled: true,
          headcount: 8,
          occupied: personStore.filter((person) =>
            ensureAssignments(person).some((row) => row.postId === item.id && row.status === 'active' && row.occupyHeadcount),
          ).length,
        })),
      )
    },
  },
]

function changeStatus(
  body: unknown,
  status: PersonRecord['employeeStatus'],
  type: 'disable' | 'retire',
  title: string,
) {
  const payload = (body || {}) as Recordable<any>
  const person = findPerson(pickText(payload.userId))
  if (!person) return resultError('人员不存在')
  const remark = pickText(payload.remark)
  if (type === 'retire' && person.employeeStatus !== 'formal' && person.employeeStatus !== 'rehired') {
    return resultError('仅正式或返聘人员可退休')
  }
  person.previousStatus = person.employeeStatus
  person.employeeStatus = status
  if (status === 'retired') {
    person.retireDate = pickText(payload.effectiveDate) || today()
    ensureAssignments(person).forEach((item) => {
      if (item.status === 'active') {
        item.status = 'ended'
        item.endDate = person.retireDate || today()
      }
    })
  }
  person.updatedAt = now()
  pushHistory(person, {
    type,
    title,
    summary: remark,
    effectiveDate: pickText(payload.effectiveDate) || today(),
  })
  return resultSuccess(toDetail(person), { message: `${title}成功` })
}

export default mocks
