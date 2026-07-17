<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

defineOptions({ name: 'NLinkAdapter', inheritAttrs: false })

const attrs = useAttrs()

const linkAttrs = computed(() => {
  const {
    type: _type,
    underline,
    disabled,
    href,
    target,
    ...rest
  } = attrs as Record<string, unknown>
  return {
    ...rest,
    href: disabled ? undefined : (href as string | undefined),
    target: target as string | undefined,
    'aria-disabled': disabled ? 'true' : undefined,
  }
})

const linkStyle = computed(() => {
  const { type, underline, disabled } = attrs as {
    type?: string
    underline?: boolean
    disabled?: boolean
  }
  const colorMap: Record<string, string> = {
    primary: 'var(--n-primary-color, #18a058)',
    success: 'var(--n-success-color, #18a058)',
    warning: 'var(--n-warning-color, #f0a020)',
    danger: 'var(--n-error-color, #d03050)',
    error: 'var(--n-error-color, #d03050)',
    info: 'var(--n-info-color, #2080f0)',
    default: 'inherit',
  }
  return {
    color: colorMap[type || 'default'] || colorMap.default,
    textDecoration: underline === false ? 'none' : 'underline',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : undefined,
  }
})
</script>

<template>
  <a v-bind="linkAttrs" :style="linkStyle">
    <slot />
  </a>
</template>
