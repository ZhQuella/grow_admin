<script setup lang="ts">
import { PageLoading } from '@grow-admin-rock/layouts'
</script>

<template>
  <GrowConfig>
    <GrowNotificationProvider>
      <GrowMessageProvider>
        <GrowDialogProvider>
          <PageLoading />
          <router-view />
        </GrowDialogProvider>
      </GrowMessageProvider>
    </GrowNotificationProvider>
  </GrowConfig>
</template>
