<template>
  <div class="p-6">
    <p class="mb-4 m-0 text-lg font-semibold text-text">Child{{ id }}</p>
    <el-input v-model="value" placeholder="输入内容测试 keep-alive" />
    <el-button class="mt-3" @click="onBtnClick">click Me</el-button>
    <div v-if="visible" class="mt-3 text-text-secondary">显示么？</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { useTabs } from '@grow-admin-rock/hooks'

defineOptions({
  name: 'ChildPage',
})

const value = ref('')
const visible = ref(false)
const route = useRoute()
const { setTab } = useTabs()

const id = computed(() => route.params.id)

watch(
  () => [route.fullPath, id.value] as const,
  ([, nextId]) => {
    if (nextId != null && nextId !== '') {
      setTab(`详情页-${nextId}`)
    }
  },
  { immediate: true },
)

function onBtnClick() {
  visible.value = !visible.value
}
</script>
