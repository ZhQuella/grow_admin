<template>
  <component
    v-if="resolvedTag"
    :is="resolvedTag"
    v-bind="bindProps"
    :style="styleInfo"
  >
    {{ textContent }}
  </component>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

interface PropsType {
  config: any
  propsInfo: any
  styleInfo?: Record<string, any>
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({}),
  styleInfo: () => ({}),
})

const { config, propsInfo, styleInfo } = toRefs(props)

const isTitle = computed(() => config.value.elTagName === 'BasicTitle')

/** 标题级别统一为原生 h1-h6（配置里可能是 H3） */
const resolvedTag = computed(() => {
  const tag = config.value?.elTagName
  if (!tag) return null
  if (tag === 'BasicTitle') {
    const raw = String(propsInfo.value?.level || 'h3').toLowerCase()
    return /^h[1-6]$/.test(raw) ? raw : 'h3'
  }
  return tag
})

const bindProps = computed(() => {
  const info = { ...(propsInfo.value || {}) }
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')
  if (isTitle.value || ['p', 'span', 'div'].includes(config.value?.elTagName)) {
    Reflect.deleteProperty(info, 'level')
    Reflect.deleteProperty(info, 'context')
  }
  if (config.value?.elTagName === 'GrowLink' || config.value?.elTagName === 'GrowButton') {
    Reflect.deleteProperty(info, 'content')
  }
  return info
})

const textContent = computed(() => {
  if (isTitle.value || ['p', 'span'].includes(config.value?.elTagName)) {
    return propsInfo.value?.context ?? ''
  }
  return undefined
})
</script>
