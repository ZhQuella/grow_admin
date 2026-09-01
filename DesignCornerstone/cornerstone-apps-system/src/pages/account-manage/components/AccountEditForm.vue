<template>
  <GrowForm
    ref="growFormRef"
    class="account-form"
    :model="model"
    :rules="rules"
    label-width="96px"
  >
    <GrowFormItem label="账号名称" prop="username">
      <GrowInput
        v-model="model.username"
        maxlength="32"
        clearable
        :disabled="usernameLocked"
        placeholder="字母开头，3-32 位"
      />
    </GrowFormItem>
    <GrowFormItem label="昵称" prop="nickname">
      <GrowInput v-model="model.nickname" maxlength="64" clearable placeholder="账号展示名称" />
    </GrowFormItem>
    <GrowFormItem label="手机号" prop="mobile">
      <GrowInput v-model="model.mobile" maxlength="11" clearable placeholder="中国大陆 11 位手机号" />
    </GrowFormItem>
    <GrowFormItem label="邮箱" prop="email">
      <GrowInput v-model="model.email" maxlength="128" clearable placeholder="邮箱地址" />
    </GrowFormItem>
    <GrowFormItem label="角色" prop="roleIds">
      <div class="account-form__roles">
        <div v-if="protectedRoles.length" class="account-form__protected">
          <GrowTag v-for="role in protectedRoles" :key="role.id" type="info" size="small">
            {{ role.name }}（内置）
          </GrowTag>
          <span>内置超级管理员角色不可移除</span>
        </div>
        <GrowSelect
          v-model="model.roleIds"
          :options="roleOptions"
          multiple
          filterable
          collapse-tags
          clearable
          placeholder="可选择多个角色"
        />
      </div>
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="model.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import type { AccountRoleRef } from '../../../types/systemAccount'
import type { AccountFormModel, AccountSelectOption } from '../use/useAccountForm'

defineOptions({ name: 'AccountEditForm' })

defineEmits<{
  'generate-password': []
}>()

defineProps<{
  model: AccountFormModel
  rules: Record<string, unknown>
  roleOptions: AccountSelectOption[]
  protectedRoles: AccountRoleRef[]
  usernameLocked: boolean
}>()

const growFormRef = ref()

async function validate() {
  const form = driverRef(growFormRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) throw new Error('表单未就绪')
  return form.validate()
}

defineExpose({ validate })
</script>

<style scoped>
.account-form__roles {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

.account-form__protected {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.account-form :deep(.el-select) {
  width: 100%;
}
</style>
