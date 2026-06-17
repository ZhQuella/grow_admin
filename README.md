# Grow Admin

基于 Vue 3 / Vite / TypeScript 的 Monorepo 管理后台框架，采用 IOC 模块化架构，并通过**组件驱动桥接层**支持多套 UI 组件库切换。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动示例应用
pnpm serve
```

默认访问地址：`http://localhost:3000`

## 项目结构

```
grow_admin/
├── DesignRock/              # 框架核心层
│   ├── rock-components/     # 契约组件（Grow* 前缀）
│   ├── rock-layouts/        # 布局壳（主题设置抽屉、菜单、标签页等）
│   ├── rock-state/          # 应用状态（主题模式、配置持久化）
│   ├── rock-styles/         # 全局样式与 CSS 变量
│   ├── rock-component-driver/              # 驱动桥接基础包
│   ├── rock-component-driver-element-plus/   # Element Plus 驱动
│   ├── rock-component-driver-naive/          # Naive UI 驱动
│   ├── rock-component-driver-antdv/          # Ant Design Vue 驱动
│   ├── rock-ioc/            # 依赖注入
│   └── ...
├── DesignCornerstone/       # 业务模块层
│   ├── cornerstone-apps-login/     # 登录模块
│   ├── cornerstone-apps-home/      # 登录后首页（布局壳 + 动态路由注册）
│   └── cornerstone-apps-workspace/ # 工作区业务页（路由配置 + 页面组件）
├── configs/                 # 共享构建配置（含 UnoCSS 主题色映射）
└── sample/                  # 宿主示例应用
```

## 路由与菜单

框架采用 **静态基础路由 + 接口驱动动态路由** 的模式。登录后进入 Home 布局，业务页面作为 Home 的**子路由**渲染在 `home.vue` 的 `<router-view />` 中；侧边菜单与路由共用同一份接口数据，但职责分离：**目录节点只负责菜单展示，叶子节点才注册为可访问路由**。

### 架构概览

```
业务包路由配置（apps-workspace/route-config）
        ↓  Mock / 真实接口  GET /api/menu/list
apps-home/registerDynamicRoutes.ts
        ├─ flatten → router.addRoute('Home', route)   ← 仅叶子节点
        └─ tree    → authStore.backMenuList            ← 保留树形结构
        ↓
rock-layouts/menu（MenuTreeNode 递归渲染）
        ↓ 点击叶子菜单
router.push('/home/xxx')  ← 通过 IoC 获取 router 实例
        ↓
home.vue <router-view /> 渲染业务页面
```

| 层级 | 路由路径 | 说明 |
|------|----------|------|
| 根 | `/` | Login（静态，`whiteRoute: true`） |
| 布局 | `/home` | Home 布局壳（静态，`isBasic: true`） |
| 业务 | `/home/workspace`、`/home/settings` | 动态注册的 Home 子路由 |

### 路由实例的获取方式

**业务代码与布局组件不直接 `import { useRouter } from 'vue-router'`**，统一通过 `@grow-admin-rock/middleware-router` + IoC 获取：

```typescript
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'

// 获取 router 实例（与 registerDynamicRoutes.ts 用法一致）
const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router

router.push('/home/workspace')
router.addRoute('Home', childRoute)
```

宿主应用在 `sample/src/plugin/initIoc.ts` 末尾挂载路由：

```typescript
const router = diKT(routeLib.types.RouteTable).router
app.use(router)
await router.isReady()
```

### 静态路由注册

各业务模块通过 `Lib.routes` 在 IOC 加载时注册到 `AppContext`：

```typescript
// cornerstone-apps-home/src/routes/index.ts
const HOME_ROUTE: RouteRecordItem = {
  path: '/home',
  name: 'Home',
  component: () => import('../pages/home.vue'),
  meta: { title: '首页', isBasic: true },
  // 注意：业务子路由不在此静态声明，由接口动态注入
}

export const RouteList: RouteRecordItem[] = [HOME_ROUTE]
```

| `meta` 字段 | 含义 |
|-------------|------|
| `isBasic: true` | 基础路由，应用启动时写入 router，重置路由时不会被移除 |
| `whiteRoute: true` | 白名单路由（如 Login），未登录可访问 |

### 动态路由注册

动态路由在**用户已登录且首次进入受保护页面时**完成，核心逻辑位于 `cornerstone-apps-home/src/routes/registerDynamicRoutes.ts`：

```typescript
export async function registerDynamicRoutes() {
  // 1. 请求菜单/路由配置
  const { menuList } = await getMenuList()

  // 2. 展平树形配置，仅叶子节点注册为 Vue 路由
  flattenWorkspaceRouteConfigs(menuList).forEach((config) => {
    const route = resolveWorkspaceRoute(config)  // 合并 API 配置与本地 component 映射
    router.addRoute('Home', route)               // 挂到 Home 下
  })

  // 3. 完整树形结构写入 state，供侧边菜单渲染
  authStore.setBackMenuList(toMenuList(menuList))
}
```

**路由守卫**（`cornerstone-apps-home/src/routes/guard.ts`）保证注册时机正确——必须在导航完成前注册，否则直接访问 `/home/workspace` 会因路由不存在而无法匹配：

```typescript
if (!authStore.getIsDynamicAddedRoute) {
  await registerDynamicRoutes()
  authStore.setDynamicAddedRoute(true)
  next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true })
  return
}
```

> 不可仅在 `home.vue` 的 `onMounted` 中注册路由：若用户直接访问子路由 URL，Home 组件尚未挂载，动态路由永远不会被添加。

### 业务包路由配置（apps-workspace）

业务模块维护**两份配置**，职责分离：

| 文件 | 职责 | 是否含 `.vue` 组件 |
|------|------|-------------------|
| `src/routes/config.ts` | 可序列化的树形菜单/路由元数据，供 Mock 与接口返回 | ❌ |
| `src/routes/index.ts` | 本地 `component` 映射 + `resolveWorkspaceRoute()` | ✅ |

**树形配置示例**（`config.ts`）：

```typescript
export const WORKSPACE_ROUTE_CONFIGS: WorkspaceRouteConfig[] = [
  {
    path: 'workspace-catalog',       // 目录标识，不注册为路由
    name: 'WorkspaceCatalog',
    icon: 'ant-design:folder-outlined',
    meta: { title: '工作区' },        // 父级：菜单目录
    children: [
      {
        path: 'workspace',
        name: 'Workspace',
        icon: 'ant-design:appstore-outlined',
        meta: { title: '工作台' },    // 叶子：可访问页面
      },
      {
        path: 'settings',
        name: 'WorkspaceSettings',
        meta: { title: '设置中心' },
      },
    ],
  },
]
```

**组件映射**（`routes/index.ts`）——API 只返回元数据，组件在客户端解析：

```typescript
const WORKSPACE_COMPONENTS: Record<string, GrowRouteComponent> = {
  Workspace: () => import('../pages/workspace.vue'),
  WorkspaceSettings: () => import('../pages/settings.vue'),
}
```

Mock 通过子路径导出引用纯配置，避免 vite-plugin-mock 打包 `.vue` 文件：

```typescript
// sample/mock/routers.ts
import { WORKSPACE_ROUTE_CONFIGS } from '@grow-admin-cornerstone/apps-workspace/route-config'

// GET /api/menu/list → { menuList: WORKSPACE_ROUTE_CONFIGS }
```

### 路由与菜单的关系

同一份接口数据，`registerDynamicRoutes` 处理后产生两种结构：

| 用途 | 数据结构 | 处理方式 |
|------|----------|----------|
| Vue Router | 扁平叶子路由 | `flattenWorkspaceRouteConfigs()` → `addRoute('Home', route)` |
| 侧边菜单 | 树形 `Menu[]` | `toMenuList()` → `authStore.backMenuList` |

**字段映射规则**（`toMenuItem`）：

| 节点类型 | `Menu.path` | 是否注册路由 | 点击行为 |
|----------|-------------|-------------|----------|
| 目录（有 `children`） | `name` 字符串（如 `WorkspaceCatalog`） | ❌ | 展开/收起，不跳转 |
| 叶子（无 `children`） | 完整路径（如 `/home/workspace`） | ✅ | `router.push(path)` |

菜单状态存储在 `@grow-admin-rock/state` 的 `authStore.backMenuList`，侧边栏从该字段读取并渲染。

### 菜单渲染（rock-layouts）

`@grow-admin-rock/layouts` 的 `Menu` 组件从 `authStore.backMenuList` 读取数据，通过 `MenuTreeNode` **递归组件**渲染树形菜单：

```
Menu（menu.vue）
  └─ MenuTreeNode（递归）
       ├─ 有 children → GrowSubMenu（目录）
       └─ 无 children → GrowMenuItem（可点击菜单项）
```

Element Plus 的 `ElMenu` 要求 `SubMenu` / `MenuItem` 作为**直接子节点**，因此不可使用 `<template v-for>` 包裹，必须通过递归组件保证每个节点只有一个根元素。

菜单点击跳转同样通过 IoC 获取 router（**不依赖 vue-router 作为 layouts 的直接依赖**）：

```typescript
// rock-layouts/src/menu/menu.vue
function handleMenuSelect(path: string) {
  if (!path.startsWith('/')) return  // 目录节点 path 不以 / 开头，忽略
  resolveByKeyOrThrow(routeLib.types.RouteTable).router.push(path)
}
```

Home 页面通过 Teleport 将 Menu 挂载到布局插槽：

```vue
<!-- cornerstone-apps-home/src/pages/home.vue -->
<template #view>
  <router-view />   <!-- 子路由页面渲染位置 -->
</template>

<Teleport to="#grow-menu">
  <Menu />          <!-- 侧边菜单 -->
</Teleport>
```

### 新增业务页面流程

以在 `apps-workspace` 中新增页面为例：

1. **新建页面组件** — `src/pages/xxx.vue`
2. **更新树形配置** — 在 `src/routes/config.ts` 的 `children` 中追加节点（或新增目录）
3. **注册组件映射** — 在 `src/routes/index.ts` 的 `WORKSPACE_COMPONENTS` 中添加 `name → import()` 对应关系
4. **Mock 自动生效** — `sample/mock/routers.ts` 引用 `route-config`，无需额外修改
5. **重启/刷新** — 重新登录或清除 `isDynamicAddedRoute` 状态后验证

### 关键文件索引

| 文件 | 职责 |
|------|------|
| `DesignCornerstone/cornerstone-apps-workspace/src/routes/config.ts` | 树形路由/菜单元数据（Mock 安全导出） |
| `DesignCornerstone/cornerstone-apps-workspace/src/routes/index.ts` | 组件映射、`resolveWorkspaceRoute()` |
| `DesignCornerstone/cornerstone-apps-home/src/routes/index.ts` | Home 静态路由 |
| `DesignCornerstone/cornerstone-apps-home/src/routes/guard.ts` | 登录守卫 + 动态路由注册触发 |
| `DesignCornerstone/cornerstone-apps-home/src/routes/registerDynamicRoutes.ts` | 拉取菜单、注册路由、写入 state |
| `DesignCornerstone/cornerstone-apps-home/src/api/routers.ts` | `getMenuList()` 接口定义 |
| `sample/mock/routers.ts` | 开发环境 Mock 菜单接口 |
| `DesignRock/rock-layouts/src/menu/menu.vue` | 侧边菜单容器 |
| `DesignRock/rock-layouts/src/menu/MenuTreeNode.vue` | 菜单树递归节点 |
| `DesignRock/rock-state/src/modules/authStore.ts` | `backMenuList` 菜单状态 |
| `DesignRock/rock-middleware-router/` | 路由表 IoC 注册、`RouteOperator` |

### 开发自检清单

1. 登录后直接访问 `/home/workspace`，页面正常渲染（非空白、非跳转 Login）。
2. 侧边栏显示树形目录，目录节点点击不跳转，叶子节点点击切换路由。
3. 当前路由对应的菜单项高亮。
4. Mock 接口 `/api/menu/list` 返回的数据结构与 `config.ts` 一致。
5. 新增页面后，`WORKSPACE_COMPONENTS` 中存在对应 `name` 映射，否则 `resolveWorkspaceRoute` 会抛错。

## 主题与颜色

框架通过 **CSS 变量 + Pinia 状态 + 三库 Config 驱动** 统一管理主题。开发时修改颜色，通常只需动下面几处；运行时用户在「项目配置」抽屉中选色会写入 `localStorage`，可能覆盖你改过的默认值。

### 架构概览

```
sample/src/projectSetting.ts          ← 宿主静态默认配置（themeColor 等）
        ↓ 首次启动 merge
@grow-admin-rock/state (useAppConfig) ← 运行时状态 + localStorage 持久化
        ↓ useTheme()
:root / :root.dark CSS 变量            ← @grow-admin-rock/styles
        ↓ GrowConfig 驱动
Element Plus / Naive UI / Ant Design Vue 主色与 hover/active
```

| 包 | 职责 |
|----|------|
| `@grow-admin-rock/styles` | `:root` 变量、亮/暗 token、主题切换过渡动画 |
| `@grow-admin-rock/state` | `themeMode`（亮/暗/跟随系统）、`themeColor`、动态写入 DOM |
| `@grow-admin-rock/layouts` | `SettingDrawer` 等项目配置 UI |
| `@grow-admin-rock/constants` | 预设色板 `APP_THEME_COLOR_LIST` |
| `configs/vite` UnoCSS | 语义类名 `bg-layout`、`text-text`、`bg-primary` 等 |

### 修改默认主题色（新项目 / 首次加载）

**推荐只改宿主应用的 `projectSetting.ts`：**

```typescript
// sample/src/projectSetting.ts
export const projectSetting: ProjectSetting = {
  themeColor: '#8b5cf6', // ← 改这里
  // ...
};
```

首次访问（`localStorage` 尚无 `APP_CONFIG`）时，`sample/src/initAppConfig.ts` 会把该值 merge 进 `useAppConfig`。  
若本地已有持久化配置，需清除站点 `localStorage` 或在设置抽屉点击「重置配置」才能看到新默认值。

Pinia 内置默认值位于 `DesignRock/rock-state/src/modules/appConfig.ts` 的 `themeColor`，一般**不必改**；以宿主 `projectSetting.ts` 为准即可。

### 增加 / 修改设置抽屉中的可选主题色

设置抽屉的色块来自常量 **`APP_THEME_COLOR_LIST`**：

```typescript
// DesignRock/rock-constants/src/designSetting.ts
export const APP_THEME_COLOR_LIST: string[] = [
  '#8b5cf6', // 第一项建议与默认 themeColor 一致
  '#0084f4',
  // 追加新颜色…
];
```

修改后重启 `pnpm serve` 即可；无需改 `SettingDrawer` 组件逻辑。

### 修改 CSS 变量（布局、文字、边框等）

全局 design token 在 **`DesignRock/rock-styles/src/variables.css`**：

```css
:root {
  --primary-color: #8b5cf6;
  --primary-color-hover: #a78bfa;   /* 静态回退值 */
  --primary-color-active: #7c3aed;
  --text-color: rgba(0, 0, 0, 0.85);
  --layout-container-background-color: #f0f2f5;
  /* … */
}

:root.dark {
  --text-color: rgba(255, 255, 255, 0.85);
  --layout-container-background-color: rgb(16, 16, 20);
  /* … */
}
```

**注意：**

- 运行时切换 `themeColor` 时，`useTheme` 会按主色**自动计算** hover / active 及 Element Plus 的 `--el-color-primary-light-*`，并写入 `:root` 行内样式。
- `variables.css` 里的 `--primary-color-hover` 等主要作**首屏回退**；动态主色以 JS 计算结果为准。
- 新增语义变量时，建议同时在 `:root` 与 `:root.dark` 各写一套。

### 在页面中使用颜色（UnoCSS）

UnoCSS 已映射到 CSS 变量（`configs/vite/src/plugins/unocss.ts`），**无需写 `dark:` 前缀**，亮/暗随 `:root.dark` 自动切换：

| UnoCSS 类 | 含义 |
|-----------|------|
| `bg-primary` / `text-primary` | 主题主色 |
| `bg-layout` | 页面背景 |
| `bg-component` | 卡片 / 面板背景 |
| `text-text` | 主文字 |
| `text-muted` / `text-text-secondary` | 次要文字 |
| `border-border` | 边框 |
| `shadow-card` | 卡片阴影（随主题变化） |
| `surface-panel` | shortcut：`bg-component border border-border rounded-lg` |

示例（参考 `cornerstone-apps-login/src/pages/login.vue`）：

```vue
<template>
  <div class="min-h-screen bg-layout text-text">
    <div class="surface-panel shadow-card p-8">
      <h1 class="text-2xl font-semibold text-primary">标题</h1>
      <p class="text-muted">说明文字</p>
    </div>
  </div>
</template>
```

**新增 UnoCSS 语义色：** 在 `configs/vite/src/plugins/unocss.ts` 的 `theme.colors` 增加映射，并在 `variables.css` 定义对应变量：

```typescript
// configs/vite/src/plugins/unocss.ts
theme: {
  colors: {
    accent: 'var(--accent-color)', // 新增
  },
},
```

```css
/* rock-styles/src/variables.css */
:root { --accent-color: #f59e0b; }
:root.dark { --accent-color: #fbbf24; }
```

修改 UnoCSS 配置后需重启 dev server。

### 三库主色同步（一般无需手动改）

`GrowConfig` 驱动会在运行时注入当前主题色及 hover/active：

| 组件库 | 实现位置 |
|--------|----------|
| Element Plus | `html.dark` + `--el-color-primary*` CSS 变量 |
| Naive UI | `rock-component-driver-naive/src/components/Config.vue` |
| Ant Design Vue | `rock-component-driver-antdv/src/components/Config.vue` |

业务代码使用 `GrowButton type="primary"` 等即可，**不要**在业务里单独写各库主色。

Ant Design Vue 构建时 Less 变量在 `configs/vite/src/presets/antd.ts` 的 `primary-color`；若默认主色与线上一致，可同步修改该文件（主要影响构建期 antd 基础样式）。

### 主题模式（亮 / 暗 / 跟随系统）

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 默认模式 | `initAppConfig` → `themeMode: ThemeModeEnum.SYSTEM` | 跟随系统 |
| 运行时切换 | 登录页 `LoginThemeSwitch` / 设置抽屉 `SettingTheme` | 写入 `useAppConfig` |
| 暗色 class | `html.dark` | UnoCSS `dark:` 与 EP 暗色变量均依赖此类 |
| 切换动画 | `rock-styles/src/theme-transition.css` | 约 0.35s，可在 `variables.css` 调整 `--theme-transition-duration` |

### 开发自检清单

1. 改完 `projectSetting.themeColor` 后，清除 `localStorage` 或使用无痕窗口验证默认值。
2. 在设置抽屉切换色块，确认按钮 hover、主色、UnoCSS `text-primary` 同步变化。
3. 切换亮/暗模式，确认 `:root.dark` 下布局背景、文字、卡片阴影正常。
4. 切换 `componentLibrary` 后，主色在三库下表现一致。

## 主题选择与语言选择

主题与语言分为两套 UI：**登录页顶部工具栏**（`cornerstone-apps-login` 内专用组件）与 **项目配置抽屉**（`@grow-admin-rock/layouts`）。二者共用同一套运行时状态，切换会同步。

### 前置条件

宿主应用（`sample/src/plugin/initIoc.ts`）需注册：

```ts
import { Lib as localeLib } from '@grow-admin-rock/locale'
import { Lib as stateLib } from '@grow-admin-rock/state'
import { Lib as componentsLib } from '@grow-admin-rock/components'

app
  .use(stateLib, appContext)
  .use(localeLib, appContext)      // 多语言必需
  .use(componentsLib, appContext) // GrowSwitch / GrowSelect 等
```

根组件需挂载 `GrowMessageProvider` 等 Provider（参考 `sample/src/App.vue`）。

### 登录页：主题 / 语言

登录页使用本包专用组件，**不要**直接使用项目配置里的 `SwitchLanguage`。

| 组件 | 路径 | 说明 |
|------|------|------|
| `LoginThemeSwitch` | `cornerstone-apps-login/src/components/LoginThemeSwitch` | 暗色模式开关（亮色 ↔ 暗色） |
| `LoginLanguageSwitch` | `cornerstone-apps-login/src/components/LoginLanguageSwitch` | 语言下拉（简体中文 / English） |

```vue
<script setup lang="ts">
import { useLocale } from '@grow-admin-rock/locale'
import LoginThemeSwitch from '#/components/LoginThemeSwitch/index.vue'
import LoginLanguageSwitch from '#/components/LoginLanguageSwitch/index.vue'

const { getLocale } = useLocale()
</script>

<template>
  <div :key="getLocale">
    <LoginThemeSwitch />
    <LoginLanguageSwitch />
  </div>
</template>
```

参考：`DesignCornerstone/cornerstone-apps-login/src/pages/login.vue`。

### 项目配置抽屉：主题 / 语言

完整主题（模式 + 主题色）与语言表单项在 `@grow-admin-rock/layouts`：

| 组件 | 导出 | 说明 |
|------|------|------|
| `SettingDrawer` | `@grow-admin-rock/layouts` | 项目配置抽屉（默认宽度 400px） |
| `SettingTheme` | `@grow-admin-rock/layouts` | 主题模式 + 主题色（`GrowForm`） |
| `SwitchLanguage` | `@grow-admin-rock/layouts` | 语言下拉（`GrowForm`） |

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SettingDrawer, SettingTheme, SwitchLanguage } from '@grow-admin-rock/layouts'

const settingVisible = ref(false)
</script>

<template>
  <GrowButton @click="settingVisible = true">项目配置</GrowButton>
  <SettingDrawer v-model="settingVisible" />

  <!-- 也可单独拼装 -->
  <SettingTheme />
  <SwitchLanguage />
</template>
```

`SwitchLanguage` 可选 Props：

| Prop | 默认值 | 说明 |
|------|--------|------|
| `showLabel` | `true` | 是否显示表单项标签 |
| `labelKey` | `layout.setting.language` | i18n 标签 key |
| `selectClass` | `w-full` | 下拉框 class |

设置抽屉内点击「重置配置」会恢复主题默认值，并将语言重置为 **简体中文**（`zh_CN`）。

### 编程式调用

不渲染组件时，可直接操作状态 API：

```ts
import { ThemeModeEnum } from '@grow-admin-rock/constants'
import { LOCALE, useLocale } from '@grow-admin-rock/locale'
import { useAppConfig } from '@grow-admin-rock/state'

// 主题
const appConfig = useAppConfig()
appConfig.setThemeMode(ThemeModeEnum.DARK)   // 暗色
appConfig.setThemeMode(ThemeModeEnum.LIGHT)  // 亮色
appConfig.setThemeMode(ThemeModeEnum.SYSTEM) // 跟随系统
appConfig.setThemeColor('#8b5cf6')

// 语言
const { changeLocale } = useLocale()
await changeLocale(LOCALE.zh) // 简体中文（默认）
await changeLocale(LOCALE.en) // English
```

| 能力 | 包 | API |
|------|-----|-----|
| 主题模式 / 主题色 | `@grow-admin-rock/state` | `useAppConfig()` |
| 语言切换 / 持久化 | `@grow-admin-rock/locale` | `useLocale().changeLocale()` |
| 文案 | `@grow-admin-rock/locale` | `useI18n().t('layout.login.*')` / `layout.setting.*` |

语言偏好保存在 `localStorage`（key：`LOCALE__`），登录页与项目配置抽屉共用。

### 文案扩展

在 `DesignRock/rock-locale/src/lang/` 下维护：

- 登录页：`zh-CN/layout/login.ts`、`en/layout/login.ts`
- 项目配置：`zh-CN/layout/setting.ts`、`en/layout/setting.ts`

新增语言时，同步修改 `rock-locale/src/config.ts` 的 `localeList` 与 `availableLocales`。

## 组件驱动架构

业务代码与具体 UI 库解耦，通过三层结构协作：

```
业务代码 / 业务模块（apps-login 等）
        ↓
Grow* 契约组件（@grow-admin-rock/components）
        ↓
组件驱动桥接层（@grow-admin-rock/component-driver）
        ↓
具体驱动包（element-plus / naive-ui / ant-design-vue）
```

**设计原则：**

- 业务模块只使用 `Grow*` 契约组件，禁止直接 `import element-plus` / `naive-ui` / `ant-design-vue`
- 组件库切换在宿主应用（`sample`）统一配置，业务模块无需关心底层实现
- 支持全局一种组件库 + 局部子树覆盖另一种

## 切换组件库

当前支持三种组件库，默认使用 **Element Plus**。

切换时需要同时修改**两处配置**，分别控制运行时驱动和构建时自动导入：

| 配置位置 | 作用 | 影响范围 |
|----------|------|----------|
| `sample/src/projectSetting.ts` | 运行时加载哪个驱动包 | `Grow*` 组件实际渲染的 UI 库 |
| `sample/vite.config.ts` 的 `preset` | 构建时 `unplugin-vue-components` 的 resolver | 三方组件按需自动导入、样式预处理 |

两处必须保持一致，否则可能出现样式缺失或组件行为异常。

### 配置对照表

| 组件库 | `componentLibrary` | `vite preset` | 驱动包 |
|--------|-------------------|---------------|--------|
| Element Plus（默认） | `ComponentLibraryType.ElementPlus` | `'ele'` | `@grow-admin-rock/component-driver-element-plus` |
| Naive UI | `ComponentLibraryType.NaiveUI` | `'naive'` | `@grow-admin-rock/component-driver-naive` |
| Ant Design Vue | `ComponentLibraryType.AntDesignVue` | `'antd'` | `@grow-admin-rock/component-driver-antdv` |

### 切换流程

```
projectSetting.componentLibrary
        ↓
sample/src/init-components-driver.ts   ← 动态 import 对应驱动包
        ↓
driver.builder().enableAll()           ← 注册全部组件映射
        ↓
AppContext.DriverComponentDictionary
        ↓
componentsLib.onSetup → registerGrowComponent()  ← 全局注册 Grow* 组件
```

### 切换到 Element Plus（默认）

**第一步** — `sample/src/projectSetting.ts`：

```typescript
import { ComponentLibraryType } from '@grow-admin-rock/types';

export const projectSetting: ProjectSetting = {
  componentLibrary: ComponentLibraryType.ElementPlus,
  // ...
};
```

**第二步** — `sample/vite.config.ts`：

```typescript
export default defineConfig(async ({ command, mode }) => {
  return await createViteConfig(command, mode, process.cwd(), { preset: 'ele' });
});
```

**第三步** — 重启开发服务器：

```bash
pnpm serve
```

控制台应输出：`[ComponentDriver] 已加载组件库驱动: element-plus`

> Element Plus 的 Message / Notification / Dialog 同样会在 `init-components-driver.ts` 中自动绑定（`ElMessage` / `ElNotification` / `ElMessageBox`），无需额外配置。

### 切换到 Naive UI

**第一步** — `sample/src/projectSetting.ts`：

```typescript
componentLibrary: ComponentLibraryType.NaiveUI,
```

**第二步** — `sample/vite.config.ts`：

```typescript
{ preset: 'naive' }
```

**第三步** — 重启开发服务器，确认控制台输出：`naive-ui`

> Naive UI 的 Message / Notification / Dialog 会在 `init-components-driver.ts` 中自动绑定，无需额外配置。

### 切换到 Ant Design Vue

**第一步** — `sample/src/projectSetting.ts`：

```typescript
componentLibrary: ComponentLibraryType.AntDesignVue,
```

**第二步** — `sample/vite.config.ts`：

```typescript
{ preset: 'antd' }
```

**第三步** — 重启开发服务器，确认控制台输出：`ant-design-vue`

### 开发环境与生产环境

`projectSetting.ts` 在开发和生产构建中均生效，切换方式相同。无论 `pnpm serve` 还是 `pnpm build`，都需要保证 `componentLibrary` 与 `preset` 一致。

若需按环境区分（例如开发用 Element Plus、生产用 Naive UI），可在 `projectSetting.ts` 中根据 `import.meta.env` 分支：

```typescript
export const projectSetting: ProjectSetting = {
  componentLibrary: import.meta.env.PROD
    ? ComponentLibraryType.NaiveUI
    : ComponentLibraryType.ElementPlus,
  // ...
};
```

对应的 `vite.config.ts` 也需按 `mode` 传入不同 `preset`，或通过 `.env.development` / `.env.production` 配合脚本动态选择。

### 验证切换是否成功

1. 控制台出现 `[ComponentDriver] 已加载组件库驱动: xxx`
2. 页面中 `<GrowButton>`、`<GrowInput>` 渲染为对应 UI 库风格
3. 浏览器开发者工具中，对应 UI 库的 CSS 已加载（驱动包在入口自动引入样式）

### 常见问题

| 现象 | 原因 | 解决 |
|------|------|------|
| 组件无样式 | `preset` 与 `componentLibrary` 不一致 | 对照配置表同步修改两处 |
| 控制台报「缺少驱动」 | 未重启 dev server | 修改配置后重新 `pnpm serve` |
| 切换后组件行为异常 | 只改了 `projectSetting` 没改 `preset` | 两处必须同时切换 |
| `ComponentMap is not defined` | 驱动包构建缓存问题 | 清除缓存后重启：`rm -rf sample/node_modules/.vite` |

## 在页面中使用组件

契约组件以 **`Grow` 前缀**全局注册，可直接在模板中使用：

```vue
<template>
  <GrowButton type="primary">提交</GrowButton>
  <GrowInput v-model="value" placeholder="请输入" />
  <GrowSelect v-model="selected" :options="options" />
</template>
```

在 `<script>` 中需要获取底层驱动组件时：

```typescript
import { useDriverComponent, RockComponent } from '@grow-admin-rock/components';

const Button = useDriverComponent(RockComponent.Button);
```

## 命令式 API 统一调用（Message / Notification / Dialog）

除模板中的 `Grow*` 组件外，消息提示、通知、对话框等**命令式 API** 也通过桥接层统一暴露，切换组件库时业务代码无需 `import element-plus` / `naive-ui` / `ant-design-vue`。

### 绑定机制

宿主应用在 `sample/src/init-components-driver.ts` 安装驱动时，调用 `setMessage` / `setNotice` / `setDialog` 注入当前组件库的实现：

| 组件库 | Message | Notification | Dialog |
|--------|---------|--------------|--------|
| Element Plus | `ElMessage` | `ElNotification` | `ElMessageBox` |
| Naive UI | `useMessage()` | `useNotification()` | `useDialog()` |
| Ant Design Vue | `message` | `notification` | `Modal` |

```
init-components-driver.ts
        ↓ setMessage / setNotice / setDialog
@grow-admin-rock/components
        ↓ useMessage() / useNotice() / useDialog()
业务代码（统一 import，无需感知底层库）
```

### Provider 包裹（必须）

Naive UI 的 `useMessage()` 等必须在 `GrowMessageProvider` 子树的组件 `setup` 中调用；Element Plus / Ant Design Vue 也建议保持相同结构，便于三库切换时代码一致。

推荐在宿主应用根组件（参考 `sample/src/App.vue`）中包裹：

```vue
<template>
  <GrowConfig>
    <GrowNotificationProvider>
      <GrowMessageProvider>
        <GrowDialogProvider>
          <router-view />
          <!-- 业务页面作为 Provider 的子组件 -->
        </GrowDialogProvider>
      </GrowMessageProvider>
    </GrowNotificationProvider>
  </GrowConfig>
</template>
```

> `useMessage()` 必须在 Provider **子组件** 的 `setup` 中调用，不可在根组件 `setup` 中直接调用（此时 Provider 尚未挂载）。可将业务逻辑放在子页面或独立子组件中。

### 统一入口

```typescript
import { useMessage, useNotice, useDialog } from '@grow-admin-rock/components';

// useMessage 是 useMsg 的别名，两者等价
const message = useMessage();
const notice = useNotice();
const dialog = useDialog();
```

### Message（消息提示）

三库均支持相同调用方式，可直接统一编写：

```typescript
message.success('操作成功');
message.error('操作失败');
message.warning('请注意');
message.info('提示信息');
```

### Notification（通知）

各库参数名略有差异，建议同时传入兼容字段：

```typescript
notice.success({
  title: '通知标题',
  content: '通知内容',      // Naive UI
  message: '通知内容',      // Element Plus
  description: '通知内容',  // Ant Design Vue
});
```

### Dialog（对话框）

三库 API 差异较大，需按库分支处理：

```typescript
import { ComponentLibraryType } from '@grow-admin-rock/types';
import { projectSetting } from '@/projectSetting';

function showConfirm() {
  const dialog = useDialog();
  if (!dialog) return;

  // Naive UI
  if (typeof dialog.warning === 'function') {
    dialog.warning({
      title: '确认操作',
      content: '确定要执行此操作吗？',
      positiveText: '确定',
      negativeText: '取消',
    });
    return;
  }

  // Ant Design Vue
  if (projectSetting.componentLibrary === ComponentLibraryType.AntDesignVue) {
    dialog.confirm({
      title: '确认操作',
      content: '确定要执行此操作吗？',
    });
    return;
  }

  // Element Plus
  if (typeof dialog.confirm === 'function') {
    dialog.confirm('确定要执行此操作吗？', '确认操作');
  }
}
```

### 完整示例

`sample/src/components/DriverDemo.vue` 提供了可运行的演示，启动 `pnpm serve` 后点击页面按钮即可验证：

```vue
<script setup lang="ts">
import { useMessage, useNotice, useDialog } from '@grow-admin-rock/components';

const message = useMessage();
const notice = useNotice();
const dialog = useDialog();

function handleMessage(type: 'success' | 'error' | 'warning' | 'info') {
  message?.[type]?.('这是一条 Message 提示');
}

function handleNotice() {
  notice?.success?.({
    title: '通知标题',
    content: '这是一条 Notification 通知',
    message: '这是一条 Notification 通知',
    description: '这是一条 Notification 通知',
  });
}
</script>

<template>
  <GrowButton type="primary" @click="handleMessage('success')">Message Success</GrowButton>
  <GrowButton @click="handleNotice">Notification</GrowButton>
</template>
```

### API 对照速查

| 能力 | 统一入口 | 三库一致性 | 备注 |
|------|----------|-----------|------|
| 消息提示 | `useMessage()` / `useMsg()` | ✅ 完全一致 | `.success()` `.error()` `.warning()` `.info()` |
| 通知 | `useNotice()` | ⚠️ 参数名不同 | 建议同时传 `title` + `content`/`message`/`description` |
| 对话框 | `useDialog()` | ⚠️ 方法不同 | Naive `.warning()`，EP `confirm(msg, title)`，Antdv `confirm({ title, content })` |

### 开发规范

| ✅ 推荐 | ❌ 禁止 |
|---------|---------|
| `import { useMessage } from '@grow-admin-rock/components'` | `import { ElMessage } from 'element-plus'` |
| 在 Provider 子组件中调用 `useMessage()` | 在根组件 setup 中直接调用（Naive 会失效） |
| 通过 `projectSetting` 切换库后自动切换底层实现 | 业务模块内手动绑定各库 Message API |

## 在业务模块中使用（以 apps-login 为例）

业务模块（`DesignCornerstone/*`）**不需要**自行安装驱动，依赖宿主应用完成初始化。

### 宿主应用启动顺序

`sample/src/plugin/initIoc.ts` 中的顺序必须保持：

```typescript
await installComponentDriver(app, appContext);  // 1. 安装驱动
app
  .use(IocPlugin, iocOptions)
  .use(infrastructureLib, appContext)
  .use(routeLib, appContext)
  .use(appsLoginLib, appContext)
  .use(componentsLib, appContext);               // 2. 注册 Grow 组件
await appContext.load(app);
```

### 业务模块声明依赖

在业务模块 `package.json` 中添加：

```json
{
  "peerDependencies": {
    "vue": "~3.3.4",
    "@grow-admin-rock/components": "workspace:*"
  },
  "devDependencies": {
    "@grow-admin-rock/components": "workspace:*"
  }
}
```

### 业务页面编写

```vue
<!-- DesignCornerstone/cornerstone-apps-login/src/pages/login.vue -->
<script lang="ts" setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-8">
    <GrowInput v-model="username" placeholder="用户名" />
    <GrowInput v-model="password" type="password" placeholder="密码" />
    <GrowButton type="primary">登录</GrowButton>
  </div>
</template>
```

## 局部覆盖组件库

当某个页面需要使用与全局不同的组件库时，用 `ComponentDriverProvider` 包裹子树：

```vue
<script setup>
import { ComponentDriverProvider } from '@grow-admin-rock/component-driver';
import { NaiveComponentDriver } from '@grow-admin-rock/component-driver-naive';

const driver = NaiveComponentDriver.builder()
  .enableButton()
  .enableInput()
  .finish();
</script>

<template>
  <ComponentDriverProvider :driver="driver">
    <!-- 此区域内的 Grow* 组件走 Naive UI 驱动 -->
    <GrowButton>局部 Naive 按钮</GrowButton>
  </ComponentDriverProvider>
</template>
```

按需启用组件：

```typescript
EPComponentDriver.builder()
  .enableButton()
  .enableDatePicker()
  .finish();
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm serve` | 启动 sample 开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm stub` | 预构建 Vite 配置包 |

## 开发规范

| ✅ 推荐 | ❌ 禁止 |
|---------|---------|
| 模板中使用 `<GrowButton>` 等契约组件 | 直接 `import { ElButton } from 'element-plus'` |
| 通过 `projectSetting.componentLibrary` 切换库 | 在业务模块内安装/切换驱动 |
| 业务模块 peer 依赖 `@grow-admin-rock/components` | 业务模块直接依赖三方 UI 库 |
| 特殊场景使用 `ComponentDriverProvider` | 绕过桥接层直接使用三方组件 |
| `useMessage()` / `useNotice()` / `useDialog()` 统一调用 | 直接 `import { ElMessage }` 等三方 API |

## 相关包说明

| 包名 | 职责 |
|------|------|
| `@grow-admin-rock/components` | `RockComponent` 枚举、`Grow*` 契约组件、`ComponentMap` |
| `@grow-admin-rock/layouts` | 布局壳：`SettingDrawer`、`SettingTheme`、`SwitchLanguage` 等 |
| `@grow-admin-rock/locale` | `useI18n`、`useLocale`、语言包加载与持久化 |
| `@grow-admin-rock/state` | `useAppConfig`、`useTheme`、`useAuthStore`（含 `backMenuList`）、配置持久化 |
| `@grow-admin-rock/middleware-router` | 路由表 IoC 注册、`RouteTable`、`RouteOperator` |
| `@grow-admin-rock/styles` | 全局 CSS 变量、UnoCSS 入口、主题过渡 |
| `@grow-admin-rock/constants` | `APP_THEME_COLOR_LIST` 等设计常量 |
| `@grow-admin-rock/component-driver` | 抽象驱动、`ComponentDriverProvider`、Builder API |
| `@grow-admin-rock/component-driver-element-plus` | Element Plus 组件映射（84 个共有组件） |
| `@grow-admin-rock/component-driver-naive` | Naive UI 组件映射（84 个共有组件） |
| `@grow-admin-rock/component-driver-antdv` | Ant Design Vue 组件映射（84 个共有组件） |

三个驱动包已对齐全部 **84 个共有契约组件**（`Grow*` 前缀），切换 `projectSetting.componentLibrary` 即可在同一套业务代码下切换 UI 库，无需修改页面中的组件用法。

### 不包含的组件（参考项目自定义封装）

以下组件属于参考项目（weiming-design）自行封装，**不纳入本项目**：

| 组件 | 说明 |
|------|------|
| `GrowIconify` | 基于 Iconify 的自定义图标组件 |
| `GrowTable` | 基于 vxe-table 的表格封装 |
| `GrowCubeTable` | 基于 @antv/s2 的多维表格 |
| `GrowLocalePicker` | 自定义语言切换器 |

若业务需要类似能力，请在 `DesignCornerstone` 业务模块中自行实现，不要放入 `rock-components` 契约层。
