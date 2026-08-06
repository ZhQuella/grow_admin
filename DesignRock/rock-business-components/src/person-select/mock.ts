import type { DeptItem, PersonItem, RoleItem } from './types'

/** mock：部门扁平表（parentId 建树） */
export const MOCK_DEPTS: DeptItem[] = [
  { id: 'd-root', name: '全部', parentId: null },
  { id: 'd-dl', name: '大连研发中心', parentId: 'd-root' },
  { id: 'd-dl-fe', name: '前端组', parentId: 'd-dl' },
  { id: 'd-dl-be', name: '后端组', parentId: 'd-dl' },
  { id: 'd-qa', name: '质量管理组', parentId: 'd-root' },
  { id: 'd-bj', name: '北京研发中心', parentId: 'd-root' },
  { id: 'd-bj-app', name: '应用组', parentId: 'd-bj' },
  { id: 'd-frontier', name: '前沿部署组', parentId: 'd-root' },
]

export const MOCK_ROLES: RoleItem[] = [
  { id: 'r-admin', name: '管理员' },
  { id: 'r-dev', name: '开发' },
  { id: 'r-qa', name: '测试' },
  { id: 'r-pm', name: '产品' },
  { id: 'r-ops', name: '运维' },
]

export const MOCK_PERSONS: PersonItem[] = [
  { userId: 'u1', name: '张三', deptId: 'd-dl-fe', deptName: '前端组', roleIds: ['r-dev'] },
  { userId: 'u2', name: '李四', deptId: 'd-dl-fe', deptName: '前端组', roleIds: ['r-dev', 'r-admin'] },
  { userId: 'u3', name: '王五', deptId: 'd-dl-be', deptName: '后端组', roleIds: ['r-dev'] },
  { userId: 'u4', name: '赵六', deptId: 'd-dl-be', deptName: '后端组', roleIds: ['r-dev'] },
  { userId: 'u5', name: '钱七', deptId: 'd-dl', deptName: '大连研发中心', roleIds: ['r-pm'] },
  { userId: 'u6', name: '孙八', deptId: 'd-qa', deptName: '质量管理组', roleIds: ['r-qa'] },
  { userId: 'u7', name: '周九', deptId: 'd-qa', deptName: '质量管理组', roleIds: ['r-qa'] },
  { userId: 'u8', name: '吴十', deptId: 'd-bj-app', deptName: '应用组', roleIds: ['r-dev'] },
  { userId: 'u9', name: '郑十一', deptId: 'd-bj', deptName: '北京研发中心', roleIds: ['r-pm', 'r-admin'] },
  { userId: 'u10', name: '冯十二', deptId: 'd-bj-app', deptName: '应用组', roleIds: ['r-ops'] },
  { userId: 'u11', name: '陈十三', deptId: 'd-frontier', deptName: '前沿部署组', roleIds: ['r-ops'] },
  { userId: 'u12', name: '褚十四', deptId: 'd-frontier', deptName: '前沿部署组', roleIds: ['r-dev'] },
  { userId: 'u13', name: '卫十五', deptId: 'd-frontier', deptName: '前沿部署组', roleIds: ['r-qa'] },
  { userId: 'u14', name: '蒋十六', deptId: 'd-frontier', deptName: '前沿部署组', roleIds: ['r-dev'] },
  { userId: 'u15', name: '沈十七', deptId: 'd-dl-fe', deptName: '前端组', roleIds: ['r-dev'] },
  { userId: 'u16', name: '韩十八', deptId: 'd-dl-be', deptName: '后端组', roleIds: ['r-ops'] },
  { userId: 'u17', name: '杨十九', deptId: 'd-bj-app', deptName: '应用组', roleIds: ['r-dev'] },
]
