<template>
  <GrowDialog
    v-model="listVisible"
    :title="menu ? `表定义 · ${menu.title}` : '表定义'"
    width="640px"
    append-to-body
    destroy-on-close
  >
    <div class="menu-column-config__toolbar">
      <GrowButton type="primary" @click="openCreateTable">新增表</GrowButton>
    </div>
    <div v-if="!groupedTables.length" class="menu-column-config__empty">
      一个菜单可对应多张表。请先新增表，再为每张表配置列。
    </div>
    <GrowScrollbar v-else height="420px">
      <GrowCollapse
        class="menu-column-config__collapse"
        :model-value="expandedNames"
        :expanded-names="expandedNames"
        @update:model-value="onExpandChange"
        @update:expanded-names="onExpandChange"
      >
        <GrowCollapseItem
          v-for="table in groupedTables"
          :key="table.code"
          :name="table.code"
        >
          <template #title>
            <div class="menu-column-config__group-head">
              <div class="menu-column-config__group-title">
                <span>{{ table.title }}</span>
                <span class="menu-column-config__group-code">{{ table.code }}</span>
              </div>
              <div class="menu-column-config__actions" @click.stop>
                <GrowTooltip content="新增列" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="primary" @click="openCreate(table.code)">
                    <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="编辑表" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="primary" @click="openEditTable(table)">
                    <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="删除表" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="danger" @click="onDeleteTable(table)">
                    <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
              </div>
            </div>
          </template>
          <template #header>
            <div class="menu-column-config__group-head">
              <div class="menu-column-config__group-title">
                <span>{{ table.title }}</span>
                <span class="menu-column-config__group-code">{{ table.code }}</span>
              </div>
              <div class="menu-column-config__actions" @click.stop>
                <GrowTooltip content="新增列" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="primary" @click="openCreate(table.code)">
                    <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="编辑表" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="primary" @click="openEditTable(table)">
                    <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="删除表" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="danger" @click="onDeleteTable(table)">
                    <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
              </div>
            </div>
          </template>
          <div v-if="!table.items.length" class="menu-column-config__empty menu-column-config__empty--compact">
            该表暂无列，点击加号添加
          </div>
          <div v-else class="menu-column-config__list">
            <div
              v-for="row in table.items"
              :key="row.id"
              class="menu-column-config__item"
              :class="{ 'is-disabled': !row.enabled }"
            >
              <div class="menu-column-config__item-main">
                <div class="menu-column-config__item-title">
                  <span>{{ row.title }}</span>
                </div>
                <div class="menu-column-config__item-meta">
                  {{ row.code }} · {{ columnTypeLabel(row.columnType) }}
                </div>
              </div>
              <div class="menu-column-config__actions">
                <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
                  <span class="menu-column-config__switch">
                    <GrowSwitch
                      :model-value="row.enabled"
                      size="small"
                      @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
                    />
                  </span>
                </GrowTooltip>
                <GrowTooltip content="编辑" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="primary" @click="openEdit(row)">
                    <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
                <GrowTooltip content="删除" placement="top">
                  <GrowButton class="menu-column-config__icon-btn" link type="danger" @click="onDelete(row)">
                    <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                  </GrowButton>
                </GrowTooltip>
              </div>
            </div>
          </div>
        </GrowCollapseItem>
      </GrowCollapse>
    </GrowScrollbar>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="closeList">取消</GrowButton>
        <GrowButton type="primary" :loading="listSaving" @click="saveList">
          确定
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog
    v-model="tableFormVisible"
    :title="tableFormMode === 'create' ? '新增表' : '编辑表'"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <GrowForm
      ref="tableFormRef"
      class="menu-column-config__form"
      :model="tableFormModel"
      :rules="tableFormRules"
      label-width="72px"
    >
      <GrowFormItem label="名称" prop="title">
        <GrowInput
          v-model="tableFormModel.title"
          maxlength="64"
          clearable
          placeholder="如 角色列表、绑定人员"
        />
      </GrowFormItem>
      <GrowFormItem label="标识" prop="code">
        <GrowInput
          v-model="tableFormModel.code"
          maxlength="64"
          clearable
          :placeholder="MENU_COLUMN_CODE_MESSAGE"
        />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="tableFormVisible = false">取消</GrowButton>
        <GrowButton type="primary" @click="submitTableForm">确定</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog
    v-model="formVisible"
    :title="formMode === 'create' ? `新增列 · ${currentTableTitle}` : `编辑列 · ${currentTableTitle}`"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <GrowForm
      ref="formRef"
      class="menu-column-config__form"
      :model="formModel"
      :rules="formRules"
      label-width="72px"
    >
      <GrowFormItem label="名称" prop="title">
        <GrowInput
          v-model="formModel.title"
          maxlength="64"
          clearable
          placeholder="如 标题、编码"
        />
      </GrowFormItem>
      <GrowFormItem label="标识" prop="code">
        <GrowInput
          v-model="formModel.code"
          maxlength="64"
          clearable
          :placeholder="MENU_COLUMN_CODE_MESSAGE"
        />
      </GrowFormItem>
      <GrowFormItem label="类型" prop="columnType">
        <GrowSelect
          v-model="formModel.columnType"
          :options="COLUMN_TYPE_OPTIONS"
          label="label"
          value="value"
          placeholder="请选择"
        />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="formVisible = false">取消</GrowButton>
        <GrowButton type="primary" @click="submitForm">确定</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { COLUMN_TYPE_OPTIONS, MENU_COLUMN_CODE_MESSAGE, columnTypeLabel } from '../../../../types/systemMenuColumn'
import { useMenuColumns } from './useMenuColumns'

defineOptions({
  name: 'MenuColumnConfig',
})

const {
  menu,
  groupedTables,
  listVisible,
  listSaving,
  formVisible,
  formMode,
  formRef,
  formModel,
  formRules,
  currentTableTitle,
  tableFormVisible,
  tableFormMode,
  tableFormRef,
  tableFormModel,
  tableFormRules,
  open,
  closeList,
  openCreateTable,
  openEditTable,
  submitTableForm,
  onDeleteTable,
  openCreate,
  openEdit,
  onToggleEnabled,
  submitForm,
  saveList,
  onDelete,
} = useMenuColumns()

const expandedNames = ref<string[]>([])

watch(
  () => groupedTables.value.map((item) => item.code).join('\0'),
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

defineExpose({ open })
</script>

<style scoped>
.menu-column-config__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.menu-column-config__empty {
  padding: 48px 16px;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.menu-column-config__empty--compact {
  padding: 16px 8px;
}

.menu-column-config__collapse :deep(.el-collapse),
.menu-column-config__collapse :deep(.el-collapse-item__wrap),
.menu-column-config__collapse :deep(.el-collapse-item__header) {
  --el-collapse-border-color: var(--layout-border-color, var(--border-color));
  border-color: var(--layout-border-color, var(--border-color));
  background-color: transparent;
}

.menu-column-config__collapse :deep(.el-collapse-item__header) {
  height: auto;
  min-height: 40px;
  padding: 8px 12px;
  line-height: 1.4;
}

.menu-column-config__collapse :deep(.el-collapse-item__title) {
  flex: 1 1 auto;
  overflow: hidden;
}

.menu-column-config__collapse :deep(.el-collapse-item__content) {
  padding-bottom: 12px;
}

.menu-column-config__collapse :deep(.n-collapse-item__header-main) {
  flex: 1 1 auto;
  min-width: 0;
}

.menu-column-config__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding-right: 8px;
}

.menu-column-config__group-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.menu-column-config__group-code {
  color: var(--text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.menu-column-config__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-column-config__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
  transition: background 150ms ease;
}

.menu-column-config__item:hover {
  background: var(--header-action-hover-bg-color, var(--layout-color));
}

.menu-column-config__item.is-disabled .menu-column-config__item-title span:first-child {
  color: var(--text-color-secondary);
}

.menu-column-config__item-main {
  flex: 1;
  min-width: 0;
}

.menu-column-config__item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
}

.menu-column-config__item-title span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-column-config__item-meta {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-column-config__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.menu-column-config__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.menu-column-config__switch :deep(.el-switch),
.menu-column-config__switch :deep(.n-switch) {
  margin: 0;
}

.menu-column-config__icon-btn,
.menu-column-config__actions :deep(.el-button.is-link),
.menu-column-config__actions :deep(.n-button) {
  box-sizing: border-box;
  margin: 0;
}

.menu-column-config__icon-btn {
  width: 28px;
  height: 28px;
  padding: 0;
}
</style>
