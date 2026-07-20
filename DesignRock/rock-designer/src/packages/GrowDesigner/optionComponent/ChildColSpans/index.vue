<template>
  <div class="child-col-spans">
    <div
      v-for="(item, index) in colList"
      :key="item.uuid"
      class="child-col-spans__item"
    >
      <div class="child-col-spans__head">
        <GrowInput
          class="child-col-spans__name"
          size="small"
          :model-value="item.name"
          placeholder="列名称"
          @update:model-value="(val) => onNameChange(item.uuid, val)"
        />
        <button
          type="button"
          class="child-col-spans__btn child-col-spans__btn--danger"
          title="删除"
          @click="onRemove(index)"
        >
          <GrowIconify icon="carbon:trash-can" :size="14" />
        </button>
      </div>
      <div class="child-col-spans__fields">
        <div class="child-col-spans__field">
          <span class="child-col-spans__field-label">span</span>
          <GrowInputNumber
            class="child-col-spans__input"
            size="small"
            :min="0"
            :max="24"
            :controls="false"
            :model-value="item.span"
            @update:model-value="(val) => onFieldChange(item.uuid, 'span', val)"
          />
        </div>
        <div class="child-col-spans__field">
          <span class="child-col-spans__field-label">offset</span>
          <GrowInputNumber
            class="child-col-spans__input"
            size="small"
            :min="0"
            :max="24"
            :controls="false"
            :model-value="item.offset"
            @update:model-value="(val) => onFieldChange(item.uuid, 'offset', val)"
          />
        </div>
        <div class="child-col-spans__field">
          <span class="child-col-spans__field-label">push</span>
          <GrowInputNumber
            class="child-col-spans__input"
            size="small"
            :min="0"
            :max="24"
            :controls="false"
            :model-value="item.push"
            @update:model-value="(val) => onFieldChange(item.uuid, 'push', val)"
          />
        </div>
        <div class="child-col-spans__field">
          <span class="child-col-spans__field-label">pull</span>
          <GrowInputNumber
            class="child-col-spans__input"
            size="small"
            :min="0"
            :max="24"
            :controls="false"
            :model-value="item.pull"
            @update:model-value="(val) => onFieldChange(item.uuid, 'pull', val)"
          />
        </div>
      </div>
    </div>

    <button
      type="button"
      class="child-col-spans__add"
      @click="onAdd"
    >
      <GrowIconify icon="carbon:add" :size="14" />
      <span>添加列</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { findByUUID, getAllChilds } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import { specificComponent } from '../../static/moduleMap'

defineOptions({ name: 'ChildColSpans' })

const props = withDefaults(
  defineProps<{
    childName?: string
    defaultSpan?: number
  }>(),
  {
    childName: 'GrowCol',
    defaultSpan: 12,
  },
)

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

const parentStructure = computed(() =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value),
)

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const colList = computed(() => {
  const children = parentStructure.value?.children || []
  return children.map((child: any, index: number) => {
    const childProps = draggableConfig.props[child.uuid] || {}
    const renderArgument = draggableConfig.renderArgument[child.uuid] || {}
    return {
      uuid: child.uuid,
      name: renderArgument.elName || `列 ${index + 1}`,
      span: toNumber(childProps.span, props.defaultSpan),
      offset: toNumber(childProps.offset, 0),
      push: toNumber(childProps.push, 0),
      pull: toNumber(childProps.pull, 0),
    }
  })
})

const ensureChildProps = (uuid: string) => {
  if (!draggableConfig.props[uuid]) {
    draggableConfig.props[uuid] = {}
  }
  return draggableConfig.props[uuid]
}

const ensureChildRenderArgument = (uuid: string) => {
  if (!draggableConfig.renderArgument[uuid]) {
    draggableConfig.renderArgument[uuid] = {}
  }
  return draggableConfig.renderArgument[uuid]
}

const onNameChange = (uuid: string, value: string) => {
  const renderArgument = ensureChildRenderArgument(uuid)
  renderArgument.elName = value
}

const onFieldChange = (
  uuid: string,
  key: 'span' | 'offset' | 'push' | 'pull',
  value: number | null | undefined,
) => {
  const childProps = ensureChildProps(uuid)
  childProps[key] = value == null || value === ('' as any) ? 0 : Number(value)
}

const cleanupNode = (node: any) => {
  const result = getAllChilds([node])
  for (const el of result) {
    Reflect.deleteProperty(draggableConfig.styles, el.uuid)
    Reflect.deleteProperty(draggableConfig.props, el.uuid)
    Reflect.deleteProperty(draggableConfig.events, el.uuid)
    Reflect.deleteProperty(draggableConfig.renderArgument, el.uuid)
  }
}

const onRemove = (index: number) => {
  const structure = parentStructure.value
  if (!structure?.children?.length) return
  const [removed] = structure.children.splice(index, 1)
  if (!removed) return
  cleanupNode(removed)
}

const onAdd = () => {
  const structure = parentStructure.value
  if (!structure) return
  if (!Array.isArray(structure.children)) {
    structure.children = []
  }

  const childMeta = specificComponent.get(props.childName) || {}
  const childUuid = nanoid()
  const index = structure.children.length + 1
  const child: Record<string, any> = { uuid: childUuid }
  if (childMeta.isChild) {
    child.children = []
  }

  draggableConfig.renderArgument[childUuid] = {
    ...childMeta,
    elName: `列 ${index}`,
  }
  draggableConfig.styles[childUuid] = {}
  draggableConfig.events[childUuid] = {}
  draggableConfig.props[childUuid] = {
    span: props.defaultSpan,
    offset: 0,
    push: 0,
    pull: 0,
  }

  structure.children.push(child)
}
</script>

<style scoped>
.child-col-spans {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.child-col-spans__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--color-primary-a04, rgba(0, 0, 0, 0.02));
  box-sizing: border-box;
}

.child-col-spans__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.child-col-spans__name {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

.child-col-spans__name :deep(.el-input),
.child-col-spans__name :deep(.n-input),
.child-col-spans__name :deep(.ant-input) {
  width: 100%;
  min-width: 0;
}

.child-col-spans__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.child-col-spans__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.child-col-spans__field-label {
  font-size: 11px;
  color: var(--text-color-secondary);
  line-height: 1.2;
}

.child-col-spans__input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.child-col-spans__field :deep(.el-input-number),
.child-col-spans__field :deep(.n-input-number),
.child-col-spans__field :deep(.ant-input-number) {
  width: 100% !important;
  max-width: 100%;
  min-width: 0 !important;
  box-sizing: border-box;
}

.child-col-spans__field :deep(.el-input),
.child-col-spans__field :deep(.el-input__wrapper),
.child-col-spans__field :deep(.n-input),
.child-col-spans__field :deep(.ant-input-number-input-wrap) {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.child-col-spans__btn {
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

.child-col-spans__btn :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0;
}

.child-col-spans__btn--danger:hover {
  color: var(--color-error, #d03050);
  border-color: currentColor;
}

.child-col-spans__add {
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

.child-col-spans__add :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.child-col-spans__add:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}
</style>
