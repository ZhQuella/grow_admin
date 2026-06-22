<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'

const { t } = useI18n()
const emit = defineEmits<{ back: [type: string] }>()

function onBackClick() {
  emit('back', 'login')
}
</script>

<template>
  <div>
    <GrowH4 class="mb-4.5 text-lg font-semibold tracking-tight text-text -enter-x">
      {{ t('layout.login.word.scanCodeLogin') }}
    </GrowH4>
    <div class="flex justify-center py-3 pb-2 enter-x">
      <div
        class="bg-login-qr flex h-[220px] w-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border"
      >
        <GrowIconify icon="ant-design:qrcode-outlined" :size="72" class="text-text-secondary" />
        <GrowText class="text-xs text-muted">{{ t('layout.login.word.scanCodeLogin') }}</GrowText>
      </div>
    </div>
    <div class="pt-5">
      <GrowButton size="large" class="w-full" @click="onBackClick">
        {{ t('layout.login.public.backText') }}
      </GrowButton>
    </div>
  </div>
</template>
