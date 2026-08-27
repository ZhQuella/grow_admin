<template>
  <span class="sensitive-text">
    <span>{{ visible ? displayText(value) : (masked || '-') }}</span>
    <GrowButton v-if="value" link type="primary" @click="visible = !visible">
      {{ visible ? '隐藏' : '显示' }}
    </GrowButton>
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
</style>
