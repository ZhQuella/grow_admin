<template>
  <GrowDialog
    v-model="listVisible"
    :title="menu ? `功能配置 · ${menu.title}` : '功能配置'"
    width="520px"
    append-to-body
    destroy-on-close
  >
    <div class="menu-function-config__toolbar">
      <GrowButton type="primary" @click="openCreate">新增</GrowButton>
    </div>
    <div v-if="!list.length" class="menu-function-config__empty">
      暂无功能，点击上方新增
    </div>
    <div v-else class="menu-function-config__list">
      <div
        v-for="row in list"
        :key="row.id"
        class="menu-function-config__item"
        :class="{ 'is-disabled': !row.enabled }"
      >
        <div class="menu-function-config__item-main">
          <div class="menu-function-config__item-title">
            <span>{{ row.title }}</span>
          </div>
          <div class="menu-function-config__item-meta">
            {{ row.code }} · 排序 {{ row.sort }}
          </div>
        </div>
        <div class="menu-function-config__actions">
          <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
            <span class="menu-function-config__switch">
              <GrowSwitch
                :model-value="row.enabled"
                size="small"
                @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
              />
            </span>
          </GrowTooltip>
          <GrowTooltip content="编辑" placement="top">
            <GrowButton class="menu-function-config__icon-btn" link type="primary" @click="openEdit(row)">
              <GrowIconify icon="ant-design:edit-outlined" :size="16" />
            </GrowButton>
          </GrowTooltip>
          <GrowTooltip content="删除" placement="top">
            <GrowButton class="menu-function-config__icon-btn" link type="danger" @click="onDelete(row)">
              <GrowIconify icon="ant-design:delete-outlined" :size="16" />
            </GrowButton>
          </GrowTooltip>
        </div>
      </div>
    </div>
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
    v-model="formVisible"
    :title="formMode === 'create' ? '新增功能' : '编辑功能'"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <GrowForm
      ref="formRef"
      class="menu-function-config__form"
      :model="formModel"
      :rules="formRules"
      label-width="72px"
    >
      <GrowFormItem label="名称" prop="title">
        <GrowInput
          v-model="formModel.title"
          maxlength="64"
          clearable
          placeholder="如 查询、导出"
        />
      </GrowFormItem>
      <GrowFormItem label="标识" prop="code">
        <GrowInput
          v-model="formModel.code"
          maxlength="64"
          clearable
          :placeholder="MENU_FUNCTION_CODE_MESSAGE"
        />
      </GrowFormItem>
      <GrowFormItem label="排序" prop="sort">
        <GrowInputNumber
          v-model="formModel.sort"
          :min="0"
          :max="9999"
          controls-position="right"
        />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="formVisible = false">取消</GrowButton>
        <GrowButton type="primary" @click="submitForm">
          确定
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { MENU_FUNCTION_CODE_MESSAGE } from '../../../../types/systemMenuFunction'
import { useMenuFunctions } from './useMenuFunctions'

defineOptions({
  name: 'MenuFunctionConfig',
})

const {
  menu,
  list,
  listVisible,
  listSaving,
  formVisible,
  formMode,
  formRef,
  formModel,
  formRules,
  open,
  closeList,
  openCreate,
  openEdit,
  onToggleEnabled,
  submitForm,
  saveList,
  onDelete,
} = useMenuFunctions()

defineExpose({ open })
</script>

<style scoped>
.menu-function-config__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.menu-function-config__empty {
  padding: 48px 16px;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.menu-function-config__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow: auto;
}

.menu-function-config__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
  transition: background 150ms ease;
}

.menu-function-config__item:hover {
  background: var(--header-action-hover-bg-color, var(--layout-color));
}

.menu-function-config__item.is-disabled .menu-function-config__item-title span:first-child {
  color: var(--text-color-secondary);
}

.menu-function-config__item-main {
  flex: 1;
  min-width: 0;
}

.menu-function-config__item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
}

.menu-function-config__item-title span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-function-config__item-meta {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-function-config__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.menu-function-config__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.menu-function-config__switch :deep(.el-switch),
.menu-function-config__switch :deep(.n-switch) {
  margin: 0;
}

.menu-function-config__icon-btn,
.menu-function-config__actions :deep(.el-button),
.menu-function-config__actions :deep(.n-button) {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}

.menu-function-config__form :deep(.el-input-number) {
  width: 100%;
}
</style>
