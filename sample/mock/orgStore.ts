import { MOCK_DEPTS, MOCK_PERSONS } from '../../DesignRock/rock-business-components/src/person-select/mock'

export type FamilyMemberRecord = {
  id: string
  name: string
  relation: string
  gender: string
  birthday: string
  phone: string
}

export type EmergencyContactRecord = {
  id: string
  name: string
  relation: string
  phone: string
}

export type MaterialFileRecord = {
  name: string
  url: string
}

export type HistoryRecord = {
  id: string
  type: string
  title: string
  summary: string
  effectiveDate: string
  operator: string
  createdAt: string
  extra?: Record<string, string>
}

export type DeptRecord = {
  id: string
  name: string
  parentId: string | null
  code: string
  status: 'enabled' | 'disabled'
  sort: number
  description: string
  deleted: boolean
  managerType: '' | 'person' | 'post'
  managerId: string
  managerPostId: string
  managerHistory: Array<{
    id: string
    personId: string
    personName: string
    postId?: string
    postName?: string
    startedAt: string
    endedAt: string
    reason: string
  }>
  createdAt: string
  updatedAt: string
}

export type PositionRecord = {
  id: string
  name: string
  code: string
  level: number
  sort: number
  description: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type PostRecord = {
  id: string
  name: string
  code: string
  deptId: string
  postType: '' | 'formal' | 'contractor' | 'intern' | 'management'
  formalHeadcount: number
  contractorHeadcount: number
  partTimeHeadcount: number
  internHeadcount: number
  duty: string
  requirement: string
  sort: number
  remark: string
  enabled: boolean
  enabledBeforeCascade: boolean
  createdAt: string
  updatedAt: string
}

export type PersonRecord = {
  userId: string
  name: string
  email: string
  deptId: string
  mainDeptId: string
  supervisorId: string
  post: string
  mobile: string
  employeeNo: string
  extension: string
  officeLocation: string
  remark: string
  entryDate: string
  resignDate: string
  jobCode: string
  jobTitle: string
  employeeType: 'full_time' | 'intern' | 'part_time' | 'contractor'
  employeeStatus: 'pending' | 'probation' | 'formal' | 'resigned' | 'retired' | 'rehired'
  previousStatus?: PersonRecord['employeeStatus']
  collaboratorIds?: string[]
  assignments?: Array<{
    id: string
    deptId: string
    deptName: string
    postId: string
    postName: string
    jobCode?: string
    jobTitle?: string
    jobGradeId?: string
    jobGrade?: string
    type: 'primary' | 'part_time'
    startDate: string
    endDate: string
    status: 'active' | 'ended'
    occupyHeadcount: boolean
    reason?: string
    supervisorId?: string
    collaboratorIds?: string[]
  }>
  idType?: string
  probationStart?: string
  probationEnd?: string
  retireDate?: string
  probationMonths: string
  actualConfirmDate: string
  plannedConfirmDate: string
  jobGrade: string
  roleIds: string[]
  idName: string
  idNumber: string
  birthDate: string
  gender: string
  ethnicity: string
  idAddress: string
  idValidFrom: string
  idValidTo: string
  maritalStatus: string
  firstWorkDate: string
  hukouType: string
  address: string
  politicalStatus: string
  socialSecurityNo: string
  providentFundNo: string
  hometown: string
  education: string
  school: string
  graduateDate: string
  major: string
  bankCardNo: string
  bankName: string
  contractCompany: string
  contractType: string
  firstContractStart: string
  firstContractEnd: string
  currentContractStart: string
  currentContractEnd: string
  contractTerm: string
  renewCount: string
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  emergencyContacts: EmergencyContactRecord[]
  familyMembers: FamilyMemberRecord[]
  materials: Partial<Record<string, MaterialFileRecord | null>>
  history: HistoryRecord[]
  createdAt: string
  updatedAt: string
}

const ROLE_POST: Record<string, string> = {
  'r-admin': '管理员',
  'r-dev': '开发工程师',
  'r-qa': '测试工程师',
  'r-pm': '产品经理',
  'r-ops': '运维工程师',
}

function iso(date: string) {
  return `${date}T09:00:00.000Z`
}

function emptyPerson(base: {
  userId: string
  name: string
  deptId: string
  deptName: string
  roleIds: string[]
  index: number
}): PersonRecord {
  const n = String(base.index + 1).padStart(2, '0')
  const entryDate = base.index % 5 === 0 ? '2024-03-01' : '2022-06-01'
  const status = base.index === 4 ? 'resigned' : (base.index % 7 === 2 ? 'probation' : 'formal')
  const post = ROLE_POST[base.roleIds[0]] || '职员'
  const now = iso(entryDate)
  return {
    userId: base.userId,
    name: base.name,
    email: `user${base.index + 1}@grow.local`,
    deptId: base.deptId,
    mainDeptId: base.deptId,
    supervisorId: base.index === 0 ? 'u5' : (base.deptId.startsWith('d-dl') ? 'u5' : ''),
    post,
    mobile: `138000000${n}`,
    employeeNo: `E20${n}`,
    extension: `${8000 + base.index}`,
    officeLocation: base.deptId.startsWith('d-bj') ? '北京' : (base.deptId.startsWith('d-dl') ? '大连' : '远程'),
    remark: '',
    entryDate,
    resignDate: status === 'resigned' ? '2025-12-31' : '',
    jobCode: `P-${n}`,
    jobTitle: post,
    employeeType: base.index % 9 === 0 ? 'intern' : 'full_time',
    employeeStatus: status,
    probationMonths: status === 'probation' ? '3' : '3',
    actualConfirmDate: status === 'formal' ? '2022-09-01' : '',
    plannedConfirmDate: status === 'probation' ? '2024-06-01' : '2022-09-01',
    jobGrade: base.index % 3 === 0 ? '高级专员' : '专员',
    roleIds: [],
    idName: base.name,
    idNumber: '',
    birthDate: `199${base.index % 10}-0${(base.index % 8) + 1}-15`,
    gender: base.index % 2 === 0 ? 'male' : 'female',
    ethnicity: '汉族',
    idAddress: '',
    idValidFrom: '',
    idValidTo: '',
    maritalStatus: base.index % 3 === 0 ? 'married' : 'unmarried',
    firstWorkDate: '2018-07-01',
    hukouType: 'urban',
    address: '',
    politicalStatus: '群众',
    socialSecurityNo: '',
    providentFundNo: '',
    hometown: base.deptId.startsWith('d-bj') ? '北京' : '辽宁',
    education: 'bachelor',
    school: '',
    graduateDate: '2018-06-01',
    major: '',
    bankCardNo: '',
    bankName: '',
    contractCompany: 'Grow 科技',
    contractType: 'fixed',
    firstContractStart: entryDate,
    firstContractEnd: '2025-06-01',
    currentContractStart: entryDate,
    currentContractEnd: '2026-06-01',
    contractTerm: '3年',
    renewCount: '0',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    emergencyContacts: [],
    familyMembers: [],
    materials: {},
    history: [
      {
        id: `h_${base.userId}_onboard`,
        type: 'onboard',
        title: '入职',
        summary: `入职 ${base.deptName}，岗位 ${post}`,
        effectiveDate: entryDate,
        operator: '系统',
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const deptCode: Record<string, string> = {
  'd-root': 'ROOT',
  'd-dl': 'RND-DL',
  'd-dl-fe': 'RND-DL-FE',
  'd-dl-be': 'RND-DL-BE',
  'd-qa': 'QA',
  'd-bj': 'RND-BJ',
  'd-bj-app': 'RND-BJ-APP',
  'd-frontier': 'FRONTIER',
}

export const deptList: DeptRecord[] = MOCK_DEPTS.map((item, index) => ({
  ...item,
  code: deptCode[item.id] || item.id.toUpperCase(),
  status: 'enabled',
  sort: index * 10,
  description: item.id === 'd-root' ? '虚拟组织根节点' : `${item.name}组织单元`,
  deleted: false,
  managerType: '',
  managerId: '',
  managerPostId: '',
  managerHistory: [],
  createdAt: `2024-01-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
  updatedAt: `2024-01-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
}))

type OrgGlobal = {
  personStore: PersonRecord[]
  postStore: PostRecord[]
  positionStore: PositionRecord[]
}

const ORG_STORE_VERSION = 8

const SEED_POSITIONS: PositionRecord[] = [
  { id: 'pos_manager', name: '经理', code: 'MANAGER', level: 5, sort: 10, description: '部门经理层级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
  { id: 'pos_supervisor', name: '主管', code: 'SUPERVISOR', level: 4, sort: 20, description: '团队主管层级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
  { id: 'pos_engineer', name: '工程师', code: 'ENGINEER', level: 3, sort: 25, description: '专业技术职级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
  { id: 'pos_senior', name: '高级专员', code: 'SENIOR_SPECIALIST', level: 3, sort: 30, description: '高级专员职级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
  { id: 'pos_specialist', name: '专员', code: 'SPECIALIST', level: 2, sort: 40, description: '专员职级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
  { id: 'pos_assistant', name: '助理', code: 'ASSISTANT', level: 1, sort: 50, description: '助理职级', enabled: true, createdAt: '2024-01-01T09:00:00.000Z', updatedAt: '2024-01-01T09:00:00.000Z' },
]

function nowIso() {
  return new Date().toISOString()
}

export function createPostRecord(input: Pick<PostRecord, 'id' | 'name' | 'deptId'> & Partial<PostRecord>): PostRecord {
  const stamp = nowIso()
  return {
    id: input.id,
    name: input.name,
    code: input.code || `P_${input.deptId}_${input.name}`.replace(/\s+/g, ''),
    deptId: input.deptId,
    postType: input.postType ?? 'formal',
    formalHeadcount: input.formalHeadcount ?? 8,
    contractorHeadcount: input.contractorHeadcount ?? 0,
    partTimeHeadcount: input.partTimeHeadcount ?? 0,
    internHeadcount: input.internHeadcount ?? 0,
    duty: input.duty || '',
    requirement: input.requirement || '',
    sort: input.sort ?? 10,
    remark: input.remark || '',
    enabled: input.enabled ?? true,
    enabledBeforeCascade: input.enabledBeforeCascade ?? true,
    createdAt: input.createdAt || stamp,
    updatedAt: input.updatedAt || stamp,
  }
}

function getOrgGlobal(): OrgGlobal {
  const g = globalThis as typeof globalThis & {
    __GROW_ORG_STORE__?: OrgGlobal
    __GROW_ORG_STORE_VERSION__?: number
  }
  if (
    !g.__GROW_ORG_STORE__
    || g.__GROW_ORG_STORE_VERSION__ !== ORG_STORE_VERSION
    || !g.__GROW_ORG_STORE__.positionStore
  ) {
    const personStore = MOCK_PERSONS.map((item, index) => emptyPerson({ ...item, index }))
    const zhang = personStore.find((item) => item.userId === 'u1')
    if (zhang) {
      zhang.email = 'zhangsan@grow.local'
      zhang.supervisorId = 'u5'
      zhang.idNumber = '210202199203151234'
      zhang.birthDate = '1992-03-15'
      zhang.gender = 'male'
      zhang.school = '大连理工大学'
      zhang.major = '计算机科学与技术'
      zhang.emergencyName = '张母'
      zhang.emergencyRelation = '母亲'
      zhang.emergencyPhone = '13900001111'
      zhang.emergencyContacts = [
        { id: 'ec_u1_1', name: '张母', relation: '母亲', phone: '13900001111' },
        { id: 'ec_u1_2', name: '张父', relation: '父亲', phone: '13900002222' },
      ]
      zhang.familyMembers = [
        { id: 'fm_u1_1', name: '张母', relation: '母亲', gender: 'female', birthday: '1968-05-01', phone: '13900001111' },
      ]
      zhang.jobTitle = '前端开发工程师'
      zhang.jobGrade = '工程师'
      zhang.jobCode = 'P-FE-01'
      zhang.collaboratorIds = ['u2']
      zhang.assignments = [
        {
          id: 'as_u1_primary',
          deptId: 'd-dl-fe',
          deptName: '前端组',
          postId: 'post_d-dl-fe_开发工程师',
          postName: '开发工程师',
          jobCode: 'P-FE-01',
          jobTitle: '前端开发工程师',
          jobGradeId: 'pos_engineer',
          jobGrade: '工程师',
          type: 'primary',
          startDate: zhang.entryDate,
          endDate: '',
          status: 'active',
          occupyHeadcount: true,
          supervisorId: 'u5',
          collaboratorIds: ['u2'],
        },
        {
          id: 'as_u1_be',
          deptId: 'd-dl-be',
          deptName: '后端组',
          postId: 'post_d-dl-be_开发工程师',
          postName: '开发工程师',
          jobCode: 'P-BE-PT',
          jobTitle: '后端协作开发',
          jobGradeId: 'pos_engineer',
          jobGrade: '工程师',
          type: 'part_time',
          startDate: '2024-09-01',
          endDate: '',
          status: 'active',
          occupyHeadcount: false,
          supervisorId: 'u3',
          collaboratorIds: [],
        },
        {
          id: 'as_u1_frontier',
          deptId: 'd-frontier',
          deptName: '前沿部署组',
          postId: 'post_d-frontier_开发工程师',
          postName: '开发工程师',
          jobCode: 'P-FR-PT',
          jobTitle: '前端顾问',
          jobGradeId: 'pos_senior',
          jobGrade: '高级专员',
          type: 'part_time',
          startDate: '2025-01-15',
          endDate: '',
          status: 'active',
          occupyHeadcount: false,
          supervisorId: 'u11',
          collaboratorIds: [],
        },
      ]
      zhang.history.push({
        id: 'h_u1_transfer',
        type: 'transfer',
        title: '调岗',
        summary: '岗位由前端开发调整为开发工程师',
        effectiveDate: '2023-04-01',
        operator: '钱七',
        createdAt: iso('2023-04-01'),
        extra: { fromPost: '前端开发', toPost: '开发工程师' },
      })
      zhang.history.push({
        id: 'h_u1_part_be',
        type: 'transfer',
        title: '兼职任职',
        summary: '兼任后端组开发工程师',
        effectiveDate: '2024-09-01',
        operator: '钱七',
        createdAt: iso('2024-09-01'),
        extra: { toDept: '后端组', toPost: '开发工程师', assignmentType: 'part_time' },
      })
      zhang.history.push({
        id: 'h_u1_part_frontier',
        type: 'transfer',
        title: '兼职任职',
        summary: '兼任前沿部署组前端顾问',
        effectiveDate: '2025-01-15',
        operator: '钱七',
        createdAt: iso('2025-01-15'),
        extra: { toDept: '前沿部署组', toPost: '开发工程师', assignmentType: 'part_time' },
      })
      zhang.updatedAt = iso('2025-01-15')
    }
    const li = personStore.find((item) => item.userId === 'u2')
    if (li) {
      li.email = 'lisi@grow.local'
      li.history.push({
        id: 'h_u2_confirm',
        type: 'confirm',
        title: '转正',
        summary: '试用期满，转为正式员工',
        effectiveDate: '2022-09-01',
        operator: '钱七',
        createdAt: iso('2022-09-01'),
      })
    }
    const qian = personStore.find((item) => item.userId === 'u5')
    if (qian) {
      qian.resignDate = '2025-12-31'
      qian.employeeStatus = 'resigned'
      qian.history.push({
        id: 'h_u5_resign',
        type: 'resign',
        title: '离职',
        summary: '主动离职',
        effectiveDate: '2025-12-31',
        operator: '系统',
        createdAt: iso('2025-12-31'),
      })
    }
    const postMap = new Map<string, PostRecord>()
    for (const person of personStore) {
      const assignments = ensurePersonAssignments(person)
      for (const assignment of assignments) {
        if (!postMap.has(assignment.postId)) {
          postMap.set(assignment.postId, createPostRecord({
            id: assignment.postId,
            name: assignment.postName || '职员',
            deptId: assignment.deptId,
          }))
        }
        if (person.employeeType === 'intern') {
          const post = postMap.get(assignment.postId)
          if (post && post.internHeadcount < 2) post.internHeadcount = 2
        }
      }
    }
    g.__GROW_ORG_STORE__ = {
      personStore,
      postStore: [...postMap.values()],
      positionStore: clone(SEED_POSITIONS),
    }
    g.__GROW_ORG_STORE_VERSION__ = ORG_STORE_VERSION
  }
  return g.__GROW_ORG_STORE__
}

export const personStore = getOrgGlobal().personStore
export const postStore = getOrgGlobal().postStore
export const positionStore = getOrgGlobal().positionStore

const beijing = deptList.find((item) => item.id === 'd-bj')
if (beijing && !beijing.managerId) {
  beijing.managerType = 'person'
  beijing.managerId = 'u9'
}
const frontier = deptList.find((item) => item.id === 'd-frontier')
if (frontier && !frontier.managerId) {
  frontier.managerType = 'post'
  frontier.managerId = 'u11'
  frontier.managerPostId = 'post_d-frontier_运维工程师'
}

export function getDeptName(id: string) {
  return deptList.find((item) => item.id === id)?.name || ''
}

export function buildDeptTree() {
  const byParent = new Map<string | null, typeof deptList>()
  for (const dept of deptList.filter((item) => !item.deleted && item.status === 'enabled')) {
    const list = byParent.get(dept.parentId) || []
    list.push(dept)
    byParent.set(dept.parentId, list)
  }

  const walk = (parentId: string | null): Array<{ id: string; title: string; children?: any[] }> =>
    (byParent.get(parentId) || []).map((dept) => {
      const children = walk(dept.id)
      return {
        id: dept.id,
        title: dept.name,
        ...(children.length ? { children } : {}),
      }
    })

  return walk('d-root')
}

export function collectDeptIds(rootId: string) {
  const ids = new Set<string>()
  if (!rootId) return ids
  const walk = (id: string) => {
    ids.add(id)
    for (const dept of deptList) {
      if (dept.parentId === id) walk(dept.id)
    }
  }
  walk(rootId)
  return ids
}

export function ensurePersonAssignments(person: PersonRecord) {
  if (person.assignments?.length) return person.assignments
  if (!person.deptId) return []
  const ended = person.employeeStatus === 'resigned' || person.employeeStatus === 'retired'
  person.assignments = [{
    id: `as_${person.userId}`,
    deptId: person.deptId,
    deptName: getDeptName(person.deptId),
    postId: `post_${person.deptId}_${person.post || 'default'}`,
    postName: person.post,
    jobGradeId: SEED_POSITIONS.find((item) => item.name === person.jobGrade)?.id,
    jobGrade: person.jobGrade,
    type: 'primary',
    startDate: person.entryDate,
    endDate: ended ? person.resignDate || person.retireDate || '' : '',
    status: ended ? 'ended' : 'active',
    occupyHeadcount: true,
    supervisorId: person.supervisorId || '',
    collaboratorIds: person.collaboratorIds || [],
  }]
  return person.assignments
}

export function findDept(id: string) {
  return deptList.find((item) => item.id === id)
}

export function findPost(id: string) {
  return postStore.find((item) => item.id === id)
}

export function findPosition(id: string) {
  return positionStore.find((item) => item.id === id)
}

export function isDeptSelectable(id: string) {
  const dept = findDept(id)
  return Boolean(dept && !dept.deleted && dept.status === 'enabled')
}

export function nextDeptId() {
  return `dept_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextPostId() {
  return `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextPositionId() {
  return `pos_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function findPerson(userId: string) {
  return personStore.find((item) => item.userId === userId)
}

export function nextPersonId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextHistoryId() {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextFamilyId() {
  return `fm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextEmergencyId() {
  return `ec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function nextEmployeeNo() {
  const max = personStore.reduce((acc, item) => {
    const num = Number(String(item.employeeNo || '').replace(/\D/g, ''))
    return Number.isFinite(num) ? Math.max(acc, num) : acc
  }, 2000)
  return `E${String(max + 1).padStart(4, '0')}`
}

export function clonePerson(person: PersonRecord) {
  return clone(person)
}

export function replacePersonRolesForRole(roleId: string, userIds: string[]) {
  const set = new Set(userIds)
  for (const person of personStore) {
    const has = person.roleIds.includes(roleId)
    const should = set.has(person.userId)
    if (should && !has) person.roleIds.push(roleId)
    if (has && !should) person.roleIds = person.roleIds.filter((id) => id !== roleId)
  }
}

export function toBriefPerson(person: PersonRecord) {
  return {
    userId: person.userId,
    name: person.name,
    post: person.post,
    deptId: person.deptId,
    deptName: getDeptName(person.deptId),
  }
}
