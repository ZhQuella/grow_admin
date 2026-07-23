import { reactive, provide, ref, watch } from "vue";
import {
  ACTIVE_UUID,
  DRAGGABLE_CONGIG,
  GROW_RUNTIME_STATE,
  OVERLAY_EDIT_UUID,
} from "../config/designation";
import {
  buildRuntimeState,
  syncRuntimeState,
} from "../../GrowRenderer/utils/resolveBoundProps";

export const useOption = () => {
  const draggableConfig = reactive({
    //  页面配置
    pageConfig: {},
    //  数据源
    dataSource: [],
    //  计算属性（基于 state 派生）
    computedProps: [],
    //  数据请求
    apiOutlined: [],
    //  结构
    structures: [],
    //  附属信息  model/类型/props
    renderArgument: {},
    //  纯样式相关
    styles: {},
    //  事件相关
    events: {},
    //  组件参数相关
    props: {},
    //  属性输入模式（text | bind），按 uuid -> modelKey 记录
    propBindModes: {},
  });

  const activeUUID = ref("");
  const overlayEditUUID = ref("");

  /** 可写 runtime state：绑定展示 + 控件变更回写；数据源/计算属性变更时同步 */
  const runtimeState = reactive<Record<string, unknown>>({});
  watch(
    () => [draggableConfig.dataSource, draggableConfig.computedProps] as const,
    () => {
      syncRuntimeState(
        runtimeState,
        buildRuntimeState(draggableConfig.dataSource, draggableConfig.computedProps),
      );
    },
    { deep: true, immediate: true },
  );

  provide(DRAGGABLE_CONGIG, draggableConfig);
  provide(ACTIVE_UUID, activeUUID);
  provide(OVERLAY_EDIT_UUID, overlayEditUUID);
  provide(GROW_RUNTIME_STATE, runtimeState);

  const optionConfig = reactive({
    title: "组件库",
    visible: true,
    componentName: "moduleOptions",
    type: "module",
    isFixed: true
  });

  const optionTypeMap = {
    module: {
      title: "组件库",
      componentName: "moduleOptions"
    },
    json: {
      title: "查看数据",
      componentName: "reviewData"
    },
    tree: {
      title: "结构树",
      componentName: "reviewTree"
    },
    dataBin: {
      title: "数据源",
      componentName: "dataSource"
    },
    computedProps: {
      title: "属性计算",
      componentName: "computedProps"
    },
    pageWatchers: {
      title: "数据监听",
      componentName: "pageWatchers"
    },
    apiOutlined: {
      title: "数据请求",
      componentName: "apiOutlined"
    }
  };

  const onLeftOptionClick = (type: string) => {
    if (optionConfig.type === type) {
      optionConfig.visible = false;
      optionConfig.title = "";
      optionConfig.componentName = "";
      optionConfig.type = "";
      return;
    }
    const next = optionTypeMap[type as keyof typeof optionTypeMap];
    if (!next) return;
    optionConfig.visible = true;
    optionConfig.title = next.title;
    optionConfig.componentName = next.componentName;
    optionConfig.type = type;
  };

  const onLeftOptionClose = () => {
    !optionConfig.isFixed && onLeftClose();
  };

  const onLeftClose = () => {
    optionConfig.visible = false;
    optionConfig.title = "";
    optionConfig.componentName = "";
    optionConfig.type = "";
  };

  const onChangeOptionFixed = () => {
    optionConfig.isFixed = !optionConfig.isFixed;
  };

  return {
    activeUUID,
    overlayEditUUID,
    optionConfig,
    draggableConfig,
    onLeftOptionClick,
    onLeftOptionClose,
    onChangeOptionFixed,
    onLeftClose
  };
};
