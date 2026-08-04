<script lang="ts" setup>
import { Comment, computed, ref, useSlots } from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { diKT, type ServiceIdentifier } from '@grow-admin-rock/ioc'
import {
  Lib as routeLib,
  type RouteOperator,
} from '@grow-admin-rock/middleware-router'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.CarouselItem,
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    label?: string
    href?: string
    linkType?: string
    imageFit?: string
    name?: string
  }>(),
  {
    src: '',
    alt: '',
    label: '',
    href: '',
    linkType: 'web',
    imageFit: 'cover',
    name: '',
  },
)

const CarouselItem = useDriverComponent(RockComponent.CarouselItem)
const slots = useSlots()

type CarouselImageFit =
  | 'fill'
  | 'contain'
  | 'cover'
  | 'none'
  | 'scale-down'
  /** 历史值兼容 */
  | 'full'
  | 'tile'

const src = computed(() => {
  const value = props.src
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

const alt = computed(() => {
  if (typeof props.alt === 'string' && props.alt.trim()) return props.alt.trim()
  return ''
})

const href = computed(() => {
  const value = props.href
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

/** web=新窗口；internal=系统 tab */
const linkType = computed(() =>
  props.linkType === 'internal' ? 'internal' : 'web',
)

/** 与 GrowImage object-fit 一致；full/tile 为历史兼容 */
const imageFit = computed<CarouselImageFit>(() => {
  const value = props.imageFit
  if (value === 'full') return 'cover'
  if (value === 'tile') return 'tile'
  if (
    value === 'fill' ||
    value === 'contain' ||
    value === 'cover' ||
    value === 'none' ||
    value === 'scale-down'
  ) {
    return value
  }
  return 'cover'
})

const hasDefaultSlot = computed(() => {
  const nodes = slots.default?.()
  if (!Array.isArray(nodes) || !nodes.length) return false
  return nodes.some((node) => node && node.type !== Comment)
})

const isTile = computed(() => imageFit.value === 'tile')

const navigateInternal = (path: string) => {
  try {
    const routeOperator = diKT(
      routeLib.types.RouteOperator as ServiceIdentifier<RouteOperator>,
    )
    routeOperator.go(path)
  } catch {
    // 未注入路由时忽略
  }
}

const onClick = () => {
  const url = href.value
  if (!url) return

  if (linkType.value === 'internal') {
    const path = url.startsWith('/') ? url : `/${url}`
    navigateInternal(path)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <component
    :is="CarouselItem"
    v-bind="$attrs"
    :name="name"
    :label="label"
    :ref="DriverRefKey"
    class="grow-carousel-item"
    :class="{ 'is-linkable': Boolean(href) }"
    @click="onClick"
  >
    <!-- 媒体层独立铺满，不改写 el-carousel__item 的 position -->
    <div
      v-if="src"
      class="grow-carousel-item__media"
      :class="`is-fit-${imageFit}`"
      :style="isTile ? { backgroundImage: `url(${src})` } : undefined"
      role="img"
      :aria-label="alt"
    >
      <img
        v-if="!isTile"
        class="grow-carousel-item__img"
        :src="src"
        :alt="alt"
        draggable="false"
      />
    </div>
    <div v-if="hasDefaultSlot" class="grow-carousel-item__content">
      <slot />
    </div>
    <div
      v-else-if="!src"
      class="grow-carousel-item__placeholder"
    >
      走马灯项
    </div>
  </component>
</template>

<style>
.grow-carousel-item.is-linkable {
  cursor: pointer;
}

.grow-carousel-item__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.grow-carousel-item__media.is-fit-tile {
  background-repeat: repeat;
  background-position: left top;
  background-size: auto;
}

.grow-carousel-item__img {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: none;
}

.grow-carousel-item__media.is-fit-cover .grow-carousel-item__img {
  object-fit: cover;
  object-position: center;
}

/* 历史「铺满」：行为接近等比覆盖 */
.grow-carousel-item__media.is-fit-full .grow-carousel-item__img {
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center;
}

.grow-carousel-item__media.is-fit-contain .grow-carousel-item__img {
  object-fit: contain;
  object-position: center;
}

.grow-carousel-item__media.is-fit-fill .grow-carousel-item__img {
  object-fit: fill;
}

.grow-carousel-item__media.is-fit-scale-down .grow-carousel-item__img {
  object-fit: scale-down;
  object-position: center;
}

.grow-carousel-item__media.is-fit-none .grow-carousel-item__img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.grow-carousel-item__content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.grow-carousel-item__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 80px;
  color: var(--text-color-secondary, #909399);
  font-size: 13px;
  background: var(--color-primary-a04, rgba(64, 158, 255, 0.04));
}
</style>
