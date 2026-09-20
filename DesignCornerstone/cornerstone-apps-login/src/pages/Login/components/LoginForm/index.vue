<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import { useLoginForm } from './use/useForm'

const { t } = useI18n()
const emit = defineEmits<{ forget: [type: string] }>()

const {
  loginFormRef,
  loginFormData,
  formRules,
  loading,
  captchaLoading,
  captchaImage,
  refreshCaptcha,
  onLogin,
} = useLoginForm()

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
      <GrowFormItem prop="tenantCode">
        <GrowInput
          v-model="loginFormData.tenantCode"
          :placeholder="t('layout.login.word.tenantCodeMsg')"
          autocomplete="organization"
          name="tenantCode"
          clearable
        />
      </GrowFormItem>
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
      <GrowFormItem prop="captchaCode">
        <div class="flex w-full gap-3">
          <GrowInput
            v-model="loginFormData.captchaCode"
            class="min-w-0 flex-1"
            :placeholder="t('layout.login.word.verificationCode')"
            autocomplete="off"
            name="captchaCode"
            clearable
          />
          <button
            type="button"
            class="relative flex h-10 w-30 shrink-0 appearance-none items-center justify-center overflow-hidden border-0 bg-transparent p-0 leading-none disabled:cursor-wait"
            :aria-label="t('layout.login.word.refreshCaptcha')"
            :disabled="captchaLoading"
            @click="refreshCaptcha"
          >
            <img
              v-if="captchaImage"
              class="absolute inset-0 block h-full w-full object-fill"
              :src="captchaImage"
              :alt="t('layout.login.word.verificationCode')"
            />
            <span v-else class="text-xs text-muted">
              {{ captchaLoading ? t('layout.login.word.captchaLoading') : t('layout.login.word.refreshCaptcha') }}
            </span>
          </button>
        </div>
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
