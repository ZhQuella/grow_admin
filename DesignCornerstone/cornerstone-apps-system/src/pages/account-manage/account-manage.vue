<template>
  <div class="account-manage">
    <GrowRow justify="space-between" class="account-manage__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'enabled' && col.field !== 'roleCount'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'username'">
                  <span class="account-manage__username">
                    {{ row.username }}
                    <GrowTag v-if="row.superAdmin" size="small" type="info">超管</GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'personName'">{{ row.personName || '未绑定' }}</template>
                <template v-else-if="col.field === 'deptName'">{{ row.deptName || '-' }}</template>
                <template v-else-if="col.field === 'roleCount'">
                  <GrowButton
                    v-if="row.roleCount"
                    link
                    type="primary"
                    @click="openPermission(row)"
                  >
                    {{ row.roleCount }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowTooltip
                    :content="row.superAdmin ? '超级管理员不能停用' : (row.enabled ? '停用' : '启用')"
                    placement="top"
                  >
                    <span class="account-manage__switch">
                      <GrowSwitch
                        :model-value="row.enabled"
                        size="small"
                        :disabled="row.superAdmin"
                        @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
                      />
                    </span>
                  </GrowTooltip>
                </template>
                <template v-else-if="col.field === 'lastLoginAt'">{{ formatTime(row.lastLoginAt) }}</template>
                <template v-else-if="col.field === 'actions'">
                  <div class="account-manage__actions">
                    <GrowTooltip content="详情" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="primary" @click="openDetail(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="row.personId ? '换绑人员' : '绑定人员'" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="primary" @click="row.personId ? openReassign(row) : openBind(row)">
                        <GrowIconify :icon="row.personId ? 'ant-design:swap-outlined' : 'ant-design:user-add-outlined'" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="row.personId" content="解绑人员" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="danger" @click="openUnassign(row)">
                        <GrowIconify icon="ant-design:user-delete-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="重置密码" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="primary" @click="openReset(row)">
                        <GrowIconify icon="ant-design:key-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="操作历史" placement="top">
                      <GrowButton class="account-manage__icon-btn" link type="primary" @click="openHistory(row)">
                        <GrowIconify icon="ant-design:history-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="deleteReason(row) || '删除'" placement="top">
                      <span>
                        <GrowButton
                          class="account-manage__icon-btn"
                          link
                          type="danger"
                          :disabled="Boolean(deleteReason(row))"
                          @click="openDelete(row)"
                        >
                          <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                        </GrowButton>
                      </span>
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
      width="600px"
      append-to-body
      destroy-on-close
    >
      <component
        :is="activeFormComponent"
        ref="formRef"
        v-bind="activeFormProps"
        @generate-password="generatePassword"
      />
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="formSubmitting" @click="submitForm">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="assignVisible"
      :title="assignMode === 'reassign' ? '换绑人员' : '绑定人员'"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <p class="account-manage__dialog-hint">
        {{ assignMode === 'reassign'
          ? `为账号「${assignTarget?.username}」选择新的使用人，账号其他信息保持不变。`
          : `为账号「${assignTarget?.username}」选择使用人。` }}
      </p>
      <GrowSelect
        v-model="assignPersonId"
        :options="assignPersonOptions"
        filterable
        :placeholder="assignMode === 'reassign' ? '请选择新的使用人' : '请选择人员'"
        @change="assignDisableAccount = false"
      />
      <div v-if="assignRisk" class="account-manage__risk">
        <div>
          <strong>人员状态存在风险</strong>
          <p>该人员当前为离职、退休或已删除状态，请决定是否同时停用账号。</p>
        </div>
        <label class="account-manage__risk-action">
          <span>同时停用账号</span>
          <GrowSwitch v-model="assignDisableAccount" />
        </label>
      </div>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="assignVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="assignSubmitting" @click="submitAssign">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="unassignVisible" title="解绑人员" width="460px" append-to-body destroy-on-close>
      <p class="account-manage__dialog-hint">
        确认解除账号「{{ unassignTarget?.username }}」与人员「{{ unassignTarget?.personName }}」的绑定关系？
        解绑后账号仍可登录，账号角色、状态及人员任职关系均不变。
      </p>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="unassignVisible = false">取消</GrowButton>
          <GrowButton type="danger" :loading="unassignSubmitting" @click="submitUnassign">确认解绑</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="resetVisible" title="重置密码" width="460px" append-to-body destroy-on-close>
      <GrowForm ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="92px">
        <GrowFormItem label="密码方式">
          <GrowRadioGroup
            v-model="resetForm.passwordMode"
            :options="[
              { label: '手动输入', value: 'manual' },
              { label: '系统生成', value: 'generated' },
            ]"
            @change="onResetModeChange"
          />
        </GrowFormItem>
        <GrowFormItem label="新密码" prop="password">
          <div class="account-manage__password">
            <GrowInput
              v-model="resetForm.password"
              :type="resetForm.passwordMode === 'manual' ? 'password' : 'text'"
              :readonly="resetForm.passwordMode === 'generated'"
              show-password
              placeholder="请输入新密码"
            />
            <GrowTooltip v-if="resetForm.passwordMode === 'generated'" content="重新生成" placement="top">
              <GrowButton class="account-manage__square-btn" @click="generateResetPassword">
                <GrowIconify icon="ant-design:reload-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
            <GrowTooltip v-if="resetForm.passwordMode === 'generated'" content="复制密码" placement="top">
              <GrowButton class="account-manage__square-btn" @click="copyResetPassword">
                <GrowIconify icon="ant-design:copy-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </div>
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="resetVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="resetSubmitting" @click="submitReset">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="deleteVisible" title="删除账号" width="440px" append-to-body destroy-on-close>
      <p class="account-manage__dialog-hint">
        即将删除账号「{{ deleteTarget?.username }}」，请先确认影响范围。
      </p>
      <div v-if="deleteLoading" class="account-manage__delete-loading">加载中…</div>
      <dl v-else-if="deleteImpact" class="account-manage__delete-impact">
        <div><dt>角色绑定</dt><dd>{{ deleteImpact.roleCount }} 个，将一并删除</dd></div>
        <div><dt>操作历史</dt><dd>{{ deleteImpact.historyCount }} 条，将无法再查看</dd></div>
      </dl>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton type="danger" :disabled="deleteLoading || !deleteImpact" :loading="deleteSubmitting" @click="confirmDelete">
            继续删除
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <AccountPermissionDrawer ref="permissionDrawerRef" />
    <AccountDetailDrawer ref="detailDrawerRef" />
    <AccountHistoryDrawer ref="historyDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import type { SystemAccountListItem } from '../../types/systemAccount'
import AccountCreateForm from './components/AccountCreateForm.vue'
import AccountEditForm from './components/AccountEditForm.vue'
import AccountPermissionDrawer from './components/AccountPermissionDrawer.vue'
import AccountDetailDrawer from './components/AccountDetailDrawer.vue'
import AccountHistoryDrawer from './components/AccountHistoryDrawer.vue'
import { useAccountManage } from './use/useAccountManage'

defineOptions({ name: 'AccountManagePage' })

const message = useMsg()
const detailDrawerRef = ref<{ open: (row: SystemAccountListItem) => void } | null>(null)
const historyDrawerRef = ref<{ open: (row: SystemAccountListItem) => void } | null>(null)
const permissionDrawerRef = ref<{ open: (row: SystemAccountListItem) => void } | null>(null)

function openDetail(row: SystemAccountListItem) { detailDrawerRef.value?.open(row) }
function openHistory(row: SystemAccountListItem) { historyDrawerRef.value?.open(row) }
function openPermission(row: SystemAccountListItem) { permissionDrawerRef.value?.open(row) }

const account = useAccountManage()
const {
  tableData, total, page, pageSize, searchList, tableColumns, leafColumns,
  loadList, onSearch, onColumnsConfirm, onSizeChange,
  formVisible, formMode, formSubmitting, formRef, formModel, formRules,
  roleOptions, personOptions, protectedRoles, usernameLocked,
  openCreate, openEdit, submitForm, generatePassword,
  assignVisible, assignMode, assignSubmitting, assignTarget, assignPersonId, assignPersonOptions,
  assignRisk, assignDisableAccount, openBind, openReassign, submitAssign,
  unassignVisible, unassignSubmitting, unassignTarget, openUnassign, submitUnassign,
  resetVisible, resetSubmitting, resetFormRef, resetForm, resetRules,
  openReset, generateResetPassword, submitReset, onToggleEnabled,
  deleteVisible, deleteLoading, deleteSubmitting, deleteTarget, deleteImpact,
  openDelete, confirmDelete, formatTime,
} = account

const activeFormComponent = computed(() => formMode.value === 'create' ? AccountCreateForm : AccountEditForm)
const activeFormProps = computed(() => formMode.value === 'create'
  ? { model: formModel, rules: formRules.value, roleOptions: roleOptions.value, personOptions: personOptions.value }
  : {
      model: formModel,
      rules: formRules.value,
      roleOptions: roleOptions.value,
      protectedRoles: protectedRoles.value,
      usernameLocked: usernameLocked.value,
    })

function deleteReason(row: SystemAccountListItem) {
  if (row.superAdmin) return '超级管理员账号不可删除'
  if (row.personId) return '已绑定人员的账号不可删除'
  if (row.enabled) return '请先停用账号'
  return ''
}

function onResetModeChange(value: string | number | boolean | undefined) {
  if (value === 'generated') generateResetPassword()
  else resetForm.password = ''
}

async function copyResetPassword() {
  if (!resetForm.password) return
  try {
    await navigator.clipboard.writeText(resetForm.password)
    message.success('密码已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}
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
  background: var(--component-background-color);
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
  background: var(--component-background-color);
}

.account-manage__watch {
  height: 100%;
  min-height: 0;
}

.account-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.account-manage__username,
.account-manage__actions,
.account-manage__switch {
  display: inline-flex;
  align-items: center;
}

.account-manage__username {
  gap: 6px;
}

.account-manage__actions {
  flex-wrap: nowrap;
  gap: 2px;
}

.account-manage__icon-btn,
.account-manage__square-btn {
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

.account-manage__square-btn {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
}

.account-manage__icon-btn :deep(.grow-iconify),
.account-manage__square-btn :deep(.grow-iconify) {
  display: flex !important;
}

.account-manage__dialog-hint {
  margin: 0 0 14px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.account-manage__risk {
  margin-top: 14px;
  padding: 10px 12px;
  border-left: 3px solid var(--warning-color, #e6a23c);
  border-radius: 4px;
  background: var(--layout-container-background-color);
}

.account-manage__risk strong {
  font-size: 13px;
}

.account-manage__risk p {
  margin: 4px 0 10px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.account-manage__risk-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.account-manage__password {
  display: flex;
  width: 100%;
  gap: 8px;
}

.account-manage__password :deep(.el-input) {
  flex: 1;
}

.account-manage__delete-loading {
  padding: 20px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.account-manage__delete-impact {
  margin: 0;
  border-top: 1px solid var(--layout-border-color);
}

.account-manage__delete-impact div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.account-manage__delete-impact dt {
  color: var(--text-color-secondary);
}

.account-manage__delete-impact dd {
  margin: 0;
  color: var(--text-color);
}

:deep(.el-select) {
  width: 100%;
}
</style>
