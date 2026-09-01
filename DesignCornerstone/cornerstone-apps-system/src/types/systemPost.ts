import type { AssignmentType, EmployeeStatus, EmployeeType } from './systemPerson'

export const POST_TYPE_VALUES = ['formal', 'contractor', 'intern', 'management'] as const
export type SystemPostType = (typeof POST_TYPE_VALUES)[number]

export const POST_TYPE_OPTIONS: Array<{ label: string; value: SystemPostType }> = [
  { label: '正式', value: 'formal' },
  { label: '外包', value: 'contractor' },
  { label: '实习', value: 'intern' },
  { label: '管理', value: 'management' },
]

export function postTypeLabel(value?: string) {
  return POST_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export type SystemPostListItem = {
  id: string
  name: string
  code: string
  deptId: string
  deptName: string
  postType: SystemPostType | ''
  formalHeadcount: number
  contractorHeadcount: number
  partTimeHeadcount: number
  internHeadcount: number
  formalOccupied: number
  contractorOccupied: number
  partTimeOccupied: number
  internOccupied: number
  occupied: number
  vacancy: number
  overstaffed: number
  activePersonCount: number
  enabled: boolean
  sort: number
  updatedAt: string
  nameDuplicated?: boolean
}

export type SystemPostMember = {
  assignmentId: string
  userId: string
  name: string
  employeeNo: string
  assignmentType: AssignmentType
  primary: boolean
  startDate: string
  occupyHeadcount: boolean
  employeeStatus: EmployeeStatus
  employeeType: EmployeeType
}

export type SystemPostHistoryItem = {
  assignmentId: string
  userId: string
  name: string
  employeeNo: string
  assignmentType: AssignmentType
  startDate: string
  endDate: string
  occupyHeadcount: boolean
}

export type SystemPostDetail = SystemPostListItem & {
  duty: string
  requirement: string
  remark: string
  createdAt: string
  members: SystemPostMember[]
  history: SystemPostHistoryItem[]
}

export type SystemPostQuery = {
  deptId?: string
  name?: string
  code?: string
  enabled?: boolean | string
  overstaffed?: boolean | string
  page?: number
  pageSize?: number
}

export type SystemPostPageResult = {
  items: SystemPostListItem[]
  total: number
}

export type SystemPostSavePayload = {
  name: string
  code: string
  deptId: string
  postType?: SystemPostType | ''
  formalHeadcount?: number
  contractorHeadcount?: number
  partTimeHeadcount?: number
  internHeadcount?: number
  duty?: string
  requirement?: string
  sort?: number
  remark?: string
}
