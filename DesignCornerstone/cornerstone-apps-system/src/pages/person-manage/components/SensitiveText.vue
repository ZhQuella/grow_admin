<template>
  <span class="sensitive-text">
    <span>{{ visible ? displayText(value) : (masked || '-') }}</span>
    <GrowIconify
      v-if="value"
      class="sensitive-text__eye"
      :icon="visible ? 'ant-design:eye-invisible-outlined' : 'ant-design:eye-outlined'"
      :size="16"
      @click="visible = !visible"
    />
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { displayText } from '../use/helpers'

defineOptions({ name: 'SensitiveText' })

defineProps<{
  value?: string
  masked?: string
}>()

const visible = ref(false)
</script>

<style scoped>
.sensitive-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sensitive-text__eye {
  cursor: pointer;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.sensitive-text__eye:hover {
  color: var(--primary-color);
}
</style>
