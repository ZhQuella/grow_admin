<template>
  <div class="element-display">
    <span class="element-display__label">布局模式</span>
    <GrowRadioGroup class="element-display__group" v-model="value" size="small">
      <GrowRadioButton label="inline" value="inline">
        <GrowTooltip content="内部布局 inline" placement="top">
          <GrowIconify icon="carbon:name-space" :size="14" />
        </GrowTooltip>
      </GrowRadioButton>
      <GrowRadioButton label="flex" value="flex">
        <GrowTooltip content="弹性布局 flex" placement="top">
          <GrowIconify icon="carbon:show-data-cards" :size="14" />
        </GrowTooltip>
      </GrowRadioButton>
      <GrowRadioButton label="block" value="block">
        <GrowTooltip content="块级布局 block" placement="top">
          <GrowIconify icon="carbon:group-resource" :size="14" />
        </GrowTooltip>
      </GrowRadioButton>
      <GrowRadioButton label="inline-block" value="inline-block">
        <GrowTooltip content="内联块布局 inline-block" placement="top">
          <GrowIconify icon="carbon:thumbnail2" :size="14" />
        </GrowTooltip>
      </GrowRadioButton>
    </GrowRadioGroup>

    <template v-if="value === 'flex'">
      <span class="element-display__label">主轴方向</span>
      <GrowRadioGroup class="element-display__group" size="small">
        <GrowRadioButton label="inline" value="inline">
          <GrowTooltip content="水平方向，起点在左侧" placement="top">
            <GrowIconify icon="carbon:open-panel-filled-left" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="flex" value="flex">
          <GrowTooltip content="水平方向，起点在右侧" placement="top">
            <GrowIconify icon="carbon:open-panel-filled-right" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="block" value="block">
          <GrowTooltip content="垂直方向，起点在上方" placement="top">
            <GrowIconify icon="carbon:open-panel-filled-top" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="inline-block" value="inline-block">
          <GrowTooltip content="垂直方向，起点在下方" placement="top">
            <GrowIconify icon="carbon:open-panel-filled-bottom" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
      </GrowRadioGroup>

      <span class="element-display__label">主轴对齐</span>
      <GrowRadioGroup class="element-display__group" size="small">
        <GrowRadioButton label="inline" value="inline">
          <GrowTooltip content="左对齐" placement="top">
            <GrowIconify icon="carbon:align-horizontal-left" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="flex" value="flex">
          <GrowTooltip content="右对齐" placement="top">
            <GrowIconify icon="carbon:align-horizontal-right" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="block" value="block">
          <GrowTooltip content="水平居中" placement="top">
            <GrowIconify icon="carbon:align-horizontal-center" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="inline-block" value="inline-block">
          <GrowTooltip content="两端对齐" placement="top">
            <GrowIconify icon="carbon:pan-horizontal" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="inline-block" value="inline-block">
          <GrowTooltip content="横向平分" placement="top">
            <GrowIconify icon="carbon:pause" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
      </GrowRadioGroup>

      <span class="element-display__label">辅轴方向</span>
      <GrowRadioGroup class="element-display__group" size="small">
        <GrowRadioButton label="inline" value="inline">
          <GrowTooltip content="起点对齐" placement="top">
            <GrowIconify icon="carbon:align-vertical-top" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="flex" value="flex">
          <GrowTooltip content="终点对齐" placement="top">
            <GrowIconify icon="carbon:align-vertical-bottom" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="block" value="block">
          <GrowTooltip content="水平居中" placement="top">
            <GrowIconify icon="carbon:align-vertical-center" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="inline-block" value="inline-block">
          <GrowTooltip content="项目第一行文字基线对齐" placement="top">
            <GrowIconify icon="carbon:text-underline" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="inline-block" value="inline-block">
          <GrowTooltip content="占满整个容器的高度" placement="top">
            <GrowIconify icon="carbon:join-right" :size="14" />
          </GrowTooltip>
        </GrowRadioButton>
      </GrowRadioGroup>

      <span class="element-display__label">换行</span>
      <GrowRadioGroup class="element-display__group" size="small">
        <GrowRadioButton label="" value="">
          <GrowTooltip content="不换行" placement="top">
            <span class="element-display__text">不换行</span>
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="" value="">
          <GrowTooltip content="正换行" placement="top">
            <span class="element-display__text">正换行</span>
          </GrowTooltip>
        </GrowRadioButton>
        <GrowRadioButton label="" value="">
          <GrowTooltip content="逆换行" placement="top">
            <span class="element-display__text">逆换行</span>
          </GrowTooltip>
        </GrowRadioButton>
      </GrowRadioGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ElementDisplay' })
import { ref } from 'vue'
const value = ref('inline')
</script>

<style lang="scss" scoped>
.element-display {
  padding: 5px 10px;
}

.element-display__label {
  display: block;
  font-size: 12px;
  line-height: 24px;
}

.element-display__group {
  display: flex;
}

.element-display__text {
  font-size: 14px;
}
</style>
