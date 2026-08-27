import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  collectDeptIds,
  findPerson,
  getDeptName,
  nextEmployeeNo,
  nextFamilyId,
  nextHistoryId,
  nextPersonId,
  personStore,
  type HistoryRecord,
  type PersonRecord,
} from './orgStore'

const EMPLOYEE_TYPES = new Set(['full_time', 'intern', 'part_time', 'contractor'])
const EMPLOYEE_STATUSES = new Set(['probation', 'formal', 'resigned'])

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

function toListItem(person: PersonRecord) {
  const event = lastEvent(person)
  return {
    userId: person.userId,
    name: person.name,
    employeeNo: person.employeeNo,
    email: person.email,
    mobile: person.mobile,
    deptId: person.deptId,
    deptName: getDeptName(person.deptId),
    post: person.post,
    employeeType: person.employeeType,
    employeeStatus: person.employeeStatus,
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
    extension: person.extension,
    officeLocation: person.officeLocation,
    remark: person.remark,
    jobCode: person.jobCode,
    jobTitle: person.jobTitle,
    probationMonths: person.probationMonths,
    actualConfirmDate: person.actualConfirmDate,
    plannedConfirmDate: person.plannedConfirmDate,
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
  const deptId = pickText(payload.deptId)
  const entryDate = pickText(payload.entryDate)
  const employeeType = pickText(payload.employeeType) || 'full_time'
  const employeeStatus = pickText(payload.employeeStatus) || 'formal'

  if (!name) return '请填写姓名'
  if (!email) return '请填写邮箱'
  if (!employeeNo) return '请填写工号'
  if (!deptId) return '请选择部门'
  if (!entryDate) return '请选择入职时间'
  if (!EMPLOYEE_TYPES.has(employeeType)) return '员工类型无效'
  if (!EMPLOYEE_STATUSES.has(employeeStatus)) return '员工状态无效'
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
  if (isCreate || person.employeeStatus !== 'resigned') {
    person.employeeStatus = employeeStatus as PersonRecord['employeeStatus']
  }
  person.probationMonths = pickText(payload.probationMonths)
  person.actualConfirmDate = pickText(payload.actualConfirmDate)
  person.plannedConfirmDate = pickText(payload.plannedConfirmDate)
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
  person.emergencyName = pickText(payload.emergencyName)
  person.emergencyRelation = pickText(payload.emergencyRelation)
  person.emergencyPhone = pickText(payload.emergencyPhone)
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
      const deptId = pickText(payload.deptId)
      const status = pickText(payload.employeeStatus)
      const type = pickText(payload.employeeType)
      const page = Math.max(1, Number(payload.page) || 1)
      const pageSize = Math.max(1, Number(payload.pageSize) || 10)
      const deptIds = deptId ? collectDeptIds(deptId) : null

      const filtered = personStore.filter((item) => {
        if (deptIds && !deptIds.has(item.deptId)) return false
        if (status && item.employeeStatus !== status) return false
        if (type && item.employeeType !== type) return false
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
        type: 'onboard',
        title: '入职',
        summary: `入职 ${getDeptName(person.deptId)}，岗位 ${person.post || '-'}`,
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
      if (person.employeeStatus === 'resigned') return resultError('已离职人员不能调岗')
      const deptId = pickText(payload.deptId)
      const post = pickText(payload.post)
      const effectiveDate = pickText(payload.effectiveDate) || today()
      if (!deptId) return resultError('请选择调入部门')
      if (!post) return resultError('请填写新岗位')
      if (!getDeptName(deptId)) return resultError('部门不存在')
      const fromDept = getDeptName(person.deptId)
      const fromPost = person.post
      person.deptId = deptId
      person.mainDeptId = deptId
      person.post = post
      person.jobTitle = pickText(payload.jobTitle) || post
      person.updatedAt = now()
      pushHistory(person, {
        type: 'transfer',
        title: '调岗',
        summary: `${fromDept} / ${fromPost || '-'} → ${getDeptName(deptId)} / ${post}`,
        effectiveDate,
        extra: { reason: pickText(payload.reason), fromDept, fromPost, toDept: getDeptName(deptId), toPost: post },
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
      if (person.employeeStatus !== 'probation') return resultError('仅试用期人员可转正')
      const actualConfirmDate = pickText(payload.actualConfirmDate) || today()
      person.employeeStatus = 'formal'
      person.actualConfirmDate = actualConfirmDate
      person.updatedAt = now()
      pushHistory(person, {
        type: 'confirm',
        title: '转正',
        summary: `转为正式员工${pickText(payload.remark) ? `，${pickText(payload.remark)}` : ''}`,
        effectiveDate: actualConfirmDate,
        extra: { remark: pickText(payload.remark) },
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
      if (person.employeeStatus === 'resigned') return resultError('该人员已离职')
      const resignDate = pickText(payload.resignDate) || today()
      person.employeeStatus = 'resigned'
      person.resignDate = resignDate
      person.updatedAt = now()
      pushHistory(person, {
        type: 'resign',
        title: '离职',
        summary: pickText(payload.reason) || '办理离职',
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
        extra: { remark: pickText(payload.remark) },
      })
      return resultSuccess(toDetail(person), { message: '复职成功' })
    },
  },
]

export default mocks
