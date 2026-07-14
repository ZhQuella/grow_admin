<template>
  <GrowPopover
    :visible="visible"
    :width="650"
    placement="top-end"
    trigger="click"
    persistent
    @update:visible="onPopoverVisibleChange"
  >
    <template #reference>
      <GrowButton circle>
        <GrowIconify icon="ant-design:search-outlined" :size="18" />
      </GrowButton>
    </template>
    <SearchContainer ref="container" :search="search" :default-data="defaultData" />
    <div class="flex justify-between border-t border-solid border-border p-[10px]">
      <div>
        <slot name="option" />
      </div>
      <div class="flex gap-2">
        <GrowButton @click="onSystemDefault">
          <GrowIconify icon="ant-design:database-outlined" :size="16" />
          {{ t('SEARCH_BAR.RESET_SYETEM') }}
        </GrowButton>
        <GrowButton @click="onReset">
          <GrowIconify icon="ant-design:reload-outlined" :size="16" />
          {{ t('PUBLIC.RESET_TEXT') }}
        </GrowButton>
        <GrowButton type="primary" @click="onSearch">
          <GrowIconify icon="ant-design:search-outlined" :size="16" />
          {{ t('PUBLIC.SEARCH_TEXT') }}
        </GrowButton>
      </div>
    </div>
  </GrowPopover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { formatConversion } from '@grow-admin-rock/utils'
import { RockComponent } from '#/RockComponent'
import SearchContainer from './SearchContainer.vue'
import type { SearchBarField } from '../types'

defineOptions({
  name: RockComponent.SearchBar,
  customOptions: {
    isPresetComponent: true,
  },
})

withDefaults(
  defineProps<{
    search?: SearchBarField[]
    defaultData?: Recordable<any>
  }>(),
  {
    search: () => [],
    defaultData: () => ({}),
  },
)

const emit = defineEmits<{
  search: [data: Recordable<any>]
}>()

const { t } = useI18n()
const visible = ref(false)
const container = ref<InstanceType<typeof SearchContainer>>()

/** 外挂下拉/日期面板（挂 body 后点击会被 Popover 当成外部点击） */
const OVERLAY_SELECTORS = [
  '.el-select__popper',
  '.el-picker__popper',
  '.el-cascader__dropdown',
  '.el-popper.el-select__popper',
  '.n-base-select-menu',
  '.n-date-panel',
  '.n-cascader-menu',
  '.ant-select-dropdown',
  '.ant-picker-dropdown',
  '.ant-cascader-menus',
]

function isOverlayVisible(el: Element): boolean {
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  if (el.getAttribute('aria-hidden') === 'true') {
    return false
  }
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function hasOpenOverlay(): boolean {
  return OVERLAY_SELECTORS.some((selector) =>
    Array.from(document.querySelectorAll(selector)).some(isOverlayVisible),
  )
}

function onPopoverVisibleChange(next: boolean) {
  // 操作外挂下拉时拦截关闭，避免选项点不中/弹层被提前收起
  if (!next && hasOpenOverlay()) {
    return
  }
  visible.value = next
}

const onSearch = () => {
  const searchData = container.value?.getSearchData() ?? {}
  visible.value = false
  emit('search', formatConversion({ ...searchData }))
}

const onReset = () => {
  const searchData = container.value?.resetSearch() ?? {}
  visible.value = false
  emit('search', formatConversion({ ...searchData }))
}

const onSystemDefault = () => {
  const searchData = container.value?.resetDefault() ?? {}
  visible.value = false
  emit('search', formatConversion({ ...searchData }))
}
</script>
