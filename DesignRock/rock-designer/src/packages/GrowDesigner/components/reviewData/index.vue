<template>
  <div class="review-data">
    <GrowCodeEditor
      :model-value="jsonText"
      default-language="json"
      :language-switchable="false"
      :options="{ readonly: true }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'

defineOptions({ name: 'reviewData' })

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const { data } = toRefs(props)
const jsonText = computed(() => JSON.stringify(data.value, null, 2))
</script>

<style scoped>
.review-data {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
