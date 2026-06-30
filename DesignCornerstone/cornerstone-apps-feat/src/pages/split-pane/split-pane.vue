<template>
  <div class="grid h-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
    <div class="mb-2.5 shrink-0 px-5 py-[50px] text-[17px] text-text">
      分屏组件
    </div>
    <div class="mx-2.5 min-h-0 overflow-hidden">
      <GrowSplitPane :tree-data="treeData" :root-horizontal="false">
        <template #ComA>ComA</template>
        <template #ComB1>ComB1</template>
        <template #ComB2>ComB2</template>
        <template #ComA1>ComA1</template>
        <template #ComA2>ComA2</template>
        <template #ComC="slotProps">
          ComC — {{ slotProps }}
        </template>
        <template #ComB="slotProps">
          {{ slotProps }}
        </template>
      </GrowSplitPane>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SplitPaneItem } from '@grow-admin-rock/components/split-pane'
import { GrowSplitPane } from '@grow-admin-rock/components/split-pane'

defineOptions({
  name: 'SplitPanePage',
})

const treeData: SplitPaneItem[] = [
  {
    horizontal: true,
    size: 65,
    slotKey: '',
    child: [
      {
        size: 50,
        horizontal: true,
        slotKey: 'ComA',
      },
      {
        size: 50,
        horizontal: false,
        child: [
          {
            size: 50,
            horizontal: false,
            slotKey: 'ComA2',
          },
          {
            size: 50,
            horizontal: false,
            slotKey: 'ComA1',
          },
        ],
      },
    ],
  },
  {
    horizontal: false,
    size: 15,
    slotKey: 'ComB',
  },
  {
    horizontal: false,
    size: 20,
    slotKey: 'ComC',
  },
]
</script>
