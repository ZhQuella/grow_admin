export const EMPLOYEE_TYPE_VALUES = ['full_time', 'intern', 'part_time', 'contractor'] as const
export type EmployeeType = (typeof EMPLOYEE_TYPE_VALUES)[number]

export const EMPLOYEE_STATUS_VALUES = [
  'pending',
  'probation',
  'formal',
  'resigned',
  'retired',
  'rehired',
] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUS_VALUES)[number]

export const CREATE_STATUS_VALUES = ['pending', 'probation', 'formal'] as const
export const ENABLE_STATUS_VALUES = ['probation', 'formal'] as const

export const PERSON_EVENT_VALUES = [
  'create',
  'update',
  'onboard',
  'transfer',
  'part_time_add',
  'part_time_change',
  'part_time_end',
  'confirm',
  'disable',
  'enable',
  'resign',
  'retire',
  'reinstate',
  'rehire',
  'delete',
] as const
export type PersonEventType = (typeof PERSON_EVENT_VALUES)[number]

export const PERSON_EVENT_MODES = [
  'transfer',
  'confirm',
  'resign',
  'retire',
  'reinstate',
  'rehire',
  'delete',
] as const
export type PersonEventMode = (typeof PERSON_EVENT_MODES)[number]

export const ASSIGNMENT_TYPE_VALUES = ['primary', 'part_time'] as const
export type AssignmentType = (typeof ASSIGNMENT_TYPE_VALUES)[number]

export const ASSIGNMENT_STATUS_VALUES = ['active', 'ended'] as const
export type AssignmentStatus = (typeof ASSIGNMENT_STATUS_VALUES)[number]

export const TRANSFER_TYPE_VALUES = [
  'primary',
  'part_time_add',
  'part_time_change',
  'part_time_end',
] as const
export type TransferType = (typeof TRANSFER_TYPE_VALUES)[number]

export type TransferIntent = {
  transferType?: TransferType
  assignmentId?: string
  assignmentType?: AssignmentType
}

export const TRANSFER_ACTION_LABELS: Record<TransferType, string> = {
  primary: '调整主职',
  part_time_add: '新增兼职',
  part_time_change: '调整兼职',
  part_time_end: '停止兼职',
}

export const ID_TYPE_VALUES = ['id_card', 'passport', 'other'] as const
export type PersonIdType = (typeof ID_TYPE_VALUES)[number]

export const GENDER_VALUES = ['male', 'female'] as const
export type PersonGender = (typeof GENDER_VALUES)[number]

export const MARITAL_VALUES = ['unmarried', 'married', 'divorced', 'widowed'] as const
export type MaritalStatus = (typeof MARITAL_VALUES)[number]

export const HUKOU_VALUES = ['urban', 'rural'] as const
export type HukouType = (typeof HUKOU_VALUES)[number]

export const EDUCATION_VALUES = ['high_school', 'college', 'bachelor', 'master', 'doctor'] as const
export type EducationLevel = (typeof EDUCATION_VALUES)[number]

export const CONTRACT_TYPE_VALUES = ['fixed', 'open', 'intern'] as const
export type ContractType = (typeof CONTRACT_TYPE_VALUES)[number]

export const MATERIAL_KEYS = [
  'idPortrait',
  'idEmblem',
  'educationCert',
  'degreeCert',
  'resignCert',
  'photo',
] as const
export type MaterialKey = (typeof MATERIAL_KEYS)[number]

export const EMPLOYEE_TYPE_OPTIONS: Array<{ label: string; value: EmployeeType }> = [
  { label: '全职', value: 'full_time' },
  { label: '实习', value: 'intern' },
  { label: '兼职', value: 'part_time' },
  { label: '外包', value: 'contractor' },
]

export const EMPLOYEE_STATUS_OPTIONS: Array<{ label: string; value: EmployeeStatus }> = [
  { label: '待入职', value: 'pending' },
  { label: '试用', value: 'probation' },
  { label: '正式', value: 'formal' },
  { label: '离职', value: 'resigned' },
  { label: '退休', value: 'retired' },
  { label: '返聘', value: 'rehired' },
]

export const CREATE_STATUS_OPTIONS = EMPLOYEE_STATUS_OPTIONS.filter((item) =>
  (CREATE_STATUS_VALUES as readonly string[]).includes(item.value),
)

export const ENABLE_STATUS_OPTIONS = EMPLOYEE_STATUS_OPTIONS.filter((item) =>
  (ENABLE_STATUS_VALUES as readonly string[]).includes(item.value),
)

export const ASSIGNMENT_TYPE_OPTIONS: Array<{ label: string; value: AssignmentType }> = [
  { label: '主职', value: 'primary' },
  { label: '兼职', value: 'part_time' },
]

export const TRANSFER_TYPE_OPTIONS: Array<{ label: string; value: TransferType }> = [
  { label: '主岗位调岗', value: 'primary' },
  { label: '兼职岗位新增', value: 'part_time_add' },
  { label: '兼职岗位变更', value: 'part_time_change' },
  { label: '兼职岗位结束', value: 'part_time_end' },
]

export const ID_TYPE_OPTIONS: Array<{ label: string; value: PersonIdType }> = [
  { label: '身份证', value: 'id_card' },
  { label: '护照', value: 'passport' },
  { label: '其他', value: 'other' },
]

export const PERSON_EVENT_OPTIONS: Array<{ label: string; value: PersonEventType }> = [
  { label: '新增', value: 'create' },
  { label: '编辑', value: 'update' },
  { label: '入职', value: 'onboard' },
  { label: '调岗', value: 'transfer' },
  { label: '兼职新增', value: 'part_time_add' },
  { label: '兼职变更', value: 'part_time_change' },
  { label: '兼职结束', value: 'part_time_end' },
  { label: '转正', value: 'confirm' },
  { label: '停用', value: 'disable' },
  { label: '启用', value: 'enable' },
  { label: '离职', value: 'resign' },
  { label: '退休', value: 'retire' },
  { label: '复职', value: 'reinstate' },
  { label: '返聘', value: 'rehire' },
  { label: '删除', value: 'delete' },
]

export const GENDER_OPTIONS: Array<{ label: string; value: PersonGender }> = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

export const MARITAL_OPTIONS: Array<{ label: string; value: MaritalStatus }> = [
  { label: '未婚', value: 'unmarried' },
  { label: '已婚', value: 'married' },
  { label: '离异', value: 'divorced' },
  { label: '丧偶', value: 'widowed' },
]

export const HUKOU_OPTIONS: Array<{ label: string; value: HukouType }> = [
  { label: '城镇', value: 'urban' },
  { label: '农村', value: 'rural' },
]

export const EDUCATION_OPTIONS: Array<{ label: string; value: EducationLevel }> = [
  { label: '高中', value: 'high_school' },
  { label: '大专', value: 'college' },
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'doctor' },
]

export const CONTRACT_TYPE_OPTIONS: Array<{ label: string; value: ContractType }> = [
  { label: '固定期限', value: 'fixed' },
  { label: '无固定期限', value: 'open' },
  { label: '实习协议', value: 'intern' },
]

export const ETHNICITY_OPTIONS = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '满族', '其他',
].map((label) => ({ label, value: label }))

export const POLITICAL_OPTIONS = [
  '群众', '共青团员', '中共党员', '民主党派', '其他',
].map((label) => ({ label, value: label }))

export const FAMILY_RELATION_OPTIONS = [
  '配偶', '父亲', '母亲', '儿子', '女儿', '兄弟', '姐妹', '其他',
].map((label) => ({ label, value: label }))

export const MATERIAL_LABELS: Record<MaterialKey, string> = {
  idPortrait: '身份证（人像面）',
  idEmblem: '身份证（国徽面）',
  educationCert: '学历证书',
  degreeCert: '学位证书',
  resignCert: '前公司离职证明',
  photo: '员工照片',
}

export function employeeTypeLabel(value?: string) {
  return EMPLOYEE_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function employeeStatusLabel(value?: string) {
  return EMPLOYEE_STATUS_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function personEventLabel(value?: string) {
  return PERSON_EVENT_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function genderLabel(value?: string) {
  return GENDER_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function assignmentTypeLabel(value?: string) {
  return ASSIGNMENT_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function assignmentStatusLabel(value?: string) {
  if (value === 'active') return '有效'
  if (value === 'ended') return '已结束'
  return '-'
}

export function idTypeLabel(value?: string) {
  return ID_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export function occupyHeadcount(type?: AssignmentType | string) {
  return type === 'primary'
}

const ACTION_STATUS_MAP: Record<PersonEventMode | 'edit', EmployeeStatus[]> = {
  edit: ['pending', 'probation', 'formal', 'resigned', 'retired', 'rehired'],
  transfer: ['pending', 'probation', 'formal', 'rehired'],
  confirm: ['pending', 'probation'],
  resign: ['pending', 'probation', 'formal', 'rehired'],
  retire: ['formal', 'rehired'],
  reinstate: ['resigned'],
  rehire: ['resigned', 'retired'],
  delete: ['resigned'],
}

export function canPersonAction(status: string | undefined, action: PersonEventMode | 'edit') {
  return ACTION_STATUS_MAP[action].includes((status || '') as EmployeeStatus)
}

export type PersonFamilyMember = {
  id: string
  name: string
  relation: string
  gender: string
  birthday: string
  phone: string
}

export type PersonEmergencyContact = {
  id: string
  name: string
  relation: string
  phone: string
}

export type PersonMaterialFile = {
  name: string
  url: string
}

export type PersonMaterials = Partial<Record<MaterialKey, PersonMaterialFile | null>>

export type PersonRoleRef = {
  id: string
  name: string
  code: string
}

export type PersonAssignment = {
  id: string
  deptId: string
  deptName: string
  postId: string
  postName: string
  jobCode?: string
  jobTitle?: string
  jobGrade?: string
  type: AssignmentType
  startDate: string
  endDate: string
  status: AssignmentStatus
  occupyHeadcount: boolean
  reason?: string
  supervisorId?: string
  supervisorName?: string
  collaboratorIds?: string[]
  collaboratorNames?: string[]
}

export type PersonSuperiorRef = {
  userId: string
  name: string
  relation: 'primary' | 'collaborator'
}

export type PersonAccountInfo = {
  accountId: string
  username: string
  enabled: boolean
  roles: PersonRoleRef[]
  lastLoginAt: string
}

export type SystemPostOption = {
  id: string
  name: string
  deptId: string
  enabled: boolean
  headcount?: number
  occupied?: number
}

export type PersonHistoryItem = {
  id: string
  type: PersonEventType
  title: string
  summary: string
  effectiveDate: string
  operator: string
  createdAt: string
  extra?: Record<string, string>
}

export type SystemPersonListItem = {
  userId: string
  name: string
  employeeNo: string
  email: string
  mobile: string
  deptId: string
  deptName: string
  post: string
  postId?: string
  employeeType: EmployeeType
  employeeStatus: EmployeeStatus
  previousStatus?: EmployeeStatus
  supervisorName: string
  accountId?: string
  accountUsername?: string
  accountEnabled?: boolean
  hasAccount?: boolean
  entryDate: string
  resignDate: string
  lastEventTitle: string
  lastEventAt: string
  updatedAt: string
}

export type SystemPersonDetail = SystemPersonListItem & {
  mainDeptId: string
  mainDeptName: string
  supervisorId: string
  collaboratorIds: string[]
  collaborators: PersonSuperiorRef[]
  subordinates: PersonSuperiorRef[]
  assignments: PersonAssignment[]
  account?: PersonAccountInfo | null
  idType: string
  extension: string
  officeLocation: string
  remark: string
  jobCode: string
  jobTitle: string
  probationMonths: string
  probationStart: string
  probationEnd: string
  actualConfirmDate: string
  plannedConfirmDate: string
  retireDate: string
  jobGrade: string
  tenureText: string
  ageText: string
  workYearsText: string
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
  emergencyContacts: PersonEmergencyContact[]
  familyMembers: PersonFamilyMember[]
  materials: PersonMaterials
  history: PersonHistoryItem[]
}

export type SystemPersonQuery = {
  keyword?: string
  name?: string
  employeeNo?: string
  mobile?: string
  deptId?: string
  postId?: string
  employeeStatus?: EmployeeStatus | string
  employeeType?: EmployeeType | string
  hasAccount?: string | boolean
  page?: number
  pageSize?: number
}

export type SystemPersonPageResult = {
  items: SystemPersonListItem[]
  total: number
}

export type SystemPersonSavePayload = Omit<
  SystemPersonDetail,
  | 'userId'
  | 'deptName'
  | 'mainDeptName'
  | 'supervisorName'
  | 'collaborators'
  | 'subordinates'
  | 'account'
  | 'accountId'
  | 'accountUsername'
  | 'accountEnabled'
  | 'hasAccount'
  | 'roles'
  | 'tenureText'
  | 'ageText'
  | 'workYearsText'
  | 'lastEventTitle'
  | 'lastEventAt'
  | 'updatedAt'
  | 'history'
> & {
  userId?: string
}

export type PersonTransferPayload = {
  userId: string
  transferType: TransferType
  assignmentId?: string
  assignmentType?: AssignmentType
  deptId: string
  postId: string
  post?: string
  jobTitle?: string
  jobGrade?: string
  jobCode?: string
  supervisorId?: string
  collaboratorIds?: string[]
  effectiveDate: string
  remark: string
}

export type PersonConfirmPayload = {
  userId: string
  targetStatus: Extract<EmployeeStatus, 'probation' | 'formal'>
  probationStart?: string
  probationEnd?: string
  actualConfirmDate?: string
  remark: string
}

export type PersonResignPayload = {
  userId: string
  resignDate: string
  reason?: string
  remark: string
}

export type PersonStatusPayload = {
  userId: string
  effectiveDate: string
  reason?: string
  remark: string
  employeeStatus?: Extract<EmployeeStatus, 'probation' | 'formal'>
}

export type PersonReinstatePayload = {
  userId: string
  mode: 'reinstate' | 'rehire'
  accountId?: string
  effectiveDate: string
  employeeStatus?: Extract<EmployeeStatus, 'probation' | 'formal' | 'rehired'>
  remark: string
}

export type PersonDeletePayload = {
  userId: string
  remark: string
}
