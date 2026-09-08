<template>
  <div class="tenant-admin-role">
    <GrowRow justify="space-between" class="tenant-admin-role__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
      </GrowCol>
      <GrowCol :span="10">
        <div class="tenant-admin-role__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="tenant-admin-role__table">
      <GrowWatchBox class="tenant-admin-role__watch">
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'tenantStatus' && col.field !== 'name'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'name'">
                  <span class="tenant-admin-role__name">
                    {{ row.name }}
                    <GrowTag v-if="row.builtIn" type="info" size="small">内置</GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'tenantStatus'">
                  <GrowTag :type="tenantStatusTagType(row.tenantStatus)" size="small">
                    {{ tenantStatusLabel(row.tenantStatus) }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'memberCount'">
                  <GrowButton link type="primary" @click="openView(row)">{{ row.memberCount }}</GrowButton>
                </template>
                <template v-else-if="col.field === 'grantedAt'">{{ formatTime(row.grantedAt) }}</template>
                <template v-else-if="col.field === 'actions'">
                  <div class="tenant-admin-role__actions">
                    <GrowTooltip content="查看" placement="top">
                      <GrowButton class="tenant-admin-role__icon-btn" link type="primary" @click="openView(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>{{ row[col.field] ?? '-' }}</template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="tenant-admin-role__pager">
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
      v-model="detailVisible"
      title="查看租户角色"
      width="760px"
      append-to-body
      destroy-on-close
    >
      <div v-if="detailLoading" class="tenant-admin-role__empty">加载中…</div>
      <template v-else-if="detail">
        <p class="tenant-admin-role__hint">
          {{ detail.tenantName }}（{{ detail.tenantCode }}）
          ·
          {{
            detail.builtIn
              ? '内置角色，权限与租户授权同步，不可改名、改编码、停用或删除。'
              : '普通角色。成员与授权由租户侧维护，平台仅查看。'
          }}
        </p>
        <dl class="tenant-admin-role__meta">
          <div><dt>角色名称</dt><dd>{{ detail.name }}</dd></div>
          <div><dt>角色编码</dt><dd>{{ detail.code }}</dd></div>
          <div><dt>授权菜单</dt><dd>{{ detail.menuCount }}</dd></div>
          <div><dt>功能权限</dt><dd>{{ detail.functionCount }}</dd></div>
        </dl>
        <div class="tenant-admin-role__section-title">成员账号</div>
        <GrowTable :data="detail.members" row-key="accountId" border max-height="180">
          <GrowTableColumn prop="username" label="登录名" min-width="120" />
          <GrowTableColumn prop="nickname" label="昵称" min-width="120" />
          <GrowTableColumn prop="enabled" label="状态" width="90">
            <template #default="{ row }">
              <GrowTag :type="row.enabled ? 'success' : 'info'" size="small">
                {{ row.enabled ? '启用' : '停用' }}
              </GrowTag>
            </template>
          </GrowTableColumn>
        </GrowTable>
        <div v-if="!detail.members.length" class="tenant-admin-role__empty">
          {{ detail.builtIn ? '尚未分配租户管理员账号' : '暂无成员' }}
        </div>
        <div class="tenant-admin-role__section-title">授权权限</div>
        <div class="tenant-admin-role__grant">
          <aside class="tenant-admin-role__grant-tree">
            <GrowScrollbar height="280px">
              <GrowTree
                :key="detail.tenantId"
                :data="detail.tree"
                node-key="id"
                show-checkbox
                check-strictly
                :expand-on-click-node="false"
                :default-checked-keys="detail.menuIds"
                :default-expand-all="true"
                :props="{ label: 'title', children: 'children', disabled: 'disabled' }"
              />
            </GrowScrollbar>
          </aside>
          <main class="tenant-admin-role__grant-main">
            <div class="tenant-admin-role__empty">
              {{ detail.builtIn ? '勾选结果来自租户授权上限，只读。' : '尚未授权，只读。' }}
            </div>
          </main>
        </div>
      </template>
      <template #footer>
        <GrowButton @click="detailVisible = false">关闭</GrowButton>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="formVisible"
      title="新增租户角色"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="tenant-admin-role__form"
        :model="formModel"
        :rules="formRules"
        label-width="84px"
      >
        <GrowFormItem label="所属租户" prop="tenantId">
          <GrowSelect
            v-model="formModel.tenantId"
            :options="tenantSelectOptions"
            filterable
            placeholder="请选择租户"
          />
        </GrowFormItem>
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="formModel.name" maxlength="64" clearable placeholder="角色名称" />
        </GrowFormItem>
        <GrowFormItem label="编码" prop="code">
          <GrowInput v-model="formModel.code" maxlength="64" clearable placeholder="角色唯一编码" />
        </GrowFormItem>
        <GrowFormItem label="排序" prop="sort">
          <GrowInputNumber
            v-model="formModel.sort"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </GrowFormItem>
        <GrowFormItem label="角色描述" prop="remark">
          <GrowInput
            v-model="formModel.remark"
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
  </div>
</template>

<script lang="ts" setup>
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { useTenantAdminRole } from './use/useTenantAdminRole'

defineOptions({
  name: 'TenantAdminRolePage',
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
  detailVisible,
  detailLoading,
  detail,
  openView,
  formVisible,
  formSubmitting,
  formRef,
  formModel,
  formRules,
  tenantSelectOptions,
  openCreate,
  submitForm,
  formatTime,
  tenantStatusLabel,
  tenantStatusTagType,
} = useTenantAdminRole()
</script>

<style scoped>
.tenant-admin-role {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.tenant-admin-role__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-admin-role__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.tenant-admin-role__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-admin-role__watch {
  height: 100%;
  min-height: 0;
}

.tenant-admin-role__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.tenant-admin-role__name,
.tenant-admin-role__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.tenant-admin-role__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: auto;
  height: auto;
  margin: 0;
  padding: 2px;
  line-height: 1;
}

.tenant-admin-role__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.tenant-admin-role__hint {
  margin: 0 0 14px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.tenant-admin-role__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  margin: 0 0 16px;
}

.tenant-admin-role__meta div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.tenant-admin-role__meta dt,
.tenant-admin-role__meta dd {
  margin: 0;
}

.tenant-admin-role__meta dt {
  color: var(--text-color-secondary);
}

.tenant-admin-role__section-title {
  margin: 16px 0 8px;
  font-weight: 600;
}

.tenant-admin-role__empty {
  padding: 16px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.tenant-admin-role__grant {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 280px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.tenant-admin-role__grant-tree {
  border-right: 1px solid var(--layout-border-color);
  padding: 8px;
}

.tenant-admin-role__grant-main {
  padding: 12px 16px;
}

.tenant-admin-role__form {
  padding: 4px 8px 0 0;
}
</style>
