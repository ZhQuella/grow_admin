import type { AssignmentType, EmployeeStatus } from './systemPerson'

export const ORG_CHART_MODES = ['dept', 'report', 'mixed'] as const
export type OrgChartMode = (typeof ORG_CHART_MODES)[number]

export const ORG_CHART_MODE_OPTIONS: Array<{ label: string; value: OrgChartMode }> = [
  { label: '部门结构', value: 'dept' },
  { label: '人员汇报', value: 'report' },
  { label: '混合展示', value: 'mixed' },
]

export const ORG_CHART_LINK_KINDS = ['dept', 'member', 'report', 'collab'] as const
export type OrgChartLinkKind = (typeof ORG_CHART_LINK_KINDS)[number]

export type OrgChartQuery = {
  deptId?: string
  personKeyword?: string
  postId?: string
  employeeStatus?: EmployeeStatus | string
  includeResigned?: boolean | string
  includeRetired?: boolean | string
  includeDisabledPeople?: boolean | string
  includeDisabledDepts?: boolean | string
  mode?: OrgChartMode | string
}

export type OrgChartAssignment = {
  assignmentId: string
  postId: string
  postName: string
  deptId: string
  deptName: string
  jobGrade: string
  assignmentType: AssignmentType
  primary: boolean
}

export type OrgChartDept = {
  id: string
  name: string
  code: string
  parentId: string | null
  parentName: string
  status: 'enabled' | 'disabled'
  managerName: string
  personCount: number
  postCount: number
  sort: number
}

export type OrgChartPerson = {
  id: string
  name: string
  employeeNo: string
  employeeStatus: EmployeeStatus
  deptId: string
  deptName: string
  postId: string
  postName: string
  jobGrade: string
  supervisorId: string
  supervisorName: string
  collaboratorIds: string[]
  collaboratorNames: string[]
  accountEnabled: boolean | null
  assignments: OrgChartAssignment[]
  primarySupervisor: boolean
}

export type OrgChartPost = {
  id: string
  name: string
  deptId: string
  deptName: string
  jobGrade: string
  headcount: number
  occupied: number
  vacancy: number
  overstaffed: number
}

export type OrgChartNode = {
  id: string
  kind: 'dept' | 'person'
  refId: string
  name: string
  parentId: string
  disabled?: boolean
}

export type OrgChartLink = {
  source: string
  target: string
  kind: OrgChartLinkKind
}

export type OrgChartResult = {
  mode: OrgChartMode
  nodes: OrgChartNode[]
  links: OrgChartLink[]
  depts: OrgChartDept[]
  people: OrgChartPerson[]
  posts: OrgChartPost[]
}
