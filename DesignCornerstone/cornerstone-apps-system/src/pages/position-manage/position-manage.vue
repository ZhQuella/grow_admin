<template>
  <div class="position-manage">
    <GrowRow justify="space-between" class="position-manage__toolbar">
      <GrowCol :span="14">
        <div class="position-manage__toolbar-left">
          <GrowSpace>
            <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
          </GrowSpace>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="position-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="position-manage__table">
      <GrowWatchBox class="position-manage__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            row-key="id"
            border
          >
            <GrowTableColumn
              v-for="col in leafColumns"
              :key="String(col.field)"
              :prop="String(col.field)"
              :label="col.title"
              :width="col.width"
              :min-width="col.minWidth || (col.width ? undefined : 120)"
              :fixed="col.fixed"
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'enabled'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'enabled'">
                  <GrowTooltip
                    :content="row.enabled ? '停用' : '启用'"
                    placement="top"
                  >
                    <span class="position-manage__switch">
                      <GrowSwitch
                        :model-value="row.enabled"
                        size="small"
                        @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
                      />
                    </span>
                  </GrowTooltip>
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="position-manage__actions">
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton class="position-manage__icon-btn" link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="row.enabled ? '请先停用再删除' : '删除'" placement="top">
                      <span>
                        <GrowButton
                          class="position-manage__icon-btn"
                          link
                          type="danger"
                          :disabled="row.enabled"
                          :loading="deleteLoading && deleteTarget?.id === row.id"
                          @click="onDelete(row)"
                        >
                          <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                        </GrowButton>
                      </span>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>
                  {{ row[col.field] ?? '-' }}
                </template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="position-manage__pager">
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
      :title="formMode === 'create' ? '新增职级' : '编辑职级'"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="position-manage__form"
        :model="formModel"
        :rules="formRules"
        label-width="72px"
      >
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="formModel.name" maxlength="64" clearable placeholder="职级名称" />
        </GrowFormItem>
        <GrowFormItem label="编码" prop="code">
          <GrowInput v-model="formModel.code" maxlength="64" clearable placeholder="全局唯一编码" />
        </GrowFormItem>
        <GrowFormItem label="层级" prop="level">
          <GrowInputNumber
            v-model="formModel.level"
            :min="1"
            :max="99"
            controls-position="right"
          />
        </GrowFormItem>
        <GrowFormItem label="排序号" prop="sort">
          <GrowInputNumber
            v-model="formModel.sort"
            :min="0"
            :max="9999"
            controls-position="right"
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
      v-model="deleteVisible"
      title="删除确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="position-manage__delete-hint">
        确认删除职级「{{ deleteTarget?.name }}」？删除后不可恢复。
      </p>
      <dl v-if="deleteImpact" class="position-manage__delete-impact">
        <div><dt>有效任职</dt><dd>{{ deleteImpact.assignmentCount }} 条</dd></div>
      </dl>
      <p v-if="deleteImpact?.assignmentCount" class="position-manage__delete-hint">
        {{ deleteImpact.assignments.map((item) => item.personName).join('、') }}。请先调整相关人员的职级后再删除。
      </p>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton
            type="danger"
            :disabled="Boolean(deleteImpact?.assignmentCount)"
            :loading="deleteSubmitting"
            @click="confirmDelete"
          >
            删除
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>
  </div>
</template>

<script lang="ts" setup>
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { usePositionManage } from './use/usePositionManage'

defineOptions({
  name: 'PositionManagePage',
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
  deleteVisible,
  deleteLoading,
  deleteSubmitting,
  deleteTarget,
  deleteImpact,
  onToggleEnabled,
  onDelete,
  confirmDelete,
} = usePositionManage()
</script>

<style scoped>
.position-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.position-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.position-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.position-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.position-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.position-manage__watch {
  height: 100%;
  min-height: 0;
}

.position-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.position-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.position-manage__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.position-manage__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.position-manage__switch {
  display: inline-flex;
  align-items: center;
}

.position-manage__delete-hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.position-manage__delete-impact {
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--layout-color);
}

.position-manage__delete-impact div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.position-manage__delete-impact dt,
.position-manage__delete-impact dd {
  margin: 0;
}

.position-manage__delete-impact dt {
  color: var(--text-color-secondary);
}

.position-manage__form :deep(.el-input-number),
.position-manage__form :deep(.el-select) {
  width: 100%;
}

.position-manage__form :deep(.el-form-item__label) {
  font-size: 13px;
}
</style>
