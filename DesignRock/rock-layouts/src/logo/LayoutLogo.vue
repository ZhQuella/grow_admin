<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs, useAppConfig, useLayout } from '@grow-admin-rock/state'

const props = withDefaults(
  defineProps<{
    logoUrl?: string
  }>(),
  {
    logoUrl: '/logo.png',
  },
)

const appConfig = useAppConfig()
const { systemName } = storeToRefs(appConfig)
const { collapsed, isRoofLayout } = useLayout()

const showSystemName = computed(() => isRoofLayout.value || !collapsed.value)
</script>

<template>
  <div
    class="box-border flex h-full min-w-0 items-center overflow-hidden px-3"
    :class="isRoofLayout ? 'w-auto shrink-0 justify-start' : 'w-full justify-center'"
  >
    <div class="flex min-w-0 max-w-full items-center gap-2">
      <img
        class="block h-8 w-8 shrink-0 object-contain"
        :src="props.logoUrl"
        :alt="systemName"
        width="32"
        height="32"
      />
      <span
        v-if="showSystemName"
        class="min-w-0 truncate text-sm font-semibold leading-none text-text"
        :title="systemName"
      >
        {{ systemName }}
      </span>
    </div>
  </div>
</template>
