<template>
  <div
    class="grow-person-select"
    :class="[
      `grow-person-select--${normalizedSize}`,
      {
        'is-disabled': disabled,
        'is-focus': dialogVisible,
        'is-clearable': clearable && hasValue,
      },
    ]"
  >
    <div
      class="grow-person-select__trigger"
      tabindex="0"
      @click="onOpen"
      @keydown.enter.prevent="onOpen"
    >
      <div class="grow-person-select__main">
        <div v-if="hasValue" class="grow-person-select__tags">
          <GrowTag
            v-for="person in selectedPersons"
            :key="person.userId"
            :size="tagSize"
            :closable="!disabled && (multiple || clearable)"
            class="grow-person-select__tag"
            @close="onRemove(person.userId)"
          >
            {{ person.name }}（{{ person.deptName }}）
          </GrowTag>
        </div>
        <span v-else class="grow-person-select__placeholder">{{ placeholder }}</span>
      </div>

      <div class="grow-person-select__suffix" @click.stop>
        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="grow-person-select__clear"
          aria-label="清空"
          @click.stop.prevent="onClear"
        >
          <GrowIconify icon="ant-design:close-circle-outlined" :size="iconSize" />
        </button>
        <GrowIconify
          class="grow-person-select__arrow"
          icon="ant-design:user-outlined"
          :size="iconSize"
        />
      </div>
    </div>

    <PersonSelectDialog
      v-model:visible="dialogVisible"
      :model-value="modelValue"
      :multiple="multiple"
      @confirm="onConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { PersonSelectSize, PersonSelectValue } from '../types'
import { getPersonsByIds } from '../utils'
import PersonSelectDialog from './PersonSelectDialog.vue'

defineOptions({
  name: 'GrowPersonSelect',
})

const props = withDefaults(
  defineProps<{
    modelValue?: PersonSelectValue
    multiple?: boolean
    disabled?: boolean
    clearable?: boolean
    placeholder?: string
    size?: PersonSelectSize
  }>(),
  {
    modelValue: undefined,
    multiple: true,
    disabled: false,
    clearable: true,
    placeholder: '请选择人员',
    size: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | '']
  change: [value: string | string[] | '']
}>()

const dialogVisible = ref(false)

const normalizedSize = computed<PersonSelectSize>(() => {
  const size = props.size
  if (size === 'large' || size === 'small') return size
  return 'default'
})

/** Tag 尺寸：small 跟 size，其余用 default（贴近 EP Input） */
const tagSize = computed(() =>
  normalizedSize.value === 'small' ? 'small' : 'default',
)

const iconSize = computed(() => {
  if (normalizedSize.value === 'large') return 16
  if (normalizedSize.value === 'small') return 12
  return 14
})

const selectedIds = computed(() => {
  const value = props.modelValue
  if (value == null || value === '') return [] as string[]
  return Array.isArray(value) ? value.filter(Boolean) : [String(value)]
})

const selectedPersons = computed(() => getPersonsByIds(selectedIds.value))

const hasValue = computed(() => selectedPersons.value.length > 0)

const onOpen = () => {
  if (props.disabled) return
  dialogVisible.value = true
}

const commit = (value: string | string[] | '') => {
  emit('update:modelValue', value)
  emit('change', value)
}

const onConfirm = (value: string | string[] | '') => {
  commit(value)
}

const onRemove = (userId: string) => {
  if (props.disabled) return
  if (!props.multiple) {
    commit('')
    return
  }
  commit(selectedIds.value.filter((id) => id !== userId))
}

const onClear = () => {
  if (props.disabled) return
  commit(props.multiple ? [] : '')
}
</script>

<style lang="scss" scoped>
.grow-person-select {
  width: 100%;
  box-sizing: border-box;
}

.grow-person-select__trigger {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--layout-border-color);
  border-radius: 4px;
  background: var(--component-background-color);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: var(--primary-color);
  }
}

/* 与 Element Plus Input 尺寸对齐：large 40 / default 32 / small 24 */
.grow-person-select--large .grow-person-select__trigger {
  min-height: 40px;
  padding: 4px 12px;
}

.grow-person-select--default .grow-person-select__trigger {
  min-height: 32px;
  padding: 4px 8px;
}

.grow-person-select--small .grow-person-select__trigger {
  min-height: 24px;
  padding: 2px 6px;
}

.grow-person-select.is-focus .grow-person-select__trigger {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--color-primary-a16);
}

.grow-person-select.is-disabled .grow-person-select__trigger {
  cursor: not-allowed;
  background: var(--layout-container-background-color);
  color: var(--text-color-secondary);
  border-color: var(--layout-border-color);
}

.grow-person-select__main {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
}

.grow-person-select__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: 100%;
}

.grow-person-select__tag {
  flex: 0 0 auto;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;

  :deep(.el-tag),
  :deep(.n-tag),
  :deep(.ant-tag) {
    display: inline-flex;
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
  }
}

.grow-person-select__placeholder {
  display: block;
  color: var(--text-color-secondary);
}

.grow-person-select--large .grow-person-select__placeholder {
  line-height: 30px;
  font-size: 14px;
}

.grow-person-select--default .grow-person-select__placeholder {
  line-height: 22px;
  font-size: 13px;
}

.grow-person-select--small .grow-person-select__placeholder {
  line-height: 18px;
  font-size: 12px;
}

/** 清除 / 人员图标：同一位置叠放，hover 切换（与 GrowSelect 一致） */
.grow-person-select__suffix {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  align-self: center;
  justify-content: center;
  margin-left: 8px;
  line-height: 1;
  color: var(--text-color-secondary);
}

.grow-person-select--large .grow-person-select__suffix {
  width: 16px;
  height: 16px;
}

.grow-person-select--default .grow-person-select__suffix {
  width: 14px;
  height: 14px;
}

.grow-person-select--small .grow-person-select__suffix {
  width: 12px;
  height: 12px;
  margin-left: 6px;
}

.grow-person-select__clear,
.grow-person-select__arrow {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.grow-person-select__clear {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  z-index: 1;

  &:hover {
    color: var(--text-color);
  }
}

.grow-person-select__arrow {
  opacity: 1;
  pointer-events: none;
  z-index: 0;
}

.grow-person-select.is-clearable .grow-person-select__trigger:hover {
  .grow-person-select__clear {
    opacity: 1;
    pointer-events: auto;
  }

  .grow-person-select__arrow {
    opacity: 0;
  }
}

.grow-person-select.is-disabled.is-clearable .grow-person-select__trigger:hover {
  .grow-person-select__clear {
    opacity: 0;
    pointer-events: none;
  }

  .grow-person-select__arrow {
    opacity: 1;
  }
}
</style>
