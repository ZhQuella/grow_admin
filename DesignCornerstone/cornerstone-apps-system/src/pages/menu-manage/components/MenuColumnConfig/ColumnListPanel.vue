<template>
  <div>
    <div class="column-list-panel__toolbar">
      <GrowButton type="primary" @click="state.openCreateTable">新增表</GrowButton>
    </div>
    <div v-if="!state.groupedTables.length" class="column-list-panel__empty">
      一个菜单可对应多张表。请先新增表，再为每张表配置列。
    </div>
    <GrowScrollbar v-else height="420px">
      <GrowCollapse
        class="column-list-panel__collapse"
        :model-value="expandedNames"
        :expanded-names="expandedNames"
        @update:model-value="onExpandChange"
        @update:expanded-names="onExpandChange"
      >
        <GrowCollapseItem
          v-for="table in state.groupedTables"
          :key="table.code"
          :name="table.code"
        >
          <template #title>
            <ColumnTableHeader :table="table" :state="rawState" />
          </template>
          <template #header>
            <ColumnTableHeader :table="table" :state="rawState" />
          </template>
          <div v-if="!table.items.length" class="column-list-panel__empty column-list-panel__empty--compact">
            该表暂无列，点击加号添加
          </div>
          <div v-else class="column-list-panel__list">
            <div
              v-for="row in table.items"
              :key="row.id"
              class="column-list-panel__item"
              :class="{ 'is-disabled': !row.enabled }"
            >
              <div class="column-list-panel__item-main">
                <div class="column-list-panel__item-title">{{ row.title }}</div>
                <div class="column-list-panel__item-meta">
                  {{ row.code }} · {{ columnTypeLabel(row.columnType) }} · 排序 {{ row.sort }}
                </div>
                <div class="column-list-panel__flags">
                  <GrowTag v-if="row.columnPermission" size="small">列权限</GrowTag>
                  <GrowTag v-if="row.formFill" type="success" size="small">表单填写</GrowTag>
                  <GrowTag v-if="row.queryFilter" type="warning" size="small">查询条件</GrowTag>
                </div>
                <div v-if="row.description" class="column-list-panel__item-description">
                  {{ row.description }}
                </div>
              </div>
              <div class="column-list-panel__actions">
                <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
                  <span class="column-list-panel__switch">
                    <GrowSwitch
                      :model-value="row.enabled"
                      size="small"
                      @update:model-value="(value) => state.onToggleEnabled(row, Boolean(value))"
                    />
                  </span>
                </GrowTooltip>
                <GrowTooltip content="编辑" placement="top">
                  <GrowButton class="column-list-panel__icon-btn" link type="primary" @click="state.openEdit(row)">
                    <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="删除" placement="top">
                  <GrowButton class="column-list-panel__icon-btn" link type="danger" @click="state.onDelete(row)">
                    <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
              </div>
            </div>
          </div>
        </GrowCollapseItem>
      </GrowCollapse>
    </GrowScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { proxyRefs, ref, watch } from 'vue'
import { columnTypeLabel } from '../../../../types/systemMenuColumn'
import ColumnTableHeader from './ColumnTableHeader.vue'
import type { useMenuColumns } from './useMenuColumns'

defineOptions({ name: 'ColumnListPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuColumns>
}>()

const rawState = props.state
const state = proxyRefs(props.state)
const expandedNames = ref<string[]>([])

watch(
  () => state.groupedTables.map((item) => item.code).join('\0'),
  (next, prev) => {
    const codes = next ? next.split('\0') : []
    const codeSet = new Set(codes)
    const kept = expandedNames.value.filter((code) => codeSet.has(code))
    const prevSet = new Set((prev || '').split('\0').filter(Boolean))
    const added = codes.filter((code) => !prevSet.has(code))
    expandedNames.value = [...new Set([...kept, ...added])]
  },
  { immediate: true },
)

function onExpandChange(value: string | string[]) {
  expandedNames.value = Array.isArray(value) ? value.map(String) : (value ? [String(value)] : [])
}
</script>

<style scoped>
.column-list-panel__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.column-list-panel__empty {
  padding: 48px 16px;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.column-list-panel__empty--compact {
  padding: 16px 8px;
}

.column-list-panel__collapse :deep(.el-collapse),
.column-list-panel__collapse :deep(.el-collapse-item__wrap),
.column-list-panel__collapse :deep(.el-collapse-item__header) {
  --el-collapse-border-color: var(--layout-border-color, var(--border-color));
  border-color: var(--layout-border-color, var(--border-color));
  background-color: transparent;
}

.column-list-panel__collapse :deep(.el-collapse-item__header) {
  height: auto;
  min-height: 40px;
  padding: 8px 12px;
  line-height: 1.4;
}

.column-list-panel__collapse :deep(.el-collapse-item__title) {
  flex: 1 1 auto;
  overflow: hidden;
}

.column-list-panel__collapse :deep(.el-collapse-item__content) {
  padding-bottom: 12px;
}

.column-list-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-list-panel__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.column-list-panel__item.is-disabled .column-list-panel__item-title {
  color: var(--text-color-secondary);
}

.column-list-panel__item-main {
  flex: 1;
  min-width: 0;
}

.column-list-panel__item-title {
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-list-panel__item-meta,
.column-list-panel__item-description {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-list-panel__flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
}

.column-list-panel__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.column-list-panel__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.column-list-panel__icon-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
</style>
