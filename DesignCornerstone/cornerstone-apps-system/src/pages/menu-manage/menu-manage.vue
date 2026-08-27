<template>
  <div class="menu-manage">
    <GrowRow justify="space-between" class="menu-manage__toolbar">
      <GrowCol :span="14">
        <div class="menu-manage__toolbar-left">
          <GrowSpace>
            <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
          </GrowSpace>
          <span class="menu-manage__hint">增删改仅作用于本页，不会同步到左侧菜单</span>
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
                      <GrowButton link type="primary" @click="openCreateChild(row)">
                        <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="row.menuType === MenuTypeEnum.MENU" content="功能" placement="top">
                      <GrowButton link type="primary" @click="openFunctions(row)">
                        <GrowIconify icon="ant-design:control-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="row.menuType === MenuTypeEnum.MENU" content="表定义" placement="top">
                      <GrowButton link type="primary" @click="openColumns(row)">
                        <GrowIconify icon="ant-design:table-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="删除" placement="top">
                      <GrowButton link type="danger" @click="onDelete(row)">
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

    <GrowDialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增' : '编辑'"
      width="680px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="menu-manage__form"
        :model="formModel"
        :rules="formRules"
        label-width="88px"
      >
        <GrowRow :gutter="16">
          <GrowCol :span="24">
            <GrowFormItem label="挂载位置" prop="parentName">
              <GrowTreeSelect
                v-model="formModel.parentName"
                :data="parentTreeData"
                :props="{ label: 'title', value: 'name', children: 'children', disabled: 'disabled' }"
                check-strictly
                clearable
                filterable
                default-expand-all
                placeholder="不选则为根级"
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol :span="12">
            <GrowFormItem label="类型" prop="menuType">
              <GrowRadioGroup v-model="formModel.menuType" :options="menuTypeOptions" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol :span="12">
            <GrowFormItem label="排序" prop="sort">
              <GrowInputNumber v-model="formModel.sort" :min="0" :max="9999" controls-position="right" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="formModel.menuType === MenuTypeEnum.MENU" :span="24">
            <GrowFormItem label="菜单类型" prop="menuKind">
              <GrowRadioGroup
                :model-value="formModel.menuKind"
                :options="menuKindOptions"
                @update:model-value="onMenuKindChange"
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol :span="12">
            <GrowFormItem label="标题" prop="title">
              <GrowInput v-model="formModel.title" maxlength="64" clearable placeholder="侧边栏显示名称" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="showComponentKey" :span="12">
            <GrowFormItem label="组件标识">
              <div class="menu-manage__custom-component">
                <GrowSwitch
                  :model-value="formModel.customComponentKey"
                  :disabled="isAutomationMenu"
                  @update:model-value="onCustomComponentKeyChange"
                />
                <GrowInput
                  v-if="formModel.customComponentKey"
                  v-model="formModel.componentKey"
                  class="menu-manage__custom-component-input"
                  maxlength="64"
                  clearable
                  placeholder="请填写组件标识"
                />
              </div>
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="showPath" :span="12">
            <GrowFormItem label="访问路径" prop="path" required>
              <GrowInput v-model="formModel.path" maxlength="128" clearable placeholder="如 menu-manage" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="isExternalMenu" :span="12">
            <GrowFormItem label="打开方式" prop="openMode">
              <GrowSelect v-model="formModel.openMode" :options="openModeOptions" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol :span="12">
            <GrowFormItem label="图标" prop="icon" class="menu-manage__icon-item">
              <div class="menu-manage__icon-field">
                <GrowInput
                  v-model="formModel.icon"
                  maxlength="128"
                  clearable
                  placeholder="ant-design:menu-outlined"
                />
                <span class="menu-manage__icon-preview">
                  <GrowIconify
                    v-if="formModel.icon.trim()"
                    :icon="formModel.icon.trim()"
                    :size="24"
                  />
                </span>
              </div>
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="isAutomationMenu" :span="12">
            <GrowFormItem label="页面类型" prop="automationType" required>
              <GrowSelect
                v-model="formModel.automationType"
                :options="automationTypeOptions"
                @change="onAutomationTypeChange"
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="isAutomationMenu" :span="12">
            <GrowFormItem label="选择页面" prop="automationPage" required>
              <GrowSelect
                v-model="formModel.automationPage"
                :options="automationPageOptions"
                :placeholder="automationPagePlaceholder"
                clearable
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="isExternalMenu" :span="24">
            <GrowFormItem label="链接" prop="link">
              <GrowInput v-model="formModel.link" maxlength="256" clearable placeholder="外链或 iframe 地址" />
            </GrowFormItem>
          </GrowCol>
          <GrowCol :span="24">
            <GrowFormItem label="选项">
              <div class="menu-manage__switch-group">
                <label class="menu-manage__switch">
                  <GrowSwitch v-model="formModel.isVisible" />
                  <span>显示</span>
                </label>
                <label class="menu-manage__switch">
                  <GrowSwitch v-model="formModel.isKeepAlive" />
                  <span>缓存</span>
                </label>
                <label class="menu-manage__switch">
                  <GrowSwitch v-model="formModel.affix" />
                  <span>固定标签</span>
                </label>
                <label class="menu-manage__switch">
                  <GrowSwitch v-model="formModel.defaultShow" />
                  <span>默认打开</span>
                </label>
              </div>
            </GrowFormItem>
          </GrowCol>
        </GrowRow>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="formSubmitting" @click="submitForm">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="deleteVisible"
      title="删除确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="menu-manage__delete-hint">
        确认删除「{{ deleteTarget?.title }}」？
        <template v-if="deleteChildCount">
          将同时删除其下 {{ deleteChildCount }} 个子级，删除后不可恢复。
        </template>
        <template v-else>
          删除后不可恢复。
        </template>
      </p>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton type="danger" :loading="deleteSubmitting" @click="confirmDelete">
            删除
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <MenuFunctionConfig ref="functionConfigRef" />
    <MenuColumnConfig ref="columnConfigRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuNode } from '../../types/systemMenu'
import MenuFunctionConfig from './components/MenuFunctionConfig/index.vue'
import MenuColumnConfig from './components/MenuColumnConfig/index.vue'
import { useMenuManage } from './use/useMenuManage'

defineOptions({
  name: 'MenuManagePage',
})

const functionConfigRef = ref<{ open: (menu: SystemMenuNode) => void } | null>(null)
const columnConfigRef = ref<{ open: (menu: SystemMenuNode) => void } | null>(null)

function openFunctions(row: SystemMenuNode) {
  functionConfigRef.value?.open(row)
}

function openColumns(row: SystemMenuNode) {
  columnConfigRef.value?.open(row)
}

const {
  tableData,
  tableKey,
  searchList,
  tableColumns,
  leafColumns,
  onSearch,
  onColumnsConfirm,
  formVisible,
  formMode,
  formSubmitting,
  formRef,
  formModel,
  formRules,
  parentTreeData,
  isAutomationMenu,
  isExternalMenu,
  showPath,
  showComponentKey,
  menuTypeOptions,
  menuKindOptions,
  automationTypeOptions,
  automationPageOptions,
  automationPagePlaceholder,
  openModeOptions,
  onMenuKindChange,
  onAutomationTypeChange,
  onCustomComponentKeyChange,
  openCreate,
  openCreateChild,
  openEdit,
  submitForm,
  deleteVisible,
  deleteSubmitting,
  deleteTarget,
  deleteChildCount,
  onDelete,
  confirmDelete,
  menuTypeLabel,
  menuTypeTagType,
} = useMenuManage()
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
  background: var(--layout-color);
}

.menu-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.menu-manage__hint {
  color: var(--text-color-secondary);
  font-size: 12px;
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
  background: var(--component-color, #fff);
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

.menu-manage__delete-hint {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.menu-manage__form :deep(.el-input-number),
.menu-manage__form :deep(.el-select),
.menu-manage__form :deep(.el-tree-select) {
  width: 100%;
}

.menu-manage__custom-component {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
}

.menu-manage__custom-component :deep(.el-switch) {
  flex-shrink: 0;
}

.menu-manage__custom-component-input,
.menu-manage__custom-component :deep(.el-input) {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
}

.menu-manage__icon-item :deep(.el-form-item__label) {
  height: 40px;
  line-height: 40px;
}

.menu-manage__icon-item :deep(.el-form-item__content) {
  align-items: center;
  min-height: 40px;
}

.menu-manage__icon-field {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.menu-manage__icon-field :deep(.el-input) {
  flex: 1;
  min-width: 0;
  height: 40px;
}

.menu-manage__icon-field :deep(.el-input__wrapper) {
  height: 40px;
  min-height: 40px;
}

.menu-manage__icon-preview {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--layout-color, #fff);
  color: var(--text-color-regular, #606266);
}

.menu-manage__icon-preview :deep(.grow-iconify) {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block !important;
  width: 24px;
  height: 24px;
  margin: 0;
  font-size: 24px;
  line-height: 0;
  transform: translate(-50%, -50%);
}

.menu-manage__icon-preview :deep(svg) {
  display: block;
  width: 24px !important;
  height: 24px !important;
}

.menu-manage__switch-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 20px;
  min-height: 32px;
}

.menu-manage__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}
</style>
