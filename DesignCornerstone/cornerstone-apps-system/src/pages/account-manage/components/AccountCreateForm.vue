<template>
  <GrowForm
    ref="growFormRef"
    class="account-form"
    :model="model"
    :rules="rules"
    label-width="96px"
  >
    <GrowFormItem label="账号名称" prop="username">
      <GrowInput v-model="model.username" maxlength="32" clearable placeholder="字母开头，3-32 位" />
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
    <GrowFormItem label="密码方式">
      <GrowRadioGroup
        v-model="model.passwordMode"
        :options="[
          { label: '手动输入', value: 'manual' },
          { label: '系统生成', value: 'generated' },
        ]"
        @change="onPasswordModeChange"
      />
    </GrowFormItem>
    <GrowFormItem label="密码" prop="password">
      <div class="account-form__password">
        <GrowInput
          v-model="model.password"
          :type="model.passwordMode === 'manual' ? 'password' : 'text'"
          :readonly="model.passwordMode === 'generated'"
          show-password
          placeholder="请输入密码"
        />
        <GrowTooltip v-if="model.passwordMode === 'generated'" content="重新生成" placement="top">
          <GrowButton class="account-form__icon-btn" @click="emit('generate-password')">
            <GrowIconify icon="ant-design:reload-outlined" :size="16" />
          </GrowButton>
        </GrowTooltip>
        <GrowTooltip v-if="model.passwordMode === 'generated'" content="复制密码" placement="top">
          <GrowButton class="account-form__icon-btn" @click="copyPassword">
            <GrowIconify icon="ant-design:copy-outlined" :size="16" />
          </GrowButton>
        </GrowTooltip>
      </div>
    </GrowFormItem>
    <GrowFormItem label="绑定人员" prop="personId">
      <GrowSelect
        v-model="model.personId"
        :options="personOptions"
        filterable
        clearable
        placeholder="可选，一个人员只能绑定一个账号"
        @change="onPersonChange"
      />
    </GrowFormItem>
    <div v-if="riskPerson" class="account-form__risk">
      <div>
        <strong>人员状态存在风险</strong>
        <p>该人员当前为离职、退休或已删除状态，请确认账号是否仍应保持启用。</p>
      </div>
      <label class="account-form__risk-action">
        <span>同时停用账号</span>
        <GrowSwitch v-model="model.disableAccount" />
      </label>
    </div>
    <GrowFormItem label="角色" prop="roleIds">
      <GrowSelect
        v-model="model.roleIds"
        :options="roleOptions"
        multiple
        filterable
        collapse-tags
        clearable
        placeholder="可选择多个角色"
      />
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="model.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import type { AccountFormModel, AccountSelectOption } from '../use/useAccountForm'
import { isRiskPersonStatus } from '../use/helpers'

defineOptions({ name: 'AccountCreateForm' })

const props = defineProps<{
  model: AccountFormModel
  rules: Record<string, unknown>
  roleOptions: AccountSelectOption[]
  personOptions: AccountSelectOption[]
}>()

const emit = defineEmits<{
  'generate-password': []
}>()

const message = useMsg()
const growFormRef = ref()
const riskPerson = computed(() => {
  const option = props.personOptions.find((item) => item.value === props.model.personId)
  return Boolean(option && isRiskPersonStatus(option.status))
})

function onPasswordModeChange(value: string | number | boolean | undefined) {
  if (value === 'generated') emit('generate-password')
  else props.model.password = ''
}

function onPersonChange() {
  props.model.disableAccount = false
}

async function copyPassword() {
  if (!props.model.password) return
  try {
    await navigator.clipboard.writeText(props.model.password)
    message.success('密码已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}

async function validate() {
  const form = driverRef(growFormRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) throw new Error('表单未就绪')
  return form.validate()
}

defineExpose({ validate })
</script>

<style scoped>
.account-form__password {
  display: flex;
  width: 100%;
  gap: 8px;
}

.account-form__password :deep(.el-input) {
  flex: 1;
}

.account-form__icon-btn {
  display: inline-flex;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  width: 32px;
  padding: 0;
}

.account-form__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.account-form__risk {
  margin: -4px 0 18px 96px;
  padding: 10px 12px;
  border-left: 3px solid var(--warning-color, #e6a23c);
  border-radius: 4px;
  color: var(--text-color);
  background: var(--layout-container-background-color);
}

.account-form__risk strong {
  font-size: 13px;
}

.account-form__risk p {
  margin: 4px 0 10px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.account-form__risk-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.account-form :deep(.el-select) {
  width: 100%;
}
</style>
