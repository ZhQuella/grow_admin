<template>
  <div class="column-list-panel">
    <div class="column-list-panel__toolbar">
      <GrowButton type="primary" @click="state.addTable">新增表</GrowButton>
    </div>
    <GrowScrollbar height="420px">
      <div v-if="!state.groupedTables.length" class="column-list-panel__empty">
        <GrowEmpty description="暂无表定义，点击上方新增" :image-size="80" />
      </div>
      <GrowForm
        v-else
        ref="formRef"
        class="column-list-panel__form"
        :model="state.formModel"
        label-position="top"
      >
        <div class="column-list-panel__tables">
          <div v-for="(table, tableIndex) in state.tables" :key="table.uid" class="column-list-panel__table">
            <div class="column-list-panel__table-head">
              <div class="column-list-panel__fields column-list-panel__fields--table">
                <GrowFormItem
                  label="表名称"
                  required
                  :prop="`tables.${tableIndex}.title`"
                  :rules="state.titleRules"
                >
                  <GrowInput v-model="table.title" maxlength="64" clearable placeholder="如 角色列表" />
                </GrowFormItem>
                <GrowFormItem
                  label="表标识"
                  required
                  :prop="`tables.${tableIndex}.code`"
                  :rules="state.tableCodeRules(table.uid)"
                >
                  <GrowInput v-model="table.code" maxlength="64" clearable placeholder="如 role_list" />
                </GrowFormItem>
                <GrowFormItem label="说明">
                  <GrowInput v-model="table.description" maxlength="200" clearable placeholder="选填" />
                </GrowFormItem>
              </div>
              <div class="column-list-panel__actions">
                <GrowTooltip content="新增列" placement="top">
                  <GrowButton class="column-list-panel__icon-btn" link type="primary" @click="state.addColumn(table)">
                    <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="删除表" placement="top">
                  <GrowButton class="column-list-panel__icon-btn" link type="danger" @click="state.onDeleteTable(table)">
                    <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
              </div>
            </div>

            <div v-if="!columnsOf(table.uid).length" class="column-list-panel__column-empty">
              暂无列，点击右侧加号添加
            </div>
            <div v-else class="column-list-panel__list">
              <div
                v-for="row in columnsOf(table.uid)"
                :key="row.id"
                class="column-list-panel__item"
                :class="{ 'is-disabled': !row.enabled }"
              >
                <div class="column-list-panel__fields column-list-panel__fields--column">
                  <GrowFormItem
                    label="名称"
                    required
                    :prop="`items.${state.itemIndex(row.id)}.title`"
                    :rules="state.titleRules"
                  >
                    <GrowInput v-model="row.title" maxlength="64" clearable placeholder="如 标题" />
                  </GrowFormItem>
                  <GrowFormItem
                    label="标识"
                    required
                    :prop="`items.${state.itemIndex(row.id)}.code`"
                    :rules="state.columnCodeRules(row.id, table.uid)"
                  >
                    <GrowInput v-model="row.code" maxlength="64" clearable placeholder="如 title" />
                  </GrowFormItem>
                  <GrowFormItem
                    label="类型"
                    required
                    :prop="`items.${state.itemIndex(row.id)}.columnType`"
                    :rules="state.columnTypeRules"
                  >
                    <GrowSelect
                      v-model="row.columnType"
                      :options="COLUMN_TYPE_OPTIONS"
                      label="label"
                      value="value"
                      placeholder="请选择"
                    />
                  </GrowFormItem>
                  <GrowFormItem label="说明">
                    <GrowInput v-model="row.description" maxlength="200" clearable placeholder="选填" />
                  </GrowFormItem>
                </div>
                <div class="column-list-panel__item-side">
                  <label class="column-list-panel__switch">
                    <span>启用</span>
                    <GrowSwitch
                      :model-value="row.enabled"
                      size="small"
                      @update:model-value="(value) => state.onToggleEnabled(row, Boolean(value))"
                    />
                  </label>
                  <label class="column-list-panel__switch">
                    <span>列权限</span>
                    <GrowSwitch v-model="row.columnPermission" size="small" />
                  </label>
                  <label class="column-list-panel__switch">
                    <span>表单填写</span>
                    <GrowSwitch v-model="row.formFill" size="small" />
                  </label>
                  <label class="column-list-panel__switch">
                    <span>查询条件</span>
                    <GrowSwitch v-model="row.queryFilter" size="small" />
                  </label>
                  <GrowTooltip content="删除" placement="top">
                    <GrowButton class="column-list-panel__icon-btn" link type="danger" @click="state.onDelete(row)">
                      <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                    </GrowButton>
                  </GrowTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GrowForm>
    </GrowScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import { COLUMN_TYPE_OPTIONS } from '../../../../types/systemMenuColumn'
import type { useMenuColumns } from './useMenuColumns'

defineOptions({ name: 'ColumnListPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuColumns>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)

function columnsOf(tableUid: string) {
  return state.list.filter((item) => item.tableUid === tableUid)
}
</script>

<style scoped>
.column-list-panel__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.column-list-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.column-list-panel__form {
  width: 100%;
}

.column-list-panel__tables {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-list-panel__table {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.column-list-panel__table-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.column-list-panel__fields {
  display: grid;
  flex: 1;
  gap: 10px 12px;
  min-width: 0;
}

.column-list-panel__fields--table {
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 0.8fr);
}

.column-list-panel__fields--column {
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.3fr) minmax(140px, 0.9fr) minmax(0, 0.8fr);
}

.column-list-panel__form :deep(.el-form-item) {
  margin-bottom: 0;
}

.column-list-panel__form :deep(.el-form-item__label) {
  height: auto;
  margin-bottom: 4px;
  padding: 0;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.column-list-panel__form :deep(.el-form-item__error) {
  position: static;
  padding-top: 2px;
}

.column-list-panel__form :deep(.el-select) {
  width: 100%;
}

.column-list-panel__item.is-disabled :deep(.el-form-item__label) {
  color: var(--text-color-secondary);
}

.column-list-panel__column-empty {
  padding: 16px 0 4px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.column-list-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.column-list-panel__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.column-list-panel__item-side,
.column-list-panel__actions {
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 8px;
}

.column-list-panel__actions {
  align-items: center;
  padding-top: 22px;
}

.column-list-panel__switch {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 48px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.column-list-panel__icon-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
</style>
