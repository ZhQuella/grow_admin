// Lock screen information

export interface LockInfo {
  // Password required
  pwd?: string | undefined
  // Is it locked?
  isLock?: boolean
}
export interface RoleInfo {
  roleName: string
  value: string
}
export interface UserInfo {
  // 用户id
  userId: string | number
  // 用户名
  username: string
  // 真实名字
  realName: string
  // 头像
  avatar: string
  // 介绍
  desc?: string
  // 首页地址
  homePath?: string
  // 角色列表
  roles: RoleInfo[]
}

export interface PersistStrategy {
  key?: string;
  storage?: Storage;
  paths?: string[];
}

export interface PersistOptions {
  storage?: Storage;
  paths?: string[];
  pick?: string[];
  strategies?: PersistStrategy[];
  afterRestore?: (ctx: PiniaPluginContext) => void;
}
