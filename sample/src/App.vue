<script setup lang="ts">
</script>

<template>
  <GrowConfig>
    <GrowNotificationProvider>
      <GrowMessageProvider>
        <GrowDialogProvider>
          <router-view />
        </GrowDialogProvider>
      </GrowMessageProvider>
    </GrowNotificationProvider>
  </GrowConfig>
</template>
