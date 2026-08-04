<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { Image as AImage } from 'ant-design-vue'

/** Ant Design Vue 侧对齐 Naive NImage 常用 props */
defineOptions({ name: 'Image', inheritAttrs: false })

const props = defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  'object-fit'?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  previewSrc?: string
  'preview-src'?: string
  previewDisabled?: boolean
  'preview-disabled'?: boolean
  fallbackSrc?: string
  'fallback-src'?: string
}>()

const attrs = useAttrs()

const objectFit = computed(
  () => props.objectFit || props['object-fit'] || 'fill',
)

const fallback = computed(() => props.fallbackSrc || props['fallback-src'])

const preview = computed(() => {
  if (props.previewDisabled || props['preview-disabled']) return false
  const src = props.previewSrc || props['preview-src']
  return src ? { src } : true
})

/** Ant Image 的 width/height 支持 number 或带单位字符串 */
const toAntSize = (value: string | number | undefined | null) => {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value).trim()
  if (!raw) return undefined
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return raw
}

const width = computed(() => toAntSize(props.width))
const height = computed(() => toAntSize(props.height))

const imgStyle = computed(() => ({
  objectFit: objectFit.value,
}))
</script>

<template>
  <AImage
    v-bind="attrs"
    :src="props.src"
    :alt="props.alt"
    :width="width"
    :height="height"
    :fallback="fallback"
    :preview="preview"
    :style="imgStyle"
  >
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </AImage>
</template>
