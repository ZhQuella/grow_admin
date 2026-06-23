<template>
  <iframe :src="src" class="h-full w-full border-0" @load="onIframeLoad" />
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const { src } = toRefs(props)
const loading = ref(true)

const onIframeLoad = () => {
  loading.value = false
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FramePage',
})
</script>
