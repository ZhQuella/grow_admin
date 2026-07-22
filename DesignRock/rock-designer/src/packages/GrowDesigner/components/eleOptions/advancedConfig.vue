<template>
  <div class="advanced-config">
    <GrowForm
      label-width="100px"
      label-position="left"
      size="small"
      :show-message="false"
    >
      <GrowFormItem label="唯一标识">
        <span class="advanced-config__uuid">{{ activeUUID }}</span>
      </GrowFormItem>
      <GrowFormItem label="组件名称">
        <GrowInput
          class="advanced-config__control w-full"
          :model-value="currentBasicConfig.elName"
          clearable
          placeholder="请输入组件名称"
          @update:model-value="onNameChange"
        />
      </GrowFormItem>
    </GrowForm>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'advancedConfig' })

const props = defineProps({
  activeUUID: {
    type: String,
    required: true,
  },
  currentBasicConfig: {
    type: Object,
    default: () => ({}),
  },
})

const onNameChange = (value: string) => {
  if (!props.currentBasicConfig) return
  props.currentBasicConfig.elName = value
}
</script>

<style scoped>
.advanced-config {
  height: 100%;
  padding: 10px;
}

.advanced-config__control {
  width: 100%;
}

.advanced-config__uuid {
  font-size: 13px;
  color: var(--text-color-secondary);
  word-break: break-all;
  line-height: 32px;
}
</style>
