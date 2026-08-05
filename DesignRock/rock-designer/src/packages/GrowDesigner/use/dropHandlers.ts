import { nanoid } from 'nanoid'
import {
  ensureStructureSlots,
  resolveDefaultProps,
  resolveDefaultStyles,
} from '../static/dropDefaults'
import { applyDropInitByTag, applySpecialAdd } from './dropChildren'

const getIsChild = (obj1: any = {}, obj2: any = {}) =>
  Boolean(obj1.isChild || obj2.isChild)

const setChildren = (isChild: boolean, structure: any, children: any[]) => {
  if (isChild) {
    structure.children = children?.length ? children : []
  }
  return structure
}

/** 从拖入项构建结构节点并写入 list */
export const buildDroppedStructure = (
  config: any,
  list: any[],
  newIndex: number,
  existingRenderArgument: any,
) => {
  const uuid = config.uuid || nanoid()
  const { children, uuid: _u, ...otherConfig } = { ...config, uuid }
  const renderArgument = { ...otherConfig }
  const isChild = getIsChild(renderArgument, existingRenderArgument)
  const structure = ensureStructureSlots(
    setChildren(isChild, { uuid }, children),
    renderArgument.elTagName,
  )
  list[newIndex] = structure
  return { uuid, structure, renderArgument }
}

/** 写入拖入节点的 renderArgument / styles / events / props */
export const bindDroppedNodeConfig = (
  draggableConfig: any,
  uuid: string,
  renderArgument: any,
) => {
  draggableConfig.renderArgument[uuid] = {
    ...renderArgument,
    ...(draggableConfig.renderArgument[uuid] || {}),
  }
  const isInline =
    renderArgument.isInlineBlock || draggableConfig.renderArgument[uuid]?.isInlineBlock
  draggableConfig.styles[uuid] = {
    ...resolveDefaultStyles(renderArgument.elTagName, isInline),
    ...(draggableConfig.styles[uuid] || {}),
  }
  draggableConfig.events[uuid] = draggableConfig.events[uuid] || {}
  draggableConfig.props[uuid] = {
    ...resolveDefaultProps(renderArgument.elTagName),
    ...(draggableConfig.props[uuid] || {}),
  }
  if (!draggableConfig.propBindModes) draggableConfig.propBindModes = {}
  const defaultBindModes: Record<string, string> = {}
  const tag = renderArgument.elTagName as string | undefined

  // model：仅变量绑定
  const MODEL_BIND_ONLY_TAGS = new Set([
    'GrowInput',
    'GrowInputNumber',
    'GrowSelect',
    'GrowCascader',
    'GrowSwitch',
    'GrowColorPicker',
    'GrowSlider',
    'GrowTransfer',
    'GrowDatePicker',
    'GrowDatePickerPanel',
    'GrowTimePicker',
    'GrowRadioGroup',
    'GrowCheckboxGroup',
    'GrowTreeSelect',
    'GrowAutoComplete',
    'GrowMention',
    'GrowInputTag',
    'GrowDynamicTags',
    'GrowUpload',
    'GrowTabs',
    'GrowCollapse',
  ])
  // 选项数据 options：仅变量绑定
  const OPTIONS_BIND_ONLY_TAGS = new Set([
    'GrowSelect',
    'GrowCascader',
    'GrowRadioGroup',
    'GrowCheckboxGroup',
    'GrowAutoComplete',
    'GrowMention',
  ])
  // 数据源 data：仅变量绑定
  const DATA_BIND_ONLY_TAGS = new Set([
    'GrowTransfer',
    'GrowTreeSelect',
    'GrowTable',
    'GrowLoop',
  ])

  if (tag && MODEL_BIND_ONLY_TAGS.has(tag)) {
    defaultBindModes.model = 'bind'
  }
  if (tag && OPTIONS_BIND_ONLY_TAGS.has(tag)) {
    defaultBindModes.options = 'bind'
  }
  if (tag && DATA_BIND_ONLY_TAGS.has(tag)) {
    defaultBindModes.data = 'bind'
  }
  // 判断条件：仅变量绑定
  if (tag === 'GrowCondition') {
    defaultBindModes.when = 'bind'
  }
  if (tag === 'GrowColorPicker') {
    defaultBindModes.predefine = 'bind'
    defaultBindModes['empty-values'] = 'bind'
  }
  if (tag === 'GrowDatePickerPanel') {
    defaultBindModes.shortcuts = 'bind'
    defaultBindModes['default-value'] = 'bind'
    defaultBindModes['default-time'] = 'bind'
  }

  draggableConfig.propBindModes[uuid] = {
    ...defaultBindModes,
    ...(draggableConfig.propBindModes[uuid] || {}),
  }
}

export const createDraggableViewAddHandler = (draggableConfig: any) => {
  return ({ event, list }) => {
    const config = list[event.newIndex]
    if (!config) return

    const { uuid, structure, renderArgument } = buildDroppedStructure(
      config,
      list,
      event.newIndex,
      draggableConfig.renderArgument[config.uuid],
    )
    bindDroppedNodeConfig(draggableConfig, uuid, renderArgument)
    applyDropInitByTag(
      draggableConfig,
      renderArgument.elTagName,
      structure,
      renderArgument,
      uuid,
    )
  }
}

export const createSpecialAddHandler = (draggableConfig: any) => {
  return ({ structure, renderArgument }) => {
    applySpecialAdd(draggableConfig, structure, renderArgument)
  }
}
