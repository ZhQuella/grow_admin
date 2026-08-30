<template>
  <div>
    <div class="function-list-panel__toolbar">
      <GrowButton type="primary" @click="state.openCreate">新增</GrowButton>
    </div>
    <div v-if="!state.list.length" class="function-list-panel__empty">
      暂无功能，点击上方新增
    </div>
    <GrowScrollbar v-else height="360px">
      <div class="function-list-panel__list">
        <div
          v-for="row in state.list"
          :key="row.id"
          class="function-list-panel__item"
          :class="{ 'is-disabled': !row.enabled }"
        >
          <div class="function-list-panel__item-main">
            <div class="function-list-panel__item-title">{{ row.title }}</div>
            <div class="function-list-panel__item-meta">
              {{ row.code }} · {{ row.group || '未分组' }} · 排序 {{ row.sort }}
            </div>
            <div v-if="row.description" class="function-list-panel__item-description">
              {{ row.description }}
            </div>
          </div>
          <div class="function-list-panel__actions">
            <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
              <span class="function-list-panel__switch">
                <GrowSwitch
                  :model-value="row.enabled"
                  size="small"
                  @update:model-value="(value) => state.onToggleEnabled(row, Boolean(value))"
                />
              </span>
            </GrowTooltip>
            <GrowTooltip content="编辑" placement="top">
              <GrowButton class="function-list-panel__icon-btn" link type="primary" @click="state.openEdit(row)">
                <GrowIconify icon="ant-design:edit-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
            <GrowTooltip content="删除" placement="top">
              <GrowButton class="function-list-panel__icon-btn" link type="danger" @click="state.onDelete(row)">
                <GrowIconify icon="ant-design:delete-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </div>
        </div>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import type { useMenuFunctions } from './useMenuFunctions'

defineOptions({ name: 'FunctionListPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuFunctions>
}>()

const state = proxyRefs(props.state)
</script>

<style scoped>
.function-list-panel__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.function-list-panel__empty {
  padding: 48px 16px;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.function-list-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-list-panel__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.function-list-panel__item.is-disabled .function-list-panel__item-title {
  color: var(--text-color-secondary);
}

.function-list-panel__item-main {
  flex: 1;
  min-width: 0;
}

.function-list-panel__item-title {
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.function-list-panel__item-meta,
.function-list-panel__item-description {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.function-list-panel__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.function-list-panel__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.function-list-panel__icon-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
</style>
