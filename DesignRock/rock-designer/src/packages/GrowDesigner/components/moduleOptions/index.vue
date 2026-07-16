<template>
  <div class="module-options">
    <div class="module-options__tabs">
      <GrowTabs v-model="activeName" @tab-change="onTableChange">
        <GrowTabPane label="基础组件" name="BaseComponent" />
        <GrowTabPane label="业务组件" name="BusinessComponent" />
        <GrowTabPane label="原子组件" name="AtomicComponent" />
      </GrowTabs>
    </div>
    <GrowScrollbar class="module-options__scroll">
      <div class="module-options__content">
        <section
          v-for="([groupKey, groupInfo], index) in drageMap"
          :key="groupKey"
          :class="index > 0 ? 'mt-3' : ''"
        >
          <div
            class="my-2 mb-2.5 rounded px-2.5 py-2 text-xs font-semibold leading-[1.4] text-text bg-layout"
          >
            {{ groupInfo.title }}
          </div>
          <draggable
            v-model="groupInfo.group"
            :item-key="paletteItemKey"
            :group="paletteGroup"
            :clone="clonePaletteItem"
            tag="div"
            :animation="180"
            :sort="false"
            class="module-options__grid"
            @start="onDragStart($event, groupInfo.group)"
            @end="onDragEnd($event, groupInfo.group)"
          >
            <template #item="{ element }">
              <div
                class="module-options__item"
                :class="{ 'is-unsupported': element.unsupported }"
                :title="element.unsupported ? '组件暂未接入，仅占位' : element.elName"
              >
                <div class="module-options__item-icon">
                  <GrowIconify :icon="resolveModuleIcon(element.elIcon)" :size="24" />
                </div>
                <p class="module-options__item-name">{{ element.elName }}</p>
              </div>
            </template>
          </draggable>
        </section>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { useInit } from './use/useInit'
import { nanoid } from 'nanoid'
import { resolveModuleIcon } from '../../static/iconMap'

defineOptions({ name: 'moduleOptions' })

defineEmits(['dragstart', 'dragend', 'start'])

const { drageMap, activeName, onTableChange } = useInit()

const paletteGroup = {
  name: 'draggable-group',
  pull: 'clone' as const,
  put: false,
}

const clonePaletteItem = (el: Record<string, any>) => ({
  ...el,
  uuid: nanoid(),
})

const paletteItemKey = (el: Record<string, any>) => `${el.elTagName}__${el.elName}`

const onDragStart = (event: { oldIndex?: number }, list: any[]) => {
  if (event.oldIndex == null) return
  list[event.oldIndex].uuid = nanoid()
}

const onDragEnd = (event: { oldIndex?: number }, list: any[]) => {
  if (event.oldIndex == null) return
  Reflect.deleteProperty(list[event.oldIndex], 'uuid')
}
</script>

<style lang="scss" scoped>
.module-options {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.module-options__tabs {
  flex: 0 0 auto;
  padding: 0 5px;
}

.module-options__scroll {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
}

.module-options__content {
  padding: 0 5px 12px;
}

.module-options__grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -2px;
}

.module-options__item {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 33.3333%;
  height: 90px;
  padding: 10px 4px;
  cursor: grab;
  user-select: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-primary-a08);
  }

  &:active {
    cursor: grabbing;
  }

  &.is-unsupported {
    opacity: 0.55;
  }
}

.module-options__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
}

.module-options__item-name {
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.2;
  color: var(--text-color-secondary);
  text-align: center;
}

:deep(.module-options__tabs .el-tabs),
:deep(.module-options__tabs .n-tabs) {
  width: 100%;
}

:deep(.module-options__tabs .el-tabs__header),
:deep(.module-options__tabs .n-tabs-nav) {
  margin: 0;
}

:deep(.module-options__scroll.el-scrollbar),
:deep(.module-options__scroll.n-scrollbar),
:deep(.module-options__scroll.grow-scrollbar) {
  height: 100%;
}

:deep(.module-options__scroll .el-scrollbar__wrap),
:deep(.module-options__scroll .n-scrollbar-container) {
  max-height: 100%;
}
</style>
