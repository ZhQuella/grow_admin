<template>
  <div class="menu-manage">
    <GrowRow justify="space-between" class="menu-manage__toolbar">
      <GrowCol :span="14">
        <div class="menu-manage__toolbar-left">
          <GrowButton type="primary" @click="menuForm.openCreate()">新增</GrowButton>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="menu-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="menu-manage__table">
      <GrowWatchBox class="menu-manage__watch">
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
              :show-overflow-tooltip="col.field !== 'actions'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'title'">
                  <span class="menu-manage__title">
                    <GrowIconify v-if="row.icon" :icon="row.icon" :size="16" />
                    {{ row.title }}
                  </span>
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
                  <GrowSwitch
                    :model-value="row.enabled !== false"
                    size="small"
                    :loading="statusSubmittingName === row.name"
                    @update:model-value="(value) => menuActions.onToggleEnabled(row, Boolean(value))"
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
                  <div class="menu-manage__actions">
                    <GrowTooltip content="新增子级" placement="top">
                      <GrowButton link type="primary" @click="menuForm.openCreateChild(row)">
                        <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton link type="primary" @click="menuForm.openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="row.menuType === MenuTypeEnum.MENU" content="功能" placement="top">
                      <GrowButton link type="primary" @click="functionConfig.open(row)">
                        <GrowIconify icon="ant-design:control-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="row.menuType === MenuTypeEnum.MENU" content="表定义" placement="top">
                      <GrowButton link type="primary" @click="columnConfig.open(row)">
                        <GrowIconify icon="ant-design:table-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="删除" placement="top">
                      <GrowButton
                        link
                        type="danger"
                        :loading="deleteLoading && deleteTarget?.name === row.name"
                        @click="menuActions.onDelete(row)"
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

    <MenuManageDialog
      :menu-form="menuForm"
      :menu-actions="menuActions"
      :function-config="functionConfig"
      :column-config="columnConfig"
    />
  </div>
</template>

<script lang="ts" setup>
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuNode } from '../../types/systemMenu'
import MenuManageDialog from './components/MenuManageDialog.vue'
import { useMenuManage } from './use/useMenuManage'

defineOptions({ name: 'MenuManagePage' })

function menuRowClassName({ row }: { row: SystemMenuNode }) {
  return row.enabled === false ? 'menu-manage__row--disabled' : ''
}

const {
  tableData,
  tableKey,
  searchList,
  tableColumns,
  leafColumns,
  onSearch,
  onColumnsConfirm,
  menuForm,
  menuActions,
  functionConfig,
  columnConfig,
  menuTypeLabel,
  menuTypeTagType,
} = useMenuManage()

const {
  deleteLoading,
  deleteTarget,
  statusSubmittingName,
} = menuActions
</script>

<style scoped>
.menu-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.menu-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.menu-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.menu-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.menu-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.menu-manage__watch {
  height: 100%;
  min-height: 0;
}

.menu-manage__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.menu-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.menu-manage :deep(.menu-manage__row--disabled) {
  color: var(--text-color-secondary);
}
</style>
