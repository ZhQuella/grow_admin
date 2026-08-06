export interface PersonItem {
  userId: string
  name: string
  deptId: string
  deptName: string
  roleIds: string[]
}

export interface DeptItem {
  id: string
  name: string
  parentId: string | null
}

export interface RoleItem {
  id: string
  name: string
}

export type PersonSelectSize = 'large' | 'default' | 'small'

export type PersonSelectValue = string | string[] | null | undefined

export interface PersonSelectProps {
  modelValue?: PersonSelectValue
  multiple?: boolean
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  /** 与 GrowInput 一致：large / default / small */
  size?: PersonSelectSize
}
