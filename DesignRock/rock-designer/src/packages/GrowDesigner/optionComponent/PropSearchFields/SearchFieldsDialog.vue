<template>
  <GrowDialog
    :model-value="visible"
    title="搜索字段配置"
    width="880px"
    append-to-body
    destroy-on-close
    align-center
    :z-index="4000"
    class="search-fields-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="search-fields-dialog__body" @click.stop>
      <div class="search-fields-dialog__main">
        <div class="search-fields-dialog__list-pane">
          <div class="search-fields-dialog__toolbar">
            <button
              type="button"
              class="search-fields-dialog__tool-btn"
              title="添加字段"
              @click="onAdd"
            >
              <GrowIconify icon="carbon:add" :size="14" />
              <span>添加字段</span>
            </button>
          </div>

          <GrowScrollbar height="100%" class="search-fields-dialog__list-scroll">
            <draggable
              :key="listKey"
              class="search-fields-dialog__list"
              :list="draft"
              item-key="id"
              group="designer-search-fields"
              handle=".search-field-row__drag"
              :animation="200"
            >
              <template #item="{ element }">
                <div
                  class="search-field-row"
                  :class="{ 'is-active': activeId === element.id }"
                >
                  <span class="search-field-row__drag" title="拖拽排序">
                    <GrowIconify icon="carbon:draggable" :size="14" />
                  </span>
                  <button
                    type="button"
                    class="search-field-row__main"
                    @click="activeId = element.id"
                  >
                    <span class="search-field-row__title">
                      {{ element.labelText || '未命名' }}
                    </span>
                    <span class="search-field-row__meta">
                      {{ elTypeLabel(element.elType) }} · {{ element.model || '-' }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="search-field-row__btn search-field-row__btn--danger"
                    title="删除"
                    @click="onRemove(element.id)"
                  >
                    <GrowIconify icon="carbon:trash-can" :size="14" />
                  </button>
                </div>
              </template>
            </draggable>
            <div v-if="!draft.length" class="search-fields-dialog__empty">
              暂无字段，点击上方添加
            </div>
          </GrowScrollbar>
        </div>

        <GrowScrollbar height="100%" class="search-fields-dialog__edit-scroll">
          <SearchFieldEditForm
            v-if="activeField"
            :model-value="activeField"
            @update:model-value="onUpdateField"
          />
          <div v-else class="search-fields-dialog__empty">
            请选择左侧字段进行编辑
          </div>
        </GrowScrollbar>
      </div>
    </div>

    <template #footer>
      <div class="search-fields-dialog__footer">
        <GrowButton @click="onCancel">取消</GrowButton>
        <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
      </div>
    </template>
  </GrowDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import {
  SEARCH_FIELD_EL_TYPE_LABEL,
  type DesignerSearchField,
  type SearchFieldElType,
} from '../../static/searchFields'
import {
  cloneSearchFields,
  createSearchField,
  removeSearchFieldById,
  toDesignerSearchFields,
  updateSearchFieldById,
} from '../../static/searchFieldUtils'
import SearchFieldEditForm from './SearchFieldEditForm.vue'

defineOptions({ name: 'SearchFieldsDialog' })

const props = defineProps<{
  visible: boolean
  modelValue?: DesignerSearchField[] | Record<string, unknown>[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: DesignerSearchField[]]
}>()

const draft = ref<DesignerSearchField[]>([])
const listKey = ref(0)
const activeId = ref('')

const activeField = computed(
  () => draft.value.find((item) => item.id === activeId.value) || null,
)

const elTypeLabel = (elType: SearchFieldElType | string) =>
  SEARCH_FIELD_EL_TYPE_LABEL[elType as SearchFieldElType] || elType || '-'

watch(
  () => props.visible,
  (open) => {
    if (!open) return
    draft.value = cloneSearchFields(toDesignerSearchFields(props.modelValue))
    listKey.value += 1
    activeId.value = draft.value[0]?.id || ''
  },
)

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

const onAdd = () => {
  const next = createSearchField({
    labelText: `字段 ${draft.value.length + 1}`,
  })
  draft.value = [...draft.value, next]
  activeId.value = next.id
  listKey.value += 1
}

const onRemove = (id: string) => {
  draft.value = removeSearchFieldById(draft.value, id)
  if (activeId.value === id) {
    activeId.value = draft.value[0]?.id || ''
  }
}

const onUpdateField = (next: DesignerSearchField) => {
  draft.value = updateSearchFieldById(draft.value, next)
}

const onCancel = () => emit('update:visible', false)

const onConfirm = () => {
  emit('confirm', cloneSearchFields(draft.value))
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.search-fields-dialog__body {
  display: flex;
  flex-direction: column;
  height: min(420px, calc(100vh - 240px));
  max-height: calc(100vh - 240px);
  min-height: 0;
  overflow: hidden;
  color: var(--text-color);
}

.search-fields-dialog__main {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: minmax(220px, 34%) 1fr;
  grid-template-rows: minmax(0, 1fr);
  height: 0;
  min-height: 0;
  overflow: hidden;
}

.search-fields-dialog__list-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--layout-container-background-color);
  border-right: 1px solid var(--layout-border-color);
}

.search-fields-dialog__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--layout-border-color);
}

.search-fields-dialog__tool-btn {
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

  &:hover {
    border-color: var(--primary-color, #409eff);
    color: var(--primary-color, #409eff);
    opacity: 0.9;
  }
}

.search-fields-dialog__list-scroll,
.search-fields-dialog__edit-scroll {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.search-fields-dialog__list-scroll {
  flex: 1 1 auto;
  height: 0;
}

.search-fields-dialog__list-scroll :deep(.el-scrollbar__wrap),
.search-fields-dialog__list-scroll :deep(.n-scrollbar-container),
.search-fields-dialog__edit-scroll :deep(.el-scrollbar__wrap),
.search-fields-dialog__edit-scroll :deep(.n-scrollbar-container) {
  max-height: 100%;
}

.search-fields-dialog__list {
  padding: 8px;
}

.search-field-row {
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

    .search-field-row__title {
      color: var(--primary-color);
    }
  }
}

.search-field-row__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-color-secondary);
  cursor: grab;
  line-height: 0;
}

.search-field-row__main {
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

.search-field-row__title {
  overflow: hidden;
  font-size: 13px;
  color: var(--text-color);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-field-row__meta {
  overflow: hidden;
  font-size: 11px;
  color: var(--text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-field-row__btn {
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
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    background: var(--header-action-hover-bg-color);
    color: var(--text-color);
  }

  &--danger:hover {
    color: var(--error-color);
    background: color-mix(in srgb, var(--error-color) 12%, transparent);
  }
}

.search-fields-dialog__empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.search-fields-dialog__edit-scroll {
  padding: 12px 16px;
  background: var(--component-background-color);
}

.search-fields-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>

<!-- 限制 Dialog 整体高度，并保持水平垂直居中 -->
<style lang="scss">
.el-overlay-dialog:has(.search-fields-dialog) {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.search-fields-dialog.el-dialog,
.el-overlay-dialog .search-fields-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 0 !important;
  overflow: hidden;
}

.search-fields-dialog .el-dialog__header,
.search-fields-dialog .el-dialog__footer,
.search-fields-dialog .n-dialog__title,
.search-fields-dialog .n-dialog__action {
  flex-shrink: 0;
}

.search-fields-dialog .el-dialog__body,
.search-fields-dialog .n-dialog__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding-top: 12px;
}
</style>
