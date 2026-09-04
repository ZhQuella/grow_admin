<template>
  <div class="dept-manage">
    <GrowRow justify="space-between" class="dept-manage__toolbar">
      <GrowCol :span="14">
        <div class="dept-manage__toolbar-left">
          <GrowButton type="primary" @click="openCreate(null)">新增</GrowButton>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="dept-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div v-loading="loading" class="dept-manage__table">
      <GrowWatchBox class="dept-manage__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :key="tableKey"
            :data="tableData"
            :height="`${height}px`"
            row-key="id"
            default-expand-all
            :tree-props="{ children: 'children' }"
            :row-class-name="deptRowClassName"
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
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'directPostCount' && col.field !== 'directPersonCount'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'name'">
                  {{ row.name }}
                </template>
                <template v-else-if="col.field === 'managerName'">
                  {{ managerLabel(row) }}
                </template>
                <template v-else-if="col.field === 'directPostCount'">
                  <GrowButton link type="primary" @click="openDetail(row, 'posts')">
                    {{ row.directPostCount ?? 0 }}
                  </GrowButton>
                </template>
                <template v-else-if="col.field === 'directPersonCount'">
                  <GrowButton link type="primary" @click="openDetail(row, 'people')">
                    {{ row.directPersonCount ?? 0 }}
                  </GrowButton>
                </template>
                <template v-else-if="col.field === 'status'">
                  <GrowTag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                    {{ row.status === 'enabled' ? '启用' : '停用' }}
                  </GrowTag>
                </template>
                <template v-else-if="col.field === 'updatedAt'">
                  {{ formatTime(row.updatedAt) }}
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="dept-manage__actions">
                    <GrowTooltip content="详情" placement="top">
                      <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openDetail(row)">
                        <GrowIconify icon="ant-design:eye-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <template v-if="row.status === 'enabled'">
                      <GrowTooltip content="新增子级" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openCreate(row)">
                          <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="编辑" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openEdit(row)">
                          <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="迁移" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openMigrate(row)">
                          <GrowIconify icon="ant-design:swap-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="合并" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openMerge(row)">
                          <GrowIconify icon="ant-design:merge-cells-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="停用" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="warning" @click="openStop(row)">
                          <GrowIconify icon="ant-design:stop-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                    </template>
                    <template v-else>
                      <GrowTooltip content="启用" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="primary" @click="openAction(row, 'enable')">
                          <GrowIconify icon="ant-design:play-circle-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                      <GrowTooltip content="删除" placement="top">
                        <GrowButton class="dept-manage__icon-btn" link type="danger" @click="openAction(row, 'delete')">
                          <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                        </GrowButton>
                      </GrowTooltip>
                    </template>
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

    <GrowDialog
      v-model="formVisible"
      :title="formTitle"
      width="560px"
      append-to-body
      destroy-on-close
    >
      <DeptFormPanel
        v-if="formVisible"
        :key="formKey"
        ref="formPanelRef"
        :mode="formMode"
        :department="formDepartment"
        :tree="tree"
      />
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="submitting" @click="submitForm">保存</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDrawer
      v-model="detailVisible"
      :title="detail ? `部门详情 · ${detail.name}` : '部门详情'"
      size="640px"
      append-to-body
      destroy-on-close
    >
      <GrowWatchBox class="dept-manage__detail-watch">
        <template #default="{ height }">
          <GrowScrollbar v-if="detail && height > 0" :height="`${height}px`">
            <DeptDetailPanel :key="`${detail.id}:${detailTab}`" :department="detail" :initial-tab="detailTab" />
          </GrowScrollbar>
        </template>
      </GrowWatchBox>
      <template #footer>
        <GrowButton @click="detailVisible = false">关闭</GrowButton>
      </template>
    </GrowDrawer>

    <GrowDialog
      v-model="actionVisible"
      :title="actionTitle"
      :width="actionMode === 'delete' ? '640px' : '520px'"
      append-to-body
      destroy-on-close
    >
      <DeptActionPanel
        v-if="detail"
        :key="actionKey"
        ref="actionPanelRef"
        :mode="actionMode"
        :department="detail"
        :tree="tree"
      />
      <template #footer>
        <GrowSpace>
          <GrowButton @click="actionVisible = false">取消</GrowButton>
          <GrowButton :type="actionMode === 'delete' ? 'danger' : 'primary'" :loading="submitting" @click="submitAction">
            {{ actionMode === 'delete' ? '确认删除' : '确定' }}
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <DeptStopDrawer ref="stopRef" @success="loadTree" />
    <DeptMigrateDrawer ref="migrateRef" @success="loadTree" />
    <DeptMergeDrawer ref="mergeRef" @success="loadTree" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemDeptTree, getSystemDeptDetail } from '../../api/systemDept'
import type { SystemDeptDetail, SystemDeptNode } from '../../types/systemDept'
import DeptActionPanel from './components/DeptActionPanel.vue'
import DeptDetailPanel from './components/DeptDetailPanel.vue'
import DeptFormPanel from './components/DeptFormPanel.vue'
import DeptMigrateDrawer from './components/DeptMigrateDrawer.vue'
import DeptMergeDrawer from './components/DeptMergeDrawer.vue'
import DeptStopDrawer from './components/DeptStopDrawer.vue'

defineOptions({ name: 'DeptManagePage' })

type ActionMode = 'enable' | 'delete'
type FormMode = 'create' | 'edit'
type RelatedTab = 'people' | 'posts' | 'children'
type SearchBarField = {
  labelText: string
  elType: string
  model: string
  placeholder?: string
  isDefault?: boolean
  noDelete?: boolean
  clearable?: boolean
  label?: string
  value?: string
  options?: Array<{ label: string, value: string }>
}
type ColumnBarItem = {
  title?: string
  field?: string
  visible?: boolean
  disabled?: boolean
  children?: ColumnBarItem[]
  [key: string]: unknown
}
type DeptTableColumn = ColumnBarItem & {
  width?: number
  minWidth?: number
  fixed?: string | boolean
}

const message = useMsg() as any
const tree = ref<SystemDeptNode[]>([])
const tableKey = ref(0)
const query = ref<Recordable<any>>({})
const detail = ref<SystemDeptDetail | null>(null)
const loading = ref(false)
const submitting = ref(false)
const formVisible = ref(false)
const formMode = ref<FormMode>('create')
const formKey = ref(0)
const formParent = ref<SystemDeptNode | null>(null)
const formPanelRef = ref<{ submit?: () => Promise<SystemDeptDetail> } | null>(null)
const detailVisible = ref(false)
const detailTab = ref<RelatedTab>('people')
const actionVisible = ref(false)
const actionMode = ref<ActionMode>('enable')
const actionKey = ref(0)
const actionPanelRef = ref<{ submit: () => Promise<unknown> } | null>(null)
const stopRef = ref<{ open: (row: SystemDeptDetail, tree: SystemDeptNode[]) => void } | null>(null)
const migrateRef = ref<{ open: (row: SystemDeptDetail, tree: SystemDeptNode[]) => void } | null>(null)
const mergeRef = ref<{ open: (row: SystemDeptDetail, tree: SystemDeptNode[]) => void } | null>(null)

const searchList: SearchBarField[] = [
  {
    labelText: '关键字',
    placeholder: '部门名称 / 编码',
    elType: 'GrowInput',
    isDefault: true,
    model: 'keyword',
    noDelete: true,
    clearable: true,
  },
  {
    labelText: '状态',
    elType: 'GrowSelect',
    isDefault: true,
    model: 'status',
    label: 'label',
    value: 'value',
    placeholder: '请选择',
    clearable: true,
    options: [
      { label: '启用', value: 'enabled' },
      { label: '停用', value: 'disabled' },
    ],
  },
]

const tableColumns = ref<DeptTableColumn[]>([
  { title: '部门名称', field: 'name', visible: true, width: 260 },
  { title: '部门编码', field: 'code', visible: true, minWidth: 140 },
  { title: '上级部门', field: 'parentName', visible: true, minWidth: 140 },
  { title: '部门负责人', field: 'managerName', visible: true, minWidth: 150 },
  { title: '直属岗位', field: 'directPostCount', visible: true, minWidth: 90 },
  { title: '有效人员', field: 'directPersonCount', visible: true, minWidth: 90 },
  { title: '子部门', field: 'directChildCount', visible: true, minWidth: 80 },
  { title: '排序', field: 'sort', visible: true, minWidth: 70 },
  { title: '状态', field: 'status', visible: true, minWidth: 80 },
  { title: '更新时间', field: 'updatedAt', visible: false, minWidth: 170 },
  { title: '操作', field: 'actions', visible: true, minWidth: 220, fixed: 'right' },
])

function collectLeafColumns(list: DeptTableColumn[]): DeptTableColumn[] {
  const result: DeptTableColumn[] = []
  list.forEach((item) => {
    if (item.visible === false) return
    if (item.children?.length) result.push(...collectLeafColumns(item.children as DeptTableColumn[]))
    else if (item.field) result.push(item)
  })
  return result
}

function filterTree(nodes: SystemDeptNode[], value: Recordable<any>): SystemDeptNode[] {
  const keyword = String(value?.keyword || '').trim().toLowerCase()
  const status = String(value?.status || '')
  if (!keyword && !status) return nodes
  return nodes.flatMap((item) => {
    const children = filterTree(item.children || [], value)
    const keywordMatched = !keyword || item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)
    const statusMatched = !status || item.status === status
    return (keywordMatched && statusMatched) || children.length
      ? [{ ...item, children: children.length ? children : undefined }]
      : []
  })
}

const leafColumns = computed(() => collectLeafColumns(tableColumns.value))
const tableData = computed(() => filterTree(tree.value, query.value))
const formDepartment = computed(() => {
  if (formMode.value === 'create') return formParent.value
  return detail.value
})
const formTitle = computed(() => {
  if (formMode.value === 'create') {
    return formParent.value ? `新增子部门 · ${formParent.value.name}` : '新增部门'
  }
  return `编辑部门 · ${detail.value?.name || ''}`
})
const actionTitle = computed(() => ({ enable: '启用部门', delete: '删除部门' }[actionMode.value]))

async function loadDetail(row: SystemDeptNode) {
  try {
    const value = await getSystemDeptDetail(row.id)
    detail.value = value
    return value
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载部门详情失败')
    return null
  }
}

async function loadTree() {
  loading.value = true
  try {
    tree.value = await fetchSystemDeptTree(true)
    tableKey.value += 1
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载部门树失败')
  } finally {
    loading.value = false
  }
}

function onSearch(data: Recordable<any>) {
  query.value = data || {}
  tableKey.value += 1
}

function onColumnsConfirm(columns: ColumnBarItem[]) {
  tableColumns.value = columns as DeptTableColumn[]
}

function openCreate(parent: SystemDeptNode | null) {
  formParent.value = parent
  formMode.value = 'create'
  formKey.value += 1
  formVisible.value = true
}

async function openEdit(row: SystemDeptNode) {
  if (!(await loadDetail(row))) return
  formParent.value = null
  formMode.value = 'edit'
  formKey.value += 1
  formVisible.value = true
}

async function openDetail(row: SystemDeptNode, tab: RelatedTab = 'people') {
  if (!(await loadDetail(row))) return
  detailTab.value = tab
  detailVisible.value = true
}

async function submitForm() {
  try {
    submitting.value = true
    const value = await formPanelRef.value?.submit?.()
    if (!value) return
    formVisible.value = false
    message.success(formMode.value === 'create' ? '新增成功' : '保存成功')
    await loadTree()
  } catch (error) {
    if (error instanceof Error && (error.message === '校验未通过' || error.message === '表单未就绪')) return
    message.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function openAction(row: SystemDeptNode, mode: ActionMode) {
  if (!(await loadDetail(row))) return
  actionMode.value = mode
  actionKey.value += 1
  actionVisible.value = true
}

async function submitAction() {
  try {
    submitting.value = true
    await actionPanelRef.value?.submit()
    actionVisible.value = false
    message.success(actionMode.value === 'delete' ? '删除成功' : '操作成功')
    await loadTree()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function openMigrate(row: SystemDeptNode) {
  const value = await loadDetail(row)
  if (value) migrateRef.value?.open(value, tree.value)
}

async function openMerge(row: SystemDeptNode) {
  const value = await loadDetail(row)
  if (value) mergeRef.value?.open(value, tree.value)
}

async function openStop(row: SystemDeptNode) {
  const value = await loadDetail(row)
  if (value) stopRef.value?.open(value, tree.value)
}

function managerLabel(row: SystemDeptNode) {
  return row.managerName
    ? `${row.managerName}${row.managerPostName ? ` · ${row.managerPostName}` : ''}`
    : '未设置'
}

function formatTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}

function deptRowClassName({ row }: { row: SystemDeptNode }) {
  return row.status === 'disabled' ? 'dept-manage__row--disabled' : ''
}

loadTree()
</script>

<style scoped>
.dept-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.dept-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.dept-manage__toolbar-left,
.dept-manage__toolbar-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dept-manage__toolbar-left {
  flex-wrap: wrap;
}

.dept-manage__toolbar-options {
  justify-content: flex-end;
}

.dept-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.dept-manage__watch {
  height: 100%;
  min-height: 0;
}

.dept-manage__detail-watch {
  height: 100%;
  min-height: 240px;
}

.dept-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.dept-manage__icon-btn {
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

.dept-manage__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.dept-manage :deep(.dept-manage__row--disabled) {
  color: var(--text-color-secondary);
}
</style>
