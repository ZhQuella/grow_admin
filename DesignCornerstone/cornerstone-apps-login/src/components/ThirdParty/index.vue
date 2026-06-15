<script lang="ts" setup>
const thirdPartyIcons = [
  'ant-design:alipay-circle-outlined',
  'ant-design:github-outlined',
  'ant-design:wechat-filled',
  'ant-design:weibo-outlined',
  'ant-design:google-outlined'
]
</script>

<template>
  <div class="flex justify-between gap-2">
    <GrowButton
      v-for="icon in thirdPartyIcons"
      :key="icon"
      circle
      class="login-interactive-icon login-interactive-icon--soft !h-10 !w-10 border border-border bg-component text-text-secondary hover:-translate-y-0.5"
      aria-label="third party login"
    >
      <GrowIconify :icon="icon" :size="20" />
    </GrowButton>
  </div>
</template>
