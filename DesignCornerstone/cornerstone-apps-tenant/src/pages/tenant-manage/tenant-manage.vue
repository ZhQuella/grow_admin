<template>
  <div class="tenant-manage">
    <GrowRow justify="space-between" class="tenant-manage__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
      </GrowCol>
      <GrowCol :span="10">
        <div class="tenant-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="tenant-manage__table">
      <GrowWatchBox class="tenant-manage__watch">
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'status'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'tenantCode'">
                  <span class="tenant-manage__code">
                    {{ row.tenantCode }}
                    <GrowTag v-if="row.builtIn" size="small" type="info">内置</GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'status'">
                  <GrowTag :type="tenantStatusTagType(row.status)" size="small">
                    {{ tenantStatusLabel(row.status) }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'shortName'">{{ row.shortName || '-' }}</template>
                <template v-else-if="col.field === 'contactName'">{{ row.contactName || '-' }}</template>
                <template v-else-if="col.field === 'contactMobile'">{{ row.contactMobile || '-' }}</template>
                <template v-else-if="col.field === 'servicePeriod'">{{ formatServicePeriod(row) }}</template>
                <template v-else-if="col.field === 'lastLoginAt'">{{ formatTime(row.lastLoginAt) }}</template>
                <template v-else-if="col.field === 'createdAt'">{{ formatTime(row.createdAt) }}</template>
                <template v-else-if="col.field === 'actions'">
                  <div class="tenant-manage__actions">
                    <GrowTooltip v-if="hasAction(row, 'view')" content="查看" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openView(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'edit')" content="编辑" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'grant')" content="授权" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openGrant(row)">
                        <GrowIconify icon="ant-design:safety-certificate-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'trial')" content="试用" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openPeriod(row, 'trial')">
                        <GrowIconify icon="ant-design:experiment-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'activate')" content="开通" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openPeriod(row, 'activate')">
                        <GrowIconify icon="ant-design:check-circle-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'disable')" content="停用" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="warning" @click="openDisable(row)">
                        <GrowIconify icon="ant-design:stop-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'code')" content="改编码" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="primary" @click="openCode(row)">
                        <GrowIconify icon="ant-design:font-size-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'clear')" content="清空" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="danger" @click="openClear(row)">
                        <GrowIconify icon="ant-design:clear-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip v-if="hasAction(row, 'delete')" content="删除" placement="top">
                      <GrowButton class="tenant-manage__icon-btn" link type="danger" @click="openDelete(row)">
                        <GrowIconify icon="ant-design:delete-outlined" :size="16" />
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

    <div class="tenant-manage__pager">
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
      width="640px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="tenant-manage__form"
        :model="formModel"
        :rules="formRules"
        label-width="120px"
      >
        <GrowFormItem v-if="formMode === 'view'" label="租户ID">
          <GrowInput :model-value="formModel.id" disabled />
        </GrowFormItem>
        <GrowFormItem label="租户编码" prop="tenantCode">
          <GrowInput
            v-model="formModel.tenantCode"
            maxlength="64"
            clearable
            placeholder="登录组织代码"
            :disabled="formMode !== 'create'"
          />
        </GrowFormItem>
        <GrowFormItem label="租户名称" prop="tenantName">
          <GrowInput
            v-model="formModel.tenantName"
            maxlength="128"
            clearable
            placeholder="2-128 位"
            :disabled="formMode === 'view'"
          />
        </GrowFormItem>
        <GrowFormItem label="租户简称" prop="shortName">
          <GrowInput
            v-model="formModel.shortName"
            maxlength="64"
            clearable
            :disabled="formMode === 'view'"
          />
        </GrowFormItem>
        <GrowFormItem label="租户类型" prop="tenantType">
          <GrowSelect
            v-model="formModel.tenantType"
            :options="[...typeOptions]"
            :disabled="formMode === 'view'"
          />
        </GrowFormItem>
        <GrowFormItem v-if="formMode === 'view'" label="状态">
          <GrowTag v-if="formDetail" :type="tenantStatusTagType(formDetail.status)" size="small">
            {{ tenantStatusLabel(formDetail.status) }}
          </GrowTag>
        </GrowFormItem>
        <GrowFormItem v-if="formMode === 'view'" label="服务期限">
          {{ formDetail ? formatServicePeriod(formDetail) : '-' }}
        </GrowFormItem>
        <GrowFormItem label="联系人" prop="contactName">
          <GrowInput v-model="formModel.contactName" maxlength="64" clearable :disabled="formMode === 'view'" />
        </GrowFormItem>
        <GrowFormItem label="联系人手机" prop="contactMobile">
          <GrowInput v-model="formModel.contactMobile" maxlength="32" clearable :disabled="formMode === 'view'" />
        </GrowFormItem>
        <GrowFormItem label="联系人邮箱" prop="contactEmail">
          <GrowInput v-model="formModel.contactEmail" maxlength="128" clearable :disabled="formMode === 'view'" />
        </GrowFormItem>
        <GrowFormItem label="信用代码" prop="creditCode">
          <GrowInput v-model="formModel.creditCode" maxlength="64" clearable :disabled="formMode === 'view'" />
        </GrowFormItem>
        <GrowFormItem label="行业" prop="industry">
          <GrowInput v-model="formModel.industry" maxlength="64" clearable :disabled="formMode === 'view'" />
        </GrowFormItem>
        <GrowFormItem label="地区编码" prop="regionCode">
          <GrowInput
            v-model="formModel.regionCode"
            maxlength="32"
            clearable
            placeholder="省市区编码"
            :disabled="formMode === 'view'"
          />
        </GrowFormItem>
        <GrowFormItem label="地址" prop="address">
          <GrowInput
            v-model="formModel.address"
            type="textarea"
            :rows="2"
            maxlength="255"
            show-word-limit
            :disabled="formMode === 'view'"
          />
        </GrowFormItem>
        <GrowFormItem label="备注" prop="remark">
          <GrowInput
            v-model="formModel.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            :disabled="formMode === 'view'"
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

    <GrowDialog
      v-model="periodVisible"
      :title="periodMode === 'trial' ? '试用' : '开通'"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <p class="tenant-manage__hint">
        开始日期锁定为今天 {{ todayDate() }}，结束日不得早于今天。
      </p>
      <GrowForm ref="periodFormRef" :model="periodForm" :rules="periodRules" label-width="92px">
        <GrowFormItem label="开始日期">
          <GrowInput :model-value="todayDate()" disabled />
        </GrowFormItem>
        <GrowFormItem label="结束日期" prop="expiredOn">
          <GrowDatePicker
            v-model="periodForm.expiredOn"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择结束日"
            style="width: 100%"
          />
        </GrowFormItem>
        <GrowFormItem label="原因" prop="reason">
          <GrowInput v-model="periodForm.reason" type="textarea" :rows="3" maxlength="200" />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="periodVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="periodSubmitting" @click="submitPeriod">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="disableVisible" title="停用租户" width="440px" append-to-body destroy-on-close>
      <p class="tenant-manage__hint">
        停用后该租户立即不可登录，须再次试用或开通才能恢复。
      </p>
      <GrowForm ref="disableFormRef" :model="disableForm" :rules="disableRules" label-width="72px">
        <GrowFormItem label="原因" prop="reason">
          <GrowInput v-model="disableForm.reason" type="textarea" :rows="3" maxlength="200" />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="disableVisible = false">取消</GrowButton>
          <GrowButton type="warning" :loading="disableSubmitting" @click="submitDisable">停用</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="codeVisible" title="修改租户编码" width="520px" append-to-body destroy-on-close>
      <p class="tenant-manage__hint">
        租户编码是登录组织代码。修改后，该租户下所有账号必须使用新的组织代码登录。是否确认修改？
      </p>
      <GrowForm ref="codeFormRef" :model="codeForm" :rules="codeRules" label-width="92px">
        <GrowFormItem label="当前编码">
          <GrowInput :model-value="codeTarget?.tenantCode" disabled />
        </GrowFormItem>
        <GrowFormItem label="新编码" prop="newTenantCode">
          <GrowInput v-model="codeForm.newTenantCode" maxlength="64" clearable />
        </GrowFormItem>
        <GrowFormItem label="确认编码" prop="confirmTenantCode">
          <GrowInput v-model="codeForm.confirmTenantCode" maxlength="64" clearable placeholder="须等于新编码" />
        </GrowFormItem>
        <GrowFormItem label="修改原因" prop="reason">
          <GrowInput v-model="codeForm.reason" type="textarea" :rows="3" maxlength="200" />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="codeVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="codeSubmitting" @click="submitCode">确认修改</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="deleteVisible" title="删除租户" width="480px" append-to-body destroy-on-close>
      <p class="tenant-manage__hint">
        删除为逻辑删除，不可恢复，并立即失效该租户登录态。数据不会自动清空。
      </p>
      <GrowForm ref="deleteFormRef" :model="deleteForm" :rules="deleteRules" label-width="92px">
        <GrowFormItem label="确认编码" prop="confirmTenantCode">
          <GrowInput v-model="deleteForm.confirmTenantCode" :placeholder="deleteTarget?.tenantCode" />
        </GrowFormItem>
        <GrowFormItem label="原因" prop="reason">
          <GrowInput v-model="deleteForm.reason" type="textarea" :rows="3" maxlength="200" />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton type="danger" :loading="deleteSubmitting" @click="submitDelete">删除</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="clearVisible" title="清空租户数据" width="520px" append-to-body destroy-on-close>
      <p class="tenant-manage__hint">
        将删除该租户下账号、组织、普通角色、自建菜单和业务数据，保留租户记录、授权和租户管理员角色。
      </p>
      <div v-if="clearLoading" class="tenant-manage__loading">加载影响范围…</div>
      <dl v-else-if="clearImpact" class="tenant-manage__impact">
        <div><dt>账号</dt><dd>{{ clearImpact.accountCount }}</dd></div>
        <div><dt>部门</dt><dd>{{ clearImpact.deptCount }}</dd></div>
        <div><dt>岗位</dt><dd>{{ clearImpact.postCount }}</dd></div>
        <div><dt>职级</dt><dd>{{ clearImpact.positionCount }}</dd></div>
        <div><dt>人员</dt><dd>{{ clearImpact.personCount }}</dd></div>
        <div><dt>普通角色</dt><dd>{{ clearImpact.roleCount }}</dd></div>
        <div><dt>自建菜单</dt><dd>{{ clearImpact.selfMenuCount }}</dd></div>
        <div><dt>低代码页面</dt><dd>{{ clearImpact.lowcodePageCount }}</dd></div>
        <div><dt>报表</dt><dd>{{ clearImpact.reportCount }}</dd></div>
        <div><dt>流程</dt><dd>{{ clearImpact.processCount }}</dd></div>
      </dl>
      <GrowForm ref="clearFormRef" class="tenant-manage__clear-form" :model="clearForm" :rules="clearRules" label-width="92px">
        <GrowFormItem label="确认编码" prop="confirmTenantCode">
          <GrowInput v-model="clearForm.confirmTenantCode" :placeholder="clearTarget?.tenantCode" />
        </GrowFormItem>
        <GrowFormItem label="原因" prop="reason">
          <GrowInput v-model="clearForm.reason" type="textarea" :rows="3" maxlength="200" />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="clearVisible = false">取消</GrowButton>
          <GrowButton type="danger" :disabled="clearLoading" :loading="clearSubmitting" @click="submitClear">
            确认清空
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog v-model="grantVisible" title="租户授权" width="760px" append-to-body destroy-on-close>
      <p class="tenant-manage__hint">
        {{ grantDetail?.tenantName }}（{{ grantDetail?.tenantCode }}）
        · 最近授权：{{ formatTime(grantDetail?.grantedAt) }}
        {{ grantDetail?.grantedBy ? ` · ${grantDetail.grantedBy}` : '' }}
      </p>
      <div v-if="grantLoading" class="tenant-manage__loading">加载授权树…</div>
      <div v-else class="tenant-manage__grant">
        <aside class="tenant-manage__grant-tree">
          <GrowScrollbar height="360px">
            <GrowTree
              :key="grantDetail?.tenantId"
              :data="grantDetail?.tree || []"
              node-key="id"
              show-checkbox
              check-strictly
              highlight-current
              :expand-on-click-node="false"
              :default-checked-keys="grantMenuIds"
              :default-expand-all="true"
              :props="{ label: 'title', children: 'children' }"
              @check="onGrantMenuCheck"
              @node-click="onGrantNodeClick"
            />
          </GrowScrollbar>
        </aside>
        <main class="tenant-manage__grant-main">
          <template v-if="grantActiveMenu && !grantActiveMenu.directory">
            <div class="tenant-manage__grant-title">{{ grantActiveMenu.title }}</div>
            <label
              v-for="item in grantActiveMenu.functions"
              :key="item.id"
              class="tenant-manage__function"
            >
              <GrowCheckbox
                :model-value="grantFunctionIds.includes(item.id)"
                @update:model-value="(value) => toggleGrantFunction(item.id, Boolean(value))"
              />
              <span>{{ item.title }}</span>
              <span class="tenant-manage__function-code">{{ item.code }}</span>
            </label>
            <div v-if="!grantActiveMenu.functions.length" class="tenant-manage__empty">该菜单暂无功能权限</div>
          </template>
          <div v-else class="tenant-manage__empty">请选择菜单查看功能权限</div>
        </main>
      </div>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="grantVisible = false">取消</GrowButton>
          <GrowButton type="primary" :disabled="grantLoading" :loading="grantSubmitting" @click="submitGrant">
            保存授权
          </GrowButton>
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
import type { SystemTenantListItem, TenantActionKey } from '../../types/systemTenant'
import { useTenantManage } from './use/useTenantManage'

defineOptions({
  name: 'TenantManagePage',
})

const tenant = useTenantManage()
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
  formDetail,
  formRules,
  typeOptions,
  openCreate,
  openEdit,
  openView,
  submitForm,
  todayDate,
  periodVisible,
  periodMode,
  periodSubmitting,
  periodFormRef,
  periodForm,
  periodRules,
  openPeriod,
  submitPeriod,
  disableVisible,
  disableSubmitting,
  disableFormRef,
  disableForm,
  disableRules,
  openDisable,
  submitDisable,
  codeVisible,
  codeSubmitting,
  codeTarget,
  codeFormRef,
  codeForm,
  codeRules,
  openCode,
  submitCode,
  deleteVisible,
  deleteSubmitting,
  deleteTarget,
  deleteFormRef,
  deleteForm,
  deleteRules,
  openDelete,
  submitDelete,
  clearVisible,
  clearLoading,
  clearSubmitting,
  clearTarget,
  clearImpact,
  clearFormRef,
  clearForm,
  clearRules,
  openClear,
  submitClear,
  grantVisible,
  grantLoading,
  grantSubmitting,
  grantDetail,
  grantMenuIds,
  grantFunctionIds,
  grantActiveMenu,
  openGrant,
  onGrantMenuCheck,
  onGrantNodeClick,
  toggleGrantFunction,
  submitGrant,
  availableTenantActions,
  formatServicePeriod,
  formatTime,
  tenantStatusLabel,
  tenantStatusTagType,
} = tenant

const formTitle = computed(() => {
  if (formMode.value === 'create') return '新增租户'
  if (formMode.value === 'edit') return '编辑租户'
  return '查看租户'
})

function hasAction(row: SystemTenantListItem, action: TenantActionKey) {
  return availableTenantActions(row).includes(action)
}
</script>

<style scoped>
.tenant-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.tenant-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.tenant-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.tenant-manage__watch {
  height: 100%;
  min-height: 0;
}

.tenant-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.tenant-manage__code,
.tenant-manage__actions {
  display: inline-flex;
  align-items: center;
}

.tenant-manage__code {
  gap: 6px;
}

.tenant-manage__actions {
  flex-wrap: nowrap;
  gap: 2px;
}

.tenant-manage__icon-btn {
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

.tenant-manage__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.tenant-manage__hint {
  margin: 0 0 14px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.tenant-manage__loading,
.tenant-manage__empty {
  padding: 24px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.tenant-manage__impact {
  margin: 0 0 16px;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
}

.tenant-manage__impact div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.tenant-manage__impact dt,
.tenant-manage__impact dd {
  margin: 0;
}

.tenant-manage__impact dt {
  color: var(--text-color-secondary);
}

.tenant-manage__clear-form {
  margin-top: 8px;
}

.tenant-manage__grant {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 360px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.tenant-manage__grant-tree {
  border-right: 1px solid var(--layout-border-color);
  padding: 8px;
}

.tenant-manage__grant-main {
  padding: 12px 16px;
}

.tenant-manage__grant-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.tenant-manage__function {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  cursor: pointer;
}

.tenant-manage__function-code {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.tenant-manage__form :deep(.el-select),
.tenant-manage__form :deep(.el-date-editor) {
  width: 100%;
}
</style>
