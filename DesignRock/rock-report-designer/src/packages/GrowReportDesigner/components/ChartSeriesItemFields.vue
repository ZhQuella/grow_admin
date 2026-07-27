<template>
  <div class="flex flex-col gap-2">
    <SectionTitle title="基础" />
    <FieldRow label="名称">
      <GrowInput
        class="min-w-0 flex-1"
        size="small"
        clearable
        :model-value="model.name"
        placeholder="系列名称"
        @update:model-value="(v) => patch({ name: String(v ?? '') })"
      />
    </FieldRow>
    <FieldRow label="类型">
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="CARTESIAN_SERIES_TYPE_OPTIONS"
        :model-value="model.type || 'line'"
        @update:model-value="(v) => patch({ type: v as CartesianSeriesType })"
      />
    </FieldRow>
    <FieldRow label="X 轴">
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :min="0"
        :model-value="model.xAxisIndex ?? 0"
        @update:model-value="(v) => patch({ xAxisIndex: Number(v) || 0 })"
      />
    </FieldRow>
    <FieldRow label="Y 轴">
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="yAxisIndexOptions"
        :model-value="model.yAxisIndex ?? 0"
        @update:model-value="(v) => patch({ yAxisIndex: Number(v) || 0 })"
      />
    </FieldRow>
    <ChartColorFillField
      label="系列色"
      :model-value="model.color"
      @update:model-value="(v) => patch({ color: v })"
    />
    <FieldRow label="图例联动">
      <GrowSwitch
        size="small"
        :model-value="model.legendHoverLink !== false"
        @update:model-value="(v) => patch({ legendHoverLink: !!v })"
      />
    </FieldRow>
    <FieldRow label="裁剪">
      <GrowSwitch
        size="small"
        :model-value="model.clip !== false"
        @update:model-value="(v) => patch({ clip: !!v })"
      />
    </FieldRow>
    <FieldRow label="静默">
      <GrowSwitch
        size="small"
        :model-value="!!model.silent"
        @update:model-value="(v) => patch({ silent: !!v })"
      />
    </FieldRow>
    <FieldRow label="光标">
      <GrowInput
        class="min-w-0 flex-1"
        size="small"
        clearable
        :model-value="model.cursor"
        placeholder="如 pointer"
        @update:model-value="(v) => patch({ cursor: String(v ?? '') })"
      />
    </FieldRow>
    <FieldRow label="zlevel">
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="model.zlevel"
        @update:model-value="(v) => patch({ zlevel: v == null ? undefined : Number(v) })"
      />
    </FieldRow>
    <FieldRow label="z">
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="model.z"
        @update:model-value="(v) => patch({ z: v == null ? undefined : Number(v) })"
      />
    </FieldRow>

    <SectionTitle title="动画" />
    <FieldRow label="开启动画">
      <GrowSwitch
        size="small"
        :model-value="model.animation !== false"
        @update:model-value="(v) => patch({ animation: !!v })"
      />
    </FieldRow>
    <FieldRow label="时长 ms">
      <GrowInputNumber
        class="min-w-0 flex-1"
        size="small"
        :controls="false"
        :model-value="model.animationDuration"
        @update:model-value="(v) => patch({ animationDuration: v == null ? undefined : Number(v) })"
      />
    </FieldRow>
    <FieldRow label="缓动">
      <GrowInput
        class="min-w-0 flex-1"
        size="small"
        clearable
        :model-value="model.animationEasing"
        placeholder="如 cubicOut"
        @update:model-value="(v) => patch({ animationEasing: String(v ?? '') })"
      />
    </FieldRow>

    <template v-if="type === 'line' || type === 'bar'">
      <SectionTitle title="堆叠" />
      <FieldRow label="stack">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="model.stack"
          placeholder="同名堆叠"
          @update:model-value="(v) => patch({ stack: String(v ?? '') })"
        />
      </FieldRow>
      <FieldRow label="策略">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="stackStrategyOptions"
          :model-value="model.stackStrategy || 'samesign'"
          @update:model-value="(v) => patch({ stackStrategy: String(v) })"
        />
      </FieldRow>
      <FieldRow v-if="type === 'bar'" label="顺序">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="stackOrderOptions"
          :model-value="model.stackOrder || 'seriesAsc'"
          @update:model-value="(v) => patch({ stackOrder: String(v) })"
        />
      </FieldRow>
    </template>

    <!-- line -->
    <template v-if="type === 'line'">
      <SectionTitle title="折线" />
      <FieldRow label="平滑">
        <GrowSwitch
          size="small"
          :model-value="!!model.smooth"
          @update:model-value="(v) => patch({ smooth: !!v })"
        />
      </FieldRow>
      <FieldRow v-if="model.smooth" label="平滑度">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :min="0"
          :max="1"
          :step="0.1"
                  :model-value="typeof model.smooth === 'number' ? model.smooth : undefined"
                  @update:model-value="
                    (v) => patch({ smooth: v == null || v === '' ? true : Number(v) })
                  "
        />
      </FieldRow>
      <FieldRow label="阶梯">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="stepOptions"
          :model-value="model.step || false"
          @update:model-value="(v) => patch({ step: v === false || v === 'false' ? false : v })"
        />
      </FieldRow>
      <FieldRow label="连接空值">
        <GrowSwitch
          size="small"
          :model-value="!!model.connectNulls"
          @update:model-value="(v) => patch({ connectNulls: !!v })"
        />
      </FieldRow>
      <FieldRow label="采样">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="samplingOptions"
          :model-value="model.sampling || ''"
          @update:model-value="(v) => patch({ sampling: v ? String(v) : undefined })"
        />
      </FieldRow>
      <FieldRow label="触发线事件">
        <GrowSwitch
          size="small"
          :model-value="!!model.triggerLineEvent"
          @update:model-value="(v) => patch({ triggerLineEvent: !!v })"
        />
      </FieldRow>

      <SectionTitle title="标记点" />
      <FieldRow label="显示拐点">
        <GrowSwitch
          size="small"
          :model-value="model.showSymbol !== false"
          @update:model-value="(v) => patch({ showSymbol: !!v })"
        />
      </FieldRow>
      <FieldRow label="全量显示">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="showAllSymbolOptions"
          :model-value="model.showAllSymbol ?? 'auto'"
          @update:model-value="(v) => patch({ showAllSymbol: v })"
        />
      </FieldRow>
      <ChartSeriesSymbolFields :model="model" @patch="patch" />

      <SectionTitle title="lineStyle" />
      <ChartColorFillField
        label="线颜色"
        :model-value="model.lineStyle?.color"
        @update:model-value="(v) => patchNested('lineStyle.color', v)"
      />
      <FieldRow label="线宽">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.lineStyle?.width"
          @update:model-value="(v) => patchNested('lineStyle.width', v == null ? undefined : Number(v))"
        />
      </FieldRow>
      <FieldRow label="线型">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="lineTypeOptions"
          :model-value="model.lineStyle?.type || 'solid'"
          @update:model-value="(v) => patchNested('lineStyle.type', v)"
        />
      </FieldRow>
      <FieldRow label="透明度">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :min="0"
          :max="1"
          :step="0.1"
          :model-value="model.lineStyle?.opacity"
          @update:model-value="(v) => patchNested('lineStyle.opacity', v == null ? undefined : Number(v))"
        />
      </FieldRow>
      <ChartSeriesShadowFields prefix="lineStyle" :model="model" @patch-nested="patchNested" />

      <SectionTitle title="areaStyle" />
      <FieldRow label="面积填充">
        <GrowSwitch
          size="small"
          :model-value="!!model.areaStyle"
          @update:model-value="onAreaToggle"
        />
      </FieldRow>
      <template v-if="model.areaStyle">
        <ChartColorFillField
          label="填充色"
          :model-value="model.areaStyle?.color"
          @update:model-value="(v) => patchNested('areaStyle.color', v)"
        />
        <FieldRow label="原点">
          <GrowSelect
            class="min-w-0 flex-1"
            size="small"
            :options="areaOriginOptions"
            :model-value="model.areaStyle?.origin || 'auto'"
            @update:model-value="(v) => patchNested('areaStyle.origin', v)"
          />
        </FieldRow>
        <FieldRow label="透明度">
          <GrowInputNumber
            class="min-w-0 flex-1"
            size="small"
            :controls="false"
            :min="0"
            :max="1"
            :step="0.1"
            :model-value="model.areaStyle?.opacity"
            @update:model-value="
              (v) => patchNested('areaStyle.opacity', v == null ? undefined : Number(v))
            "
          />
        </FieldRow>
        <ChartSeriesShadowFields prefix="areaStyle" :model="model" @patch-nested="patchNested" />
      </template>
    </template>

    <!-- bar -->
    <template v-else-if="type === 'bar'">
      <SectionTitle title="柱状" />
      <FieldRow label="柱宽">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="stringify(model.barWidth)"
          placeholder="如 20 或 40%"
          @update:model-value="(v) => patch({ barWidth: v as string })"
        />
      </FieldRow>
      <FieldRow label="最大柱宽">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="stringify(model.barMaxWidth)"
          @update:model-value="(v) => patch({ barMaxWidth: v as string })"
        />
      </FieldRow>
      <FieldRow label="最小柱宽">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="stringify(model.barMinWidth)"
          @update:model-value="(v) => patch({ barMinWidth: v as string })"
        />
      </FieldRow>
      <FieldRow label="最小高度">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.barMinHeight"
          @update:model-value="(v) => patch({ barMinHeight: v == null ? undefined : Number(v) })"
        />
      </FieldRow>
      <FieldRow label="barGap">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="model.barGap"
          placeholder="如 30%"
          @update:model-value="(v) => patch({ barGap: String(v ?? '') })"
        />
      </FieldRow>
      <FieldRow label="类目间距">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="model.barCategoryGap"
          placeholder="如 20%"
          @update:model-value="(v) => patch({ barCategoryGap: String(v ?? '') })"
        />
      </FieldRow>
      <FieldRow label="采样">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="samplingOptions"
          :model-value="model.sampling || ''"
          @update:model-value="(v) => patch({ sampling: v ? String(v) : undefined })"
        />
      </FieldRow>
      <FieldRow label="实时排序">
        <GrowSwitch
          size="small"
          :model-value="!!model.realtimeSort"
          @update:model-value="(v) => patch({ realtimeSort: !!v })"
        />
      </FieldRow>
      <FieldRow label="背景柱">
        <GrowSwitch
          size="small"
          :model-value="!!model.showBackground"
          @update:model-value="(v) => patch({ showBackground: !!v })"
        />
      </FieldRow>
      <template v-if="model.showBackground">
        <ChartColorFillField
          label="背景色"
          :model-value="model.backgroundStyle?.color"
          @update:model-value="(v) => patchNested('backgroundStyle.color', v)"
        />
        <FieldRow label="背景圆角">
          <GrowInput
            class="min-w-0 flex-1"
            size="small"
            clearable
            :model-value="stringify(model.backgroundStyle?.borderRadius)"
            placeholder="如 4 或 4,4,0,0"
            @update:model-value="(v) => patchNested('backgroundStyle.borderRadius', v)"
          />
        </FieldRow>
      </template>
    </template>

    <!-- scatter -->
    <template v-else-if="type === 'scatter'">
      <SectionTitle title="散点" />
      <ChartSeriesSymbolFields :model="model" @patch="patch" />
      <FieldRow label="大数据量">
        <GrowSwitch
          size="small"
          :model-value="!!model.large"
          @update:model-value="(v) => patch({ large: !!v })"
        />
      </FieldRow>
      <FieldRow v-if="model.large" label="阈值阈值">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.largeThreshold ?? 2000"
          @update:model-value="(v) => patch({ largeThreshold: Number(v) || 2000 })"
        />
      </FieldRow>
    </template>

    <!-- candlestick -->
    <template v-else-if="type === 'candlestick'">
      <SectionTitle title="K 线" />
      <FieldRow label="布局">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="candleLayoutOptions"
          :model-value="model.layout || ''"
          @update:model-value="(v) => patch({ layout: v ? String(v) : undefined })"
        />
      </FieldRow>
      <FieldRow label="柱宽">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="stringify(model.barWidth)"
          @update:model-value="(v) => patch({ barWidth: v as string })"
        />
      </FieldRow>
      <FieldRow label="最大柱宽">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.barMaxWidth"
          @update:model-value="(v) => patch({ barMaxWidth: v == null ? undefined : Number(v) })"
        />
      </FieldRow>
      <FieldRow label="最小柱宽">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.barMinWidth"
          @update:model-value="(v) => patch({ barMinWidth: v == null ? undefined : Number(v) })"
        />
      </FieldRow>
      <SectionTitle title="涨跌样式" />
      <FieldRow label="阳线色">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.color || null"
          @update:model-value="(v) => patchNested('itemStyle.color', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="阴线色">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.color0 || null"
          @update:model-value="(v) => patchNested('itemStyle.color0', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="阳线边框">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.borderColor || null"
          @update:model-value="(v) => patchNested('itemStyle.borderColor', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="阴线边框">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.borderColor0 || null"
          @update:model-value="(v) => patchNested('itemStyle.borderColor0', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="十字星边框">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.borderColorDoji || null"
          @update:model-value="(v) => patchNested('itemStyle.borderColorDoji', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="边框宽">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.itemStyle?.borderWidth"
          @update:model-value="
            (v) => patchNested('itemStyle.borderWidth', v == null ? undefined : Number(v))
          "
        />
      </FieldRow>
    </template>

    <!-- itemStyle for non-candlestick (candlestick has dedicated colors above) -->
    <template v-if="type !== 'candlestick'">
      <SectionTitle title="itemStyle" />
      <ChartColorFillField
        label="填充色"
        :model-value="model.itemStyle?.color"
        @update:model-value="(v) => patchNested('itemStyle.color', v)"
      />
      <FieldRow label="描边色">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.itemStyle?.borderColor || null"
          @update:model-value="(v) => patchNested('itemStyle.borderColor', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="描边宽">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.itemStyle?.borderWidth"
          @update:model-value="
            (v) => patchNested('itemStyle.borderWidth', v == null ? undefined : Number(v))
          "
        />
      </FieldRow>
      <FieldRow label="描边类型">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="lineTypeOptions"
          :model-value="model.itemStyle?.borderType || 'solid'"
          @update:model-value="(v) => patchNested('itemStyle.borderType', v)"
        />
      </FieldRow>
      <FieldRow v-if="type === 'bar'" label="圆角">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="stringify(model.itemStyle?.borderRadius)"
          placeholder="如 4 或 4,4,0,0"
          @update:model-value="(v) => patchNested('itemStyle.borderRadius', v)"
        />
      </FieldRow>
      <FieldRow label="透明度">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :min="0"
          :max="1"
          :step="0.1"
          :model-value="model.itemStyle?.opacity"
          @update:model-value="
            (v) => patchNested('itemStyle.opacity', v == null ? undefined : Number(v))
          "
        />
      </FieldRow>
      <ChartSeriesShadowFields prefix="itemStyle" :model="model" @patch-nested="patchNested" />
    </template>

    <SectionTitle title="label" />
    <FieldRow label="显示标签">
      <GrowSwitch
        size="small"
        :model-value="!!model.label?.show"
        @update:model-value="(v) => patchNested('label.show', !!v)"
      />
    </FieldRow>
    <template v-if="model.label?.show">
      <FieldRow label="位置">
        <GrowSelect
          class="min-w-0 flex-1"
          size="small"
          :options="labelPositionOptions"
          :model-value="model.label?.position || 'top'"
          @update:model-value="(v) => patchNested('label.position', v)"
        />
      </FieldRow>
      <FieldRow label="距离">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.label?.distance"
          @update:model-value="(v) => patchNested('label.distance', v == null ? undefined : Number(v))"
        />
      </FieldRow>
      <FieldRow label="旋转">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.label?.rotate"
          @update:model-value="(v) => patchNested('label.rotate', v == null ? undefined : Number(v))"
        />
      </FieldRow>
      <FieldRow label="颜色">
        <GrowColorPicker
          class="min-w-0 flex-1"
          size="small"
          show-alpha
          :model-value="model.label?.color || null"
          @update:model-value="(v) => patchNested('label.color', v || undefined)"
        />
      </FieldRow>
      <FieldRow label="字号">
        <GrowInputNumber
          class="min-w-0 flex-1"
          size="small"
          :controls="false"
          :model-value="model.label?.fontSize"
          @update:model-value="(v) => patchNested('label.fontSize', v == null ? undefined : Number(v))"
        />
      </FieldRow>
      <FieldRow label="formatter">
        <GrowInput
          class="min-w-0 flex-1"
          size="small"
          clearable
          :model-value="model.label?.formatter"
          placeholder="如 {c}"
          @update:model-value="(v) => patchNested('label.formatter', String(v ?? ''))"
        />
      </FieldRow>
    </template>

    <SectionTitle title="emphasis" />
    <FieldRow label="focus">
      <GrowSelect
        class="min-w-0 flex-1"
        size="small"
        :options="emphasisFocusOptions"
        :model-value="model.emphasis?.focus || 'none'"
        @update:model-value="(v) => patchNested('emphasis.focus', v)"
      />
    </FieldRow>
    <FieldRow label="禁用">
      <GrowSwitch
        size="small"
        :model-value="!!model.emphasis?.disabled"
        @update:model-value="(v) => patchNested('emphasis.disabled', !!v)"
      />
    </FieldRow>
    <FieldRow v-if="type === 'line' || type === 'scatter'" label="缩放">
      <GrowSwitch
        size="small"
        :model-value="model.emphasis?.scale !== false"
        @update:model-value="(v) => patchNested('emphasis.scale', !!v)"
      />
    </FieldRow>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import {
  CARTESIAN_SERIES_TYPE_OPTIONS,
  type CartesianSeriesType,
} from '../../GrowReportRenderer/chartTypes'
import ChartColorFillField from './ChartColorFillField.vue'
import ChartSeriesSymbolFields from './ChartSeriesSymbolFields.vue'
import ChartSeriesShadowFields from './ChartSeriesShadowFields.vue'

defineOptions({
  name: 'ChartSeriesItemFields',
})

const props = defineProps<{
  model: Record<string, any>
}>()

const emit = defineEmits<{
  patch: [patch: Record<string, any>]
  'patch-nested': [path: string, value: unknown]
}>()

const type = computed(() => (props.model.type || 'line') as CartesianSeriesType)

const yAxisIndexOptions = [
  { label: '左轴 (0)', value: 0 },
  { label: '右轴 (1)', value: 1 },
]

const stackStrategyOptions = [
  { label: '同号 samesign', value: 'samesign' },
  { label: '全部 all', value: 'all' },
  { label: '正正 / 负负 positive', value: 'positive' },
  { label: '负负 negative', value: 'negative' },
]

const stackOrderOptions = [
  { label: '系列升序', value: 'seriesAsc' },
  { label: '系列降序', value: 'seriesDesc' },
]

const stepOptions = [
  { label: '关闭', value: false },
  { label: 'start', value: 'start' },
  { label: 'middle', value: 'middle' },
  { label: 'end', value: 'end' },
]

const samplingOptions = [
  { label: '关闭', value: '' },
  { label: 'lttb', value: 'lttb' },
  { label: 'average', value: 'average' },
  { label: 'max', value: 'max' },
  { label: 'min', value: 'min' },
  { label: 'sum', value: 'sum' },
]

const showAllSymbolOptions = [
  { label: 'auto', value: 'auto' },
  { label: '是', value: true },
  { label: '否', value: false },
]

const lineTypeOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]

const areaOriginOptions = [
  { label: 'auto', value: 'auto' },
  { label: 'start', value: 'start' },
  { label: 'end', value: 'end' },
]

const candleLayoutOptions = [
  { label: '默认竖向', value: '' },
  { label: 'horizontal', value: 'horizontal' },
]

const labelPositionOptions = [
  { label: 'top', value: 'top' },
  { label: 'left', value: 'left' },
  { label: 'right', value: 'right' },
  { label: 'bottom', value: 'bottom' },
  { label: 'inside', value: 'inside' },
  { label: 'insideTop', value: 'insideTop' },
  { label: 'insideBottom', value: 'insideBottom' },
  { label: 'insideLeft', value: 'insideLeft' },
  { label: 'insideRight', value: 'insideRight' },
]

const emphasisFocusOptions = [
  { label: 'none', value: 'none' },
  { label: 'self', value: 'self' },
  { label: 'series', value: 'series' },
]

const stringify = (value: unknown) => {
  if (value == null) return ''
  if (Array.isArray(value)) return value.join(',')
  return String(value)
}

const patch = (next: Record<string, any>) => emit('patch', next)

const patchNested = (path: string, value: unknown) => emit('patch-nested', path, value)

const onAreaToggle = (enabled: boolean) => {
  if (enabled) patch({ areaStyle: props.model.areaStyle || {} })
  else patch({ areaStyle: undefined })
}

const SectionTitle = defineComponent({
  name: 'SeriesSectionTitle',
  props: { title: { type: String, required: true } },
  setup(p) {
    return () =>
      h(
        'div',
        {
          class:
            'mb-0.5 mt-2 border-b border-solid border-border pb-0.5 text-xs font-medium text-text first:mt-0',
        },
        p.title,
      )
  },
})

const FieldRow = defineComponent({
  name: 'SeriesFieldRow',
  props: { label: { type: String, required: true } },
  setup(p, { slots }) {
    return () =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'w-20 shrink-0 text-xs text-text-secondary' }, p.label),
        slots.default?.(),
      ])
  },
})
</script>
