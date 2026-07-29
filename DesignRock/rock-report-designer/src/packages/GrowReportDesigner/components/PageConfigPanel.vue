<template>
  <div class="relative flex h-full min-h-0 w-full flex-col overflow-hidden" @click.stop>
    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <GrowForm
          label-width="96px"
          label-position="left"
          size="small"
          :show-message="false"
        >
          <p class="mb-2 mt-0 text-xs font-medium text-text-secondary">
            布局
          </p>
          <GrowFormItem label="列数">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="1"
              :max="96"
              :model-value="config.colNum"
              @update:model-value="(v) => patch({ colNum: Math.max(1, Number(v) || 1) })"
            />
          </GrowFormItem>
          <GrowFormItem label="行高">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="1"
              :model-value="config.rowHeight"
              @update:model-value="(v) => patch({ rowHeight: Math.max(1, Number(v) || 1) })"
            />
          </GrowFormItem>
          <GrowFormItem label="最大行数">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="1"
              :model-value="config.maxRows"
              placeholder="不限"
              @update:model-value="onMaxRowsChange"
            />
          </GrowFormItem>
          <GrowFormItem label="缩放">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="0.1"
              :max="4"
              :step="0.1"
              :model-value="config.transformScale"
              @update:model-value="(v) => patch({ transformScale: Math.max(0.1, Number(v) || 1) })"
            />
          </GrowFormItem>
          <GrowFormItem label="水平间距">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="0"
              :model-value="marginX"
              @update:model-value="(v) => onMarginChange(0, v)"
            />
          </GrowFormItem>
          <GrowFormItem label="垂直间距">
            <GrowInputNumber
              class="w-full"
              size="small"
              :controls="false"
              :min="0"
              :model-value="marginY"
              @update:model-value="(v) => onMarginChange(1, v)"
            />
          </GrowFormItem>
          <GrowFormItem v-for="item in switchFields" :key="item.key" :label="item.label">
            <div class="flex items-center gap-2">
              <GrowSwitch
                size="small"
                :model-value="Boolean(config[item.key])"
                @update:model-value="(v) => patch({ [item.key]: Boolean(v) })"
              />
              <GrowTooltip v-if="item.describe" :content="item.describe" placement="top">
                <span class="inline-flex cursor-help text-text-secondary">
                  <GrowIconify icon="carbon:help" :size="13" />
                </span>
              </GrowTooltip>
            </div>
          </GrowFormItem>

          <p class="mb-2 mt-3 text-xs font-medium text-text-secondary">
            响应式
          </p>
          <GrowFormItem label="响应式">
            <div class="flex items-center gap-2">
              <GrowSwitch
                size="small"
                :model-value="Boolean(config.responsive)"
                @update:model-value="(v) => patch({ responsive: Boolean(v) })"
              />
              <GrowTooltip
                content="开启后画布随容器宽度切换断点列数；预览固定使用「列数」以与设计一致"
                placement="top"
              >
                <span class="inline-flex cursor-help text-text-secondary">
                  <GrowIconify icon="carbon:help" :size="13" />
                </span>
              </GrowTooltip>
            </div>
          </GrowFormItem>

          <template v-if="config.responsive">
            <p class="mb-2 mt-2 text-xs text-text-secondary">断点宽度 breakpoints</p>
            <GrowFormItem v-for="key in breakpointKeys" :key="`bp-${key}`" :label="key">
              <GrowInputNumber
                class="w-full"
                size="small"
                :controls="false"
                :min="0"
                :model-value="breakpoints[key]"
                @update:model-value="(v) => onBreakpointChange(key, v)"
              />
            </GrowFormItem>

            <p class="mb-2 mt-2 text-xs text-text-secondary">断点列数 cols</p>
            <GrowFormItem v-for="key in breakpointKeys" :key="`col-${key}`" :label="key">
              <GrowInputNumber
                class="w-full"
                size="small"
                :controls="false"
                :min="1"
                :model-value="cols[key]"
                @update:model-value="(v) => onColsChange(key, v)"
              />
            </GrowFormItem>
          </template>
        </GrowForm>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import {
  createDefaultPageConfig,
  type ReportPageConfig,
} from '../../GrowReportRenderer/types'

defineOptions({ name: 'PageConfigPanel' })

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = toRefs(props)

const breakpointKeys = ['lg', 'md', 'sm', 'xs', 'xxs'] as const

const switchFields: {
  key:
    | 'isDraggable'
    | 'isResizable'
    | 'isMirrored'
    | 'isBounded'
    | 'autoSize'
    | 'verticalCompact'
    | 'restoreOnDrag'
    | 'preventCollision'
    | 'useCssTransforms'
    | 'useStyleCursor'
  label: string
  describe?: string
}[] = [
  { key: 'isDraggable', label: '可拖拽', describe: '仅预览/运行时：网格项是否可拖拽；画布始终可拖拽' },
  { key: 'isResizable', label: '可缩放', describe: '仅预览/运行时：网格项是否可调整大小；画布始终可缩放' },
  { key: 'isMirrored', label: '镜像', describe: '是否反转 RTL/LTR' },
  { key: 'isBounded', label: '边界限制', describe: '拖拽时是否限制在容器内' },
  { key: 'autoSize', label: '自动高度', describe: '容器高度是否随内容伸缩' },
  { key: 'verticalCompact', label: '垂直紧凑', describe: '布局是否垂直紧凑排列' },
  { key: 'restoreOnDrag', label: '拖过还原', describe: '拖过其他项后是否还原位置' },
  { key: 'preventCollision', label: '禁止碰撞', describe: '拖拽覆盖时其他项是否移动' },
  {
    key: 'useCssTransforms',
    label: 'CSS Transform',
    describe: '是否使用 CSS transform 过渡',
  },
  { key: 'useStyleCursor', label: '光标样式', describe: '仅预览/运行时：拖拽卡顿时可关闭以缓解' },
]

const ensurePageConfig = () => {
  if (!data.value.pageConfig) {
    data.value.pageConfig = createDefaultPageConfig()
  }
  return data.value.pageConfig as ReportPageConfig
}

const config = computed(() => {
  const current = (data.value.pageConfig || {}) as ReportPageConfig
  const defaults = createDefaultPageConfig()
  return {
    ...defaults,
    ...current,
    margin: current.margin?.length === 2 ? current.margin : defaults.margin,
    breakpoints: current.breakpoints || defaults.breakpoints,
    cols: current.cols || defaults.cols,
  }
})

const marginX = computed(() => config.value.margin?.[0] ?? 10)
const marginY = computed(() => config.value.margin?.[1] ?? 10)
const breakpoints = computed(
  () => config.value.breakpoints || createDefaultPageConfig().breakpoints!,
)
const cols = computed(() => config.value.cols || createDefaultPageConfig().cols!)

const patch = (next: Partial<ReportPageConfig>) => {
  Object.assign(ensurePageConfig(), next)
}

const onMaxRowsChange = (value: number | null | undefined) => {
  const page = ensurePageConfig()
  if (value == null || !Number.isFinite(Number(value)) || Number(value) < 1) {
    Reflect.deleteProperty(page, 'maxRows')
    return
  }
  page.maxRows = Math.floor(Number(value))
}

const onMarginChange = (index: 0 | 1, value: number | null | undefined) => {
  const current = [...(config.value.margin || [10, 10])] as [number, number]
  current[index] = Math.max(0, Number(value) || 0)
  patch({ margin: current })
}

const onBreakpointChange = (
  key: (typeof breakpointKeys)[number],
  value: number | null | undefined,
) => {
  patch({
    breakpoints: {
      ...breakpoints.value,
      [key]: Math.max(0, Number(value) || 0),
    },
  })
}

const onColsChange = (
  key: (typeof breakpointKeys)[number],
  value: number | null | undefined,
) => {
  patch({
    cols: {
      ...cols.value,
      [key]: Math.max(1, Number(value) || 1),
    },
  })
}
</script>
