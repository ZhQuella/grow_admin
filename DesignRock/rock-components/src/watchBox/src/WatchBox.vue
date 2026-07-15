<template>
  <div ref="elRef" class="grow-watch-box">
    <slot :width="width" :height="height" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { addEventResize, removeResizeListener } from '@grow-admin-rock/utils'
import { RockComponent } from '#/RockComponent'

defineOptions({
  name: RockComponent.WatchBox,
  customOptions: {
    isPresetComponent: true,
  },
})

const emit = defineEmits<{
  resize: [size: { width: number; height: number }]
}>()

const elRef = ref<HTMLElement | null>(null)
const width = ref(0)
const height = ref(0)

function updateSize() {
  const el = elRef.value
  if (!el) return
  const nextWidth = el.offsetWidth
  const nextHeight = el.offsetHeight
  if (nextWidth === width.value && nextHeight === height.value) return
  width.value = nextWidth
  height.value = nextHeight
  emit('resize', { width: nextWidth, height: nextHeight })
}

onMounted(() => {
  const el = elRef.value
  if (!el) return
  updateSize()
  addEventResize(el, updateSize)
})

onBeforeUnmount(() => {
  removeResizeListener(elRef.value, updateSize)
})
</script>
