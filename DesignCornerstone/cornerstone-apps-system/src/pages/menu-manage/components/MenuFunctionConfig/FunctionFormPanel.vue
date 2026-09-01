<template>
  <GrowForm
    ref="formRef"
    class="function-form-panel"
    :model="state.formModel"
    :rules="state.formRules"
    label-width="72px"
  >
    <GrowFormItem label="名称" prop="title">
      <GrowInput v-model="state.formModel.title" maxlength="64" clearable placeholder="如 查询、导出" />
    </GrowFormItem>
    <GrowFormItem label="标识" prop="code">
      <GrowInput
        v-model="state.formModel.code"
        maxlength="64"
        clearable
        :placeholder="MENU_FUNCTION_CODE_MESSAGE"
      />
    </GrowFormItem>
    <GrowFormItem label="分组" prop="group">
      <GrowInput v-model="state.formModel.group" maxlength="64" clearable placeholder="选填，如 基础操作" />
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
    <GrowFormItem label="排序" prop="sort">
      <GrowInputNumber
        v-model="state.formModel.sort"
        :min="0"
        :max="9999"
        controls-position="right"
      />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import { MENU_FUNCTION_CODE_MESSAGE } from '../../../../types/systemMenuFunction'
import type { useMenuFunctions } from './useMenuFunctions'

defineOptions({ name: 'FunctionFormPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuFunctions>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.function-form-panel :deep(.el-input-number) {
  width: 100%;
}
</style>
