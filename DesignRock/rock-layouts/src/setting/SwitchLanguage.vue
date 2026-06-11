<script setup lang="ts">
import type { LocaleType } from '@grow-admin-rock/types'
import { computed } from 'vue'
import { LOCALE, localeList, useI18n, useLocale } from '@grow-admin-rock/locale'

const props = withDefaults(
  defineProps<{
    showLabel?: boolean
    labelKey?: string
    selectClass?: string
  }>(),
  {
    showLabel: true,
    labelKey: 'layout.setting.language',
    selectClass: 'w-full',
  },
)

const { t } = useI18n()
const { getLocale, changeLocale } = useLocale()

const localeOptions = localeList.map((item) => ({
  label: item.text,
  value: item.event,
}))

const currentLocale = computed(() => getLocale.value || LOCALE.zh)

const formLabel = computed(() => (props.showLabel ? t(props.labelKey) : ''))

async function onLocaleChange(value: LocaleType) {
  await changeLocale(value)
}
</script>

<template>
  <GrowForm label-width="100px" label-position="left" class="mb-5">
    <GrowFormItem :label="formLabel">
      <GrowSelect
        :class="selectClass"
        :model-value="currentLocale"
        :options="localeOptions"
        @update:model-value="onLocaleChange"
      />
    </GrowFormItem>
  </GrowForm>
</template>
