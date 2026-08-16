<template>
  <div class="data-prep-asset-design">
    <div class="data-prep-asset-design__bar">
      <div class="data-prep-asset-design__bar-left">
        <div v-if="asset" class="data-prep-asset-design__meta">
          <span class="data-prep-asset-design__title">{{ asset.name }}</span>
          <span class="data-prep-asset-design__code">{{ asset.code }}</span>
          <GrowTag size="small" type="primary">数据集</GrowTag>
          <span class="data-prep-asset-design__version">
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

    <div class="data-prep-asset-design__body">
      <GrowDataPrepDesigner
        v-if="schemaReady && designerSchema"
        v-model="designerSchema"
        @save="onSave"
      />
      <div v-else class="data-prep-asset-design__empty">
        {{ loading ? '加载中…' : '资产不存在或加载失败' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GrowDataPrepDesigner } from '@grow-admin-rock/data-prep'
import { useDataPrepAssetDesign } from './use/useDataPrepAssetDesign'

defineOptions({
  name: 'DataPrepAssetDesignPage',
})

const {
  loading,
  saving,
  asset,
  publishStateTagType,
  designerSchema,
  schemaReady,
  onSave,
  onBack,
} = useDataPrepAssetDesign()
</script>

<style scoped>
.data-prep-asset-design {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.data-prep-asset-design__bar {
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

.data-prep-asset-design__bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.data-prep-asset-design__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.data-prep-asset-design__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.data-prep-asset-design__code,
.data-prep-asset-design__version {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.data-prep-asset-design__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.data-prep-asset-design__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
}
</style>
