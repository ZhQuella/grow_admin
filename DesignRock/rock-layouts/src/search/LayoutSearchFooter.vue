<script lang="ts" setup>
import { useI18n } from '@grow-admin-rock/locale'
import LayoutSearchKeyItem from './LayoutSearchKeyItem.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex h-11 shrink-0 items-center rounded-b-2xl border-t border-border bg-component px-4 text-xs text-text-secondary">
    <LayoutSearchKeyItem icon="ant-design:enter-outlined" />
    <span class="ml-1">{{ t('layout.search.toSearch') }}</span>
    <LayoutSearchKeyItem class="ml-3.5" icon="ion:arrow-up-outline" />
    <LayoutSearchKeyItem icon="ion:arrow-down-outline" />
    <span class="ml-1">{{ t('layout.search.toNavigate') }}</span>
    <LayoutSearchKeyItem class="ml-3.5" icon="mdi:keyboard-esc" />
    <span class="ml-1">{{ t('layout.search.close') }}</span>
  </div>
</template>
