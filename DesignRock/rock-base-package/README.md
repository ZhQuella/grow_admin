# 模块基础定义(`@grow-admin-rock/base-package`)

## 一、Module的概念

grow-admin Design中每个模块都是一个可以直接被加载进Vue3项目中的模块，生命周期尽量自封闭。同时也支持跳过AutoConfig，通过CondingConfig的模式启动模块。

1. AutoConfig模式：每个module都遵循Vue的插件协议，可以通过App.use来安装。生命周期跟随Vue插件的生命周期自动装载。这种模式比较适合使用grow-adminDesingCli创建的工程
2. CodingConfig模式：模块基于`@grow-admin-rock/base-package`来开发，每个模块都规定了需要规范化模块的接口，可以查阅相关文档，在App启动的相应时机调用相应的周期函数。这种模式比较适合一个现有的Vue3项目直接加载模块

## 二、Module的结构

一个标准的模块工程应该包含如下文件:

```md
├── README.md
├── beankeys.ts
├── index.ts
├── library.ts
├── package.json
├── src
│   └── index.ts
└── tsconfig.json
```

### 1. Npm Package的定义

一个Module首先需要是一个Npm的pkg，`package.json`必不可少，几个必选项目：

1. `script.clean`：clean命令用于将现有的模块清理重新安装，放入grow-admin-design的环境中会有turbo整体驱动执行，便于打包
2. `@grow-admin-rock/base-package`和`@grow-admin-rock/ioc`两个主要的依赖用于支持类型引用和模块定义
3. 工程额外需要依赖引用`"vue": "~3.3.4"`和`"lodash-es": "^4.0.0"`

一个完整的包一般结构如下：

```json
{
  "name": "grow-admin-design-module-template",
  "version": "0.0.0",
  "main": "index.ts",
  "module": "index.ts",
  "description": "grow-admin Design Module Template",
  "license": "MIT",
  "author": {
    "name": "Randy Zhang",
    "email": "zhangshi@tenez.cn",
    "url": "https://git.wmqhealth.com/zhangshi"
  },
  "scripts": {
    "clean": "pnpm rimraf node_modules && pnpm rimraf dist && pnpm rimraf .turbo"
  },
  "dependencies": {
    "@grow-admin-rock/base-package": "workspace:*",
    "@grow-admin-rock/ioc": "workspace:*"
  },
  "devDependencies": {
    "@grow-admin-rock/types": "workspace:*"
  },
  "peerDependencies": {
    "vue": "~3.3.4",
    "lodash-es": "^4.0.0"
  }
}
```

### 2. Module的入口

模块的入口首先是遵循Npm的pkg机制，不熟悉的可以查阅nodejs的文档。其次在pkg的入口文件中**必须**要`export`对象`Lib:Library`，`interface Library`来自`@grow-admin-rock/base-package`。

`Lib`这个对象中主要防止了一些用于加载模块的信息

1. `name`、`version`来自于`package.json`，用于展示包的主要信息，也是识别一个载入的库的唯一标识。`describtion`也来自于`package.json`，对于包的一些说明信息，属性可选。
2. `module`：来自`@grow-admin-rock/ioc`的IOC注册接口，内部处理模块的Bean注册
3. `onSetup?`：生命周期钩子函数，在应用所有基础配置完成之后
4. `beforeSetup?`：生命周期钩子函数，只创建了Vue的App，但是未执行任何配置
5. `install`：Vue的插件协议函数从`@grow-admin-rock/base-package`中直接导入install函数即可

### 3. IOC里Bean的声明

#### 目前TS中IOC的实现情况和限制

1. `type`和`interface`的限制：这两个概念都属于TS编译前的概念，编译后并不存在，只有`class`可以通过config来保留，所以按照了行注入只能按照`class`来识别和注入。所以统一实现为使用`Symbol`，`class`类的直接转换成`Symbol`
2. Bean的扫描限制：每个Module目前都是monorepo中的一个workspace，但是后续会被编译发布到npm中，这样首先可能会丢失源码的目录结构，其次，缺少了`type`和`interface`给扫描造成阻碍。所以Bean的扫描需要规范模块的中Bean的清单

所有跟Bean相关的信息，统一放到`beankeys.ts`中，pkg导出其中所有内容。
导出的内容有四项：

1. `Beans`：

一个模块中涉及到的Bean有两类：

1. Module直接提供，加载时直接注册到Ioc Container
