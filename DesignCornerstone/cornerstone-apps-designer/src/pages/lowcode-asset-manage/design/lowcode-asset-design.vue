<template>
  <div class="lowcode-asset-design">
    <div class="lowcode-asset-design__bar">
      <div class="lowcode-asset-design__bar-left">
        <div class="lowcode-asset-design__meta" v-if="asset"> 
          <span class="lowcode-asset-design__title">{{ asset.name }}</span>
          <span class="lowcode-asset-design__code">{{ asset.code }}</span>
          <GrowTag size="small" type="primary">{{ typeLabel }}</GrowTag>
          <span class="lowcode-asset-design__version">
            当前版本:
          </span>
          <GrowTag size="small" :type="publishStateTagType">{{ asset.currentVersion || '未发布' }}</GrowTag>
        </div>
      </div>
      <div>
        <GrowButton size="small" :loading="saving" :disabled="!asset" @click="onBack">
          返回
        </GrowButton>
        <GrowButton size="small" type="primary" :loading="saving" :disabled="!asset" @click="onSave">
          保存
        </GrowButton>
      </div>
    </div>

    <div class="lowcode-asset-design__body">
      <GrowDesigner
        v-if="schemaReady"
        ref="designerRef"
        :schema="designerSchema"
      />
      <div v-else class="lowcode-asset-design__empty">
        {{ loading ? '加载中…' : '资产不存在或加载失败' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GrowDesigner } from '@grow-admin-rock/designer'
import { useLowcodeAssetDesign } from './use/useLowcodeAssetDesign'

defineOptions({
  name: 'LowcodeAssetDesignPage',
})

const {
  loading,
  saving,
  asset,
  publishStateTagType,
  designerSchema,
  schemaReady,
  designerRef,
  typeLabel,
  onSave,
  onBack,
} = useLowcodeAssetDesign()
</script>

<style scoped>
.lowcode-asset-design {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.lowcode-asset-design__bar {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 44px;
  padding: 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
}

.lowcode-asset-design__bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.lowcode-asset-design__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.lowcode-asset-design__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.lowcode-asset-design__code,
.lowcode-asset-design__version {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.lowcode-asset-design__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.lowcode-asset-design__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
}
</style>
