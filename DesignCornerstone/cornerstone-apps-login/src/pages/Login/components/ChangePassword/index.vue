<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import { useChangePasswordForm } from './use/useForm'

const { t } = useI18n()
const props = defineProps<{ tagCode: string }>()
const emit = defineEmits<{ success: []; back: [] }>()

const { formRef, formData, rules, onModifyPassword, onBack } = useChangePasswordForm(
  props.tagCode,
  emit,
)
</script>

<template>
  <div>
    <GrowH4 class="mb-4.5 text-lg font-semibold tracking-tight text-text -enter-x">
      {{ t('layout.login.word.newPasswordContext') }}
    </GrowH4>
    <GrowForm ref="formRef" size="large" :model="formData" :rules="rules">
      <GrowFormItem prop="password">
        <GrowInput
          v-model="formData.password"
          :placeholder="t('layout.login.word.newPasswordContext')"
          type="password"
          show-password
        />
      </GrowFormItem>
      <GrowFormItem prop="newPassword">
        <GrowInput
          v-model="formData.newPassword"
          :placeholder="t('layout.login.word.enterPasswordContext')"
          type="password"
          show-password
        />
      </GrowFormItem>
    </GrowForm>
    <div class="pt-2.5">
      <GrowButton type="primary" class="w-full" size="large" @click="onModifyPassword">
        {{ t('layout.login.word.confirmText') }}
      </GrowButton>
    </div>
    <div class="pt-5">
      <GrowButton class="w-full" size="large" @click="onBack">
        {{ t('layout.login.public.backText') }}
      </GrowButton>
    </div>
  </div>
</template>
