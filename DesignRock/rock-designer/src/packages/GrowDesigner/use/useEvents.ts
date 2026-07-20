import type { Ref } from "vue";
import { FORM_MODULE_FULL_WIDTH_TAGS, specificComponent } from "../static/moduleMap";
import { nanoid } from "nanoid";
import {
  getAllChilds,
  deleteByUUID,
  findParentByUUID,
  findByUUID,
  updateUUIDs,
  deepCloneDesigner
} from '@grow-admin-rock/utils';

interface props {
  draggableConfig: any;
  activeUUID: Ref<string>;
  overlayEditUUID?: Ref<string>;
}

export const useEvents = ({ draggableConfig, activeUUID, overlayEditUUID }: props) => {
  const onActivated = (uuid: string) => {
    activeUUID.value = uuid;
  };

  const onGenerateKey = (list, index) => {
    console.log(list, index);
  };

  const onActiveNode = ({ uuid }) => {
    activeUUID.value = uuid;
  };

  const setChildren = (isChild: boolean, structure: any, children: any[]): any => {
    if (isChild) {
      structure.children = children && children.length ? children : [];
    }
    return structure;
  };

  const ensureCardSlots = (structure: any, elTagName?: string) => {
    if (elTagName === 'GrowCard') {
      if (!Array.isArray(structure.footerSlot)) structure.footerSlot = [];
      if (!Array.isArray(structure.optionSlot)) structure.optionSlot = [];
    }
    if (elTagName === 'GrowModal' || elTagName === 'GrowDrawer') {
      if (!Array.isArray(structure.children)) structure.children = [];
      if (!Array.isArray(structure.footerSlot)) structure.footerSlot = [];
    }
    if (elTagName === 'GrowPopover') {
      // children → #reference；contentSlot → default 弹出内容
      if (!Array.isArray(structure.children)) structure.children = [];
      if (!Array.isArray(structure.contentSlot)) structure.contentSlot = [];
    }
    if (elTagName === 'GrowLayout') {
      if (!Array.isArray(structure.children)) structure.children = [];
      if (!Array.isArray(structure.headerSlot)) structure.headerSlot = [];
      if (!Array.isArray(structure.asideSlot)) structure.asideSlot = [];
      if (!Array.isArray(structure.footerSlot)) structure.footerSlot = [];
    }
    return structure;
  };

  const getIsChild = (obj1: any = {}, obj2: any = {}): boolean => {
    return Boolean(obj1.isChild || obj2.isChild);
  };

  const onDraggableViewAdd = ({ event, list }) => {
    const newIndex = event.newIndex
    const config = list[newIndex]
    if (!config) return

    const uuid = config.uuid || nanoid()
    const { children, uuid: _u, ...otherConfig } = { ...config, uuid }
    const renderArgument = { ...otherConfig }
    const isChild: boolean = getIsChild(renderArgument, draggableConfig.renderArgument[uuid])
    const structure = ensureCardSlots(
      setChildren(isChild, { uuid }, children),
      renderArgument.elTagName,
    )
    list[newIndex] = structure
    draggableConfig.renderArgument[uuid] = {
      ...renderArgument,
      ...(draggableConfig.renderArgument[uuid] || {}),
    }
    const styleSeed: Record<string, string> = {}
    const isInline =
      renderArgument.isInlineBlock || draggableConfig.renderArgument[uuid]?.isInlineBlock
    if (isInline) {
      Object.assign(styleSeed, {
        display: 'inline-block',
        'min-width': '80px',
        'min-height': '36px',
      })
    }
    if (renderArgument.elTagName === 'img') {
      Object.assign(styleSeed, {
        width: '120px',
        height: '80px',
        'object-fit': 'cover',
      })
    }
    if (renderArgument.elTagName === 'BasicTitle') {
      Object.assign(styleSeed, {
        width: '100%',
        'min-height': '48px',
      })
    }
    if (renderArgument.elTagName === 'p') {
      Object.assign(styleSeed, {
        width: '100%',
        'min-height': '40px',
      })
    }
    if (renderArgument.elTagName === 'span') {
      Object.assign(styleSeed, {
        'min-height': '36px',
        'min-width': '96px',
      })
    }
    if (renderArgument.elTagName === 'GrowEllipsis') {
      Object.assign(styleSeed, {
        width: '240px',
        'max-width': '100%',
      })
    }
    if (FORM_MODULE_FULL_WIDTH_TAGS.has(renderArgument.elTagName)) {
      Object.assign(styleSeed, {
        width: '100%',
      })
    }
    if (renderArgument.elTagName === 'GrowScrollbar') {
      Object.assign(styleSeed, {
        width: '100%',
      })
    }
    if (
      renderArgument.elTagName === 'GrowLayout'
    ) {
      Object.assign(styleSeed, {
        width: '100%',
        height: '100%',
      })
    }
    if (renderArgument.elTagName === 'GrowModal' || renderArgument.elTagName === 'GrowDrawer') {
      Object.assign(styleSeed, {
        width: '100%',
      })
    }
    draggableConfig.styles[uuid] = {
      ...styleSeed,
      ...(draggableConfig.styles[uuid] || {}),
    }
    draggableConfig.events[uuid] = draggableConfig.events[uuid] || {}
    const defaultProps: Record<string, any> = {}
    if (renderArgument.elTagName === 'BasicTitle') {
      Object.assign(defaultProps, { level: 'h3', context: '标题文本' })
    }
    if (renderArgument.elTagName === 'p') {
      Object.assign(defaultProps, { context: '正文内容' })
    }
    if (renderArgument.elTagName === 'span') {
      Object.assign(defaultProps, { context: '短语文本' })
    }
    if (renderArgument.elTagName === 'GrowButton') {
      Object.assign(defaultProps, { content: '按钮', type: 'primary' })
    }
    if (renderArgument.elTagName === 'GrowLink') {
      Object.assign(defaultProps, {
        content: '链接文字',
        type: 'primary',
        href: '#',
        underline: true,
      })
    }
    if (renderArgument.elTagName === 'GrowSearchBar') {
      Object.assign(defaultProps, {
        search: [
          {
            labelText: '关键词',
            placeholder: '请输入关键词',
            elType: 'GrowInput',
            isDefault: true,
            model: 'keyword',
            noDelete: true,
          },
          {
            labelText: '状态',
            elType: 'GrowSelect',
            isDefault: true,
            model: 'status',
            label: 'label',
            value: 'value',
            placeholder: '请选择状态',
            options: [
              { label: '启用', value: '1' },
              { label: '禁用', value: '0' },
            ],
          },
        ],
        defaultData: {},
      })
    }
    if (renderArgument.elTagName === 'img') {
      Object.assign(defaultProps, {
        src: 'https://via.placeholder.com/120x80',
        alt: '图片',
      })
    }
    if (renderArgument.elTagName === 'GrowCarousel') {
      Object.assign(defaultProps, {
        height: '200px',
        autoplay: true,
        interval: 3000,
        arrow: 'hover',
        loop: true,
        direction: 'horizontal',
        'pause-on-hover': true,
      })
    }
    if (renderArgument.elTagName === 'GrowScrollbar') {
      Object.assign(defaultProps, {
        height: '200px',
      })
    }
    if (renderArgument.elTagName === 'GrowLayout') {
      Object.assign(defaultProps, {
        layout: 'header-main',
        headerHeight: '40px',
        asideWidth: '200px',
        footerHeight: '60px',
      })
    }
    if (renderArgument.elTagName === 'GrowTooltip') {
      Object.assign(defaultProps, {
        content: '文字提示',
        placement: 'top',
        trigger: 'hover',
        effect: 'dark',
      })
    }
    if (renderArgument.elTagName === 'GrowPopover') {
      Object.assign(defaultProps, {
        title: '标题',
        content: '弹出框内容',
        placement: 'bottom',
        trigger: 'click',
        width: 200,
      })
    }
    if (renderArgument.elTagName === 'GrowModal') {
      Object.assign(defaultProps, {
        title: '弹窗标题',
        modelValue: false,
        showFooter: false,
        width: '480px',
        'show-close': true,
        'close-on-click-modal': true,
        'close-on-press-escape': true,
      })
    }
    if (renderArgument.elTagName === 'GrowDrawer') {
      Object.assign(defaultProps, {
        title: '抽屉标题',
        modelValue: false,
        showFooter: false,
        direction: 'rtl',
        size: '30%',
        'show-close': true,
        'close-on-click-modal': true,
        'close-on-press-escape': true,
      })
    }
    if (renderArgument.elTagName === 'GrowSlider') {
      Object.assign(defaultProps, {
        modelValue: 0,
        min: 0,
        max: 100,
        step: 1,
        'show-tooltip': true,
      })
    }
    if (renderArgument.elTagName === 'GrowTransfer') {
      Object.assign(defaultProps, {
        modelValue: [],
        data: [
          { key: 1, label: '选项 1' },
          { key: 2, label: '选项 2' },
          { key: 3, label: '选项 3' },
          { key: 4, label: '选项 4' },
        ],
        filterable: false,
        titles: ['列表 1', '列表 2'],
        'button-texts': [],
        'target-order': 'original',
      })
    }
    if (renderArgument.elTagName === 'GrowTreeSelect') {
      Object.assign(defaultProps, {
        value: null,
        placeholder: '请选择',
        clearable: true,
        filterable: true,
        size: 'medium',
        options: [
          {
            label: '选项组 1',
            key: '1',
            children: [
              { label: '选项 1-1', key: '1-1' },
              { label: '选项 1-2', key: '1-2' },
            ],
          },
          {
            label: '选项组 2',
            key: '2',
            children: [{ label: '选项 2-1', key: '2-1' }],
          },
        ],
      })
    }
    if (renderArgument.elTagName === 'GrowMention') {
      Object.assign(defaultProps, {
        value: '',
        placeholder: '输入 @ 提及某人',
        prefix: '@',
        separator: ' ',
        type: 'text',
        bordered: true,
        size: 'medium',
        options: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' },
          { label: '王五', value: 'wangwu' },
        ],
      })
    }
    if (renderArgument.elTagName === 'GrowTime') {
      Object.assign(defaultProps, {
        time: Date.now(),
        type: 'datetime',
        unix: false,
        text: false,
        format: 'yyyy-MM-dd HH:mm:ss',
      })
    }
    if (renderArgument.elTagName === 'GrowEllipsis') {
      Object.assign(defaultProps, {
        content:
          '这是一段很长的文本内容，超出容器宽度或设定行数后会被省略显示，悬浮可查看完整内容。',
        'line-clamp': 1,
        tooltip: true,
      })
    }
    if (renderArgument.elTagName === 'GrowIconify') {
      Object.assign(defaultProps, {
        icon: 'carbon:application',
        size: 24,
        color: '',
        prefix: '',
        infinite: false,
        hoverPointer: false,
        hoverColor: 'inherit',
      })
    }
    if (renderArgument.elTagName === 'GrowTimePicker') {
      Object.assign(defaultProps, {
        value: null,
        placeholder: '请选择时间',
        format: 'HH:mm:ss',
        clearable: true,
        size: 'medium',
      })
    }
    if (renderArgument.elTagName === 'GrowCard') {
      Object.assign(defaultProps, {
        showFooter: false,
        showHeaderExtra: false,
      })
    }
    if (FORM_MODULE_FULL_WIDTH_TAGS.has(renderArgument.elTagName)) {
      Object.assign(defaultProps, {
        class: 'w-full',
      })
    }
    draggableConfig.props[uuid] = {
      ...defaultProps,
      ...(draggableConfig.props[uuid] || {}),
    }

    // 选项卡：拖入后默认创建一个子选项，并设为激活项
    if (renderArgument.elTagName === 'GrowTabs') {
      const paneName = addSpecificChild(structure, renderArgument, {
        titlePrefix: '选项',
        titleKey: 'label',
      })
      draggableConfig.props[uuid].modelValue = paneName
    }
    // 折叠面板：拖入后默认创建一个子面板，并设为展开项
    if (renderArgument.elTagName === 'GrowCollapse') {
      const paneName = addSpecificChild(structure, renderArgument, {
        titlePrefix: '面板',
        titleKey: 'title',
      })
      draggableConfig.props[uuid].modelValue = paneName
    }
    // 弹性盒子：拖入后默认创建一个 Col
    if (renderArgument.elTagName === 'GrowRow') {
      addColChild(structure, renderArgument, { span: 12 })
    }
  }

  /** 为 Tabs / Collapse 等容器添加特定子项，返回子项 name */
  const addSpecificChild = (
    parentStructure: any,
    parentRenderArgument: any,
    options?: {
      titlePrefix?: string
      titleKey?: string
      nameKey?: string
      title?: string
      name?: string
    },
  ) => {
    const childName = parentRenderArgument.childName
    const childMeta: any = specificComponent.get(childName) || {}
    const childUuid = nanoid()
    const paneName = options?.name ?? nanoid()
    const titleKey = options?.titleKey || 'label'
    const nameKey = options?.nameKey || 'name'
    const titlePrefix = options?.titlePrefix || '选项'

    if (!Array.isArray(parentStructure.children)) {
      parentStructure.children = []
    }
    const index = parentStructure.children.length + 1
    const child: Record<string, any> = { uuid: childUuid }
    if (childMeta.isChild) {
      child.children = []
    }

    const titleText = options?.title ?? `${titlePrefix} ${index}`
    draggableConfig.renderArgument[childUuid] = {
      ...childMeta,
      elName: titleText,
    }
    draggableConfig.styles[childUuid] = {}
    draggableConfig.events[childUuid] = {}
    draggableConfig.props[childUuid] = {
      [titleKey]: titleText,
      [nameKey]: paneName,
    }
    parentStructure.children.push(child)
    return paneName
  }

  /** 为 Row 添加 Col 子项 */
  const addColChild = (
    parentStructure: any,
    parentRenderArgument: any,
    options?: {
      span?: number
      offset?: number
      push?: number
      pull?: number
      elName?: string
    },
  ) => {
    const childName = parentRenderArgument.childName || 'GrowCol'
    const childMeta: any = specificComponent.get(childName) || {}
    const childUuid = nanoid()
    if (!Array.isArray(parentStructure.children)) {
      parentStructure.children = []
    }
    const index = parentStructure.children.length + 1
    const child: Record<string, any> = { uuid: childUuid }
    if (childMeta.isChild) {
      child.children = []
    }
    draggableConfig.renderArgument[childUuid] = {
      ...childMeta,
      elName: options?.elName || `列 ${index}`,
    }
    draggableConfig.styles[childUuid] = {}
    draggableConfig.events[childUuid] = {}
    draggableConfig.props[childUuid] = {
      span: options?.span ?? 12,
      offset: options?.offset ?? 0,
      push: options?.push ?? 0,
      pull: options?.pull ?? 0,
    }
    parentStructure.children.push(child)
    return childUuid
  }

  const onSpecialAdd = ({ structure, renderArgument }) => {
    const childName = renderArgument?.childName
    if (childName === 'GrowTabPane') {
      addSpecificChild(structure, renderArgument, {
        titlePrefix: '选项',
        titleKey: 'label',
      })
      return
    }
    if (childName === 'GrowCollapseItem') {
      addSpecificChild(structure, renderArgument, {
        titlePrefix: '面板',
        titleKey: 'title',
      })
      return
    }
    if (childName === 'GrowCol') {
      addColChild(structure, renderArgument, { span: 12 })
      return
    }

    const uuid = nanoid()
    const childRenderArgument = specificComponent.get(childName)
    const isChild = childRenderArgument?.isChild
    const child: Record<string, any> = { uuid }
    if (isChild) Reflect.set(child, 'children', [])
    draggableConfig.renderArgument[uuid] = { ...(childRenderArgument || {}) }
    draggableConfig.styles[uuid] = draggableConfig.styles[uuid] || {}
    draggableConfig.events[uuid] = draggableConfig.events[uuid] || {}
    draggableConfig.props[uuid] = draggableConfig.props[uuid] || {}
    if (!Array.isArray(structure.children)) structure.children = []
    structure.children.push(child)
  }

  const onDeleteItem = (event) => {
    const result = getAllChilds([event]);
    const uuids: string[] = result.map((el) => el.uuid);
    for (let i = 0, item; (item = uuids[i++]); ) {
      Reflect.deleteProperty(draggableConfig.styles, item);
      Reflect.deleteProperty(draggableConfig.props, item);
      Reflect.deleteProperty(draggableConfig.events, item);
      Reflect.deleteProperty(draggableConfig.renderArgument, item);
    }
    draggableConfig.structures = deleteByUUID(draggableConfig.structures, event.uuid);
    activeUUID.value = "";
    if (overlayEditUUID?.value && uuids.includes(overlayEditUUID.value)) {
      overlayEditUUID.value = "";
    }
  };

  const copyObjectConfig = (oldUUID) => {
    const uuid = nanoid();
    let optionsMap = ["styles", "props", "events", "renderArgument"];
    for (let i = 0, key; (key = optionsMap[i++]); ) {
      let obj = draggableConfig[key][oldUUID];
      draggableConfig[key][uuid] = deepCloneDesigner(obj);
    }
    return uuid;
  };

  const onCopyItem = (event) => {
    const { uuid } = event;
    const parent = findParentByUUID(draggableConfig.structures, uuid);
    const current = findByUUID(draggableConfig.structures, uuid);
    const structure = updateUUIDs(deepCloneDesigner(current), copyObjectConfig);
    let siblingArray = draggableConfig.structures;
    if (parent) {
      if (parent.children?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.children;
      } else if (parent.footerSlot?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.footerSlot;
      } else if (parent.optionSlot?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.optionSlot;
      } else if (parent.contentSlot?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.contentSlot;
      } else if (parent.headerSlot?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.headerSlot;
      } else if (parent.asideSlot?.some((el: any) => el.uuid === uuid)) {
        siblingArray = parent.asideSlot;
      } else {
        siblingArray = parent.children || [];
      }
    }
    const index = siblingArray.findIndex((elem) => elem.uuid === uuid);
    siblingArray.splice(index + 1, 0, structure);
  };

  const onClearCanvas = () => {
    if (!draggableConfig.structures.length) return
    draggableConfig.structures = []
    draggableConfig.renderArgument = {}
    draggableConfig.styles = {}
    draggableConfig.events = {}
    draggableConfig.props = {}
    activeUUID.value = ''
    if (overlayEditUUID) overlayEditUUID.value = ''
  }

  return {
    onSpecialAdd,
    onDraggableViewAdd,
    onGenerateKey,
    onActivated,
    onDeleteItem,
    onCopyItem,
    onActiveNode,
    onClearCanvas,
  };
};
