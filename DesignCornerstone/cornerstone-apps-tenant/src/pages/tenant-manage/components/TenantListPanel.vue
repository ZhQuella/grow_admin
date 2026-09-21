<template>
  <section class="tenant-list-panel">
    <GrowRow justify="space-between" class="tenant-list-panel__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="emit('create')">新增</GrowButton>
      </GrowCol>
      <GrowCol :span="10">
        <div class="tenant-list-panel__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="tenant-list-panel__table">
      <GrowWatchBox class="tenant-list-panel__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            row-key="id"
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'status'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'tenantCode'">
                  <span class="tenant-list-panel__code">
                    {{ row.tenantCode }}
                    <GrowTag v-if="row.builtIn" size="small" type="info">内置</GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'status'">
                  <GrowTag :type="tenantStatusTagType(row.status)" size="small">
                    {{ tenantStatusLabel(row.status) }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'shortName'">{{ row.shortName || '-' }}</template>
                <template v-else-if="col.field === 'contactName'">{{ row.contactName || '-' }}</template>
                <template v-else-if="col.field === 'contactMobile'">{{ row.contactMobile || '-' }}</template>
                <template v-else-if="col.field === 'servicePeriod'">{{ formatServicePeriod(row) }}</template>
                <template v-else-if="col.field === 'lastLoginAt'">{{ formatTime(row.lastLoginAt) }}</template>
                <template v-else-if="col.field === 'createdAt'">{{ formatTime(row.createdAt) }}</template>
                <template v-else-if="col.field === 'updatedAt'">{{ formatTime(row.updatedAt) }}</template>
                <template v-else-if="col.field === 'actions'">
                  <div class="tenant-list-panel__actions">
                    <GrowTooltip v-if="hasAction(row, 'view')" content="查看" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('view', row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'edit')" content="编辑" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('edit', row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'grant')" content="授权" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('grant', row)">
                        <GrowIconify icon="ant-design:safety-certificate-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'trial')" content="试用" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('trial', row)">
                        <GrowIconify icon="ant-design:experiment-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'activate')" content="开通" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('activate', row)">
                        <GrowIconify icon="ant-design:check-circle-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'disable')" content="停用" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="warning" @click="emitAction('disable', row)">
                        <GrowIconify icon="ant-design:stop-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'code')" content="改编码" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" @click="emitAction('code', row)">
                        <GrowIconify icon="ant-design:font-size-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'clear')" content="清空" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="danger" @click="emitAction('clear', row)">
                        <GrowIconify icon="ant-design:clear-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'delete')" content="删除" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="danger" @click="emitAction('delete', row)">
                        <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'history')" content="变更历史" placement="top">
                      <GrowButton class="tenant-list-panel__icon-btn" link type="primary" aria-label="变更历史" @click="emitAction('history', row)">
                        <GrowIconify icon="ant-design:history-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>{{ row[col.field] ?? '-' }}</template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="tenant-list-panel__pager">
      <GrowPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="loadList"
        @size-change="onSizeChange"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import type { SystemTenantListItem, TenantActionKey } from '../../../types/systemTenant'
import {
  availableTenantActions,
  formatServicePeriod,
  formatTime,
  tenantStatusLabel,
  tenantStatusTagType,
} from '../use/helpers'
import { useTenantTable } from '../use/useTenantTable'

const emit = defineEmits<{
  create: []
  action: [action: TenantActionKey, row: SystemTenantListItem]
}>()

const {
  tableData,
  total,
  page,
  pageSize,
  searchList,
  tableColumns,
  leafColumns,
  loadList,
  onSearch,
  onColumnsConfirm,
  onSizeChange,
} = useTenantTable()

function hasAction(row: SystemTenantListItem, action: TenantActionKey) {
  return availableTenantActions(row).includes(action)
}

function emitAction(action: TenantActionKey, row: SystemTenantListItem) {
  emit('action', action, row)
}

onMounted(() => {
  void loadList()
})

defineExpose({ reload: loadList })
</script>

<style scoped>
.tenant-list-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.tenant-list-panel__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-list-panel__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.tenant-list-panel__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-list-panel__watch {
  height: 100%;
  min-height: 0;
}

.tenant-list-panel__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.tenant-list-panel__code,
.tenant-list-panel__actions {
  display: inline-flex;
  align-items: center;
}

.tenant-list-panel__code {
  gap: 6px;
}

.tenant-list-panel__actions {
  flex-wrap: nowrap;
  gap: 10px;
}

.tenant-list-panel__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: auto;
  height: auto;
  margin: 0;
  padding: 2px;
  line-height: 1;
}

.tenant-list-panel__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}
</style>
