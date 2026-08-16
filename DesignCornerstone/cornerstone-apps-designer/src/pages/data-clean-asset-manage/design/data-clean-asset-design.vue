<template>
  <div class="data-clean-asset-design">
    <div class="data-clean-asset-design__bar">
      <div class="data-clean-asset-design__bar-left">
        <div v-if="asset" class="data-clean-asset-design__meta">
          <span class="data-clean-asset-design__title">{{ asset.name }}</span>
          <span class="data-clean-asset-design__code">{{ asset.code }}</span>
          <GrowTag size="small" type="primary">清洗流</GrowTag>
          <span class="data-clean-asset-design__version">
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

    <div class="data-clean-asset-design__body">
      <GrowDataCleanDesigner
        v-if="schemaReady && designerSchema"
        ref="designerRef"
        :model-value="designerSchema"
        @save="onSave"
      />
      <div v-else class="data-clean-asset-design__empty">
        {{ loading ? '加载中…' : '资产不存在或加载失败' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GrowDataCleanDesigner } from '@grow-admin-rock/data-clean'
import { useDataCleanAssetDesign } from './use/useDataCleanAssetDesign'

defineOptions({
  name: 'DataCleanAssetDesignPage',
})

const {
  loading,
  saving,
  asset,
  publishStateTagType,
  designerSchema,
  schemaReady,
  designerRef,
  onSave,
  onBack,
} = useDataCleanAssetDesign()
</script>

<style scoped>
.data-clean-asset-design {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.data-clean-asset-design__bar {
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

.data-clean-asset-design__bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.data-clean-asset-design__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.data-clean-asset-design__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.data-clean-asset-design__code,
.data-clean-asset-design__version {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.data-clean-asset-design__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.data-clean-asset-design__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
}
</style>
