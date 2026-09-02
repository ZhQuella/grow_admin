<template>
  <div class="online-page-design">
    <div class="online-page-design__bar">
      <div class="online-page-design__bar-left">
        <div v-if="asset" class="online-page-design__meta">
          <span class="online-page-design__title">{{ asset.name }}</span>
          <span class="online-page-design__code">{{ asset.code }}</span>
          <GrowTag size="small" type="primary">在线页面</GrowTag>
          <span class="online-page-design__version">
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

    <div class="online-page-design__body">
      <GrowSplitPane v-if="schemaReady" :tree-data="treeData" :root-horizontal="false">
        <template #Editor>
          <div class="box-border flex h-full min-h-0 flex-col overflow-hidden p-2">
            <div class="mb-2 shrink-0 text-sm font-medium text-text">
              代码编辑器
              <span class="ml-2 text-xs font-normal text-text-secondary">
                多文件 · 入口 App.vue · 支持 ./ 相对引入
              </span>
            </div>
            <MultiFileEditor
              v-model:files="sandboxFiles"
              entry="App.vue"
              class="min-h-0 flex-1 overflow-hidden rounded border border-solid border-border bg-component"
              :editor-options="{ theme: 'auto' }"
            />
          </div>
        </template>
        <template #Deps>
          <div class="box-border h-full min-h-0 overflow-hidden p-2">
            <GrowCodeDeps
              v-model="dependencies"
              class="h-full rounded border border-solid border-border bg-component"
            >
              <template #title>
                <span class="text-sm font-medium text-text">依赖注入</span>
              </template>
            </GrowCodeDeps>
          </div>
        </template>
        <template #Sandbox>
          <div class="box-border flex h-full min-h-0 flex-col overflow-hidden p-2">
            <div class="mb-2 flex shrink-0 items-center justify-between gap-2">
              <div class="text-sm font-medium text-text">呈现沙箱</div>
              <GrowButton
                v-if="!previewExpanded"
                size="small"
                circle
                title="放大预览"
                aria-label="放大预览"
                @click="previewExpanded = true"
              >
                <GrowIconify icon="ant-design:fullscreen-outlined" :size="14" />
              </GrowButton>
            </div>
            <div class="relative min-h-0 flex-1">
              <GrowCodeSandbox
                :files="sandboxFiles"
                entry="App.vue"
                :class="
                  previewExpanded
                    ? 'fixed inset-0 z-[1000] bg-[var(--layout-container-background-color)]'
                    : 'h-full rounded border border-solid border-border bg-component'
                "
                :expose="sandboxExpose"
                :dependencies="dependencies"
              />
              <GrowButton
                v-if="previewExpanded"
                size="small"
                circle
                class="!fixed right-3 top-3 z-[1001]"
                title="退出放大"
                aria-label="退出放大"
                @click="previewExpanded = false"
              >
                <GrowIconify icon="ant-design:fullscreen-exit-outlined" :size="14" />
              </GrowButton>
            </div>
          </div>
        </template>
      </GrowSplitPane>
      <div v-else class="online-page-design__empty">
        {{ loading ? '加载中…' : '页面不存在或加载失败' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SplitPaneItem } from '@grow-admin-rock/components/split-pane'
import { GrowSplitPane } from '@grow-admin-rock/components/split-pane'
import {
  GrowCodeDeps,
  GrowCodeSandbox,
} from '@grow-admin-rock/code-sandbox'
import MultiFileEditor from '@grow-admin-cornerstone/apps-sandbox/multi-file-editor'
import { useOnlinePageDesign } from './use/useOnlinePageDesign'

defineOptions({
  name: 'OnlinePageDesignPage',
})

const treeData: SplitPaneItem[] = [
  {
    size: 50,
    minSize: 30,
    horizontal: true,
    child: [
      { size: 60, minSize: 30, slotKey: 'Editor' },
      { size: 40, minSize: 20, slotKey: 'Deps' },
    ],
  },
  {
    size: 50,
    minSize: 20,
    slotKey: 'Sandbox',
  },
]

const {
  loading,
  saving,
  asset,
  publishStateTagType,
  schemaReady,
  sandboxFiles,
  dependencies,
  sandboxExpose,
  previewExpanded,
  onSave,
  onBack,
} = useOnlinePageDesign()
</script>

<style scoped>
.online-page-design {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--text-color);
  background: var(--layout-container-background-color);
}

.online-page-design__bar {
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

.online-page-design__bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.online-page-design__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.online-page-design__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.online-page-design__code,
.online-page-design__version {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.online-page-design__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.online-page-design__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
}
</style>
