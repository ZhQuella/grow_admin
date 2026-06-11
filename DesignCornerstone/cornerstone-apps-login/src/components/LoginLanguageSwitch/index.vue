<script lang="ts" setup>
import type { LocaleType } from '@grow-admin-rock/types'
import { computed } from 'vue'
import { LOCALE, localeList, useI18n, useLocale } from '@grow-admin-rock/locale'

const { t } = useI18n()
const { getLocale, changeLocale } = useLocale()

const localeOptions = localeList.map((item) => ({
  label: item.text,
  value: item.event,
}))

const currentLocale = computed(() => getLocale.value || LOCALE.zh)

async function onLocaleChange(value: LocaleType) {
  await changeLocale(value)
}
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-2 surface-panel shadow-card">
    <span class="text-[13px] text-muted shrink-0 select-none">
      {{ t('layout.login.language') }}
    </span>
    <GrowSelect
      class="w-[120px]"
      :model-value="currentLocale"
      :options="localeOptions"
      @update:model-value="onLocaleChange"
    />
  </div>
</template>
