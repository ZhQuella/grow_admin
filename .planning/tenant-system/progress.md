# 进度日志

## 会话：2026-09-07

### 阶段 1：调研与计划
- **状态：** complete
- **开始时间：** 2026-09-07
- 执行的操作：
  - 阅读 `docs/10-租户系统需求.md`、`docs/11-租户系统技术.md`
  - 核对前端登录、系统管理路由、后端登录/JWT/SQL、空 Gradle 模块
  - 编写分阶段实施计划
- 创建/修改的文件：
  - `docs/12-租户系统实施计划.md`
  - `docs/00-基础服务总览.md`（增加计划文档入口）
  - `.planning/tenant-system/task_plan.md`
  - `.planning/tenant-system/findings.md`
  - `.planning/tenant-system/progress.md`
  - `.planning/.active_plan`

### 阶段 4：租户管理前端（挂在系统管理下）
- **状态：** in_progress
- 执行的操作：
  - 在系统管理目录下注册 `TenantManage` 路由与菜单
  - 实现租户列表、新增/编辑/查看、试用/开通/停用、改编码、删除、清空、授权（mock）
  - 将租户管理改为一级目录 `TenantCatalog`，排在系统管理之后
- 页面仍为 `TenantManage`
- 创建/修改的文件：
  - 租户管理已拆为独立模块 `DesignCornerstone/cornerstone-apps-tenant`
  - `sample/mock/systemTenant.ts`
  - `sample/mock/systemMenu.ts`

### 阶段 6：主角色 + 租户账号前端
- **状态：** in_progress（仅前端 mock）
- 执行的操作：
  - `TenantCatalog` 下增加「主角色」「租户账号」
  - 「租户角色」：内置 `TENANT_ADMIN` 只读；平台可为指定租户新增普通角色
  - 租户账号：按租户创建/编辑/分配租户管理员
- 创建/修改的文件：
  - `DesignCornerstone/cornerstone-apps-system/src/pages/tenant-admin-role/**`
  - `DesignCornerstone/cornerstone-apps-system/src/pages/tenant-account/**`
  - `sample/mock/tenantAccountStore.ts`、`systemTenantAccount.ts`、`systemTenantAdminRole.ts`

### 阶段 7：租户菜单只读页
- **状态：** in_progress（仅前端 mock）
- 执行的操作：
  - `TenantCatalog` 下增加「租户菜单」
  - 左租户列表、右只读菜单树；无增删改
- 创建/修改的文件：
  - `DesignCornerstone/cornerstone-apps-system/src/pages/tenant-menu/**`
  - `sample/mock/systemTenantMenu.ts`

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 侧边栏菜单 | GET /mock/menu/list | 租户管理下含主角色、租户账号 | 是 | pass |
| 租户分页 | POST /mock/platform/tenants/page | 返回 5 条含 platform | 是 | pass |
| 内置试用 | tenantId=1 | 拒绝 | 内置租户不可试用 | pass |
| 未开通试用 | tenantId=3 | 变为 trial | 已设为试用中 | pass |
| 租户账号分页 | POST /mock/platform/tenant-accounts/page | 返回账号 | 有数据 | pass |
| 主角色与账号共享 | 为 west-school 创建 tenantAdmin | 主角色成员可见 | school_admin | pass |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|------|------|---------|---------|
| 2026-09-07 | mock 文件各自打包导致账号 store 不共享 | 1 | 与 accountStore 相同，挂到 globalThis |

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | 阶段 6 前端主角色 + 租户账号已挂上 |
| 我要去哪里？ | 后端库表/登录，或代操作审计页 |
| 目标是什么？ | 建成完整 SaaS 租户系统 |
| 我学到了什么？ | 文档无「主角色」菜单名，按 TENANT_ADMIN 只读页实现；vite mock 要共享数据必须 globalThis |
| 我做了什么？ | 租户管理目录下增加主角色、租户账号两页 + mock |
