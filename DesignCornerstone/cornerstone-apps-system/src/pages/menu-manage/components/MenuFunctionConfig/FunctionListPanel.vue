<template>
  <div class="function-list-panel">
    <div class="function-list-panel__toolbar">
      <GrowButton type="primary" @click="state.addRow">新增</GrowButton>
    </div>
    <GrowScrollbar height="360px">
      <div v-if="!state.list.length" class="function-list-panel__empty">
        <GrowEmpty description="暂无功能，点击上方新增" :image-size="80" />
      </div>
      <GrowForm
        v-else
        ref="formRef"
        class="function-list-panel__form"
        :model="state.formModel"
        label-position="top"
      >
        <div class="function-list-panel__list">
          <div
            v-for="(row, index) in state.list"
            :key="row.id"
            class="function-list-panel__item"
            :class="{ 'is-disabled': !row.enabled }"
          >
            <div class="function-list-panel__fields">
              <GrowFormItem
                label="名称"
                required
                :prop="`items.${index}.title`"
                :rules="state.titleRules"
              >
                <GrowInput v-model="row.title" maxlength="64" clearable placeholder="如 查询、导出" />
              </GrowFormItem>
              <GrowFormItem
                label="标识"
                required
                :prop="`items.${index}.code`"
                :rules="state.codeRules(row.id)"
              >
                <GrowInput v-model="row.code" maxlength="64" clearable placeholder="如 query" />
              </GrowFormItem>
              <GrowFormItem label="说明">
                <GrowInput v-model="row.description" maxlength="200" clearable placeholder="选填" />
              </GrowFormItem>
            </div>
            <div class="function-list-panel__actions">
              <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
                <span class="function-list-panel__switch">
                  <GrowSwitch
                    :model-value="row.enabled"
                    size="small"
                    @update:model-value="(value) => state.onToggleEnabled(row, Boolean(value))"
                  />
                </span>
              </GrowTooltip>
              <GrowTooltip content="删除" placement="top">
                <GrowButton class="function-list-panel__icon-btn" link type="danger" @click="state.onDelete(row)">
                  <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                </GrowButton>
              </GrowTooltip>
            </div>
          </div>
        </div>
      </GrowForm>
    </GrowScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import type { useMenuFunctions } from './useMenuFunctions'

defineOptions({ name: 'FunctionListPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuFunctions>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.function-list-panel__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.function-list-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.function-list-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-list-panel__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.function-list-panel__form {
  width: 100%;
}

.function-list-panel__item.is-disabled :deep(.el-form-item__label) {
  color: var(--text-color-secondary);
}

.function-list-panel__fields {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 0.8fr);
  gap: 10px 12px;
  min-width: 0;
}

.function-list-panel__form :deep(.el-form-item) {
  margin-bottom: 0;
}

.function-list-panel__form :deep(.el-form-item__label) {
  height: auto;
  margin-bottom: 4px;
  padding: 0;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.function-list-panel__form :deep(.el-form-item__error) {
  position: static;
  padding-top: 2px;
}

.function-list-panel__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
  padding-top: 22px;
}

.function-list-panel__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

.function-list-panel__icon-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
</style>
