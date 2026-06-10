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
│   ├── rock-component-driver/              # 驱动桥接基础包
│   ├── rock-component-driver-element-plus/   # Element Plus 驱动
│   ├── rock-component-driver-naive/          # Naive UI 驱动
│   ├── rock-component-driver-antdv/          # Ant Design Vue 驱动
│   ├── rock-ioc/            # 依赖注入
│   └── ...
├── DesignCornerstone/       # 业务模块层
│   └── cornerstone-apps-login/
├── configs/                 # 共享构建配置
└── sample/                  # 宿主示例应用
```

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

## 相关包说明

| 包名 | 职责 |
|------|------|
| `@grow-admin-rock/components` | `RockComponent` 枚举、`Grow*` 契约组件、`ComponentMap` |
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
