<script lang="ts" setup>
import type { LocaleType } from '@grow-admin-rock/types'
import { computed, ref } from 'vue'
import { localeList, useI18n, useLocale } from '@grow-admin-rock/locale'

const { t } = useI18n()
const { getLocale, changeLocale } = useLocale()
const popoverVisible = ref(false)

const currentLocale = computed(() => getLocale.value)

async function onLocaleChange(value: LocaleType) {
  await changeLocale(value)
  popoverVisible.value = false
}
</script>

<template>
  <GrowPopover
    v-model:visible="popoverVisible"
    trigger="hover"
    placement="bottom-end"
    :width="150"
  >
    <template #reference>
      <GrowButton
        circle
        class="login-interactive-icon !h-9 !w-9 border border-border bg-component text-text-secondary"
        :aria-label="t('layout.login.language')"
        :title="t('layout.login.language')"
      >
        <GrowIconify icon="ant-design:translation-outlined" :size="20" hover-pointer />
      </GrowButton>
    </template>

    <div class="flex flex-col gap-0.5 p-1">
      <div
        v-for="item in localeList"
        :key="item.event"
        text
        class="cursor-pointer !h-auto w-full justify-start rounded-lg px-3 py-2 text-left text-sm"
        :class="currentLocale === item.event ? 'font-medium text-primary' : 'text-text'"
        @click="onLocaleChange(item.event)"
      >
        {{ item.text }}
      </div>
    </div>
  </GrowPopover>
</template>
