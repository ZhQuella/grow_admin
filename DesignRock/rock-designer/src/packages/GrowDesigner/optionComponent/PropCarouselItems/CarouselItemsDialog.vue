<template>
  <GrowDialog
    :model-value="visible"
    title="轮播项配置"
    width="860px"
    append-to-body
    destroy-on-close
    align-center
    :z-index="4000"
    class="carousel-items-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="carousel-items-dialog__body" @click.stop>
      <div class="carousel-items-dialog__main">
        <div class="carousel-items-dialog__list-pane">
          <div class="carousel-items-dialog__toolbar">
            <button
              type="button"
              class="carousel-items-dialog__tool-btn"
              title="添加轮播项"
              @click="onAdd"
            >
              <GrowIconify icon="carbon:add" :size="14" />
              <span>添加轮播项</span>
            </button>
          </div>

          <GrowScrollbar height="100%" class="carousel-items-dialog__list-scroll">
            <draggable
              :key="listKey"
              class="carousel-items-dialog__list"
              :list="draft"
              item-key="id"
              group="designer-carousel-items"
              handle=".carousel-item-row__drag"
              :animation="200"
            >
              <template #item="{ element }">
                <div
                  class="carousel-item-row"
                  :class="{ 'is-active': activeId === element.id }"
                >
                  <span class="carousel-item-row__drag" title="拖拽排序">
                    <GrowIconify icon="carbon:draggable" :size="14" />
                  </span>
                  <button
                    type="button"
                    class="carousel-item-row__main"
                    @click="activeId = element.id"
                  >
                    <span class="carousel-item-row__title">
                      {{ element.name || `轮播项` }}
                    </span>
                    <span class="carousel-item-row__meta">
                      {{ element.src ? '已配图片' : '未配图片' }}
                      ·
                      {{
                        element.href
                          ? element.linkType === 'internal'
                            ? '系统内部'
                            : '网页'
                          : '无跳转'
                      }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="carousel-item-row__btn carousel-item-row__btn--danger"
                    title="删除"
                    @click="onRemove(element.id)"
                  >
                    <GrowIconify icon="carbon:trash-can" :size="14" />
                  </button>
                </div>
              </template>
            </draggable>
            <div v-if="!draft.length" class="carousel-items-dialog__empty">
              暂无轮播项，点击上方添加
            </div>
          </GrowScrollbar>
        </div>

        <GrowScrollbar height="100%" class="carousel-items-dialog__edit-scroll">
          <div v-if="activeItem" class="carousel-item-edit">
            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">名字</span>
              <GrowInput
                size="small"
                :model-value="activeItem.name"
                placeholder="可用作 setActiveItem 参数"
                @update:model-value="(v) => patchActive({ name: String(v ?? '') })"
              />
            </div>

            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">指示器文本</span>
              <GrowInput
                size="small"
                :model-value="activeItem.label"
                placeholder="可为空，为空时指示器不显示文字"
                @update:model-value="(v) => patchActive({ label: String(v ?? '') })"
              />
            </div>

            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">图片地址</span>
              <PropVariableBind
                :model-value="activeItem.src"
                placeholder="请输入 URL 或绑定变量"
                :bind-mode="activeItem.bindModes.src"
                @update:model-value="(v) => patchActive({ src: v })"
                @update:bind-mode="(m) => patchBindMode('src', m)"
              />
            </div>

            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">展示方式</span>
              <GrowSelect
                size="small"
                class="carousel-item-edit__select"
                teleported
                popper-class="carousel-items-select-popper"
                :model-value="activeItem.imageFit"
                :options="imageFitOptions"
                @update:model-value="
                  (v) =>
                    patchActive({
                      imageFit: normalizeCarouselImageFit(v),
                    })
                "
              />
            </div>

            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">链接类型</span>
              <GrowSelect
                size="small"
                class="carousel-item-edit__select"
                teleported
                popper-class="carousel-items-select-popper"
                :model-value="activeItem.linkType"
                :options="linkTypeOptions"
                @update:model-value="
                  (v) =>
                    patchActive({
                      linkType: (v as CarouselItemDraft['linkType']) || 'web',
                    })
                "
              />
            </div>

            <div class="carousel-item-edit__field">
              <span class="carousel-item-edit__label">
                {{ activeItem.linkType === 'internal' ? '系统内部地址' : '网页地址' }}
              </span>
              <PropVariableBind
                :model-value="activeItem.href"
                :placeholder="
                  activeItem.linkType === 'internal'
                    ? '请输入系统路由，如 /dashboard'
                    : '请输入网页 URL'
                "
                :bind-mode="activeItem.bindModes.href"
                @update:model-value="(v) => patchActive({ href: v })"
                @update:bind-mode="(m) => patchBindMode('href', m)"
              />
            </div>
          </div>
          <div v-else class="carousel-items-dialog__empty">
            请选择左侧轮播项进行编辑
          </div>
        </GrowScrollbar>
      </div>
    </div>

    <template #footer>
      <div class="carousel-items-dialog__footer">
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
  CAROUSEL_IMAGE_FIT_OPTIONS,
  normalizeCarouselImageFit,
  type CarouselItemDraft,
} from './types'

defineOptions({ name: 'CarouselItemsDialog' })

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: CarouselItemDraft[]]
}>()

const CHILD_NAME = 'GrowCarouselItem'

const linkTypeOptions = [
  { label: '网页', value: 'web' },
  { label: '系统内部地址', value: 'internal' },
]

const imageFitOptions = CAROUSEL_IMAGE_FIT_OPTIONS

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

const draft = ref<CarouselItemDraft[]>([])
const activeId = ref('')
const listKey = ref(0)

const activeItem = computed(
  () => draft.value.find((item) => item.id === activeId.value) || null,
)

const parentStructure = () =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value)

const createDraftItem = (
  partial?: Partial<CarouselItemDraft>,
  index = 0,
): CarouselItemDraft => ({
  id: partial?.id || nanoid(),
  // name：幻灯片名字；未填时给设计侧可读默认值，不写入指示器
  name:
    typeof partial?.name === 'string' && partial.name.trim()
      ? partial.name
      : `轮播项 ${index + 1}`,
  // label：指示器文本，允许为空
  label: typeof partial?.label === 'string' ? partial.label : '',
  src: partial?.src || '',
  href: partial?.href || '',
  linkType: partial?.linkType === 'internal' ? 'internal' : 'web',
  imageFit: normalizeCarouselImageFit(partial?.imageFit),
  bindModes: {
    src: normalizePropBindMode(partial?.bindModes?.src) || PROP_BIND_MODE_TEXT,
    href: normalizePropBindMode(partial?.bindModes?.href) || PROP_BIND_MODE_TEXT,
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
        // 名字与指示器文本分离；兼容旧数据用 elName 兜底名字
        name: childProps.name || elName,
        label:
          typeof childProps.label === 'string' ? childProps.label : '',
        src: childProps.src,
        href: childProps.href,
        linkType: childProps.linkType,
        imageFit: childProps.imageFit,
        bindModes: {
          src: modes.src,
          href: modes.href,
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

const patchActive = (patch: Partial<CarouselItemDraft>) => {
  const current = activeItem.value
  if (!current) return
  draft.value = draft.value.map((item) =>
    item.id === current.id ? { ...item, ...patch } : item,
  )
}

const patchBindMode = (key: 'src' | 'href', mode: PropBindMode) => {
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

const applyDraft = (items: CarouselItemDraft[]) => {
  const structure = parentStructure()
  if (!structure) return
  if (!Array.isArray(structure.children)) {
    structure.children = []
  }

  const childMeta = specificComponent.get(CHILD_NAME) || {}
  const oldMap = new Map<string, any>(
    (structure.children || []).map((child: any) => [child.uuid, child]),
  )
  const keepIds = new Set(items.map((item) => item.id))

  for (const [uuid, node] of oldMap) {
    if (!keepIds.has(uuid)) {
      cleanupNode(node)
    }
  }

  const nextChildren: any[] = []
  items.forEach((item, index) => {
    let node = oldMap.get(item.id)
    if (!node) {
      node = { uuid: item.id }
      if (childMeta.isChild) {
        node.children = []
      }
      draggableConfig.styles[item.id] = {}
      draggableConfig.events[item.id] = {}
    }

    const slideName =
      (typeof item.name === 'string' && item.name.trim()) ||
      `轮播项 ${index + 1}`
    // 指示器文本保持用户输入（可为空），勿用设计侧显示名回填
    const indicatorLabel = typeof item.label === 'string' ? item.label : ''

    draggableConfig.renderArgument[item.id] = {
      ...(draggableConfig.renderArgument[item.id] || childMeta),
      ...childMeta,
      elName: slideName,
    }
    const nextProps = {
      ...(draggableConfig.props[item.id] || {}),
      name: slideName,
      label: indicatorLabel,
      src: item.src || '',
      href: item.href || '',
      linkType: item.linkType === 'internal' ? 'internal' : 'web',
      imageFit: normalizeCarouselImageFit(item.imageFit),
    }
    // 兼容清理旧「打开方式」字段
    Reflect.deleteProperty(nextProps, 'target')
    draggableConfig.props[item.id] = nextProps

    if (!draggableConfig.propBindModes) {
      draggableConfig.propBindModes = {}
    }
    draggableConfig.propBindModes[item.id] = {
      ...(draggableConfig.propBindModes[item.id] || {}),
      src: item.bindModes.src || PROP_BIND_MODE_TEXT,
      href: item.bindModes.href || PROP_BIND_MODE_TEXT,
    }

    nextChildren.push(node)
  })

  structure.children = nextChildren
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
.carousel-items-dialog__body {
  display: flex;
  flex-direction: column;
  height: min(420px, calc(100vh - 240px));
  max-height: calc(100vh - 240px);
  min-height: 0;
  overflow: hidden;
  color: var(--text-color);
}

.carousel-items-dialog__main {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: minmax(220px, 34%) 1fr;
  grid-template-rows: minmax(0, 1fr);
  height: 0;
  min-height: 0;
  overflow: hidden;
}

.carousel-items-dialog__list-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--layout-container-background-color);
  border-right: 1px solid var(--layout-border-color);
}

.carousel-items-dialog__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--layout-border-color);
}

.carousel-items-dialog__tool-btn {
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

.carousel-items-dialog__list-scroll,
.carousel-items-dialog__edit-scroll {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.carousel-items-dialog__list-scroll {
  flex: 1 1 auto;
  height: 0;
}

.carousel-items-dialog__list {
  padding: 8px;
}

.carousel-item-row {
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

    .carousel-item-row__title {
      color: var(--primary-color);
    }
  }
}

.carousel-item-row__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary);
  cursor: grab;
  line-height: 0;
}

.carousel-item-row__main {
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

.carousel-item-row__title {
  overflow: hidden;
  font-size: 13px;
  color: var(--text-color);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carousel-item-row__meta {
  overflow: hidden;
  font-size: 11px;
  color: var(--text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carousel-item-row__btn {
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

.carousel-items-dialog__empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.carousel-items-dialog__edit-scroll {
  padding: 12px 16px;
  background: var(--component-background-color);
}

.carousel-item-edit {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.carousel-item-edit__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.carousel-item-edit__label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.carousel-item-edit__select {
  width: 100%;
}

.carousel-items-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>

<style lang="scss">
.el-overlay-dialog:has(.carousel-items-dialog) {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.carousel-items-dialog.el-dialog,
.el-overlay-dialog .carousel-items-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 0 !important;
  overflow: hidden;
}

.carousel-items-dialog .el-dialog__header,
.carousel-items-dialog .el-dialog__footer,
.carousel-items-dialog .n-dialog__title,
.carousel-items-dialog .n-dialog__action {
  flex-shrink: 0;
}

.carousel-items-dialog .el-dialog__body,
.carousel-items-dialog .n-dialog__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding-top: 12px;
}

/* 弹层需高于轮播项配置弹窗（z-index: 4000） */
.carousel-items-select-popper {
  z-index: 5100 !important;
}
</style>
