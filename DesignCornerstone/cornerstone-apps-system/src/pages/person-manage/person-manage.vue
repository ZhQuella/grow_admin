<template>
  <div class="person-manage">
    <aside class="person-manage__aside">
      <div class="person-manage__aside-head">
        <span>组织架构</span>
        <GrowButton link type="primary" @click="onDeptChange('')">全部</GrowButton>
      </div>
      <GrowInput
        v-model="deptKeyword"
        clearable
        placeholder="搜索部门"
      />
      <div class="person-manage__tree">
        <GrowScrollbar height="100%">
          <GrowTree
            v-if="filteredDeptTree.length"
            :key="deptKeyword || deptId || 'all'"
            :data="filteredDeptTree"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            :current-node-key="deptId || undefined"
            :props="{ label: 'title', children: 'children' }"
            @node-click="onTreeClick"
          />
          <div v-else class="person-manage__hint">暂无部门</div>
        </GrowScrollbar>
      </div>
    </aside>

    <div class="person-manage__main">
      <GrowRow justify="space-between" class="person-manage__toolbar">
        <GrowCol :span="12">
          <div class="person-manage__toolbar-left">
            <GrowButton type="primary" @click="openCreate()">新增人员</GrowButton>
            <span class="person-manage__hint-text">新增即入职；调岗 / 转正 / 离职 / 复职会写入历史。账号绑定在后续「账号管理」中处理。</span>
          </div>
        </GrowCol>
        <GrowCol :span="12">
          <div class="person-manage__toolbar-options">
            <GrowSearchBar :search="searchList" @search="onSearch" />
            <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
          </div>
        </GrowCol>
      </GrowRow>

      <div class="person-manage__table">
        <GrowWatchBox class="person-manage__watch">
          <template #default="{ height }">
            <GrowTable
              v-if="height > 0"
              :data="tableData"
              :height="`${height}px`"
              row-key="userId"
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
                :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'roles'"
              >
                <template #default="{ row }">
                  <template v-if="col.field === 'name'">
                    <GrowButton link type="primary" @click="openDetail(row)">{{ row.name }}</GrowButton>
                  </template>
                  <template v-else-if="col.field === 'employeeType'">
                    {{ employeeTypeLabel(row.employeeType) }}
                  </template>
                  <template v-else-if="col.field === 'employeeStatus'">
                    <GrowTag :type="statusTag(row.employeeStatus)" size="small">
                      {{ employeeStatusLabel(row.employeeStatus) }}
                    </GrowTag>
                  </template>
                  <template v-else-if="col.field === 'mobile'">
                    {{ maskMobile(row.mobile) }}
                  </template>
                  <template v-else-if="col.field === 'entryDate'">
                    {{ formatDate(row.entryDate) }}
                  </template>
                  <template v-else-if="col.field === 'roles'">
                    <span v-if="!row.roles?.length">-</span>
                    <span v-else class="person-manage__roles">
                      <GrowTag v-for="role in row.roles" :key="role.id" size="small" type="info">
                        {{ role.name }}
                      </GrowTag>
                    </span>
                  </template>
                  <template v-else-if="col.field === 'lastEventTitle'">
                    <span>{{ row.lastEventTitle || '-' }}</span>
                  </template>
                  <template v-else-if="col.field === 'actions'">
                    <div class="person-manage__actions">
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
                      <GrowTooltip content="历史" placement="top">
                        <GrowButton link type="primary" @click="openHistory(row)">
                          <GrowIconify icon="ant-design:history-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip v-if="row.employeeStatus !== 'resigned'" content="调岗" placement="top">
                        <GrowButton link type="primary" @click="openEvent('transfer', row)">
                          <GrowIconify icon="ant-design:swap-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip v-if="row.employeeStatus === 'probation'" content="转正" placement="top">
                        <GrowButton link type="primary" @click="openEvent('confirm', row)">
                          <GrowIconify icon="ant-design:check-circle-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip v-if="row.employeeStatus !== 'resigned'" content="离职" placement="top">
                        <GrowButton link type="danger" @click="openEvent('resign', row)">
                          <GrowIconify icon="ant-design:logout-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip v-if="row.employeeStatus === 'resigned'" content="复职" placement="top">
                        <GrowButton link type="primary" @click="openEvent('reinstate', row)">
                          <GrowIconify icon="ant-design:login-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="删除" placement="top">
                        <GrowButton
                          link
                          type="danger"
                          :disabled="row.employeeStatus !== 'resigned'"
                          @click="onDelete(row)"
                        >
                          <GrowIconify icon="ant-design:delete-outlined" :size="16" />
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

      <div class="person-manage__pager">
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
    </div>

    <GrowDialog
      v-model="deleteVisible"
      title="删除确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="person-manage__delete-hint">
        确认删除人员「{{ deleteTarget?.name }}」？仅离职人员可删除，删除后不可恢复。
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

    <PersonHistoryDrawer ref="historyRef" />
    <PersonEventDialog ref="eventRef" @success="loadList" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { useMsg } from '@grow-admin-rock/components'
import { deleteSystemPerson } from '../../api/systemPerson'
import {
  employeeStatusLabel,
  employeeTypeLabel,
  type SystemPersonListItem,
} from '../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../types/systemRole'
import PersonHistoryDrawer from './components/PersonHistoryDrawer.vue'
import PersonEventDialog from './components/PersonEventDialog.vue'
import { usePersonManage } from './use/usePersonManage'
import { toMessage } from './use/helpers'

defineOptions({ name: 'PersonManagePage' })

const message = useMsg()
const historyRef = ref<{ open: (row: SystemPersonListItem) => void } | null>(null)
const eventRef = ref<{
  open: (mode: 'transfer' | 'confirm' | 'resign' | 'reinstate', row: SystemPersonListItem, tree: SystemDeptTreeNode[]) => void
} | null>(null)
const deleteVisible = ref(false)
const deleteSubmitting = ref(false)
const deleteTarget = ref<SystemPersonListItem | null>(null)

const {
  tableData,
  total,
  page,
  pageSize,
  deptId,
  searchList,
  tableColumns,
  leafColumns,
  loadList,
  onSearch,
  onColumnsConfirm,
  onSizeChange,
  onDeptChange,
  openCreate,
  openDetail,
  openEdit,
  deptTree,
  deptKeyword,
  formatDate,
  maskMobile,
} = usePersonManage()

const filteredDeptTree = computed(() => filterTree(deptTree.value, deptKeyword.value.trim()))

function filterTree(nodes: SystemDeptTreeNode[], keyword: string): SystemDeptTreeNode[] {
  if (!keyword) return nodes
  const lower = keyword.toLowerCase()
  const walk = (list: SystemDeptTreeNode[]): SystemDeptTreeNode[] => {
    const result: SystemDeptTreeNode[] = []
    for (const node of list) {
      const children = node.children?.length ? walk(node.children) : []
      if (node.title.toLowerCase().includes(lower) || children.length) {
        result.push({ ...node, children })
      }
    }
    return result
  }
  return walk(nodes)
}

function statusTag(status: string) {
  if (status === 'formal') return 'success'
  if (status === 'probation') return 'warning'
  return 'info'
}

function onTreeClick(node: SystemDeptTreeNode) {
  onDeptChange(node.id)
}

function openHistory(row: SystemPersonListItem) {
  historyRef.value?.open(row)
}

function openEvent(mode: 'transfer' | 'confirm' | 'resign' | 'reinstate', row: SystemPersonListItem) {
  eventRef.value?.open(mode, row, deptTree.value)
}

function onDelete(row: SystemPersonListItem) {
  if (row.employeeStatus !== 'resigned') {
    message.warning('在职人员不能删除，请先办理离职')
    return
  }
  deleteTarget.value = row
  deleteVisible.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  deleteSubmitting.value = true
  try {
    await deleteSystemPerson(target.userId)
    message.success('删除成功')
    deleteVisible.value = false
    await loadList()
  } catch (error) {
    message.error(toMessage(error, '删除失败'))
  } finally {
    deleteSubmitting.value = false
  }
}
</script>

<style scoped>
.person-manage {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
  gap: 10px;
}

.person-manage__aside {
  display: flex;
  flex-direction: column;
  flex: 0 0 240px;
  width: 240px;
  min-height: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.person-manage__aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
}

.person-manage__tree {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
}

.person-manage__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.person-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.person-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.person-manage__hint,
.person-manage__hint-text {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.person-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.person-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--component-color, #fff);
}

.person-manage__watch {
  height: 100%;
  min-height: 0;
}

.person-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  border-radius: 0 0 8px 8px;
  background: var(--component-color, #fff);
}

.person-manage__roles {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.person-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.person-manage__delete-hint {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}
</style>
