<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import { useLoginForm } from './use/useForm'

const { t } = useI18n()
const emit = defineEmits<{ forget: [type: string] }>()

const { loginFormRef, loginFormData, formRules, loading, onLogin } = useLoginForm()

function onForgetPass() {
  emit('forget', 'forgetPassword')
}
</script>

<template>
  <div>
    <GrowH4 class="mb-4.5 text-lg font-semibold tracking-tight text-text -enter-x">
      {{ t('layout.login.word.accountLogin') }}
    </GrowH4>
    <GrowForm ref="loginFormRef" size="large" :model="loginFormData" :rules="formRules">
      <GrowFormItem prop="account">
        <GrowInput
          v-model="loginFormData.account"
          :placeholder="t('layout.login.word.accessMsg')"
          autocomplete="username"
          name="username"
          clearable
        />
      </GrowFormItem>
      <GrowFormItem prop="password">
        <GrowInput
          v-model="loginFormData.password"
          :placeholder="t('layout.login.word.passwordMsg')"
          type="password"
          autocomplete="current-password"
          name="password"
          clearable
          show-password
        />
      </GrowFormItem>
      <div class="flex justify-between items-center">
        <GrowCheckbox v-model="loginFormData.isRemember">
          {{ t('layout.login.word.rememberMe') }}
        </GrowCheckbox>
        <GrowButton link type="primary" @click="onForgetPass">
          {{ t('layout.login.word.forgetPassword') }}
        </GrowButton>
      </div>
      <div class="pt-5">
        <GrowButton type="primary" class="w-full" :loading="loading" @click="onLogin">
          {{ t('layout.login.word.loginText') }}
        </GrowButton>
      </div>
    </GrowForm>
  </div>
</template>
