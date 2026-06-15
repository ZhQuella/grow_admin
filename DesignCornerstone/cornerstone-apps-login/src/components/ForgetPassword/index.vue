<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import { useVerificationCode } from '#/composables/useVerificationCode'
import { useForgetPasswordForm } from './use/useForm'

const { t } = useI18n()
const emit = defineEmits<{ back: [type: string]; success: [identifying: string] }>()

const { forgetFormRef, forgetForm, rules, onForgetPassword, onBackClick } =
  useForgetPasswordForm(emit)

const { isCooling, isGetCodeDisabled, codeContext, onGetVerificationCode } =
  useVerificationCode(forgetForm)
</script>

<template>
  <div>
    <GrowH4 class="mb-4.5 text-lg font-semibold tracking-tight text-text -enter-x">
      {{ t('layout.login.word.forgetPassword') }}
    </GrowH4>
    <GrowForm ref="forgetFormRef" size="large" :model="forgetForm" :rules="rules">
      <GrowFormItem prop="account">
        <GrowInput
          v-model="forgetForm.account"
          :placeholder="t('layout.login.word.accessMsg')"
        />
      </GrowFormItem>
      <GrowFormItem prop="phoneNumber">
        <GrowInput
          v-model="forgetForm.phoneNumber"
          :placeholder="t('layout.login.word.mobilePhone')"
        />
      </GrowFormItem>
      <GrowFormItem prop="verificationCode">
        <GrowRow class="w-full">
          <GrowCol :span="18" class="pr-2.5">
            <GrowInput
              v-model="forgetForm.verificationCode"
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
        <GrowButton type="primary" class="w-full" @click="onForgetPassword">
          {{ t('layout.login.word.confirmText') }}
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
