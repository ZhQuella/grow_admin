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
import {
  applyApiDefaultData,
  recomputeComputedProps,
  runApiOutlinedList,
  setupComputedPropReactivity,
  resolveDesignerHttpClient,
} from "../../GrowRenderer/utils/runApiOutlined";

const createEmptyDraggableConfig = () =>
  reactive({
    pageConfig: {},
    dataSource: [],
    computedProps: [],
    apiOutlined: [],
    structures: [],
    renderArgument: {},
    styles: {},
    events: {},
    props: {},
    propBindModes: {},
  });

const optionTypeMap = {
  module: { title: "组件库", componentName: "moduleOptions" },
  json: { title: "查看数据", componentName: "reviewData" },
  tree: { title: "结构树", componentName: "reviewTree" },
  dataBin: { title: "数据源", componentName: "dataSource" },
  computedProps: { title: "属性计算", componentName: "computedProps" },
  pageWatchers: { title: "数据监听", componentName: "pageWatchers" },
  pageEvents: { title: "页面事件", componentName: "pageEvents" },
  apiOutlined: { title: "数据请求", componentName: "apiOutlined" },
} as const;

type OptionConfig = {
  title: string;
  visible: boolean;
  componentName: string;
  type: string;
  isFixed: boolean;
};

const createOptionConfig = (): OptionConfig =>
  reactive({
    title: "组件库",
    visible: true,
    componentName: "moduleOptions",
    type: "module",
    isFixed: true,
  });

const clearOptionPanel = (optionConfig: OptionConfig) => {
  optionConfig.visible = false;
  optionConfig.title = "";
  optionConfig.componentName = "";
  optionConfig.type = "";
};

const setupDesignerRuntime = (draggableConfig: ReturnType<typeof createEmptyDraggableConfig>) => {
  const runtimeState = reactive<Record<string, unknown>>({});
  let apiRunToken = 0;

  const rebuildRuntimeState = async () => {
    const token = ++apiRunToken;
    syncRuntimeState(
      runtimeState,
      buildRuntimeState(draggableConfig.dataSource, draggableConfig.computedProps),
    );
    applyApiDefaultData(draggableConfig.apiOutlined, runtimeState);
    await runApiOutlinedList(draggableConfig.apiOutlined, runtimeState, {
      httpClient: resolveDesignerHttpClient(),
      autoLoadOnly: true,
    });
    if (token !== apiRunToken) return;
    recomputeComputedProps(draggableConfig.computedProps, runtimeState);
  };

  watch(
    () =>
      [
        draggableConfig.dataSource,
        draggableConfig.computedProps,
        draggableConfig.apiOutlined,
      ] as const,
    () => {
      void rebuildRuntimeState();
    },
    { deep: true, immediate: true },
  );

  setupComputedPropReactivity(runtimeState, () => draggableConfig.computedProps);
  return runtimeState;
};

const createLeftOptionActions = (optionConfig: OptionConfig) => {
  const onLeftClose = () => clearOptionPanel(optionConfig);
  const onLeftOptionClick = (type: string) => {
    if (optionConfig.type === type) {
      clearOptionPanel(optionConfig);
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
  const onChangeOptionFixed = () => {
    optionConfig.isFixed = !optionConfig.isFixed;
  };
  return { onLeftOptionClick, onLeftOptionClose, onChangeOptionFixed, onLeftClose };
};

export const useOption = () => {
  const draggableConfig = createEmptyDraggableConfig();
  const activeUUID = ref("");
  const overlayEditUUID = ref("");
  const runtimeState = setupDesignerRuntime(draggableConfig);
  const optionConfig = createOptionConfig();

  provide(DRAGGABLE_CONGIG, draggableConfig);
  provide(ACTIVE_UUID, activeUUID);
  provide(OVERLAY_EDIT_UUID, overlayEditUUID);
  provide(GROW_RUNTIME_STATE, runtimeState);

  return {
    activeUUID,
    overlayEditUUID,
    optionConfig,
    draggableConfig,
    ...createLeftOptionActions(optionConfig),
  };
};
