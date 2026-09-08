<template>
  <div class="tenant-menu">
    <aside class="tenant-menu__aside">
      <div class="tenant-menu__aside-head">租户</div>
      <GrowInput v-model="tenantKeyword" clearable placeholder="搜索编码 / 名称" />
      <div class="tenant-menu__list">
        <GrowScrollbar height="100%">
          <button
            v-for="item in filteredTenants"
            :key="item.id"
            type="button"
            class="tenant-menu__tenant"
            :class="{ 'is-active': item.id === selectedTenantId }"
            @click="selectTenant(item.id)"
          >
            <span class="tenant-menu__tenant-name">{{ item.tenantName }}</span>
            <span class="tenant-menu__tenant-meta">
              <span>{{ item.tenantCode }}</span>
              <GrowTag :type="tenantStatusTagType(item.status)" size="small">
                {{ tenantStatusLabel(item.status) }}
              </GrowTag>
            </span>
          </button>
          <div v-if="!filteredTenants.length" class="tenant-menu__empty">暂无租户</div>
        </GrowScrollbar>
      </div>
    </aside>

    <div class="tenant-menu__main">
      <GrowRow justify="space-between" class="tenant-menu__toolbar">
        <GrowCol :span="14">
          <div class="tenant-menu__toolbar-left">
            <span v-if="selectedTenant">
              {{ selectedTenant.tenantName }}（{{ selectedTenant.tenantCode }}）
            </span>
            <span v-else>请选择租户</span>
            <span class="tenant-menu__hint">只读，不可增删改</span>
          </div>
        </GrowCol>
        <GrowCol :span="10">
          <div class="tenant-menu__toolbar-options">
            <GrowSearchBar :search="searchList" @search="onSearch" />
            <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
          </div>
        </GrowCol>
      </GrowRow>

      <div class="tenant-menu__table">
        <GrowWatchBox class="tenant-menu__watch">
          <template #default="{ height }">
            <GrowTable
              v-if="height > 0"
              :key="tableKey"
              :data="tableData"
              :height="`${height}px`"
              row-key="name"
              default-expand-all
              :tree-props="{ children: 'children' }"
              :row-class-name="menuRowClassName"
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
                :show-overflow-tooltip="true"
              >
                <template #default="{ row }">
                  <template v-if="col.field === 'title'">
                    <span class="tenant-menu__title">
                      <GrowIconify v-if="row.icon" :icon="row.icon" :size="16" />
                      {{ row.title }}
                      <GrowTag v-if="row.originTitle && row.originTitle !== row.title" size="small" type="info">
                        {{ row.originTitle }}
                      </GrowTag>
                    </span>
                  </template>
                  <template v-else-if="col.field === 'source'">
                    <GrowTag :type="row.source === 'platform' ? 'info' : 'warning'" size="small">
                      {{ menuSourceLabel(row.source) }}
                    </GrowTag>
                  </template>
                  <template v-else-if="col.field === 'componentKey'">
                    {{ row.componentKey || (row.menuType === MenuTypeEnum.MENU ? row.name : '-') }}
                  </template>
                  <template v-else-if="col.field === 'menuType'">
                    <GrowTag :type="menuTypeTagType(row.menuType)" size="small">
                      {{ menuTypeLabel(row.menuType) }}
                    </GrowTag>
                  </template>
                  <template v-else-if="col.field === 'isVisible'">
                    <GrowTag :type="row.isVisible ? 'success' : 'danger'" size="small">
                      {{ row.isVisible ? '显示' : '隐藏' }}
                    </GrowTag>
                  </template>
                  <template v-else-if="col.field === 'enabled'">
                    <GrowTag :type="row.enabled !== false ? 'success' : 'info'" size="small">
                      {{ row.enabled !== false ? '启用' : '停用' }}
                    </GrowTag>
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
                  <template v-else-if="col.field === 'openMode'">
                    {{ openModeLabel(row.openMode) }}
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import type { TenantMenuNode } from '../../types/systemTenantMenu'
import { useTenantMenu } from './use/useTenantMenu'
import {
  menuSourceLabel,
  menuTypeLabel,
  menuTypeTagType,
  openModeLabel,
  tenantStatusLabel,
  tenantStatusTagType,
} from './use/helpers'

defineOptions({
  name: 'TenantMenuPage',
})

function menuRowClassName({ row }: { row: TenantMenuNode }) {
  return row.enabled === false ? 'tenant-menu__row--disabled' : ''
}

const {
  tenantKeyword,
  filteredTenants,
  selectedTenantId,
  selectedTenant,
  tableData,
  tableKey,
  searchList,
  tableColumns,
  leafColumns,
  selectTenant,
  onSearch,
  onColumnsConfirm,
} = useTenantMenu()
</script>

<style scoped>
.tenant-menu {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
  gap: 10px;
}

.tenant-menu__aside {
  display: flex;
  flex-direction: column;
  flex: 0 0 260px;
  width: 260px;
  min-height: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-menu__aside-head {
  margin-bottom: 8px;
  font-weight: 600;
}

.tenant-menu__list {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
}

.tenant-menu__tenant {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin: 0 0 6px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.tenant-menu__tenant:hover,
.tenant-menu__tenant.is-active {
  background: var(--layout-hover-background-color, rgba(0, 0, 0, 0.04));
}

.tenant-menu__tenant.is-active {
  border-color: var(--el-color-primary-light-7, #c6e2ff);
}

.tenant-menu__tenant-name {
  font-weight: 500;
}

.tenant-menu__tenant-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.tenant-menu__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.tenant-menu__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-menu__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tenant-menu__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.tenant-menu__hint,
.tenant-menu__empty {
  color: var(--text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.tenant-menu__empty {
  padding: 24px 0;
  text-align: center;
}

.tenant-menu__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-menu__watch {
  height: 100%;
  min-height: 0;
}

.tenant-menu__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tenant-menu :deep(.tenant-menu__row--disabled) {
  color: var(--text-color-secondary);
}
</style>
