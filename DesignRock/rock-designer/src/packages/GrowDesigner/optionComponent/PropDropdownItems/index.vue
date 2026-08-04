<template>
  <div class="prop-dropdown-items">
    <div
      v-for="(item, index) in itemList"
      :key="itemKey(item, index)"
      class="prop-dropdown-items__row"
    >
      <GrowInput
        class="prop-dropdown-items__label"
        size="small"
        :model-value="item.label"
        :placeholder="`${titlePrefix}标题`"
        @update:model-value="(val) => onLabelChange(index, val)"
      />
      <GrowInput
        class="prop-dropdown-items__command"
        size="small"
        :model-value="String(item.command ?? '')"
        placeholder="指令 command"
        @update:model-value="(val) => onCommandChange(index, val)"
      />
      <button
        type="button"
        class="prop-dropdown-items__btn"
        :class="{ 'is-active': Boolean(item.divided) }"
        title="显示分割线"
        @click="onToggleDivided(index)"
      >
        <GrowIconify icon="carbon:subtract" :size="14" />
      </button>
      <button
        type="button"
        class="prop-dropdown-items__btn prop-dropdown-items__btn--danger"
        title="删除"
        @click="onRemove(index)"
      >
        <GrowIconify icon="carbon:trash-can" :size="14" />
      </button>
    </div>

    <button
      type="button"
      class="prop-dropdown-items__add"
      @click="onAdd"
    >
      <GrowIconify icon="carbon:add" :size="14" />
      <span>添加{{ titlePrefix }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { nanoid } from 'nanoid'

defineOptions({ name: 'PropDropdownItems' })

type DropdownItemDraft = {
  label?: string
  command?: string | number
  disabled?: boolean
  divided?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: DropdownItemDraft[]
    titlePrefix?: string
  }>(),
  {
    modelValue: () => [],
    titlePrefix: '菜单项',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: DropdownItemDraft[]]
}>()

const itemList = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
)

const itemKey = (item: DropdownItemDraft, index: number) =>
  `${String(item.command ?? '')}-${index}`

const commit = (next: DropdownItemDraft[]) => {
  emit('update:modelValue', next)
}

const onLabelChange = (index: number, value: string) => {
  const next = itemList.value.map((item, i) =>
    i === index ? { ...item, label: value } : { ...item },
  )
  commit(next)
}

const onCommandChange = (index: number, value: string) => {
  const next = itemList.value.map((item, i) =>
    i === index ? { ...item, command: value } : { ...item },
  )
  commit(next)
}

const onToggleDivided = (index: number) => {
  const next = itemList.value.map((item, i) =>
    i === index ? { ...item, divided: !item.divided } : { ...item },
  )
  commit(next)
}

const onRemove = (index: number) => {
  const next = itemList.value.filter((_, i) => i !== index)
  commit(next)
}

const onAdd = () => {
  const index = itemList.value.length + 1
  const command = nanoid(8)
  commit([
    ...itemList.value.map((item) => ({ ...item })),
    {
      label: `${props.titlePrefix} ${index}`,
      command,
      divided: false,
    },
  ])
}
</script>

<style scoped>
.prop-dropdown-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.prop-dropdown-items__row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.prop-dropdown-items__label {
  flex: 1 1 42%;
  min-width: 0;
}

.prop-dropdown-items__command {
  flex: 1 1 42%;
  min-width: 0;
}

.prop-dropdown-items__btn {
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--text-color-secondary);
  line-height: 1;
  cursor: pointer;
}

.prop-dropdown-items__btn :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0;
}

.prop-dropdown-items__btn.is-active {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.prop-dropdown-items__btn--danger:hover {
  color: var(--error-color);
  border-color: currentColor;
}

.prop-dropdown-items__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: auto;
  max-width: 100%;
  height: 28px;
  padding: 0 10px;
  border: 1px dashed var(--layout-border-color);
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  align-self: flex-start;
}

.prop-dropdown-items__add :deep(.grow-iconify) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.prop-dropdown-items__add:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}
</style>
