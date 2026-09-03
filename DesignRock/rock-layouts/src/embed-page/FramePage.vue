<template>
  <div class="frame-page">
    <iframe
      :src="src"
      class="frame-page__iframe"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      @load="onIframeLoad"
    />
    <div v-if="loading" class="frame-page__loading">
      <GrowSpinner class="frame-page__spinner" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const loading = ref(true)

watch(
  () => props.src,
  () => {
    loading.value = true
  },
)

function onIframeLoad() {
  loading.value = false
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FramePage',
})
</script>

<style scoped>
.frame-page {
  position: relative;
  width: 100%;
  height: 100%;
}

.frame-page__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.frame-page__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--component-background-color, var(--el-bg-color, #fff));
}

.frame-page__spinner {
  font-size: 32px;
  color: var(--el-color-primary, var(--primary-color, #8b5cf6));
}
</style>
