export const EMPLOYEE_TYPE_VALUES = ['full_time', 'intern', 'part_time', 'contractor'] as const
export type EmployeeType = (typeof EMPLOYEE_TYPE_VALUES)[number]

export const EMPLOYEE_STATUS_VALUES = ['probation', 'formal', 'resigned'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUS_VALUES)[number]

export const PERSON_EVENT_VALUES = ['onboard', 'transfer', 'confirm', 'resign', 'reinstate'] as const
export type PersonEventType = (typeof PERSON_EVENT_VALUES)[number]

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
  { label: '试用', value: 'probation' },
  { label: '正式', value: 'formal' },
  { label: '离职', value: 'resigned' },
]

export const PERSON_EVENT_OPTIONS: Array<{ label: string; value: PersonEventType }> = [
  { label: '入职', value: 'onboard' },
  { label: '调岗', value: 'transfer' },
  { label: '转正', value: 'confirm' },
  { label: '离职', value: 'resign' },
  { label: '复职', value: 'reinstate' },
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

export type PersonFamilyMember = {
  id: string
  name: string
  relation: string
  gender: string
  birthday: string
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
  employeeType: EmployeeType
  employeeStatus: EmployeeStatus
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
  supervisorName: string
  extension: string
  officeLocation: string
  remark: string
  jobCode: string
  jobTitle: string
  probationMonths: string
  actualConfirmDate: string
  plannedConfirmDate: string
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
  familyMembers: PersonFamilyMember[]
  materials: PersonMaterials
  history: PersonHistoryItem[]
}

export type SystemPersonQuery = {
  keyword?: string
  deptId?: string
  employeeStatus?: EmployeeStatus | string
  employeeType?: EmployeeType | string
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
  deptId: string
  post: string
  jobTitle?: string
  effectiveDate: string
  reason?: string
}

export type PersonConfirmPayload = {
  userId: string
  actualConfirmDate: string
  remark?: string
}

export type PersonResignPayload = {
  userId: string
  resignDate: string
  reason?: string
}

export type PersonReinstatePayload = {
  userId: string
  deptId: string
  post: string
  effectiveDate: string
  employeeStatus?: EmployeeStatus
  remark?: string
}
