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
  // 循环数据源、判断条件：与变量绑定输入框一致，默认走 bind
  if (renderArgument.elTagName === 'GrowLoop') {
    defaultBindModes.data = 'bind'
  }
  if (renderArgument.elTagName === 'GrowCondition') {
    defaultBindModes.when = 'bind'
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
