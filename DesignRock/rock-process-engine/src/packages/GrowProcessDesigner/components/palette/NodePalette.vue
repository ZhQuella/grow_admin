<template>
  <aside
    class="process-palette box-border flex h-full min-h-0 w-[240px] shrink-0 flex-col border-r border-solid border-border bg-component"
  >
    <div
      class="box-border flex h-10 shrink-0 items-center border-b border-solid border-border px-3"
    >
      <h4 class="m-0 text-[13px] font-semibold text-text">组件库</h4>
    </div>
    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-2 py-2">
        <div v-for="group in groups" :key="group.category" class="mb-2">
          <button
            type="button"
            class="process-palette__group-btn"
            @click="toggle(group.category)"
          >
            <span
              class="process-palette__dot"
              :style="{ background: `var(${categoryCssVar(group.category)})` }"
            />
            <span class="process-palette__group-label">{{ group.label }}</span>
            <GrowIconify
              :icon="collapsed[group.category] ? 'carbon:chevron-down' : 'carbon:chevron-up'"
              :size="14"
              class="ml-auto text-text-secondary"
            />
          </button>
          <div v-show="!collapsed[group.category]" class="mt-1 flex flex-col gap-1">
            <div
              v-for="item in group.items"
              :key="item.type"
              class="process-palette__item"
              :class="{ 'is-disabled': item.enabled === false }"
              draggable="true"
              :title="item.description"
              @dragstart="onDragStart($event, item.type)"
            >
              <span class="process-palette__item-main">
                <GrowIconify
                  :icon="item.icon"
                  :size="14"
                  class="process-palette__item-icon"
                  :style="{ color: `var(${categoryCssVar(item.category)})` }"
                />
                <span class="process-palette__item-label">{{ item.label }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GrowScrollbar>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { CATEGORY_META, PALETTE_GROUPS } from '../../static/nodeCatalog'
import type { ProcessNodeCategory, ProcessNodeType } from '../../types'

defineOptions({
  name: 'ProcessNodePalette',
})

const groups = PALETTE_GROUPS

const collapsed = reactive<Record<ProcessNodeCategory, boolean>>({
  human: false,
  event: false,
  system: false,
  state: false,
  decision: false,
  branch: false,
})

function categoryCssVar(category: ProcessNodeCategory) {
  return CATEGORY_META[category].cssVar
}

function toggle(category: ProcessNodeCategory) {
  collapsed[category] = !collapsed[category]
}

function onDragStart(event: DragEvent, type: ProcessNodeType) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/grow-process-engine-node', type)
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.process-palette__group-btn {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 6px 6px;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
}

.process-palette__group-btn:hover {
  background: color-mix(in srgb, var(--text-color) 6%, transparent);
}

.process-palette__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.process-palette__group-label {
  font-size: 12px;
  font-weight: 600;
}

.process-palette__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color);
  color: var(--text-color);
  font-size: 12px;
  cursor: grab;
  text-align: left;
}

.process-palette__item-main {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
}

.process-palette__item-icon {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
}

.process-palette__item :deep(.grow-iconify) {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
}

.process-palette__item :deep(.grow-iconify svg) {
  width: 14px;
  height: 14px;
}

.process-palette__item-label {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.process-palette__item:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.process-palette__item:active {
  cursor: grabbing;
}

.process-palette__item.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}
</style>
