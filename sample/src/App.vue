<script setup lang="ts">
import { ref } from 'vue';

const inputValue = ref('');
</script>

<template>
  <router-view />
  <div class="p-8 flex flex-col items-center gap-4">
    <h1 class="text-2xl font-bold">Grow Admin - 组件驱动演示</h1>
    <p class="text-gray-500">通过 projectSetting.componentLibrary 切换全局组件库</p>
    <GrowButton type="primary">GrowButton 契约组件</GrowButton>
    <GrowInput v-model="inputValue" placeholder="GrowInput 输入框" style="width: 240px" />
    <p v-if="inputValue">输入值: {{ inputValue }}</p>
  </div>
</template>
