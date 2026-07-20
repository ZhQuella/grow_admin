import { nanoid } from 'nanoid'
import { specificComponent } from '../static/moduleMap'
import {
  dropInitActionsByTag,
  specialAddByChildName,
  type DropInitAction,
} from '../static/dropDefaults'

type DraggableConfig = Record<string, any>

type SpecificChildOptions = {
  titlePrefix?: string
  titleKey?: string
  nameKey?: string
  title?: string
  name?: string
}

type ColChildOptions = {
  span?: number
  offset?: number
  push?: number
  pull?: number
  elName?: string
}

const ensureChildrenArray = (structure: any) => {
  if (!Array.isArray(structure.children)) structure.children = []
  return structure.children as any[]
}

/** 初始化子节点在 draggableConfig 中的配置 */
const bindChildConfig = (
  draggableConfig: DraggableConfig,
  childUuid: string,
  renderArgument: Record<string, any>,
  props: Record<string, any> = {},
) => {
  draggableConfig.renderArgument[childUuid] = renderArgument
  draggableConfig.styles[childUuid] = {}
  draggableConfig.events[childUuid] = {}
  draggableConfig.props[childUuid] = props
  if (!draggableConfig.propBindModes) draggableConfig.propBindModes = {}
  draggableConfig.propBindModes[childUuid] = {}
}

/** 创建结构节点，按需挂 children */
const createStructureNode = (uuid: string, isChild?: boolean) => {
  const node: Record<string, any> = { uuid }
  if (isChild) node.children = []
  return node
}

/** 为 Tabs / Collapse 等容器添加特定子项，返回子项 name */
export const addSpecificChild = (
  draggableConfig: DraggableConfig,
  parentStructure: any,
  parentRenderArgument: any,
  options?: SpecificChildOptions,
) => {
  const childMeta: any = specificComponent.get(parentRenderArgument.childName) || {}
  const childUuid = nanoid()
  const paneName = options?.name ?? nanoid()
  const titleKey = options?.titleKey || 'label'
  const nameKey = options?.nameKey || 'name'
  const titlePrefix = options?.titlePrefix || '选项'
  const children = ensureChildrenArray(parentStructure)
  const titleText = options?.title ?? `${titlePrefix} ${children.length + 1}`

  children.push(createStructureNode(childUuid, childMeta.isChild))
  bindChildConfig(
    draggableConfig,
    childUuid,
    { ...childMeta, elName: titleText },
    { [titleKey]: titleText, [nameKey]: paneName },
  )
  return paneName
}

/** 为 Row 添加 Col 子项 */
export const addColChild = (
  draggableConfig: DraggableConfig,
  parentStructure: any,
  parentRenderArgument: any,
  options?: ColChildOptions,
) => {
  const childName = parentRenderArgument.childName || 'GrowCol'
  const childMeta: any = specificComponent.get(childName) || {}
  const childUuid = nanoid()
  const children = ensureChildrenArray(parentStructure)
  const index = children.length + 1

  children.push(createStructureNode(childUuid, childMeta.isChild))
  bindChildConfig(
    draggableConfig,
    childUuid,
    { ...childMeta, elName: options?.elName || `列 ${index}` },
    {
      span: options?.span ?? 12,
      offset: options?.offset ?? 0,
      push: options?.push ?? 0,
      pull: options?.pull ?? 0,
    },
  )
  return childUuid
}

/** 按配置执行拖入/添加子项动作 */
export const runDropInitAction = (
  draggableConfig: DraggableConfig,
  action: DropInitAction,
  structure: any,
  renderArgument: any,
  parentUuid?: string,
) => {
  if (action.type === 'specificChild') {
    const paneName = addSpecificChild(draggableConfig, structure, renderArgument, {
      titlePrefix: action.titlePrefix,
      titleKey: action.titleKey,
    })
    if (action.setModelValue && parentUuid) {
      draggableConfig.props[parentUuid].modelValue = paneName
    }
    return
  }
  addColChild(draggableConfig, structure, renderArgument, { span: action.span ?? 12 })
}

/** 追加通用子项（无特殊 childName 映射时） */
export const appendGenericChild = (
  draggableConfig: DraggableConfig,
  structure: any,
  childName?: string,
) => {
  const uuid = nanoid()
  const childRenderArgument = specificComponent.get(childName)
  const child = createStructureNode(uuid, childRenderArgument?.isChild)
  bindChildConfig(draggableConfig, uuid, { ...(childRenderArgument || {}) })
  ensureChildrenArray(structure).push(child)
  return uuid
}

/** 拖入后按标签执行初始化子项 */
export const applyDropInitByTag = (
  draggableConfig: DraggableConfig,
  elTagName: string,
  structure: any,
  renderArgument: any,
  parentUuid: string,
) => {
  const action = dropInitActionsByTag[elTagName]
  if (action) runDropInitAction(draggableConfig, action, structure, renderArgument, parentUuid)
}

/** 「添加子项」：优先走特殊映射，否则追加通用子项 */
export const applySpecialAdd = (
  draggableConfig: DraggableConfig,
  structure: any,
  renderArgument: any,
) => {
  const childName = renderArgument?.childName
  const specialAction = childName ? specialAddByChildName[childName] : undefined
  if (specialAction) {
    runDropInitAction(draggableConfig, specialAction, structure, renderArgument)
    return
  }
  appendGenericChild(draggableConfig, structure, childName)
}
