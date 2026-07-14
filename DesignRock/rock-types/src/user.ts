export interface RoleInfo {
  /** 角色展示名 */
  name: string
  /** 角色唯一标识 */
  value: string
}

export interface UserInfo {
  userId: string
  username: string
  realname: string
  avatar?: string
  deptName: string
  /** 当前登录人角色列表 */
  roles: RoleInfo[]
}
