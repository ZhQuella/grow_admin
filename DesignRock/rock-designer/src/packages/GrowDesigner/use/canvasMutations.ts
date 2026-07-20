import { nanoid } from 'nanoid'
import type { Ref } from 'vue'
import { findSiblingArray } from '../static/dropDefaults'
import {
  getAllChilds,
  deleteByUUID,
  findParentByUUID,
  findByUUID,
  updateUUIDs,
  deepCloneDesigner,
} from '@grow-admin-rock/utils'

const CONFIG_KEYS = ['styles', 'props', 'events', 'renderArgument', 'propBindModes'] as const

/** 清理节点及其子孙在配置表中的数据 */
export const purgeNodeConfigs = (draggableConfig: any, uuids: string[]) => {
  for (let i = 0, item; (item = uuids[i++]); ) {
    Reflect.deleteProperty(draggableConfig.styles, item)
    Reflect.deleteProperty(draggableConfig.props, item)
    Reflect.deleteProperty(draggableConfig.events, item)
    Reflect.deleteProperty(draggableConfig.renderArgument, item)
    Reflect.deleteProperty(draggableConfig.propBindModes, item)
  }
}

export const createDeleteHandler = (
  draggableConfig: any,
  activeUUID: Ref<string>,
  overlayEditUUID?: Ref<string>,
) => {
  return (event: any) => {
    const uuids = getAllChilds([event]).map((el) => el.uuid)
    purgeNodeConfigs(draggableConfig, uuids)
    draggableConfig.structures = deleteByUUID(draggableConfig.structures, event.uuid)
    activeUUID.value = ''
    if (overlayEditUUID?.value && uuids.includes(overlayEditUUID.value)) {
      overlayEditUUID.value = ''
    }
  }
}

export const createCopyHandler = (draggableConfig: any) => {
  const copyObjectConfig = (oldUUID: string) => {
    const uuid = nanoid()
    for (const key of CONFIG_KEYS) {
      const source = draggableConfig[key]?.[oldUUID]
      draggableConfig[key][uuid] = deepCloneDesigner(source ?? {})
    }
    return uuid
  }

  return (event: any) => {
    const { uuid } = event
    const parent = findParentByUUID(draggableConfig.structures, uuid)
    const current = findByUUID(draggableConfig.structures, uuid)
    const structure = updateUUIDs(deepCloneDesigner(current), copyObjectConfig)
    const siblingArray = findSiblingArray(parent, uuid, draggableConfig.structures)
    const index = siblingArray.findIndex((elem) => elem.uuid === uuid)
    siblingArray.splice(index + 1, 0, structure)
  }
}

export const createClearCanvasHandler = (
  draggableConfig: any,
  activeUUID: Ref<string>,
  overlayEditUUID?: Ref<string>,
) => {
  return () => {
    if (!draggableConfig.structures.length) return
    draggableConfig.structures = []
    draggableConfig.renderArgument = {}
    draggableConfig.styles = {}
    draggableConfig.events = {}
    draggableConfig.props = {}
    draggableConfig.propBindModes = {}
    activeUUID.value = ''
    if (overlayEditUUID) overlayEditUUID.value = ''
  }
}
