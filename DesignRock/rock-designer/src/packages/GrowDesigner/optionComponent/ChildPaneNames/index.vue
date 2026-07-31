<template>
  <div class="child-pane-names">
    <div
      v-for="(item, index) in paneList"
      :key="item.uuid"
      class="child-pane-names__row"
    >
      <GrowInput
        class="child-pane-names__title"
        size="small"
        :model-value="item.title"
        :placeholder="`${titlePrefix}标题`"
        @update:model-value="(val) => onTitleChange(item.uuid, val)"
      />
      <GrowInput
        class="child-pane-names__name"
        size="small"
        :model-value="item.name"
        placeholder="标识 name"
        @update:model-value="(val) => onNameChange(item.uuid, val)"
      />
      <button
        type="button"
        class="child-pane-names__btn child-pane-names__btn--danger"
        title="删除"
        @click="onRemove(index)"
      >
        <GrowIconify icon="carbon:trash-can" :size="14" />
      </button>
    </div>

    <button
      type="button"
      class="child-pane-names__add"
      @click="onAdd"
    >
      <GrowIconify icon="carbon:add" :size="14" />
      <span>添加{{ titlePrefix }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { findByUUID, getAllChilds } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import { specificComponent } from '../../static/moduleMap'

defineOptions({ name: 'ChildPaneNames' })

const props = withDefaults(
  defineProps<{
    /** 标题字段：Tabs=label，Collapse=title */
    titleKey?: string
    /** 标识字段，默认 name */
    nameKey?: string
    /** 父级激活值字段，默认 modelValue */
    activeKey?: string
    /** 子组件类型，如 GrowTabPane / GrowCollapseItem */
    childName: string
    /** 默认标题前缀，如「选项」「面板」 */
    titlePrefix?: string
  }>(),
  {
    titleKey: 'label',
    nameKey: 'name',
    activeKey: 'modelValue',
    titlePrefix: '选项',
  },
)

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

const parentStructure = computed(() =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value),
)

const paneList = computed(() => {
  const children = parentStructure.value?.children || []
  return children.map((child: any, index: number) => {
    const childProps = draggableConfig.props[child.uuid] || {}
    return {
      uuid: child.uuid,
      title: childProps[props.titleKey] ?? `${props.titlePrefix} ${index + 1}`,
      name: childProps[props.nameKey] ?? '',
    }
  })
})

const ensureChildProps = (uuid: string) => {
  if (!draggableConfig.props[uuid]) {
    draggableConfig.props[uuid] = {}
  }
  return draggableConfig.props[uuid]
}

const ensureParentProps = () => {
  const parentId = activeUUID?.value
  if (!parentId) return null
  if (!draggableConfig.props[parentId]) {
    draggableConfig.props[parentId] = {}
  }
  return draggableConfig.props[parentId]
}

const syncActiveName = (oldName: string, newName: string) => {
  const parentProps = ensureParentProps()
  if (!parentProps) return
  const current = parentProps[props.activeKey]
  if (Array.isArray(current)) {
    parentProps[props.activeKey] = current.map((item) => (item === oldName ? newName : item))
  } else if (current === oldName) {
    parentProps[props.activeKey] = newName
  }
}

const resolveFallbackActive = (structure: any) => {
  const first = structure.children?.[0]
  return first ? draggableConfig.props[first.uuid]?.[props.nameKey] ?? '' : ''
}

const onTitleChange = (uuid: string, value: string) => {
  const childProps = ensureChildProps(uuid)
  childProps[props.titleKey] = value
  if (!draggableConfig.renderArgument[uuid]) {
    draggableConfig.renderArgument[uuid] = {}
  }
  draggableConfig.renderArgument[uuid].elName = value
}

const onNameChange = (uuid: string, value: string) => {
  const childProps = ensureChildProps(uuid)
  const oldName = childProps[props.nameKey]
  childProps[props.nameKey] = value
  if (oldName != null && oldName !== '' && oldName !== value) {
    syncActiveName(String(oldName), value)
  }
}

const cleanupNode = (node: any) => {
  const result = getAllChilds([node])
  for (const el of result) {
    Reflect.deleteProperty(draggableConfig.styles, el.uuid)
    Reflect.deleteProperty(draggableConfig.props, el.uuid)
    Reflect.deleteProperty(draggableConfig.events, el.uuid)
    Reflect.deleteProperty(draggableConfig.renderArgument, el.uuid)
    Reflect.deleteProperty(draggableConfig.propBindModes, el.uuid)
  }
}

const onRemove = (index: number) => {
  const structure = parentStructure.value
  if (!structure?.children?.length) return
  const [removed] = structure.children.splice(index, 1)
  if (!removed) return

  const removedName = draggableConfig.props[removed.uuid]?.[props.nameKey]
  cleanupNode(removed)

  const parentProps = ensureParentProps()
  if (!parentProps) return
  const current = parentProps[props.activeKey]
  if (Array.isArray(current)) {
    const next = current.filter((item) => item !== removedName)
    if (next.length) {
      parentProps[props.activeKey] = next
    } else {
      const fallback = resolveFallbackActive(structure)
      parentProps[props.activeKey] = fallback ? [fallback] : []
    }
  } else if (current === removedName) {
    parentProps[props.activeKey] = resolveFallbackActive(structure)
  }
}

const onAdd = () => {
  const structure = parentStructure.value
  if (!structure) return
  if (!Array.isArray(structure.children)) {
    structure.children = []
  }

  const childMeta = specificComponent.get(props.childName) || {}
  const childUuid = nanoid()
  const paneName = nanoid()
  const index = structure.children.length + 1
  const child: Record<string, any> = { uuid: childUuid }
  if (childMeta.isChild) {
    child.children = []
  }

  const titleText = `${props.titlePrefix} ${index}`
  draggableConfig.renderArgument[childUuid] = {
    ...childMeta,
    elName: titleText,
  }
  draggableConfig.styles[childUuid] = {}
  draggableConfig.events[childUuid] = {}
  draggableConfig.props[childUuid] = {
    [props.titleKey]: titleText,
    [props.nameKey]: paneName,
  }

  structure.children.push(child)

  const parentProps = ensureParentProps()
  if (!parentProps) return
  const current = parentProps[props.activeKey]
  if (current == null || current === '') {
    parentProps[props.activeKey] = paneName
  } else if (Array.isArray(current) && current.length === 0) {
    parentProps[props.activeKey] = [paneName]
  }
}
</script>

<style scoped>
.child-pane-names {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.child-pane-names__row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.child-pane-names__title {
  flex: 1 1 42%;
  min-width: 0;
}

.child-pane-names__name {
  flex: 1 1 42%;
  min-width: 0;
}

.child-pane-names__btn {
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--text-color-secondary);
  line-height: 1;
  cursor: pointer;
}

.child-pane-names__btn :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0;
}

.child-pane-names__btn--danger:hover {
  color: var(--error-color);
  border-color: currentColor;
}

.child-pane-names__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: auto;
  max-width: 100%;
  height: 28px;
  padding: 0 10px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  align-self: flex-start;
}

.child-pane-names__add :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.child-pane-names__add:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}
</style>
