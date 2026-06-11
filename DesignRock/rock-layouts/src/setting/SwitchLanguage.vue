<script setup lang="ts">
import type { LocaleType } from '@grow-admin-rock/types'
import { computed } from 'vue'
import { LOCALE, localeList, useI18n, useLocale } from '@grow-admin-rock/locale'

const props = withDefaults(
  defineProps<{
    showLabel?: boolean
    labelKey?: string
    selectClass?: string
    inline?: boolean
  }>(),
  {
    showLabel: true,
    labelKey: 'layout.setting.language',
    selectClass: 'w-[140px]',
    inline: true,
  },
)

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
  <div
    class="flex items-center gap-2"
    :class="inline ? 'min-h-8 justify-between gap-3' : ''"
  >
    <span
      v-if="showLabel"
      class="text-[13px] text-text-secondary shrink-0 select-none"
    >
      {{ t(labelKey) }}
    </span>
    <GrowSelect
      :class="selectClass"
      :model-value="currentLocale"
      :options="localeOptions"
      @update:model-value="onLocaleChange"
    />
  </div>
</template>
