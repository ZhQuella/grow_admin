<script lang="ts" setup>
import { computed, ref, useAttrs } from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.Timeline,
  inheritAttrs: false,
})

const Timeline = useDriverComponent(RockComponent.Timeline)
const attrs = useAttrs()

/**
 * 样式面板把 display 设为 flex 时默认 flex-direction:row，
 * 会把时间项排成横向。时间线强制纵向。
 */
const boundAttrs = computed(() => {
  const raw = { ...(attrs as Record<string, unknown>) }
  const styleRaw = raw.style
  if (styleRaw && typeof styleRaw === 'object' && !Array.isArray(styleRaw)) {
    const style = { ...(styleRaw as Record<string, unknown>) }
    const display = style.display
    if (display === 'flex' || display === 'inline-flex') {
      style['flex-direction'] = 'column'
      style.flexDirection = 'column'
      raw.style = style
    }
  }
  // 去掉会裁切绝对定位连接线的 overflow
  if (styleRaw && typeof styleRaw === 'object' && !Array.isArray(styleRaw)) {
    const style = { ...((raw.style as Record<string, unknown>) || {}) }
    if (style.overflow === 'hidden' || style.overflow === 'clip') {
      style.overflow = 'visible'
      raw.style = style
    }
  }
  raw.class = ['grow-timeline', raw.class]
  return raw
})
</script>
<template>
  <!-- 外层保证连接线样式一定挂得上（ElTimeline 渲染函数不合并 class） -->
  <div class="grow-timeline-root">
    <component :is="Timeline" v-bind="boundAttrs" :ref="DriverRefKey">
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <slot :name="item" v-bind="data || {}" />
      </template>
    </component>
  </div>
</template>

<style>
.grow-timeline-root {
  display: block;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.grow-timeline-root .el-timeline,
.grow-timeline-root .grow-timeline {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding-left: 8px;
  overflow: visible;
  list-style: none;
}

.grow-timeline-root .el-timeline[style*='display: flex'],
.grow-timeline-root .el-timeline[style*='display:flex'],
.grow-timeline-root .grow-timeline[style*='display: flex'],
.grow-timeline-root .grow-timeline[style*='display:flex'] {
  flex-direction: column !important;
}

/* EP 2.13+ 连接线依赖 is-start 定位；设计态嵌套时 :last-child 会误伤全部竖线 */
.grow-timeline-root .el-timeline-item {
  position: relative;
  overflow: visible;
}

.grow-timeline-root .el-timeline-item__tail {
  position: absolute !important;
  top: 0;
  left: 4px !important;
  height: 100% !important;
  width: 0 !important;
  border: none !important;
  border-left: 2px solid var(--el-timeline-node-color, var(--el-border-color-light, #e4e7ed)) !important;
  display: block !important;
  box-sizing: border-box;
}

/* 运行时 / 预览：RenderNode 会包一层 .grow-render-node，li 不是 ul 直接子级 */
.grow-timeline-root .el-timeline > *:last-child .el-timeline-item__tail {
  display: none !important;
}

.grow-timeline-root .el-timeline-item__node--normal {
  left: -1px !important;
}

.grow-timeline-root .el-timeline-item__node--large {
  left: -2px !important;
}

.grow-timeline-root .el-timeline-item__wrapper {
  padding-left: 28px;
}
</style>
