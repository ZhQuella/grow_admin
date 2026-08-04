<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import { ElImage } from 'element-plus'

/** Element Plus 侧对齐 Naive NImage 常用 props */
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
  lazy?: boolean
  fallbackSrc?: string
  'fallback-src'?: string
}>()

const attrs = useAttrs()

const fit = computed(
  () => props.objectFit || props['object-fit'] || 'fill',
)

const fallback = computed(() => props.fallbackSrc || props['fallback-src'])

const previewSrcList = computed(() => {
  if (props.previewDisabled || props['preview-disabled']) return []
  const preview = props.previewSrc || props['preview-src'] || props.src
  return preview ? [preview] : []
})

/** 纯数字补 px；已带单位的原样保留（供 ElImage 根节点 CSS 尺寸） */
const toCssSize = (value: string | number | undefined | null) => {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  const raw = String(value).trim()
  if (!raw) return undefined
  if (/^-?\d+(\.\d+)?$/.test(raw)) return `${raw}px`
  return raw
}

const sizeStyle = computed(() => {
  const style: Record<string, string> = {}
  const width = toCssSize(props.width)
  const height = toCssSize(props.height)
  if (width) style.width = width
  if (height) style.height = height
  return style
})

const rootStyle = computed(() => {
  const fromAttrs = attrs.style
  if (!fromAttrs) return sizeStyle.value
  return [fromAttrs, sizeStyle.value]
})
</script>

<template>
  <ElImage
    v-bind="attrs"
    :src="props.src"
    :alt="props.alt"
    :fit="fit"
    :lazy="props.lazy"
    :preview-src-list="previewSrcList"
    :style="rootStyle"
  >
    <template v-if="fallback || $slots.error" #error>
      <slot name="error">
        <img v-if="fallback" :src="fallback" :alt="props.alt" :style="sizeStyle" />
      </slot>
    </template>
    <template
      v-for="name in Object.keys($slots).filter((n) => n !== 'error')"
      #[name]="data"
    >
      <slot :name="name" v-bind="data || {}" />
    </template>
  </ElImage>
</template>
