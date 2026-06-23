<template>
  <div class="child-page">
    <p class="child-page__title">Child{{ id }}</p>
    <el-input v-model="value" placeholder="输入内容测试 keep-alive" />
    <el-button class="child-page__btn" @click="onBtnClick">click Me</el-button>
    <div v-if="visible" class="child-page__hint">显示么？</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
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

if (id.value != null && id.value !== '') {
  setTab(`详情页-${id.value}`)
}

function onBtnClick() {
  visible.value = !visible.value
}
</script>

<style scoped>
.child-page {
  padding: 24px;
}

.child-page__title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.child-page__btn {
  margin-top: 12px;
}

.child-page__hint {
  margin-top: 12px;
  color: var(--text-color-secondary);
}
</style>
