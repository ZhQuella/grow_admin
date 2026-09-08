<template>
  <div class="tenant-account">
    <GrowRow justify="space-between" class="tenant-account__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
      </GrowCol>
      <GrowCol :span="10">
        <div class="tenant-account__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="tenant-account__table">
      <GrowWatchBox class="tenant-account__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            row-key="accountId"
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'enabled' && col.field !== 'tenantAdmin'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'tenantName'">
                  <span>{{ row.tenantName }}（{{ row.tenantCode }}）</span>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowTag :type="row.enabled ? 'success' : 'info'" size="small">
                    {{ row.enabled ? '启用' : '停用' }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'tenantAdmin'">
                  <GrowTag v-if="row.tenantAdmin" type="warning" size="small">租户管理员</GrowTag>
                  <span v-else>-</span>
                </template>
                <template v-else-if="col.field === 'lastLoginAt'">{{ formatTime(row.lastLoginAt) }}</template>
                <template v-else-if="col.field === 'actions'">
                  <div class="tenant-account__actions">
                    <GrowTooltip content="查看" placement="top">
                      <GrowButton class="tenant-account__icon-btn" link type="primary" @click="openView(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton class="tenant-account__icon-btn" link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="row.tenantAdmin ? '取消租户管理员' : '分配租户管理员'" placement="top">
                      <GrowButton class="tenant-account__icon-btn" link type="primary" @click="openAssign(row)">
                        <GrowIconify icon="ant-design:safety-certificate-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>{{ row[col.field] || '-' }}</template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="tenant-account__pager">
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
      :title="formTitle"
      width="560px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="tenant-account__form"
        :model="formModel"
        :rules="formRules"
        label-width="108px"
      >
        <GrowFormItem label="所属租户" prop="tenantId">
          <GrowSelect
            v-model="formModel.tenantId"
            :options="tenantSelectOptions"
            filterable
            placeholder="请选择租户"
            :disabled="formMode !== 'create'"
          />
        </GrowFormItem>
        <GrowFormItem label="登录名" prop="username">
          <GrowInput
            v-model="formModel.username"
            maxlength="32"
            clearable
            placeholder="字母开头，3-32 位"
            :disabled="formMode !== 'create'"
          />
        </GrowFormItem>
        <GrowFormItem label="昵称" prop="nickname">
          <GrowInput v-model="formModel.nickname" maxlength="64" clearable :disabled="readonly" />
        </GrowFormItem>
        <GrowFormItem v-if="formMode === 'create'" label="密码" prop="password">
          <div class="tenant-account__password">
            <GrowInput v-model="formModel.password" show-password placeholder="请输入密码" />
            <GrowTooltip content="生成密码" placement="top">
              <GrowButton class="tenant-account__icon-btn" @click="generatePassword">
                <GrowIconify icon="ant-design:reload-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </div>
        </GrowFormItem>
        <GrowFormItem label="手机号" prop="mobile">
          <GrowInput v-model="formModel.mobile" maxlength="11" clearable :disabled="readonly" />
        </GrowFormItem>
        <GrowFormItem label="邮箱" prop="email">
          <GrowInput v-model="formModel.email" maxlength="128" clearable :disabled="readonly" />
        </GrowFormItem>
        <GrowFormItem v-if="formMode === 'create'" label="租户管理员">
          <GrowSwitch v-model="formModel.tenantAdmin" />
        </GrowFormItem>
        <GrowFormItem v-else label="租户管理员">
          <GrowTag v-if="formModel.tenantAdmin" type="warning" size="small">已分配</GrowTag>
          <span v-else>未分配</span>
        </GrowFormItem>
        <GrowFormItem v-if="formMode !== 'create'" label="状态">
          <GrowSwitch v-model="formModel.enabled" :disabled="readonly" />
        </GrowFormItem>
        <GrowFormItem label="备注" prop="remark">
          <GrowInput
            v-model="formModel.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            :disabled="readonly"
          />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">{{ formMode === 'view' ? '关闭' : '取消' }}</GrowButton>
          <GrowButton v-if="formMode !== 'view'" type="primary" :loading="formSubmitting" @click="submitForm">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="assignVisible" :title="assignTitle" width="460px" append-to-body destroy-on-close>
      <p class="tenant-account__hint">
        {{ assignHint }}
      </p>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="assignVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="assignSubmitting" @click="submitAssign">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { useTenantAccountManage } from './use/useTenantAccountManage'

defineOptions({
  name: 'TenantAccountPage',
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
  tenantSelectOptions,
  readonly,
  openCreate,
  openEdit,
  openView,
  generatePassword,
  submitForm,
  assignVisible,
  assignSubmitting,
  assignTarget,
  openAssign,
  submitAssign,
  formatTime,
} = useTenantAccountManage()

const formTitle = computed(() => {
  if (formMode.value === 'create') return '新增租户账号'
  if (formMode.value === 'edit') return '编辑租户账号'
  return '查看租户账号'
})

const assignTitle = computed(() => (
  assignTarget.value?.tenantAdmin ? '取消租户管理员' : '分配租户管理员'
))

const assignHint = computed(() => {
  const row = assignTarget.value
  if (!row) return ''
  if (row.tenantAdmin) {
    return `确认取消账号「${row.username}」在租户「${row.tenantName}」的租户管理员角色？取消后该账号不再拥有授权上限全集。`
  }
  return `确认把内置角色「租户管理员」分配给账号「${row.username}」（${row.tenantName}）？仅平台超级管理员可执行此操作。`
})
</script>

<style scoped>
.tenant-account {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.tenant-account__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-account__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.tenant-account__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-account__watch {
  height: 100%;
  min-height: 0;
}

.tenant-account__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.tenant-account__actions,
.tenant-account__password {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tenant-account__actions {
  flex-wrap: nowrap;
  gap: 2px;
}

.tenant-account__icon-btn {
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

.tenant-account__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.tenant-account__password {
  width: 100%;
}

.tenant-account__password :deep(.el-input) {
  flex: 1;
}

.tenant-account__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.tenant-account__form :deep(.el-select) {
  width: 100%;
}
</style>
