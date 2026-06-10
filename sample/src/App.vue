<script setup lang="ts">
import DriverDemo from './components/DriverDemo.vue';
</script>

<template>
  <GrowConfig>
    <GrowNotificationProvider>
      <GrowMessageProvider>
        <GrowDialogProvider>
          <router-view />
          <DriverDemo />
        </GrowDialogProvider>
      </GrowMessageProvider>
    </GrowNotificationProvider>
  </GrowConfig>
</template>
