<template>
  <SystemMenuManage :allow-hierarchy="false" api-scope="platform" />
</template>

<script lang="ts" setup>
import { SystemMenuManage } from '@grow-admin-cornerstone/apps-system'

defineOptions({ name: 'ApplicationFunctionPage' })
</script>
