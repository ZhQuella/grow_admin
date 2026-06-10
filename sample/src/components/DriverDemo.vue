<script setup lang="ts">
import { ref } from 'vue';
import { useMessage, useNotice, useDialog } from '@grow-admin-rock/components';
import { ComponentLibraryType } from '@grow-admin-rock/types';
import { projectSetting } from '../projectSetting';

const inputValue = ref('');
const message = useMessage();
const notice = useNotice();
const dialog = useDialog();

function handleMessage(type: 'success' | 'error' | 'warning' | 'info') {
  message?.[type]?.('这是一条 Message 提示');
}

function handleNotice() {
  notice?.success?.({
    title: '通知标题',
    content: '这是一条 Notification 通知',
    message: '这是一条 Notification 通知',
    description: '这是一条 Notification 通知',
  });
}

function handleDialog() {
  if (!dialog) return;
  if (typeof dialog.warning === 'function') {
    dialog.warning({
      title: '确认操作',
      content: '确定要执行此操作吗？',
      positiveText: '确定',
      negativeText: '取消',
    });
  } else if (projectSetting.componentLibrary === ComponentLibraryType.AntDesignVue) {
    dialog.confirm({
      title: '确认操作',
      content: '确定要执行此操作吗？',
    });
  } else if (typeof dialog.confirm === 'function') {
    dialog.confirm('确定要执行此操作吗？', '确认操作');
  }
}
</script>

<template>
  <div class="p-8 flex flex-col items-center gap-4">
    <h1 class="text-2xl font-bold">Grow Admin - 组件驱动演示</h1>
    <p class="text-gray-500">当前组件库：{{ projectSetting.componentLibrary }}</p>

    <div class="flex flex-wrap gap-2 justify-center">
      <GrowButton type="primary" @click="handleMessage('success')">Message Success</GrowButton>
      <GrowButton @click="handleMessage('error')">Message Error</GrowButton>
      <GrowButton @click="handleMessage('warning')">Message Warning</GrowButton>
      <GrowButton @click="handleMessage('info')">Message Info</GrowButton>
    </div>

    <div class="flex flex-wrap gap-2 justify-center">
      <GrowButton type="primary" @click="handleNotice">Notification</GrowButton>
      <GrowButton @click="handleDialog">Dialog 确认框</GrowButton>
    </div>

    <GrowInput v-model="inputValue" placeholder="GrowInput 输入框" style="width: 240px" />
    <p v-if="inputValue" class="text-gray-500">输入值: {{ inputValue }}</p>

    <p class="text-sm text-gray-400 max-w-lg text-center">
      统一调用：import { useMessage, useNotice, useDialog } from '@grow-admin-rock/components'，
      在 Provider 子组件的 setup 中 const message = useMessage()，再调用 message.success('...')。
    </p>
  </div>
</template>
