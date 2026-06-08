# 磐石的钩子模块

## 钩子模块的目的和定位

1. 降低代码量
2. 降低模块依赖耦合
3. 对Vue3的模块更符合使用风格
4. 对于基础模块的一些autoconfig处理，比如默认链接bean等

## 钩子模块的一些约定

1. 禁止引入组件级别的模块，只针对基础模块（本地化、路由、state等）封装一些钩子函数
2. 钩子函数中的实现必须以IOC为基础实现，不要直接创建
3. 对于IOC的注入过程如果涉及到一些`type`类引入可以选择契约声明，比如：

- `@grow-admin-rock/types/GlobConfig`是在不同模块中声明的Symbol
- 使用侧按照`useGlobConfig1<GlobConfig>();`的方式引用，直接依赖类型

```ts
const useGlobConfig1: <T>() => T = () => {
  return diKT(Symbol.for('@grow-admin-rock/types/GlobConfig') as ServiceIdentifier<any>)
};

useGlobConfig1<GlobConfig>();
```

## 钩子函数清单

### App相关
[源码文件](src/app/index.ts)

- `useDesign`：获取`DesignInfo`，导出全局样式前缀和样式变量
- `useAppStatus`：获取`AppStatus`，`@grow-admin-rock/settings/AppStatus`的封装
- `useAppStateStore`：获取`AppStore`，`@grow-admin-rock/state/AppStore`的封装，后续需要合并到`useAppStatus`中