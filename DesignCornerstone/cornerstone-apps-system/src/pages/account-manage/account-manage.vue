<template>
  <div class="account-manage">
    <GrowRow justify="space-between" class="account-manage__toolbar">
      <GrowCol :span="14">
        <div class="account-manage__toolbar-left">
          <GrowSpace>
            <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
          </GrowSpace>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="account-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="account-manage__table">
      <GrowWatchBox class="account-manage__watch">
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'roles' && col.field !== 'enabled'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'personName'">
                  {{ row.personName || '未绑定' }}
                </template>
                <template v-else-if="col.field === 'deptName'">
                  {{ row.deptName || '-' }}
                </template>
                <template v-else-if="col.field === 'roles'">
                  <span v-if="!row.roles?.length">-</span>
                  <span v-else class="account-manage__roles">
                    <GrowTag v-for="role in row.roles" :key="role.id" size="small" type="info">
                      {{ role.name }}
                    </GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowTooltip
                    :content="isSystemAdmin(row) ? '系统管理员不能停用' : (row.enabled ? '停用' : '启用')"
                    placement="top"
                  >
                    <span class="account-manage__switch">
                      <GrowSwitch
                        :model-value="row.enabled"
                        size="small"
                        :disabled="isSystemAdmin(row)"
                        @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
                      />
                    </span>
                  </GrowTooltip>
                </template>
                <template v-else-if="col.field === 'lastLoginAt'">
                  {{ formatTime(row.lastLoginAt) }}
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="account-manage__actions">
                    <GrowTooltip content="详情" placement="top">
                      <GrowButton link type="primary" @click="openDetail(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="分配人员" placement="top">
                      <GrowButton link type="primary" @click="openAssign(row)">
                        <GrowIconify icon="ant-design:user-add-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="重置密码" placement="top">
                      <GrowButton link type="primary" @click="openReset(row)">
                        <GrowIconify icon="ant-design:key-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="历史" placement="top">
                      <GrowButton link type="primary" @click="openHistory(row)">
                        <GrowIconify icon="ant-design:history-outlined" :size="16" />
                      </GrowButton>
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

    <div class="account-manage__pager">
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
      :title="formMode === 'create' ? '新增账号' : '编辑账号'"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="account-manage__form"
        :model="formModel"
        :rules="formRules"
        label-width="72px"
      >
        <GrowFormItem label="登录名" prop="username">
          <GrowInput
            v-model="formModel.username"
            maxlength="32"
            clearable
            :disabled="usernameLocked"
            placeholder="自定义登录名，字母开头"
          />
        </GrowFormItem>
        <GrowFormItem v-if="formMode === 'create'" label="密码" prop="password">
          <GrowInput
            v-model="formModel.password"
            type="password"
            show-password
            maxlength="64"
            placeholder="至少 6 位"
          />
        </GrowFormItem>
        <GrowFormItem label="角色" prop="roleIds">
          <GrowSelect
            v-model="formModel.roleIds"
            :options="roleOptions"
            label="label"
            value="value"
            multiple
            filterable
            collapse-tags
            clearable
            placeholder="请选择角色，可多选"
          />
        </GrowFormItem>
        <GrowFormItem label="备注" prop="remark">
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

    <GrowDialog
      v-model="assignVisible"
      title="分配人员"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <p class="account-manage__assign-hint">
        为账号「{{ assignTarget?.username }}」绑定人员，可清空解绑。账号可不绑定人员。
      </p>
      <GrowPersonSelect
        v-model="assignPersonId"
        :multiple="false"
        clearable
        placeholder="选择人员，可清空解绑"
      />
      <template #footer>
        <GrowSpace>
          <GrowButton @click="assignVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="assignSubmitting" @click="submitAssign">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="resetVisible"
      title="重置密码"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="resetFormRef"
        class="account-manage__form"
        :model="resetForm"
        :rules="resetRules"
        label-width="72px"
      >
        <GrowFormItem label="新密码" prop="password">
          <GrowInput
            v-model="resetForm.password"
            type="password"
            show-password
            maxlength="64"
            placeholder="至少 6 位"
          />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="resetVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="resetSubmitting" @click="submitReset">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <AccountDetailDrawer ref="detailDrawerRef" />
    <AccountHistoryDrawer ref="historyDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { GrowPersonSelect } from '@grow-admin-rock/business-components/person-select'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import type { SystemAccountListItem } from '../../types/systemAccount'
import AccountDetailDrawer from './components/AccountDetailDrawer.vue'
import AccountHistoryDrawer from './components/AccountHistoryDrawer.vue'
import { useAccountManage } from './use/useAccountManage'

defineOptions({
  name: 'AccountManagePage',
})

const detailDrawerRef = ref<{ open: (row: SystemAccountListItem) => void } | null>(null)
const historyDrawerRef = ref<{ open: (row: SystemAccountListItem) => void } | null>(null)

function openDetail(row: SystemAccountListItem) {
  detailDrawerRef.value?.open(row)
}

function openHistory(row: SystemAccountListItem) {
  historyDrawerRef.value?.open(row)
}

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
  roleOptions,
  usernameLocked,
  openCreate,
  openEdit,
  submitForm,
  assignVisible,
  assignSubmitting,
  assignTarget,
  assignPersonId,
  openAssign,
  submitAssign,
  resetVisible,
  resetSubmitting,
  resetFormRef,
  resetForm,
  resetRules,
  openReset,
  submitReset,
  onToggleEnabled,
  formatTime,
  isSystemAdmin,
} = useAccountManage()
</script>

<style scoped>
.account-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.account-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.account-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.account-manage__hint {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.account-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.account-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-color, #fff);
}

.account-manage__watch {
  height: 100%;
  min-height: 0;
}

.account-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-color, #fff);
}

.account-manage__roles {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.account-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.account-manage__switch {
  display: inline-flex;
  align-items: center;
}

.account-manage__assign-hint {
  margin: 0 0 12px;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.account-manage__form :deep(.el-input-number),
.account-manage__form :deep(.el-select) {
  width: 100%;
}
</style>
