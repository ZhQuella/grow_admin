<template>
  <GrowSelect
    :model-value="modelValue"
    :options="options"
    label="label"
    value="value"
    multiple
    filterable
    clearable
    collapse-tags
    placeholder="请选择"
    @update:model-value="onChange"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { fetchSystemPersons } from '../../../api/systemRole'
import { FILTER_CURRENT_USER, type SystemPerson } from '../../../types/systemRole'

defineOptions({ name: 'FilterPersonSelect' })

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const persons = ref<SystemPerson[]>([])

const options = computed(() => [
  { value: FILTER_CURRENT_USER, label: '我（当前用户）' },
  ...persons.value.map((item) => ({
    value: item.userId,
    label: item.name,
  })),
])

function onChange(value: unknown) {
  emit('update:modelValue', Array.isArray(value) ? value.map((item) => String(item)) : [])
}

onMounted(async () => {
  try {
    const list = await fetchSystemPersons()
    persons.value = Array.isArray(list) ? list : []
  } catch {
    persons.value = []
  }
})
</script>
