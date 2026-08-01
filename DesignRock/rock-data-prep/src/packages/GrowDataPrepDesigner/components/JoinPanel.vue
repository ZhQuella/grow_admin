<template>
  <div class="box-border flex h-full min-h-0 flex-col px-3 py-3">
    <p class="m-0 mb-3 text-xs text-text-secondary">
      关联由你配置：可选表与多组字段，多组条件可设「并 / 或」。也可在画布上拖线创建。
    </p>

    <GrowButton
      size="small"
      type="primary"
      class="mb-3 self-start"
      :disabled="sources.length < 2"
      @click="$emit('add')"
    >
      <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
      添加关联
    </GrowButton>

    <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      <div
        v-for="item in joinViews"
        :key="item.id"
        class="rounded border border-solid border-border px-2.5 py-2"
      >
        <div class="mb-1 flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-text">
            {{ item.type.toUpperCase() }} JOIN
            <span v-if="item.conditions.length > 1" class="text-text-secondary">
              · {{ item.logicLabel }}
            </span>
          </span>
          <div class="flex gap-1">
            <GrowButton text size="small" @click="$emit('edit', item.id)">编辑</GrowButton>
            <GrowButton text size="small" type="danger" @click="$emit('remove', item.id)">
              删除
            </GrowButton>
          </div>
        </div>
        <div
          v-for="(cond, index) in item.conditions"
          :key="`${item.id}-${index}`"
          class="text-xs text-text-secondary"
          :class="{ 'mt-0.5': index > 0 }"
        >
          <span v-if="index > 0" class="mr-1 text-[11px] text-text">{{ item.logicLabel }}</span>
          {{ item.leftLabel }}.{{ cond.leftField }} = {{ item.rightLabel }}.{{ cond.rightField }}
        </div>
      </div>
      <div v-if="!joinViews.length" class="py-8 text-center text-xs text-text-secondary">
        {{ sources.length < 2 ? '请先添加至少两张表' : '暂无关联，请添加或画布连线' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataPrepJoin, DataPrepSource } from '../types'

defineOptions({
  name: 'DataPrepJoinPanel',
})

const props = defineProps<{
  joins: DataPrepJoin[]
  sources: DataPrepSource[]
}>()

defineEmits<{
  add: []
  edit: [joinId: string]
  remove: [joinId: string]
}>()

const joinViews = computed(() =>
  props.joins.map((join) => {
    const left = props.sources.find((s) => s.id === join.leftSourceId)
    const right = props.sources.find((s) => s.id === join.rightSourceId)
    const logic = join.onLogic || 'and'
    return {
      id: join.id,
      type: join.type,
      logicLabel: logic === 'or' ? '或' : '并',
      leftLabel: left?.alias || join.leftSourceId,
      rightLabel: right?.alias || join.rightSourceId,
      conditions: (join.on || []).map((cond) => ({
        leftField: cond.leftField || '-',
        rightField: cond.rightField || '-',
      })),
    }
  }),
)
</script>
