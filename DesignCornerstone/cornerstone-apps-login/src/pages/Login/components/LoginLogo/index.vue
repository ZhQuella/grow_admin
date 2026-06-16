<script lang="ts" setup>
import { getImageUrl } from '#/utils/getImageUrl'

withDefaults(
  defineProps<{
    showTitle?: boolean
    compact?: boolean
  }>(),
  {
    showTitle: true,
    compact: false,
  },
)

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    class="flex cursor-pointer items-center"
    :class="compact ? 'gap-2' : 'gap-2.5'"
    @click="emit('click')"
  >
    <div :class="compact ? 'h-9 w-9' : 'h-10 min-w-10'">
      <img
        class="block h-full w-full object-contain"
        :src="getImageUrl('logo.png')"
        alt="Grow Admin"
      />
    </div>
    <div v-if="showTitle !== false">
      <GrowH1
        class="m-0 font-semibold leading-none text-text"
        :class="compact ? 'text-base' : 'text-lg leading-10'"
      >
        Grow Admin
      </GrowH1>
      <GrowText v-if="!compact" class="mt-1 text-xs text-text-secondary">
        SaaS Platform
      </GrowText>
    </div>
  </div>
</template>
