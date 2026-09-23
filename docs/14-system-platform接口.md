# `/system/platform` 接口文档

本文档根据当前后端控制器与 DTO 源码整理，覆盖 `/system/platform/**` 下的全部接口。

## 1. 通用约定

- 访问权限：所有接口均要求当前用户具有 `ROLE_PLATFORM_ADMIN` 权限。
- 请求与响应格式：除路径参数外，请求体和响应体均使用 JSON。
- 日期格式：`date` 表示 `yyyy-MM-dd`；`date-time` 表示后端 `LocalDateTime` 序列化后的日期时间字符串。
- 分页规范：所有分页接口统一在 URL 末尾使用 `/{page}/{pageSize}`，分页参数不得放在查询参数或请求体中；请求体只承载筛选条件。
- 可选请求体：租户分页接口允许不传请求体，此时不使用筛选条件。

分页接口示例：

```text
POST /system/platform/tenant/{page}/{pageSize}
POST /system/platform/tenant/change-history/{page}/{pageSize}
```

所有响应均使用统一的 `Result<T>` 包装：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `integer` | 业务状态码，成功时为 `200` |
| `message` | `string` | 响应消息，成功时为“操作成功” |
| `data` | `T` | 接口数据，具体类型见各接口的“返回结构” |

通用响应示例：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## 2. 接口总览

| 模块 | 控制器 | 接口数量 | 路径前缀 |
| --- | --- | ---: | --- |
| 租户管理 | `TenantController` | 11 | `/system/platform/tenant` |
| 应用菜单 | `SystemMenuController` | 9 | `/system/platform/application` |
| 应用功能权限 | `SystemMenuFunctionController` | 4 | `/system/platform/application` |
| 应用列定义 | `SystemMenuColumnController` | 5 | `/system/platform/application` |

## 3. 租户管理接口

对应模块：租户管理（`TenantController`）。

| 接口功能 | 请求方式 | 接口地址 | 请求参数 | 返回结构 |
| --- | --- | --- | --- | --- |
| 分页查询租户 | `POST` | `/system/platform/tenant/{page}/{pageSize}` | 路径参数：`page`、`pageSize`；请求体：`TenantPageRequest`，可选 | `Result<TenantPageResponse>` |
| 查询租户选项 | `POST` | `/system/platform/tenant/options` | 无 | `Result<List<TenantOption>>` |
| 查询租户详情 | `GET` | `/system/platform/tenant/detail/{tenantId}` | 路径参数：`tenantId` | `Result<TenantListItem>` |
| 创建租户 | `POST` | `/system/platform/tenant/create` | 请求体：`TenantCreateRequest` | `Result<TenantListItem>` |
| 编辑租户 | `PUT` | `/system/platform/tenant` | 请求体：`TenantUpdateRequest` | `Result<TenantListItem>` |
| 修改租户编码 | `PUT` | `/system/platform/tenant/code` | 请求体：`TenantCodeUpdateRequest` | `Result<TenantListItem>` |
| 设置租户试用期 | `POST` | `/system/platform/tenant/trial` | 请求体：`TenantPeriodRequest` | `Result<TenantListItem>` |
| 开通租户 | `POST` | `/system/platform/tenant/activate` | 请求体：`TenantPeriodRequest` | `Result<TenantListItem>` |
| 停用租户 | `POST` | `/system/platform/tenant/disable` | 请求体：`TenantDisableRequest` | `Result<TenantListItem>` |
| 逻辑删除租户 | `POST` | `/system/platform/tenant/delete` | 请求体：`TenantDeleteRequest` | `Result<TenantListItem>` |
| 分页查询租户变更历史 | `POST` | `/system/platform/tenant/change-history/{page}/{pageSize}` | 路径参数：`page`、`pageSize`；请求体：`TenantChangeHistoryPageRequest` | `Result<TenantChangeHistoryPageResponse>` |

### 3.1 路径参数

| 参数 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `page` | `integer` | 是 | 页码，从 `1` 开始 |
| `pageSize` | `integer` | 是 | 每页数量，范围 `1-200` |
| `tenantId` | `integer(int64)` | 是 | 租户主键 |

### 3.2 `TenantPageRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `keyword` | `string` | 否 | 模糊搜索租户编码、租户名称、租户简称或联系人 |
| `status` | `string` | 否 | `not_opened`、`trial`、`active`、`expired`、`disabled` |
| `createdStartAt` | `string(date)` | 否 | 创建日期起始值，包含当天 |
| `createdEndAt` | `string(date)` | 否 | 创建日期结束值，包含当天 |
| `expiredStartAt` | `string(date)` | 否 | 服务到期日期起始值，包含当天 |
| `expiredEndAt` | `string(date)` | 否 | 服务到期日期结束值，包含当天 |

### 3.3 `TenantCreateRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantCode` | `string` | 是 | `5-12` 个字符，只能包含字母、数字和下划线 |
| `tenantName` | `string` | 是 | `2-128` 个字符 |
| `shortName` | `string` | 否 | 最长 `64` 个字符 |
| `contactName` | `string` | 否 | 最长 `64` 个字符 |
| `contactMobile` | `string` | 否 | 空字符串或中国大陆手机号 |

### 3.4 `TenantUpdateRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 租户主键 |
| `tenantName` | `string` | 是 | `2-128` 个字符 |
| `shortName` | `string` | 否 | 最长 `64` 个字符 |
| `contactName` | `string` | 否 | 最长 `64` 个字符 |
| `contactMobile` | `string` | 否 | 空字符串或中国大陆手机号 |

### 3.5 `TenantCodeUpdateRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 租户主键；系统内置租户不可修改编码 |
| `newTenantCode` | `string` | 是 | 新编码，`5-12` 个字符，只能包含字母、数字和下划线，保存时转为小写 |
| `confirmTenantCode` | `string` | 是 | 必须与 `newTenantCode` 一致 |
| `remark` | `string` | 否 | 操作备注，最长 `200` 个字符 |

修改编码后，该租户账号需要使用新编码登录，已有令牌不会被强制下线。

### 3.6 `TenantPeriodRequest`

试用和开通接口共用此请求结构。

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 租户主键 |
| `expiredOn` | `string(date)` | 是 | 服务到期日期 |
| `graceDays` | `integer` | 否 | 延后停用天数，范围 `0-3650` |
| `remark` | `string` | 否 | 操作备注，最长 `200` 个字符 |

### 3.7 `TenantDisableRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 租户主键 |
| `remark` | `string` | 否 | 操作备注，最长 `200` 个字符 |

### 3.8 `TenantDeleteRequest`

仅允许删除未开通或已停用的非内置租户。

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 租户主键 |
| `confirmTenantCode` | `string` | 是 | 输入租户编码进行删除确认 |
| `remark` | `string` | 否 | 操作备注，最长 `200` 个字符 |

### 3.9 `TenantChangeHistoryPageRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `tenantId` | `integer(int64)` | 是 | 要查询变更历史的租户主键 |

## 4. 应用菜单接口

对应模块：应用功能中的菜单维护（`SystemMenuController`）。

| 接口功能 | 请求方式 | 接口地址 | 请求参数 | 返回结构 |
| --- | --- | --- | --- | --- |
| 查询应用功能 | `POST` | `/system/platform/application/functions/list` | 无 | `Result<List<SystemMenuNode>>` |
| 查询平台当前可用应用功能 | `POST` | `/system/platform/application/tenant-authorized/list` | 无 | `Result<List<SystemMenuNode>>` |
| 查询平台菜单树 | `POST` | `/system/platform/application/menus/tree` | 无 | `Result<List<SystemMenuNode>>` |
| 新增应用功能 | `POST` | `/system/platform/application/menus` | 请求体：`SystemMenuRequest` | `Result<SystemMenuNode>` |
| 编辑应用功能 | `PUT` | `/system/platform/application/menu` | 请求体：`SystemMenuRequest` | `Result<SystemMenuNode>` |
| 启用或停用应用功能 | `PUT` | `/system/platform/application/menu/enabled` | 请求体：`SystemMenuEnabledRequest` | `Result<SystemMenuNode>` |
| 查询删除影响 | `POST` | `/system/platform/application/menu/delete-impact` | 请求体：`SystemMenuNameRequest` | `Result<SystemMenuImpact>` |
| 查询标识变更影响 | `POST` | `/system/platform/application/menu/code-impact` | 请求体：`SystemMenuNameRequest` | `Result<SystemMenuCodeImpact>` |
| 删除应用功能 | `POST` | `/system/platform/application/menu/delete` | 请求体：`SystemMenuNameRequest` | `Result<{name: string}>` |

### 4.1 `SystemMenuRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `originalName` | `string` | 否 | 编辑时的原菜单标识；为空时使用 `name` |
| `parentName` | `string` | 否 | 父级菜单标识 |
| `name` | `string` | 是 | 菜单标识，最长 `128` 位；以字母开头，只含字母、数字和下划线 |
| `title` | `string` | 是 | 菜单名称，最长 `128` 位 |
| `path` | `string` | 否 | 访问路径，最长 `256` 位 |
| `icon` | `string` | 否 | 图标标识，最长 `128` 位 |
| `menuType` | `string` | 否 | 菜单类型 |
| `enabled` | `boolean` | 否 | 是否启用 |
| `description` | `string` | 否 | 说明，最长 `255` 位 |
| `isVisible` | `boolean` | 否 | 是否可见 |
| `isKeepAlive` | `boolean` | 否 | 是否缓存页面 |
| `affix` | `boolean` | 否 | 是否固定页签 |
| `defaultShow` | `boolean` | 否 | 是否默认显示 |
| `sort` | `integer` | 否 | 排序值 |
| `isExternalPage` | `boolean` | 否 | 是否为外部页面 |
| `openMode` | `string` | 否 | 打开方式 |
| `link` | `string` | 否 | 外部链接，最长 `512` 位 |
| `pageDataId` | `string` | 否 | 页面数据标识 |
| `pageType` | `string` | 否 | 页面类型 |

### 4.2 `SystemMenuEnabledRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 菜单标识 |
| `enabled` | `boolean` | 是 | `true` 启用，`false` 停用 |

### 4.3 `SystemMenuNameRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 菜单标识 |

## 5. 应用功能权限接口

对应模块：应用功能下的按钮与操作权限（`SystemMenuFunctionController`）。

| 接口功能 | 请求方式 | 接口地址 | 请求参数 | 返回结构 |
| --- | --- | --- | --- | --- |
| 查询指定应用的功能权限 | `POST` | `/system/platform/application/menu/functions` | 请求体：`SystemMenuFunctionRequest` | `Result<List<SystemMenuFunctionItem>>` |
| 覆盖保存指定应用的功能权限 | `PUT` | `/system/platform/application/menu/functions` | 请求体：`SystemMenuFunctionSaveRequest` | `Result<List<SystemMenuFunctionItem>>` |
| 查询全部功能权限 | `POST` | `/system/platform/application/menu-functions/all` | 无 | `Result<List<SystemMenuFunctionItem>>` |
| 查询功能权限删除影响 | `POST` | `/system/platform/application/menu/function/delete-impact` | 请求体：`SystemMenuIdRequest` | `Result<SystemMenuFunctionImpact>` |

### 5.1 `SystemMenuFunctionRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `menuName` | `string` | 是 | 菜单标识 |

### 5.2 `SystemMenuFunctionSaveRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `menuName` | `string` | 是 | 菜单标识 |
| `items` | `array<SystemMenuFunctionItem>` | 是 | 要覆盖保存的功能权限列表，可传空数组清空 |

### 5.3 `SystemMenuIdRequest`

功能权限删除影响和字段引用影响接口共用此请求结构。

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 功能权限或列定义的主键 |

## 6. 应用列定义接口

对应模块：应用功能的数据表与字段定义（`SystemMenuColumnController`）。

| 接口功能 | 请求方式 | 接口地址 | 请求参数 | 返回结构 |
| --- | --- | --- | --- | --- |
| 查询指定应用的表和字段定义 | `POST` | `/system/platform/application/menu/columns` | 请求体：`SystemMenuFunctionRequest` | `Result<SystemMenuColumnBundle>` |
| 覆盖保存指定应用的表和字段定义 | `PUT` | `/system/platform/application/menu/columns` | 请求体：`SystemMenuColumnSaveRequest` | `Result<SystemMenuColumnBundle>` |
| 查询全部字段定义 | `POST` | `/system/platform/application/menu-columns/all` | 无 | `Result<List<SystemMenuColumnItem>>` |
| 查询字段引用影响 | `POST` | `/system/platform/application/menu/column-impact` | 请求体：`SystemMenuIdRequest` | `Result<SystemMenuColumnImpact>` |
| 查询数据表删除影响 | `POST` | `/system/platform/application/menu/table-delete-impact` | 请求体：`SystemMenuTableImpactRequest` | `Result<SystemMenuTableImpact>` |

### 6.1 `SystemMenuColumnSaveRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `menuName` | `string` | 是 | 菜单标识 |
| `tables` | `array<SystemMenuTableItem>` | 是 | 数据表定义列表，可包含多个表格 |
| `items` | `array<SystemMenuColumnItem>` | 是 | 所有表格的列定义列表，通过 `tableCode` 归属数据表 |

### 6.2 `SystemMenuTableImpactRequest`

| 字段 | 类型 | 必填 | 约束与说明 |
| --- | --- | --- | --- |
| `menuName` | `string` | 是 | 菜单标识 |
| `tableCode` | `string` | 是 | 数据表标识 |

## 7. 返回数据模型

### 7.1 `TenantPageResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `array<TenantListItem>` | 当前页租户列表 |
| `total` | `integer(int64)` | 符合筛选条件的租户总数 |

### 7.2 `TenantListItem`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 租户主键 |
| `tenantCode` | `string` | 租户编码 |
| `tenantName` | `string` | 租户名称 |
| `shortName` | `string` | 租户简称 |
| `status` | `string` | `not_opened`、`trial`、`active`、`expired`、`disabled` |
| `startedAt` | `string(date-time)` | 服务开始时间 |
| `expiredAt` | `string(date-time)` | 服务到期时间 |
| `graceDays` | `integer` | 服务到期后的延后停用天数 |
| `contactName` | `string` | 联系人 |
| `contactMobile` | `string` | 中国大陆手机号 |
| `accountCount` | `integer(int64)` | 租户账号数量，实时统计 |
| `personCount` | `integer(int64)` | 租户人员数量，实时统计 |
| `lastLoginAt` | `string(date-time)` | 租户账号最后登录时间 |
| `createdAt` | `string(date-time)` | 创建时间 |
| `updatedAt` | `string(date-time)` | 最后更新时间 |
| `isDelete` | `boolean` | 逻辑删除标志 |
| `deletedAt` | `string(date-time)` | 逻辑删除时间，未删除时为空 |
| `builtIn` | `boolean` | 是否为系统内置租户 |

### 7.3 `TenantOption`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 租户主键 |
| `tenantCode` | `string` | 租户编码 |
| `tenantName` | `string` | 租户名称 |
| `status` | `string` | 租户状态 |
| `builtIn` | `boolean` | 是否为系统内置租户 |

### 7.4 `TenantChangeHistoryPageResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `array<TenantChangeHistoryItem>` | 当前页变更历史 |
| `total` | `integer(int64)` | 变更历史总数 |

### 7.5 `TenantChangeHistoryItem`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 变更历史主键 |
| `tenantId` | `string` | 租户主键 |
| `action` | `string` | `create`、`edit`、`code`、`trial`、`activate`、`disable`、`grant`、`clear`、`delete` |
| `operatedAt` | `string(date-time)` | 操作时间 |
| `operatorName` | `string` | 操作人显示名称 |
| `remark` | `string` | 操作备注 |

### 7.6 `SystemMenuNode`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `parentName` | `string` | 父级菜单标识 |
| `name` | `string` | 菜单标识 |
| `title` | `string` | 菜单名称 |
| `path` | `string` | 访问路径 |
| `icon` | `string` | 图标标识 |
| `menuType` | `string` | 菜单类型 |
| `enabled` | `boolean` | 是否启用 |
| `description` | `string` | 说明 |
| `isVisible` | `boolean` | 是否可见 |
| `isKeepAlive` | `boolean` | 是否缓存页面 |
| `affix` | `boolean` | 是否固定页签 |
| `defaultShow` | `boolean` | 是否默认显示 |
| `sort` | `integer` | 排序值 |
| `isExternalPage` | `boolean` | 是否为外部页面 |
| `openMode` | `string` | 打开方式 |
| `link` | `string` | 外部链接 |
| `pageDataId` | `string` | 页面数据标识 |
| `pageType` | `string` | 页面类型 |
| `children` | `array<SystemMenuNode>` | 子菜单节点，递归结构 |

### 7.7 `SystemMenuImpact`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `childCount` | `integer` | 子菜单数量 |
| `roleMenuGrantCount` | `integer` | 角色菜单授权数量 |
| `functionCount` | `integer` | 功能权限数量 |
| `functionGrantCount` | `integer` | 功能权限授权数量 |
| `tableCount` | `integer` | 数据表数量 |
| `columnPermissionCount` | `integer` | 字段权限引用数量 |

### 7.8 `SystemMenuCodeImpact`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roleMenuGrantCount` | `integer` | 角色菜单授权数量 |
| `functionCount` | `integer` | 功能权限数量 |
| `tableCount` | `integer` | 数据表数量 |
| `dataPermissionCount` | `integer` | 数据权限引用数量 |

### 7.9 `SystemMenuFunctionItem`

此模型既用于返回功能权限，也用于覆盖保存请求中的 `items`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 功能权限主键；新增项可为空 |
| `menuName` | `string` | 所属菜单标识 |
| `title` | `string` | 功能名称 |
| `code` | `string` | 功能编码 |
| `group` | `string` | 功能分组 |
| `description` | `string` | 说明 |
| `sort` | `integer` | 排序值 |
| `enabled` | `boolean` | 是否启用 |

### 7.10 `SystemMenuFunctionImpact`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roleGrantCount` | `integer` | 角色功能授权数量 |

### 7.11 `SystemMenuColumnBundle`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tables` | `array<SystemMenuTableItem>` | 当前应用的数据表定义 |
| `items` | `array<SystemMenuColumnItem>` | 当前应用所有数据表的列定义 |

### 7.12 `SystemMenuTableItem`

此模型既用于返回数据表，也用于覆盖保存请求中的 `tables`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string` | 数据表标识 |
| `title` | `string` | 数据表名称 |
| `description` | `string` | 说明 |
| `sort` | `integer` | 排序值 |

### 7.13 `SystemMenuColumnItem`

此模型既用于返回列定义，也用于覆盖保存请求中的 `items`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 列定义主键；新增项可为空 |
| `menuName` | `string` | 所属菜单标识 |
| `tableCode` | `string` | 所属数据表标识 |
| `tableTitle` | `string` | 所属数据表名称 |
| `title` | `string` | 字段名称 |
| `code` | `string` | 字段编码 |
| `columnType` | `string` | 字段类型 |
| `enabled` | `boolean` | 是否启用 |
| `columnPermission` | `boolean` | 是否用于字段权限 |
| `formFill` | `boolean` | 是否用于表单填报 |
| `queryFilter` | `boolean` | 是否用于查询条件 |
| `sort` | `integer` | 排序值 |
| `description` | `string` | 说明 |

### 7.14 `SystemMenuColumnImpact`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `columnPermissionCount` | `integer` | 字段权限引用数量 |
| `formConfigCount` | `integer` | 表单配置引用数量 |
| `queryConditionCount` | `integer` | 查询条件引用数量 |

### 7.15 `SystemMenuTableImpact`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fieldCount` | `integer` | 数据表下的字段数量 |
| `columnPermissionCount` | `integer` | 字段权限引用数量 |
| `formConfigCount` | `integer` | 表单配置引用数量 |
| `queryConditionCount` | `integer` | 查询条件引用数量 |
