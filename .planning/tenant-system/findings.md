# 发现与决策

## 2026-09-07 主角色语义
文档无「主角色」菜单名。按 5.9 / 5.10 实现：平台侧只读页展示各租户内置 `TENANT_ADMIN`（名称「租户管理员」），权限与授权同步；「租户账号」按租户建账号并分配该角色。两页挂在 `TenantCatalog` 下。

## 需求
- 共享库表 + `tenant_id` 强隔离
- 登录：`tenantCode + username + password + captcha`
- 平台管理三页：租户管理、租户账号、代操作审计
- 生命周期：未开通 / 试用中 / 已开通 / 已到期 / 已停用 / 已删除；页面不提供「改状态」
- 仅试用中、已开通可登录、可代操作
- 创建租户插入 `TENANT_ADMIN`，不自动创建账号/部门/菜单
- 平台统一下发菜单/功能上限；新菜单只自动给 `platform`
- 代操作：用目标租户组织代码登录；退出即退出登录；代操作时无平台管理
- 清空保留租户记录、授权、`TENANT_ADMIN`、编码日志、代操作审计
- 本次不做：独立后台、套餐、品牌、多租户账号、已删除恢复、开通中续期

## 研究发现

### 后端（grow_admin_server）
- 已有：`sys_tenant`（状态仍为 0/1，编码全表 UNIQUE）、`sys_account.tenant_id` / `is_platform_admin`、`LoginRequest.tenantCode`、JWT claims `tenantId/tenantCode/platformAdmin`、图片验证码、Redis refresh token
- 登录只按 `tenant_code + username` 查启用账号，**不校验租户生命周期**
- `last_login_at` 写 UTC；需求要求租户日期用 `Asia/Shanghai`
- refresh token Redis key 仅为 `grow:account:refresh:{sessionId}`，**没有按租户索引**，无法直接作废某租户全部会话
- Gradle 已 include `base-org` / `base-access` / `base-designer` / `base-runtime`，但这些模块**几乎没有 Java 源码**
- 全库 SQL 只有 `scripts/sql/mysql/grow_admin.sql`，无 Flyway/Liquibase
- 无 `/platform/**`、无租户 CRUD、无授权表、无角色/菜单表

### 前端（grow_admin）
- 登录页只有账号+密码，**不传 `tenantCode`、无验证码**，请求 URL 为 `/login`，后端是 `/account/login`
- `AccountLoginParams` 仅 `username/password`
- 系统管理页面（账号/角色/菜单/组织/租户）已实现，走接口契约 + mock
- 租户管理已挂在「系统管理」下（用户 2026-09-07 要求），未单开「平台管理」分组
- 无代操作横幅、无 `platformAdmin` / `impersonating` 状态

### 文档与代码差距
- 技术文档第 11 节开发顺序是后端 11 步、前端 6 步串行；实施计划改为「同阶段前后端一起交付」
- `00-基础服务总览` 已声明租户系统同时改前后端，不再沿用「只改前端」

## 技术决策
| 决策 | 理由 |
|------|------|
| 增量 SQL，不引入 Flyway | 与现有初始化方式一致，减少无关基建 |
| 阶段 3 增加「租户 → sessionId」Redis 集合 | 停用/到期/删除必须立即作废登录态 |
| 创建租户所需的最小 `sys_role` 放在阶段 2 | 否则无法插入 `TENANT_ADMIN` |
| 阶段 5 允许最小菜单种子 | 授权页需要菜单树；完整菜单 CRUD 可后续补 |
| 清空注册表按「当时已存在的表」维护 | 组织/设计器/运行时表可能尚不存在，不能假装清空 |
| 租户管理菜单挂在系统管理下 | 用户明确要求，不单开平台管理分组 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| 编码唯一性与「过期后可复用」冲突 | 不用全表 UNIQUE，用 `active_code` 生成列 + 试用/开通时校验 |
| 前端 `/login` 与后端 `/account/login` 不一致 | 阶段 3 对齐为 `/account/login`，并补 captcha |
| 空模块无法加 `tenant_id` | 阶段 9 写隔离契约；表出现后再注册进清空清单 |

## 资源
- `docs/10-租户系统需求.md`
- `docs/11-租户系统技术.md`
- `docs/12-租户系统实施计划.md`
- `grow_admin_server/scripts/sql/mysql/grow_admin.sql`
- `grow_admin_server/grow-base-service/base-account/src/main/java/dev/gad/account/service/LoginService.java`
- `DesignCornerstone/cornerstone-apps-login/src/api/login.ts`

## 视觉/浏览器发现
- 未做浏览器验证（本会话只出计划）
