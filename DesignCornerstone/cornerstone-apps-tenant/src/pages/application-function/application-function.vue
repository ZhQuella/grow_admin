<template>
  <div class="application-function">
    <GrowRow justify="space-between" class="application-function__toolbar">
      <GrowCol :span="14">
        <div class="application-function__toolbar-left">
          <GrowButton type="primary" @click="functionForm.openCreate()">新增</GrowButton>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="application-function__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="application-function__table">
      <GrowWatchBox class="application-function__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :key="tableKey"
            :data="tableData"
            :height="`${height}px`"
            row-key="name"
            :row-class-name="functionRowClassName"
            border
          >
            <GrowTableColumn
              v-for="col in leafColumns"
              :key="String(col.field)"
              :prop="String(col.field)"
              :label="col.title"
              :width="col.width"
              :min-width="col.minWidth || (col.width ? undefined : 120)"
              :fixed="col.fixed"
              :show-overflow-tooltip="col.field !== 'actions'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'title'">
                  <span class="application-function__title">
                    <GrowIconify v-if="row.icon" :icon="row.icon" :size="16" />
                    {{ row.title }}
                  </span>
                </template>
                <template v-else-if="col.field === 'isVisible'">
                  <GrowTag :type="row.isVisible ? 'success' : 'danger'" size="small">
                    {{ row.isVisible ? '显示' : '隐藏' }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowSwitch
                    :model-value="row.enabled !== false"
                    size="small"
                    :loading="statusSubmittingName === row.name"
                    @update:model-value="(value) => functionActions.onToggleEnabled(row, Boolean(value))"
                  />
                </template>
                <template v-else-if="col.field === 'isKeepAlive'">
                  {{ row.isKeepAlive ? '是' : '否' }}
                </template>
                <template v-else-if="col.field === 'affix'">
                  {{ row.affix ? '是' : '否' }}
                </template>
                <template v-else-if="col.field === 'defaultShow'">
                  {{ row.defaultShow ? '是' : '否' }}
                </template>
                <template v-else-if="col.field === 'isExternalPage'">
                  {{ row.isExternalPage ? '是' : '否' }}
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="application-function__actions">
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton link type="primary" @click="functionForm.openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="功能" placement="top">
                      <GrowButton link type="primary" @click="functionConfig.open(row)">
                        <GrowIconify icon="ant-design:control-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="表定义" placement="top">
                      <GrowButton link type="primary" @click="columnConfig.open(row)">
                        <GrowIconify icon="ant-design:table-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="删除" placement="top">
                      <GrowButton
                        link
                        type="danger"
                        :loading="deleteLoading && deleteTarget?.name === row.name"
                        @click="functionActions.onDelete(row)"
                      >
                        <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>
                  {{ row[col.field] ?? '-' }}
                </template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <ApplicationFunctionDialog
      :function-form="functionForm"
      :function-actions="functionActions"
      :function-config="functionConfig"
      :column-config="columnConfig"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ApplicationFunctionNode } from '../../types/applicationFunction'
import ApplicationFunctionDialog from './components/ApplicationFunctionDialog.vue'
import { useApplicationFunctionManage } from './use/useApplicationFunctionManage'

defineOptions({ name: 'ApplicationFunctionPage' })

function functionRowClassName({ row }: { row: ApplicationFunctionNode }) {
  return row.enabled === false ? 'application-function__row--disabled' : ''
}

const {
  tableData,
  tableKey,
  searchList,
  tableColumns,
  leafColumns,
  onSearch,
  onColumnsConfirm,
  functionForm,
  functionActions,
  functionConfig,
  columnConfig,
} = useApplicationFunctionManage()

const {
  deleteLoading,
  deleteTarget,
  statusSubmittingName,
} = functionActions
</script>

<style scoped>
.application-function {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.application-function__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.application-function__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.application-function__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.application-function__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.application-function__watch {
  height: 100%;
  min-height: 0;
}

.application-function__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.application-function__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.application-function :deep(.application-function__row--disabled) {
  color: var(--text-color-secondary);
}
</style>
