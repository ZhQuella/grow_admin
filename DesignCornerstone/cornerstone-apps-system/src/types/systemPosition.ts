export type SystemPositionListItem = {
  id: string
  name: string
  code: string
  level: number
  sort: number
  enabled: boolean
  description: string
  assignmentCount: number
  updatedAt: string
}

export type SystemPositionDetail = SystemPositionListItem

export type SystemPositionOption = {
  id: string
  name: string
  code: string
  level: number
  enabled: boolean
}

export type SystemPositionQuery = {
  name?: string
  code?: string
  enabled?: boolean | string
  page?: number
  pageSize?: number
}

export type SystemPositionPageResult = {
  items: SystemPositionListItem[]
  total: number
}

export type SystemPositionSavePayload = {
  name: string
  code: string
  level: number
  sort?: number
  description?: string
}

export type SystemPositionImpact = {
  assignmentCount: number
  assignments: Array<{
    assignmentId: string
    userId: string
    personName: string
    deptName: string
    postName: string
  }>
}
