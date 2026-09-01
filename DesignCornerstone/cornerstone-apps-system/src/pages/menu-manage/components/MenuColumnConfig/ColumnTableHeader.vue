<template>
  <div class="column-table-header">
    <div class="column-table-header__title">
      <span>{{ table.title }}</span>
      <span class="column-table-header__meta">{{ table.code }}</span>
      <span class="column-table-header__meta">排序 {{ table.sort }}</span>
    </div>
    <div class="column-table-header__actions" @click.stop>
      <GrowTooltip content="新增列" placement="top">
        <GrowButton class="column-table-header__icon-btn" link type="primary" @click="state.openCreate(table.code)">
          <GrowIconify icon="ant-design:plus-outlined" :size="16" />
        </GrowButton>
      </GrowTooltip>
      <GrowTooltip content="编辑表" placement="top">
        <GrowButton class="column-table-header__icon-btn" link type="primary" @click="state.openEditTable(table)">
          <GrowIconify icon="ant-design:edit-outlined" :size="16" />
        </GrowButton>
      </GrowTooltip>
      <GrowTooltip content="删除表" placement="top">
        <GrowButton class="column-table-header__icon-btn" link type="danger" @click="state.onDeleteTable(table)">
          <GrowIconify icon="ant-design:delete-outlined" :size="16" />
        </GrowButton>
      </GrowTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SystemMenuTable } from '../../../../types/systemMenuColumn'
import type { useMenuColumns } from './useMenuColumns'

defineOptions({ name: 'ColumnTableHeader' })

defineProps<{
  table: SystemMenuTable
  state: ReturnType<typeof useMenuColumns>
}>()
</script>

<style scoped>
.column-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding-right: 8px;
}

.column-table-header__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.column-table-header__meta {
  color: var(--text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.column-table-header__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.column-table-header__icon-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
</style>
