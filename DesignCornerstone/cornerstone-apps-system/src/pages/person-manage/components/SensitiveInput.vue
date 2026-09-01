<template>
  <div class="sensitive-input" :class="{ 'sensitive-input--masked': !visible }">
    <GrowInput
      :model-value="modelValue"
      type="text"
      autocomplete="off"
      :show-password="false"
      clearable
      :placeholder="placeholder"
      :maxlength="maxlength"
      @update:model-value="onInput"
    >
      <template #suffix>
        <GrowIconify
          class="sensitive-input__eye"
          :icon="visible ? 'ant-design:eye-invisible-outlined' : 'ant-design:eye-outlined'"
          :size="16"
          @click.stop="visible = !visible"
        />
      </template>
    </GrowInput>
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
  width: 100%;
}

.sensitive-input :deep(.el-input) {
  width: 100%;
}

.sensitive-input__eye {
  cursor: pointer;
  color: var(--text-color-secondary);
}

.sensitive-input__eye:hover {
  color: var(--primary-color);
}

.sensitive-input--masked :deep(input) {
  -webkit-text-security: disc;
}
</style>
