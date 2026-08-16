<template>
  <div class="data-prep-asset-manage">
    <GrowRow justify="space-between" class="data-prep-asset-manage__toolbar">
      <GrowCol :span="14">
        <GrowSpace>
          <GrowButton type="primary" @click="openCreate">新增</GrowButton>
        </GrowSpace>
      </GrowCol>
      <GrowCol :span="10">
        <div class="data-prep-asset-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="data-prep-asset-manage__table">
      <GrowWatchBox class="data-prep-asset-manage__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            border
          >
            <GrowTableColumn
              v-for="col in leafColumns"
              :key="String(col.field)"
              :prop="String(col.field)"
              :label="col.title"
              :min-width="col.minWidth || 120"
              :fixed="col.fixed"
              :show-overflow-tooltip="col.field !== 'actions'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'currentVersion'">
                  {{ row.currentVersion || '-' }}
                </template>
                <template v-else-if="col.field === 'publishStatus'">
                  <GrowTag :type="row.currentVersion ? 'success' : 'info'" size="small">
                    {{ row.currentVersion ? '已发布' : '草稿' }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowTag :type="row.enabled ? 'success' : 'danger'" size="small">
                    {{ row.enabled ? '启用' : '停用' }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'updatedBy'">
                  {{ row.updatedBy || '-' }}
                </template>
                <template v-else-if="col.field === 'updatedAt'">
                  {{ formatTime(row.updatedAt) }}
                </template>
                <template v-else-if="col.field === 'publishedAt'">
                  {{ formatTime(row.publishedAt) }}
                </template>
                <template v-else-if="col.field === 'publishedBy'">
                  {{ row.publishedBy || '-' }}
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="data-prep-asset-manage__actions">
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="设计" placement="top">
                      <GrowButton link type="primary" @click="goDesign(row)">
                        <GrowIconify icon="ant-design:partition-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="发布" placement="top">
                      <GrowButton link type="primary" @click="onPublish(row)">
                        <GrowIconify icon="ant-design:cloud-upload-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="版本历史" placement="top">
                      <GrowButton link type="primary" @click="openVersions(row)">
                        <GrowIconify icon="ant-design:history-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="row.enabled ? '停用' : '启用'" placement="top">
                      <GrowButton
                        link
                        :type="row.enabled ? 'warning' : 'success'"
                        @click="onToggleEnabled(row)"
                      >
                        <GrowIconify
                          :icon="row.enabled ? 'ant-design:stop-outlined' : 'ant-design:check-circle-outlined'"
                          :size="16"
                        />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="删除" placement="top">
                      <GrowButton
                        link
                        type="danger"
                        :disabled="row.enabled"
                        @click="onDelete(row)"
                      >
                        <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>
                  {{ row[col.field] }}
                </template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="data-prep-asset-manage__pager">
      <GrowPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="loadList"
        @size-change="onSizeChange"
      />
    </div>

    <GrowDialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增数据准备资产' : '编辑基础信息'"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <GrowForm ref="formRef" :model="formModel" :rules="formRules" label-width="88px">
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="formModel.name" maxlength="64" show-word-limit clearable />
        </GrowFormItem>
        <GrowFormItem label="编码" prop="code">
          <GrowInput
            v-model="formModel.code"
            maxlength="64"
            show-word-limit
            clearable
            :disabled="formMode === 'edit'"
            placeholder="创建后不可修改"
          />
        </GrowFormItem>
        <GrowFormItem label="描述" prop="description">
          <GrowInput
            v-model="formModel.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="formSubmitting" @click="submitForm">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="publishVisible"
      title="发布确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="data-prep-asset-manage__hint">
        将把「{{ publishTarget?.name }}」当前草稿发布为新版本（v1 / v2 …）。
      </p>
      <GrowInput
        v-model="publishRemark"
        type="textarea"
        :rows="3"
        maxlength="100"
        show-word-limit
        placeholder="发布备注（可选）"
      />
      <template #footer>
        <GrowSpace>
          <GrowButton @click="publishVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="publishSubmitting" @click="confirmPublish">
            发布
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="deleteVisible"
      title="删除确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="data-prep-asset-manage__hint">
        确认删除「{{ deleteTarget?.name }}」？删除后不可恢复。
      </p>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton type="danger" :loading="deleteSubmitting" @click="confirmDelete">
            删除
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDrawer
      v-model="versionVisible"
      title="版本历史"
      size="480px"
      append-to-body
      destroy-on-close
    >
      <div class="data-prep-asset-manage__version-head">
        <div class="data-prep-asset-manage__version-head-main">
          <span>{{ versionAsset?.name }}</span>
          <span v-if="versionAsset?.code" class="data-prep-asset-manage__muted">
            {{ versionAsset.code }}
          </span>
        </div>
        <span class="data-prep-asset-manage__muted">
          当前版本：{{ versionCurrent || '-' }}
        </span>
      </div>
      <p v-if="versionLoading" class="data-prep-asset-manage__hint">加载中…</p>
      <div v-else-if="!versionRows.length" class="data-prep-asset-manage__version-empty">
        暂无发布版本
      </div>
      <GrowTimeline v-else class="data-prep-asset-manage__version-timeline">
        <GrowTimelineItem
          v-for="row in versionRows"
          :key="row.version"
          :timestamp="formatTime(row.publishedAt)"
          :type="row.isCurrent ? 'primary' : 'info'"
          :hollow="!row.isCurrent"
          placement="top"
        >
          <div
            class="data-prep-asset-manage__version-card"
            :class="{ 'is-current': row.isCurrent }"
          >
            <div class="data-prep-asset-manage__version-card-top">
              <div class="data-prep-asset-manage__version-card-title">
                <span class="data-prep-asset-manage__version-no">{{ row.version }}</span>
                <GrowTag v-if="row.isCurrent" type="success" size="small">当前版本</GrowTag>
                <GrowTag v-else type="info" size="small">历史版本</GrowTag>
              </div>
              <GrowTooltip v-if="!row.isCurrent" content="回滚到此版本" placement="top">
                <GrowButton link type="primary" @click="onRollback(row)">
                  <GrowIconify icon="ant-design:rollback-outlined" :size="16" />
                </GrowButton>
              </GrowTooltip>
            </div>
            <div class="data-prep-asset-manage__version-meta">
              <div class="data-prep-asset-manage__version-meta-item">
                <span class="data-prep-asset-manage__version-meta-label">发布时间</span>
                <span>{{ formatTime(row.publishedAt) }}</span>
              </div>
              <div class="data-prep-asset-manage__version-meta-item">
                <span class="data-prep-asset-manage__version-meta-label">发布人</span>
                <span>{{ row.publishedBy || '-' }}</span>
              </div>
            </div>
            <div class="data-prep-asset-manage__version-remark-block">
              <span class="data-prep-asset-manage__version-meta-label">发布备注</span>
              <p class="data-prep-asset-manage__version-remark">
                {{ row.remark || '无备注' }}
              </p>
            </div>
          </div>
        </GrowTimelineItem>
      </GrowTimeline>
    </GrowDrawer>
  </div>
</template>

<script lang="ts" setup>
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { useDataPrepAssetManage } from './use/useDataPrepAssetManage'

defineOptions({
  name: 'DataPrepAssetManagePage',
})

const {
  tableData,
  total,
  page,
  pageSize,
  searchList,
  tableColumns,
  leafColumns,
  loadList,
  onSearch,
  onColumnsConfirm,
  onSizeChange,
  formVisible,
  formMode,
  formSubmitting,
  formRef,
  formModel,
  formRules,
  openCreate,
  openEdit,
  submitForm,
  publishVisible,
  publishSubmitting,
  publishRemark,
  publishTarget,
  deleteVisible,
  deleteSubmitting,
  deleteTarget,
  versionVisible,
  versionLoading,
  versionAsset,
  versionCurrent,
  versionRows,
  goDesign,
  onPublish,
  confirmPublish,
  onToggleEnabled,
  onDelete,
  confirmDelete,
  openVersions,
  onRollback,
  formatTime,
} = useDataPrepAssetManage()
</script>

<style scoped>
.data-prep-asset-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.data-prep-asset-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.data-prep-asset-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.data-prep-asset-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-color, #fff);
}

.data-prep-asset-manage__watch {
  height: 100%;
  min-height: 0;
}

.data-prep-asset-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-color, #fff);
}

.data-prep-asset-manage__hint {
  margin: 0 0 12px;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.data-prep-asset-manage__version-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 600;
}

.data-prep-asset-manage__version-head-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.data-prep-asset-manage__version-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.data-prep-asset-manage__version-timeline {
  padding-left: 4px;
}

.data-prep-asset-manage__version-card {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color, #f5f7fa);
}

.data-prep-asset-manage__version-card.is-current {
  background: color-mix(in srgb, var(--el-color-primary, #409eff) 8%, transparent);
}

.data-prep-asset-manage__version-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.data-prep-asset-manage__version-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.data-prep-asset-manage__version-no {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
}

.data-prep-asset-manage__version-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-top: 10px;
}

.data-prep-asset-manage__version-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 13px;
  color: var(--text-color);
  word-break: break-word;
}

.data-prep-asset-manage__version-meta-label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.data-prep-asset-manage__version-remark-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.data-prep-asset-manage__version-remark {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-color);
  word-break: break-word;
}

.data-prep-asset-manage__muted {
  color: var(--text-color-secondary);
  font-weight: 400;
  font-size: 13px;
}

.data-prep-asset-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}
</style>
