<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { useMagicKeys } from '@grow-admin-rock/utils'
import LayoutSearchModal from './LayoutSearchModal.vue'

const { t } = useI18n()
const showModal = ref(false)
const keys = useMagicKeys()

watch(keys.current, (currentKeys) => {
  if (showModal.value || !currentKeys.length) {
    return
  }

  const [firstKey, secondKey] = currentKeys
  const isModifier = firstKey === 'control' || firstKey === 'meta'
  if (isModifier && secondKey === 'k') {
    showModal.value = true
  }
})

function openModal() {
  showModal.value = true
}
</script>

<template>
  <GrowPopover placement="bottom" trigger="hover">
    <template #reference>
      <GrowButton
        circle
        text
        :aria-label="t('layout.search.placeholder')"
        :title="t('layout.search.placeholder')"
        @click="openModal"
      >
        <GrowIconify icon="ant-design:search-outlined" :size="18" hover-pointer />
      </GrowButton>
    </template>
    <span>{{ t('layout.search.placeholder') }} ({{ t('layout.search.shortcut') }})</span>
  </GrowPopover>
  <LayoutSearchModal v-model:visible="showModal" />
</template>
