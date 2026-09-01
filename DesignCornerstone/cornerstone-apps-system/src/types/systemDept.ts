import type { AssignmentType, EmployeeStatus } from './systemPerson'
import type { SystemPostType } from './systemPost'

export const DEPT_STATUS_VALUES = ['enabled', 'disabled'] as const
export type SystemDeptStatus = (typeof DEPT_STATUS_VALUES)[number]
export type SystemDeptManagerType = '' | 'person' | 'post'

export type SystemDeptManagerHistory = {
  id: string
  personId: string
  personName: string
  postId?: string
  postName?: string
  startedAt: string
  endedAt: string
  reason: string
}

export type SystemDeptNode = {
  id: string
  name: string
  code: string
  parentId: string | null
  parentName: string
  status: SystemDeptStatus
  sort: number
  description: string
  managerType: SystemDeptManagerType
  managerId: string
  managerName: string
  managerPostId: string
  managerPostName: string
  directChildCount: number
  directPostCount: number
  directPersonCount: number
  createdAt: string
  updatedAt: string
  children?: SystemDeptNode[]
}

export type SystemDeptDetail = SystemDeptNode & {
  descendantCount: number
  managerHistory: SystemDeptManagerHistory[]
}

export type SystemDeptSavePayload = {
  name: string
  code: string
  parentId: string | null
  sort: number
  description: string
  managerType?: SystemDeptManagerType
  managerId?: string
  managerPostId?: string
}

export type SystemDeptPost = {
  id: string
  name: string
  deptId: string
  enabled: boolean
  enabledBeforeCascade: boolean
  activePersonCount: number
  code?: string
  postType?: SystemPostType | ''
  formalHeadcount?: number
  contractorHeadcount?: number
  partTimeHeadcount?: number
  duty?: string
  requirement?: string
  sort?: number
  remark?: string
}

export type SystemDeptPerson = {
  assignmentId: string
  userId: string
  name: string
  employeeNo: string
  employeeStatus: EmployeeStatus
  assignmentType: AssignmentType
  deptId: string
  deptName: string
  postId: string
  postName: string
}

export type SystemDeptRelated = {
  posts: SystemDeptPost[]
  people: SystemDeptPerson[]
  children: SystemDeptNode[]
}

export type SystemDeptStopImpact = {
  departments: SystemDeptNode[]
  posts: SystemDeptPost[]
  assignments: SystemDeptPerson[]
}

export type SystemDeptAssignmentDecision = {
  assignmentId: string
  action: 'move' | 'end'
  targetDeptId?: string
  targetPostId?: string
  reason: string
}

export type SystemDeptEnableImpact = {
  departments: SystemDeptNode[]
}

export type SystemDeptMergeImpact = {
  source: SystemDeptDetail
  posts: SystemDeptPost[]
  assignments: SystemDeptPerson[]
  children: SystemDeptNode[]
}

export type SystemDeptNewPost = {
  name: string
  code: string
  postType: SystemPostType | ''
  formalHeadcount: number
  contractorHeadcount: number
  partTimeHeadcount: number
  duty: string
  requirement: string
  sort: number
  remark: string
}

export type SystemDeptPostMapping = {
  sourcePostId: string
  action: 'existing' | 'create'
  targetPostId?: string
  targetPost?: SystemDeptNewPost
}

export type SystemDeptMergePayload = {
  sourceId: string
  targetId: string
  postMappings: SystemDeptPostMapping[]
  childIds: string[]
  managerAction: 'replace' | 'cancel'
  stopSource: boolean
  stopDecisions: SystemDeptAssignmentDecision[]
}

export type SystemDeptDeleteImpact = {
  departments: SystemDeptNode[]
  assignments: SystemDeptPerson[]
  historyAssignmentCount: number
  hasChildren: boolean
}
