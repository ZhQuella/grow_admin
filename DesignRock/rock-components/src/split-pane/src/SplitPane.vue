<template>
  <div class="rock-split-pane h-full w-full min-h-0 overflow-hidden">
    <Splitpanes :horizontal="rootHorizontal" class="default-theme h-full w-full">
      <Pane
        v-for="(pItem, i) in treeData"
        :key="i"
        :size="pItem.size"
        :min-size="pItem.minSize"
        :max-size="pItem.maxSize"
      >
        <template v-if="pItem?.slotKey">
          <slot :name="pItem.slotKey" v-bind="pItem" />
        </template>
        <template v-if="pItem.child">
          <RockSplitPane :tree-data="pItem.child" :root-horizontal="pItem.horizontal">
            <template v-for="row in getAllChild(pItem)" #[row]="slotData">
              <slot :name="row" v-bind="slotData" />
            </template>
          </RockSplitPane>
        </template>
      </Pane>
    </Splitpanes>
  </div>
</template>

<script lang="ts" setup generic="T extends SplitPaneItem">
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { RockComponent } from '#/RockComponent'
import type { SplitPaneItem } from '../types'
import RockSplitPane from './SplitPane.vue'

defineOptions({
  name: RockComponent.SplitPane,
  customOptions: {
    isPresetComponent: true,
  },
})

interface Props {
  treeData?: T[]
  rootHorizontal?: boolean
}

withDefaults(defineProps<Props>(), {
  treeData: () => [],
  rootHorizontal: false,
})

function getAllChild(item: SplitPaneItem) {
  const queue = [item]
  const result: SplitPaneItem[] = [item]
  while (queue.length) {
    const ele = queue.shift()
    if (ele?.child && Array.isArray(ele.child)) {
      queue.push(...ele.child)
      result.push(...ele.child)
    }
  }
  return result.filter((el) => el.slotKey).map((el) => el.slotKey!)
}
</script>

<style scoped>
.rock-split-pane :deep(.splitpanes__pane) {
  display: flex;
  flex-direction: column;
  background-color: var(--layout-container-background-color);
}

.rock-split-pane :deep(.splitpanes.default-theme .splitpanes__pane) {
  background-color: var(--layout-container-background-color);
}

.rock-split-pane :deep(.splitpanes.default-theme .splitpanes__splitter) {
  background-color: var(--layout-border-color);
}

.rock-split-pane :deep(.splitpanes.default-theme .splitpanes__splitter:before),
.rock-split-pane :deep(.splitpanes.default-theme .splitpanes__splitter:after) {
  background-color: var(--text-color-secondary);
}

.rock-split-pane :deep(.splitpanes__pane > *) {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}
</style>
