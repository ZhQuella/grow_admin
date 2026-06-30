<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { useMediaQuery } from '@grow-admin-rock/utils'
import LayoutSearchFooter from './LayoutSearchFooter.vue'
import { useMenuSearch } from './useMenuSearch'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t } = useI18n()
const isMobile = useMediaQuery('(max-width: 768px)')
const visibleRef = toRef(props, 'visible')

const {
  keyword,
  searchResult,
  activeIndex,
  scrollWrapRef,
  handleKeywordInput,
  handleMouseenter,
  handleEnter,
  handleClose,
  setItemRef,
} = useMenuSearch({
  visible: visibleRef,
  onClose: () => emit('update:visible', false),
})

const showEmptyState = computed(() => !keyword.value || searchResult.value.length === 0)

const listMaxHeight = computed(() =>
  isMobile.value ? 'calc(100vh - 120px)' : 'min(472px, calc(100vh - 220px))',
)
</script>

<template>
  <Teleport to="body">
    <Transition name="layout-search-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[800] flex items-start justify-center overflow-y-auto bg-black/25 px-4 pb-4 pt-[50px]"
        :class="{ '!items-stretch !overflow-hidden !p-0': isMobile }"
        @click="handleClose"
      >
        <div
          class="layout-search-modal relative flex h-fit w-[632px] max-h-[calc(100vh-66px)] flex-col overflow-hidden rounded-2xl bg-component shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
          :class="{ '!h-full !max-h-none !w-full !rounded-none': isMobile }"
          @click.stop
        >
          <div class="flex shrink-0 items-center justify-between px-3.5 pt-3.5">
            <GrowInput
              :model-value="keyword"
              class="layout-search-modal__input !h-12 !w-full !text-[18px]"
              :placeholder="t('layout.search.placeholder')"
              allow-clear
              autofocus
              @update:model-value="handleKeywordInput"
            >
              <template #prefix>
                <GrowIconify icon="ant-design:search-outlined" :size="24" class="text-text-secondary" />
              </template>
            </GrowInput>
            <button
              type="button"
              class="ml-2 hidden shrink-0 text-base text-text-secondary"
              :class="{ '!inline-block': isMobile }"
              @click="handleClose"
            >
              {{ t('layout.search.cancel') }}
            </button>
          </div>

          <div
            v-show="showEmptyState"
            class="flex w-full shrink-0 items-center justify-center px-3.5 py-8 text-sm text-text-secondary"
          >
            {{ t('layout.search.notData') }}
          </div>

          <GrowScrollbar
            v-show="!showEmptyState"
            ref="scrollWrapRef"
            class="layout-search-modal__scrollbar mt-3.5 w-full"
            :max-height="listMaxHeight"
            :style="{ maxHeight: listMaxHeight, '--layout-search-list-max-height': listMaxHeight }"
          >
            <ul class="layout-search-modal__list px-3.5 pb-5">
              <li
                v-for="(item, index) in searchResult"
                :key="item.path"
                :ref="(el) => setItemRef(el as Element | null, index)"
                :data-index="index"
                class="layout-search-modal__item box-border mt-2 flex h-14 w-full cursor-pointer items-center rounded px-3.5 text-sm text-text shadow-[0_1px_3px_0_#d4d9e1]"
                :class="{ 'layout-search-modal__item--active': activeIndex === index }"
                @mouseenter="handleMouseenter"
                @click="handleEnter"
              >
                <div class="flex w-[30px] items-center">
                  <GrowIconify :icon="item.icon || 'mdi:form-select'" :size="20" />
                </div>
                <div class="min-w-0 flex-1 truncate">
                  {{ item.title }}
                </div>
                <div
                  class="layout-search-modal__enter flex w-[30px] items-center opacity-0"
                  :class="{ '!opacity-100': activeIndex === index }"
                >
                  <GrowIconify icon="ant-design:enter-outlined" :size="20" />
                </div>
              </li>
            </ul>
          </GrowScrollbar>

          <LayoutSearchFooter v-if="!isMobile" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.layout-search-fade-enter-active,
.layout-search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.layout-search-fade-enter-from,
.layout-search-fade-leave-to {
  opacity: 0;
}

.layout-search-modal__scrollbar {
  box-sizing: border-box;
  max-height: var(--layout-search-list-max-height);
  overflow: hidden;
}

.layout-search-modal__scrollbar :deep(.el-scrollbar) {
  max-height: var(--layout-search-list-max-height);
}

.layout-search-modal__scrollbar :deep(.el-scrollbar__wrap) {
  max-height: var(--layout-search-list-max-height);
}

.layout-search-modal__scrollbar :deep(.grow-scrollbar) {
  max-height: var(--layout-search-list-max-height);
}

.layout-search-modal__scrollbar :deep(.n-scrollbar) {
  max-height: var(--layout-search-list-max-height);
}

.layout-search-modal__list {
  box-sizing: border-box;
  list-style: none;
  margin: 0;
  padding-left: 14px;
  padding-right: 14px;
}

.layout-search-modal__item {
  width: 100%;
  background-color: var(--component-background-color);
}

.layout-search-modal__item--active {
  color: #fff;
  background-color: var(--primary-color);
}

.layout-search-modal__item--active .layout-search-modal__enter {
  opacity: 1;
}

@media (max-width: 768px) {
  .layout-search-modal__item .layout-search-modal__enter {
    opacity: 0 !important;
  }
}
</style>
