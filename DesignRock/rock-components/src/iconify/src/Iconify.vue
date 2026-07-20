<script setup lang="ts">
import { RockComponent } from '#/RockComponent'
import { IconifyPropTypes, type IconifyProps } from './props'
import type { CSSProperties } from 'vue'
import { computed, nextTick, onMounted, ref, unref, useAttrs, watch } from 'vue'
import Iconify from '@purge-icons/generated'

defineOptions({
  name: RockComponent.Iconify,
  customOptions: {
    isPresetComponent: true,
  },
})

const props: IconifyProps = defineProps(IconifyPropTypes)

const iconRefEl = ref<HTMLElement | null>(null)
const attrs = useAttrs()

const iconRef = computed(() => `${props.prefix ? `${props.prefix}:` : ''}${props.icon}`)

const styles = computed((): CSSProperties => {
  let size = props.size
  if (typeof size === 'string') {
    size = parseInt(size, 10)
  }

  return {
    fontSize: `${size}px`,
    color: props.color,
    display: 'inline-flex',
  }
})

const classes = computed(() => {
  const cls = ['grow-iconify', unref(attrs).class]
  if (props.infinite) {
    cls.push('grow-iconify--infinite')
  }
  return cls
})

async function update() {
  const el = unref(iconRefEl)
  if (!el) return

  await nextTick()
  const icon = unref(iconRef)
  if (!icon) return

  const svg = Iconify.renderSVG(icon, {})
  if (svg) {
    el.textContent = ''
    el.appendChild(svg)
  } else {
    const span = document.createElement('span')
    span.className = 'iconify'
    span.dataset.icon = icon
    el.textContent = ''
    el.appendChild(span)
  }
}

watch(iconRef, update, { flush: 'post' })

onMounted(update)
</script>

<template>
  <span
    ref="iconRefEl"
    :class="[classes, { 'cursor-pointer': hoverPointer }]"
    :style="styles"
  />
</template>

<style scoped>
.grow-iconify {
  display: inline-block;
  transition: color 0.2s, transform 0.2s;
}

.grow-iconify:hover {
  color: v-bind(hoverColor) !important;
}

.grow-iconify--infinite {
  animation: grow-iconify-spin 1s infinite linear;
}

@keyframes grow-iconify-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
