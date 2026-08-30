<template>
  <GrowForm
    ref="formRef"
    class="table-form-panel"
    :model="state.tableFormModel"
    :rules="state.tableFormRules"
    label-width="72px"
  >
    <GrowFormItem label="名称" prop="title">
      <GrowInput v-model="state.tableFormModel.title" maxlength="64" clearable placeholder="如 角色列表、绑定人员" />
    </GrowFormItem>
    <GrowFormItem label="标识" prop="code">
      <GrowInput
        v-model="state.tableFormModel.code"
        maxlength="64"
        clearable
        :placeholder="MENU_COLUMN_CODE_MESSAGE"
      />
    </GrowFormItem>
    <GrowFormItem label="排序" prop="sort">
      <GrowInputNumber
        v-model="state.tableFormModel.sort"
        :min="0"
        :max="9999"
        controls-position="right"
      />
    </GrowFormItem>
    <GrowFormItem label="说明" prop="description">
      <GrowInput
        v-model="state.tableFormModel.description"
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
import { MENU_COLUMN_CODE_MESSAGE } from '../../../../types/systemMenuColumn'
import type { useMenuColumns } from './useMenuColumns'

defineOptions({ name: 'TableFormPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuColumns>
}>()

const formRef = props.state.tableFormRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.table-form-panel :deep(.el-input-number) {
  width: 100%;
}
</style>
