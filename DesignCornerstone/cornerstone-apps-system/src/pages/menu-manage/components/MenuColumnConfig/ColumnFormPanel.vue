<template>
  <GrowForm
    ref="formRef"
    class="column-form-panel"
    :model="state.formModel"
    :rules="state.formRules"
    label-width="72px"
  >
    <GrowFormItem label="名称" prop="title">
      <GrowInput v-model="state.formModel.title" maxlength="64" clearable placeholder="如 标题、编码" />
    </GrowFormItem>
    <GrowFormItem label="标识" prop="code">
      <GrowInput
        v-model="state.formModel.code"
        maxlength="64"
        clearable
        :placeholder="MENU_COLUMN_CODE_MESSAGE"
      />
    </GrowFormItem>
    <GrowFormItem label="类型" prop="columnType">
      <GrowSelect
        v-model="state.formModel.columnType"
        :options="COLUMN_TYPE_OPTIONS"
        label="label"
        value="value"
        placeholder="请选择"
      />
    </GrowFormItem>
    <GrowFormItem label="排序" prop="sort">
      <GrowInputNumber
        v-model="state.formModel.sort"
        :min="0"
        :max="9999"
        controls-position="right"
      />
    </GrowFormItem>
    <GrowFormItem label="用途">
      <div class="column-form-panel__switches">
        <label><GrowSwitch v-model="state.formModel.enabled" /><span>启用</span></label>
        <label><GrowSwitch v-model="state.formModel.columnPermission" /><span>列权限</span></label>
        <label><GrowSwitch v-model="state.formModel.formFill" /><span>表单填写</span></label>
        <label><GrowSwitch v-model="state.formModel.queryFilter" /><span>查询条件</span></label>
      </div>
    </GrowFormItem>
    <GrowFormItem label="说明" prop="description">
      <GrowInput
        v-model="state.formModel.description"
        type="textarea"
        :rows="2"
        maxlength="200"
        show-word-limit
        placeholder="选填"
      />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import { COLUMN_TYPE_OPTIONS, MENU_COLUMN_CODE_MESSAGE } from '../../../../types/systemMenuColumn'
import type { useMenuColumns } from './useMenuColumns'

defineOptions({ name: 'ColumnFormPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuColumns>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.column-form-panel :deep(.el-input-number),
.column-form-panel :deep(.el-select) {
  width: 100%;
}

.column-form-panel__switches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
}

.column-form-panel__switches label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text-color);
  font-size: 13px;
}
</style>
