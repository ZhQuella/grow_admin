<template>
  <div class="sensitive-input">
    <GrowInput
      :model-value="modelValue"
      :type="visible ? 'text' : 'password'"
      :show-password="false"
      clearable
      :placeholder="placeholder"
      :maxlength="maxlength"
      @update:model-value="onInput"
    />
    <GrowButton link type="primary" @click="visible = !visible">
      {{ visible ? '隐藏' : '显示' }}
    </GrowButton>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({ name: 'SensitiveInput' })

defineProps<{
  modelValue?: string
  placeholder?: string
  maxlength?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)

function onInput(value: string | number) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<style scoped>
.sensitive-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sensitive-input :deep(.el-input) {
  flex: 1;
}
</style>
