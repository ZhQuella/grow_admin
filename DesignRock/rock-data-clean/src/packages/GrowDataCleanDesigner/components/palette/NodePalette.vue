<template>
  <aside class="clean-palette box-border flex h-full min-h-0 w-[240px] shrink-0 flex-col border-r border-solid border-border bg-component">
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
            class="clean-palette__group-btn"
            @click="toggle(group.category)"
          >
            <span
              class="clean-palette__dot"
              :style="{ background: `var(${categoryCssVar(group.category)})` }"
            />
            <span class="clean-palette__group-label">{{ group.label }}</span>
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
              class="clean-palette__item"
              :class="{ 'is-disabled': item.enabled === false }"
              draggable="true"
              :title="item.description"
              @dragstart="onDragStart($event, item.type)"
            >
              <GrowIconify
                :icon="item.icon"
                :size="14"
                class="shrink-0"
                :style="{ color: `var(${categoryCssVar(item.category)})` }"
              />
              <span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {{ item.label }}
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
import type { CleanNodeCategory, CleanNodeType } from '../../types'

defineOptions({
  name: 'CleanNodePalette',
})

const groups = PALETTE_GROUPS

const collapsed = reactive<Record<CleanNodeCategory, boolean>>({
  source: false,
  clean: false,
  merge: false,
  agg: false,
  output: false,
})

function categoryCssVar(category: CleanNodeCategory) {
  return CATEGORY_META[category].cssVar
}

function toggle(category: CleanNodeCategory) {
  collapsed[category] = !collapsed[category]
}

function onDragStart(event: DragEvent, type: CleanNodeType) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/grow-data-clean-node', type)
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.clean-palette__group-btn {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  padding: 6px 6px;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 4px;
}

.clean-palette__group-btn:hover {
  background: color-mix(in srgb, var(--text-color) 6%, transparent);
}

.clean-palette__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.clean-palette__group-label {
  font-size: 12px;
  font-weight: 600;
}

.clean-palette__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid var(--layout-border-color);
  background: var(--layout-container-background-color);
  color: var(--text-color);
  font-size: 12px;
  cursor: grab;
}

.clean-palette__item:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.clean-palette__item:active {
  cursor: grabbing;
}

.clean-palette__item.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}
</style>
