<template>
  <div class="prop-column-bar-columns">
    <GrowSelect
      class="prop-column-bar-columns__mode"
      size="small"
      :options="sourceOptions"
      :model-value="columnsSource"
      @update:model-value="onSourceChange"
    />

    <div v-if="columnsSource === 'bind'" class="prop-column-bar-columns__bind">
      <PropVariableBind
        :model-value="columnsBindText"
        placeholder="请绑定列数据，如 state.tableColumns"
        :bind-mode="columnsBindMode"
        @update:model-value="onColumnsBindValue"
        @update:bind-mode="onColumnsBindMode"
      />
    </div>

    <div v-else class="prop-column-bar-columns__table">
      <GrowSelect
        class="prop-column-bar-columns__table-select"
        size="small"
        clearable
        filterable
        :options="tableOptions"
        :model-value="tableUuid || undefined"
        placeholder="请选择画布中的表格"
        @update:model-value="onTableChange"
      />
      <GrowButton
        class="prop-column-bar-columns__sync"
        size="small"
        :disabled="!tableUuid"
        title="从关联表格同步表头"
        @click="syncFromTable"
      >
        <GrowIconify icon="carbon:renew" :size="14" />
      </GrowButton>
    </div>

    <p v-if="columnsSource === 'table' && !tableOptions.length" class="prop-column-bar-columns__hint">
      画布中暂无表格，请先拖入表格组件
    </p>
    <p v-else-if="columnsSource === 'table' && tableUuid" class="prop-column-bar-columns__hint">
      已同步 {{ columnCount }} 列；表格表头变更后可点同步刷新
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, watch, type Ref } from 'vue'
import { getAllChilds } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import { toColumnBarItems } from '../../static/tableColumnUtils'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
  PROP_BIND_MODE_TEXT,
  type PropBindMode,
} from '../../static/propBindModes'
import PropVariableBind from '../PropVariableBind/index.vue'

defineOptions({ name: 'PropColumnBarColumns' })

type ColumnsSource = 'bind' | 'table'

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>

const sourceOptions = [
  { label: '关联数据源', value: 'bind' },
  { label: '关联表格', value: 'table' },
]

const propsInfo = computed(() => {
  const uuid = activeUUID?.value
  if (!uuid || !draggableConfig?.props) return {}
  if (!draggableConfig.props[uuid]) draggableConfig.props[uuid] = {}
  return draggableConfig.props[uuid] as Record<string, any>
})

const bindModes = computed(() => {
  const uuid = activeUUID?.value
  if (!uuid || !draggableConfig) return {}
  if (!draggableConfig.propBindModes) draggableConfig.propBindModes = {}
  if (!draggableConfig.propBindModes[uuid]) draggableConfig.propBindModes[uuid] = {}
  return draggableConfig.propBindModes[uuid] as Record<string, string>
})

const columnsSource = computed<ColumnsSource>(() =>
  propsInfo.value.columnsSource === 'table' ? 'table' : 'bind',
)

const tableUuid = computed(() =>
  propsInfo.value.tableUuid == null ? '' : String(propsInfo.value.tableUuid),
)

const columnsBindMode = computed<PropBindMode>(() =>
  normalizePropBindMode(bindModes.value.columns),
)

const columnsBindText = computed(() => {
  const raw = propsInfo.value.columns
  if (raw == null) return ''
  if (typeof raw === 'string') return raw
  try {
    return JSON.stringify(raw)
  } catch {
    return ''
  }
})

const columnCount = computed(() => {
  const cols = propsInfo.value.columns
  return Array.isArray(cols) ? cols.length : 0
})

const tableOptions = computed(() => {
  const structures = draggableConfig?.structures || []
  const nodes = getAllChilds(structures)
  return nodes
    .map((node: { uuid: string }) => {
      const arg = draggableConfig?.renderArgument?.[node.uuid]
      if (arg?.elTagName !== 'GrowTable') return null
      const label =
        arg.elName ||
        `表格 ${String(node.uuid).slice(0, 6)}`
      return { label, value: node.uuid }
    })
    .filter(Boolean) as Array<{ label: string; value: string }>
})

const ensureProps = () => propsInfo.value

const onSourceChange = (next: string) => {
  const info = ensureProps()
  const mode: ColumnsSource = next === 'table' ? 'table' : 'bind'
  info.columnsSource = mode
  if (mode === 'bind') {
    info.tableUuid = ''
  } else {
    bindModes.value.columns = PROP_BIND_MODE_TEXT
    if (info.tableUuid) syncFromTable()
  }
}

const onColumnsBindMode = (mode: PropBindMode) => {
  bindModes.value.columns = normalizePropBindMode(mode) || PROP_BIND_MODE_TEXT
}

const onColumnsBindValue = (value: string) => {
  const info = ensureProps()
  info.columnsSource = 'bind'
  info.tableUuid = ''
  if (normalizePropBindMode(bindModes.value.columns) === PROP_BIND_MODE_BIND) {
    info.columns = value
    return
  }
  // 文本模式尝试解析 JSON 数组，否则按绑定表达式存字符串
  const trimmed = String(value ?? '').trim()
  if (!trimmed) {
    info.columns = []
    return
  }
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        info.columns = parsed
        bindModes.value.columns = PROP_BIND_MODE_TEXT
        return
      }
    } catch {
      /* fallthrough */
    }
  }
  info.columns = trimmed
  bindModes.value.columns = PROP_BIND_MODE_BIND
}

const syncFromTable = () => {
  const info = ensureProps()
  const uuid = info.tableUuid
  if (!uuid) {
    info.columns = []
    return
  }
  const tableProps = draggableConfig?.props?.[uuid]
  info.columns = toColumnBarItems(tableProps?.columns)
  bindModes.value.columns = PROP_BIND_MODE_TEXT
}

const onTableChange = (next: string | null | undefined) => {
  const info = ensureProps()
  info.columnsSource = 'table'
  info.tableUuid = next == null ? '' : String(next)
  bindModes.value.columns = PROP_BIND_MODE_TEXT
  syncFromTable()
}

// 关联表格时，表头变更自动同步（仅设计态属性面板挂载期间）
watch(
  () => {
    if (columnsSource.value !== 'table' || !tableUuid.value) return null
    return draggableConfig?.props?.[tableUuid.value]?.columns
  },
  (cols) => {
    if (columnsSource.value !== 'table' || !tableUuid.value) return
    if (cols == null) return
    ensureProps().columns = toColumnBarItems(cols)
  },
  { deep: true },
)
</script>

<style scoped lang="scss">
.prop-column-bar-columns {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.prop-column-bar-columns__mode,
.prop-column-bar-columns__bind {
  width: 100%;
}

.prop-column-bar-columns__table {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.prop-column-bar-columns__table-select {
  flex: 1;
  min-width: 0;
}

.prop-column-bar-columns__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-color-secondary);
}
</style>
