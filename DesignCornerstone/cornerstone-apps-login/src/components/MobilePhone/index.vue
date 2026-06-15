<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import { useVerificationCode } from '#/composables/useVerificationCode'
import { usePhoneLogin } from './use/useLogin'

const { t } = useI18n()
const emit = defineEmits<{ back: [type: string] }>()

const { formRef, formData, rules, loginLoading, onPhoneLogin, onBackClick } =
  usePhoneLogin(emit)

const { isCooling, isGetCodeDisabled, codeContext, onGetVerificationCode } =
  useVerificationCode(formData)
</script>

<template>
  <div>
    <GrowH4 class="mb-4.5 text-lg font-semibold tracking-tight text-text -enter-x">
      {{ t('layout.login.word.numberLogin') }}
    </GrowH4>
    <GrowForm ref="formRef" size="large" :model="formData" :rules="rules">
      <GrowFormItem prop="phoneNumber">
        <GrowInput
          v-model="formData.phoneNumber"
          :placeholder="t('layout.login.word.mobilePhone')"
        />
      </GrowFormItem>
      <GrowFormItem prop="verificationCode">
        <GrowRow class="w-full">
          <GrowCol :span="18" class="pr-2.5">
            <GrowInput
              v-model="formData.verificationCode"
              :placeholder="t('layout.login.word.verificationCode')"
            />
          </GrowCol>
          <GrowCol :span="6">
            <GrowButton
              class="w-full"
              :disabled="isCooling || isGetCodeDisabled"
              @click="onGetVerificationCode"
            >
              {{ codeContext }}
            </GrowButton>
          </GrowCol>
        </GrowRow>
      </GrowFormItem>
      <div class="pt-2.5">
        <GrowButton type="primary" class="w-full" :loading="loginLoading" @click="onPhoneLogin">
          {{ t('layout.login.word.loginText') }}
        </GrowButton>
      </div>
      <div class="pt-5">
        <GrowButton class="w-full" @click="onBackClick">
          {{ t('layout.login.public.backText') }}
        </GrowButton>
      </div>
    </GrowForm>
  </div>
</template>
