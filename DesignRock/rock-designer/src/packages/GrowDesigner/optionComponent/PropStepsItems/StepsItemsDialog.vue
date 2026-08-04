<template>
  <GrowDialog
    :model-value="visible"
    title="步骤项配置"
    width="860px"
    append-to-body
    destroy-on-close
    align-center
    :z-index="4000"
    class="steps-items-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="steps-items-dialog__body" @click.stop>
      <div class="steps-items-dialog__main">
        <div class="steps-items-dialog__list-pane">
          <div class="steps-items-dialog__toolbar">
            <button
              type="button"
              class="steps-items-dialog__tool-btn"
              title="添加步骤项"
              @click="onAdd"
            >
              <GrowIconify icon="carbon:add" :size="14" />
              <span>添加步骤项</span>
            </button>
          </div>

          <GrowScrollbar height="100%" class="steps-items-dialog__list-scroll">
            <draggable
              :key="listKey"
              class="steps-items-dialog__list"
              :list="draft"
              item-key="id"
              group="designer-steps-items"
              handle=".step-item-row__drag"
              :animation="200"
            >
              <template #item="{ element, index }">
                <div
                  class="step-item-row"
                  :class="{ 'is-active': activeId === element.id }"
                >
                  <span class="step-item-row__drag" title="拖拽排序">
                    <GrowIconify icon="carbon:draggable" :size="14" />
                  </span>
                  <button
                    type="button"
                    class="step-item-row__main"
                    @click="activeId = element.id"
                  >
                    <span class="step-item-row__title">
                      {{ element.title || `步骤 ${index + 1}` }}
                    </span>
                    <span class="step-item-row__meta">
                      {{ statusLabel(element.status) }}
                      ·
                      {{ element.disabled ? '已禁用' : '可用' }}
                      ·
                      {{ element.icon ? '已配图标' : '无图标' }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="step-item-row__btn step-item-row__btn--danger"
                    title="删除"
                    @click="onRemove(element.id)"
                  >
                    <GrowIconify icon="carbon:trash-can" :size="14" />
                  </button>
                </div>
              </template>
            </draggable>
            <div v-if="!draft.length" class="steps-items-dialog__empty">
              暂无步骤项，点击上方添加
            </div>
          </GrowScrollbar>
        </div>

        <GrowScrollbar height="100%" class="steps-items-dialog__edit-scroll">
          <div v-if="activeItem" class="step-item-edit">
            <div class="step-item-edit__field">
              <span class="step-item-edit__label">标题</span>
              <PropVariableBind
                :model-value="activeItem.title"
                placeholder="请输入步骤标题或绑定变量"
                :bind-mode="activeItem.bindModes.title"
                @update:model-value="(v) => patchActive({ title: v })"
                @update:bind-mode="(m) => patchBindMode('title', m)"
              />
            </div>

            <div class="step-item-edit__field">
              <span class="step-item-edit__label">描述</span>
              <PropVariableBind
                :model-value="activeItem.description"
                placeholder="请输入步骤描述或绑定变量"
                :bind-mode="activeItem.bindModes.description"
                @update:model-value="(v) => patchActive({ description: v })"
                @update:bind-mode="(m) => patchBindMode('description', m)"
              />
            </div>

            <div class="step-item-edit__field">
              <span class="step-item-edit__label">状态</span>
              <GrowSelect
                size="small"
                class="step-item-edit__select"
                teleported
                popper-class="steps-items-select-popper"
                :model-value="activeItem.status"
                :options="statusOptions"
                @update:model-value="
                  (v) =>
                    patchActive({
                      status: normalizeStepStatus(v),
                    })
                "
              />
            </div>

            <div class="step-item-edit__field step-item-edit__field--row">
              <span class="step-item-edit__label">禁用</span>
              <GrowSwitch
                size="small"
                :model-value="activeItem.disabled"
                @update:model-value="(v) => patchActive({ disabled: Boolean(v) })"
              />
            </div>

            <div class="step-item-edit__field">
              <span class="step-item-edit__label">图标</span>
              <PropVariableBind
                :model-value="activeItem.icon"
                placeholder="如 carbon:checkmark"
                :bind-mode="activeItem.bindModes.icon"
                @update:model-value="(v) => patchActive({ icon: v })"
                @update:bind-mode="(m) => patchBindMode('icon', m)"
              />
            </div>
          </div>
          <div v-else class="steps-items-dialog__empty">
            请选择左侧步骤项进行编辑
          </div>
        </GrowScrollbar>
      </div>
    </div>

    <template #footer>
      <div class="steps-items-dialog__footer">
        <GrowButton @click="onCancel">取消</GrowButton>
        <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
      </div>
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import draggable from 'vuedraggable'
import { findByUUID, getAllChilds } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import { specificComponent } from '../../static/moduleMap'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import PropVariableBind from '../PropVariableBind/index.vue'
import {
  STEP_STATUS_OPTIONS,
  normalizeStepStatus,
  type StepItemDraft,
} from './types'

defineOptions({ name: 'StepsItemsDialog' })

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: StepItemDraft[]]
}>()

const CHILD_NAME = 'GrowStep'
const statusOptions = STEP_STATUS_OPTIONS

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

const draft = ref<StepItemDraft[]>([])
const activeId = ref('')
const listKey = ref(0)

const activeItem = computed(
  () => draft.value.find((item) => item.id === activeId.value) || null,
)

const parentStructure = () =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value)

const statusLabel = (status: StepItemDraft['status']) =>
  STEP_STATUS_OPTIONS.find((item) => item.value === status)?.label || '跟随步骤条'

const createDraftItem = (
  partial?: Partial<StepItemDraft>,
  index = 0,
): StepItemDraft => ({
  id: partial?.id || nanoid(),
  title:
    typeof partial?.title === 'string' && partial.title.trim()
      ? partial.title
      : `步骤 ${index + 1}`,
  description:
    typeof partial?.description === 'string' ? partial.description : '',
  status: normalizeStepStatus(partial?.status),
  disabled: Boolean(partial?.disabled),
  icon: typeof partial?.icon === 'string' ? partial.icon : '',
  bindModes: {
    title:
      normalizePropBindMode(partial?.bindModes?.title) || PROP_BIND_MODE_TEXT,
    description:
      normalizePropBindMode(partial?.bindModes?.description) ||
      PROP_BIND_MODE_TEXT,
    icon:
      normalizePropBindMode(partial?.bindModes?.icon) || PROP_BIND_MODE_TEXT,
  },
})

const loadDraft = () => {
  const structure = parentStructure()
  const children = structure?.children || []
  draft.value = children.map((child: any, index: number) => {
    const childProps = draggableConfig.props[child.uuid] || {}
    const modes = draggableConfig.propBindModes?.[child.uuid] || {}
    const elName = draggableConfig.renderArgument?.[child.uuid]?.elName
    return createDraftItem(
      {
        id: child.uuid,
        title: childProps.title || elName,
        description: childProps.description,
        status: childProps.status,
        disabled: childProps.disabled,
        icon: childProps.icon,
        bindModes: {
          title: modes.title,
          description: modes.description,
          icon: modes.icon,
        },
      },
      index,
    )
  })
  listKey.value += 1
  activeId.value = draft.value[0]?.id || ''
}

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    loadDraft()
  },
)

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

const onAdd = () => {
  const next = createDraftItem(undefined, draft.value.length)
  draft.value = [...draft.value, next]
  activeId.value = next.id
  listKey.value += 1
}

const onRemove = (id: string) => {
  draft.value = draft.value.filter((item) => item.id !== id)
  if (activeId.value === id) {
    activeId.value = draft.value[0]?.id || ''
  }
}

const patchActive = (patch: Partial<StepItemDraft>) => {
  const current = activeItem.value
  if (!current) return
  draft.value = draft.value.map((item) =>
    item.id === current.id ? { ...item, ...patch } : item,
  )
}

const patchBindMode = (
  key: 'title' | 'description' | 'icon',
  mode: PropBindMode,
) => {
  const current = activeItem.value
  if (!current) return
  draft.value = draft.value.map((item) =>
    item.id === current.id
      ? {
          ...item,
          bindModes: {
            ...item.bindModes,
            [key]: normalizePropBindMode(mode) || PROP_BIND_MODE_TEXT,
          },
        }
      : item,
  )
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

const removeDroppedStepNodes = (
  oldMap: Map<string, any>,
  keepIds: Set<string>,
) => {
  for (const [uuid, node] of oldMap) {
    if (!keepIds.has(uuid)) cleanupNode(node)
  }
}

const ensureStepChildNode = (
  item: StepItemDraft,
  oldMap: Map<string, any>,
  childMeta: Record<string, any>,
) => {
  let node = oldMap.get(item.id)
  if (node) return node
  node = { uuid: item.id }
  if (childMeta.isChild) node.children = []
  draggableConfig.styles[item.id] = {}
  draggableConfig.events[item.id] = {}
  return node
}

const writeStepItemConfig = (
  item: StepItemDraft,
  index: number,
  childMeta: Record<string, any>,
) => {
  const titleText =
    (typeof item.title === 'string' && item.title.trim()) ||
    `步骤 ${index + 1}`

  draggableConfig.renderArgument[item.id] = {
    ...(draggableConfig.renderArgument[item.id] || childMeta),
    ...childMeta,
    elName: titleText,
  }

  const nextProps: Record<string, any> = {
    ...(draggableConfig.props[item.id] || {}),
    title: titleText,
    description:
      typeof item.description === 'string' ? item.description : '',
    disabled: Boolean(item.disabled),
    icon: typeof item.icon === 'string' ? item.icon : '',
  }

  const status = normalizeStepStatus(item.status)
  if (status) {
    nextProps.status = status
  } else {
    Reflect.deleteProperty(nextProps, 'status')
  }
  Reflect.deleteProperty(nextProps, 'name')
  draggableConfig.props[item.id] = nextProps

  if (!draggableConfig.propBindModes) {
    draggableConfig.propBindModes = {}
  }
  draggableConfig.propBindModes[item.id] = {
    ...(draggableConfig.propBindModes[item.id] || {}),
    title: item.bindModes.title || PROP_BIND_MODE_TEXT,
    description: item.bindModes.description || PROP_BIND_MODE_TEXT,
    icon: item.bindModes.icon || PROP_BIND_MODE_TEXT,
  }
}

const applyDraft = (items: StepItemDraft[]) => {
  const structure = parentStructure()
  if (!structure) return
  if (!Array.isArray(structure.children)) {
    structure.children = []
  }

  const childMeta = specificComponent.get(CHILD_NAME) || {}
  const oldMap = new Map<string, any>(
    (structure.children || []).map((child: any) => [child.uuid, child]),
  )
  removeDroppedStepNodes(
    oldMap,
    new Set(items.map((item) => item.id)),
  )

  structure.children = items.map((item, index) => {
    const node = ensureStepChildNode(item, oldMap, childMeta)
    writeStepItemConfig(item, index, childMeta)
    return node
  })
}

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  const next = draft.value.map((item, index) =>
    createDraftItem(item, index),
  )
  applyDraft(next)
  emit('confirm', next)
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.steps-items-dialog__body {
  display: flex;
  flex-direction: column;
  height: min(420px, calc(100vh - 240px));
  max-height: calc(100vh - 240px);
  min-height: 0;
  overflow: hidden;
  color: var(--text-color);
}

.steps-items-dialog__main {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: minmax(220px, 34%) 1fr;
  grid-template-rows: minmax(0, 1fr);
  height: 0;
  min-height: 0;
  overflow: hidden;
}

.steps-items-dialog__list-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--layout-container-background-color);
  border-right: 1px solid var(--layout-border-color);
}

.steps-items-dialog__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--layout-border-color);
}

.steps-items-dialog__tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid var(--primary-color, #409eff);
  border-radius: 4px;
  background: var(--color-primary-a08);
  color: var(--primary-color, #409eff);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;

  :deep(.grow-iconify),
  :deep(svg) {
    display: block;
    line-height: 0;
  }
}

.steps-items-dialog__list-scroll,
.steps-items-dialog__edit-scroll {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.steps-items-dialog__list-scroll {
  flex: 1 1 auto;
  height: 0;
}

.steps-items-dialog__list {
  padding: 8px;
}

.step-item-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--header-action-hover-bg-color);
  }

  &.is-active {
    background: var(--color-primary-a08);

    .step-item-row__title {
      color: var(--primary-color);
    }
  }
}

.step-item-row__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary);
  cursor: grab;
  line-height: 0;
}

.step-item-row__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  margin: 0;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.step-item-row__title {
  overflow: hidden;
  font-size: 13px;
  color: var(--text-color);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-item-row__meta {
  overflow: hidden;
  font-size: 11px;
  color: var(--text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-item-row__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  line-height: 0;

  &--danger:hover {
    color: var(--error-color);
    background: color-mix(in srgb, var(--error-color) 12%, transparent);
  }
}

.steps-items-dialog__empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.steps-items-dialog__edit-scroll {
  padding: 12px 16px;
  background: var(--component-background-color);
}

.step-item-edit {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item-edit__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-item-edit__field--row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.step-item-edit__label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.step-item-edit__select {
  width: 100%;
}

.steps-items-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>

<style lang="scss">
.el-overlay-dialog:has(.steps-items-dialog) {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.steps-items-dialog.el-dialog,
.el-overlay-dialog .steps-items-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 0 !important;
  overflow: hidden;
}

.steps-items-dialog .el-dialog__header,
.steps-items-dialog .el-dialog__footer,
.steps-items-dialog .n-dialog__title,
.steps-items-dialog .n-dialog__action {
  flex-shrink: 0;
}

.steps-items-dialog .el-dialog__body,
.steps-items-dialog .n-dialog__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding-top: 12px;
}

.steps-items-select-popper {
  z-index: 5100 !important;
}
</style>
