<template>
  <div class="assignment-editor">
    <div v-for="(row, index) in rows" :key="row.id" class="assignment-editor__card">
      <div class="assignment-editor__head">
        <GrowTag :type="row.type === 'primary' ? 'primary' : 'info'" size="small">
          {{ row.type === 'primary' ? '主职' : '兼职' }}
        </GrowTag>
        <span class="assignment-editor__headcount">{{ row.occupyHeadcount ? '占用编制' : '不占编制' }}</span>
        <GrowButton
          v-if="!readonly && !lockAssignment"
          link
          type="danger"
          :disabled="rows.length <= 1"
          @click="remove(index)"
        >
          删除
        </GrowButton>
      </div>
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="任职类型">
            <GrowSelect
              :model-value="row.type"
              :options="ASSIGNMENT_TYPE_OPTIONS"
              label="label"
              value="value"
              :disabled="readonly || lockAssignment"
              placeholder="请选择"
              @update:model-value="(value) => onTypeChange(row, String(value || 'primary'))"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="部门">
            <GrowTreeSelect
              :model-value="row.deptId"
              :data="deptTree"
              :props="{ label: 'title', value: 'id', children: 'children' }"
              check-strictly
              filterable
              default-expand-all
              :disabled="readonly || lockAssignment"
              placeholder="请选择"
              @update:model-value="(value) => onDeptChange(row, value)"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="岗位">
            <GrowSelect
              :model-value="row.postId"
              :options="postSelectOptions(row.deptId)"
              label="label"
              value="value"
              filterable
              :disabled="readonly || lockAssignment || !row.deptId"
              placeholder="请选择"
              @update:model-value="(value) => onPostChange(row, pickSelectId(value))"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="职位">
            <GrowInput
              :model-value="row.jobTitle"
              :disabled="readonly"
              maxlength="32"
              clearable
              placeholder="请输入"
              @update:model-value="(value) => patch(row, { jobTitle: String(value || '') })"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="职级">
            <GrowInput
              :model-value="row.jobGrade"
              :disabled="readonly"
              maxlength="16"
              clearable
              placeholder="如 P6"
              @update:model-value="(value) => patch(row, { jobGrade: String(value || '') })"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="岗位编码">
            <GrowInput
              :model-value="row.jobCode"
              :disabled="readonly"
              maxlength="32"
              clearable
              placeholder="请输入"
              @update:model-value="(value) => patch(row, { jobCode: String(value || '') })"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="开始日期">
            <GrowDatePicker
              :model-value="row.startDate"
              value-format="YYYY-MM-DD"
              :disabled="readonly || lockAssignment"
              placeholder="请选择"
              style="width: 100%"
              @update:model-value="(value) => patch(row, { startDate: String(value || '') })"
            />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
      <div class="assignment-editor__divider" />
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="主上级">
            <GrowSelect
              :model-value="row.supervisorId"
              :options="supervisorOptions"
              label="label"
              value="value"
              filterable
              clearable
              placeholder="最多一个"
              @update:model-value="(value) => onSupervisorChange(row, String(value || ''))"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="12">
          <GrowFormItem label="协同上级">
            <GrowSelect
              :model-value="row.collaboratorIds || []"
              :options="collaboratorOptionsOf(row)"
              label="label"
              value="value"
              multiple
              filterable
              clearable
              collapse-tags
              placeholder="可多个"
              @update:model-value="(value) => onCollaboratorChange(row, value)"
            />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </div>
    <p v-if="overstaffHint" class="assignment-editor__warn">{{ overstaffHint }}</p>
    <GrowButton v-if="!readonly && !lockAssignment" link type="primary" @click="add">+ 添加任职</GrowButton>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { useDialog } from '@grow-admin-rock/components'
import { fetchSystemPosts } from '../../../api/systemPost'
import {
  ASSIGNMENT_TYPE_OPTIONS,
  occupyHeadcount,
  type AssignmentType,
  type PersonAssignment,
  type SystemPostOption,
} from '../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import { emptyAssignment, findDeptTitle, pickSelectId, toPostSelectOptions } from '../use/helpers'

defineOptions({ name: 'AssignmentEditor' })

const props = defineProps<{
  modelValue: PersonAssignment[]
  deptTree: SystemDeptTreeNode[]
  readonly?: boolean
  lockAssignment?: boolean
  supervisorOptions?: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonAssignment[]]
}>()

const dialog = useDialog()
const postMap = reactive<Record<string, SystemPostOption[]>>({})

const rows = computed(() => props.modelValue)

const overstaffHint = computed(() => {
  for (const row of rows.value) {
    if (row.type !== 'primary' || !row.postId) continue
    const post = postsOf(row.deptId).find((item) => item.id === row.postId)
    if (!post || post.headcount == null || post.occupied == null) continue
    if (post.occupied >= post.headcount) {
      return '当前岗位已超出编制人数，系统仅做提示，不阻止继续分配人员。'
    }
  }
  return ''
})

function postsOf(deptId: string) {
  return (postMap[deptId] || []).filter((item) => item.enabled !== false)
}

function postSelectOptions(deptId: string) {
  return toPostSelectOptions(postsOf(deptId))
}

function emitRows(next: PersonAssignment[]) {
  emit('update:modelValue', next)
}

function patch(row: PersonAssignment, extra: Partial<PersonAssignment>) {
  emitRows(rows.value.map((item) => (item.id === row.id ? { ...item, ...extra } : item)))
}

const loadingDepts = new Set<string>()

async function loadPosts(deptId: string) {
  if (!deptId || postMap[deptId] || loadingDepts.has(deptId)) return
  loadingDepts.add(deptId)
  try {
    postMap[deptId] = await fetchSystemPosts(deptId)
  } catch {
    // 失败不写入空缓存，下次选择同一部门可重试
  } finally {
    loadingDepts.delete(deptId)
  }
}

function onDeptChange(row: PersonAssignment, value: unknown) {
  const deptId = pickSelectId(value)
  patch(row, {
    deptId,
    deptName: findDeptTitle(props.deptTree, deptId),
    postId: '',
    postName: '',
  })
  void loadPosts(deptId)
}

function onPostChange(row: PersonAssignment, postId: string) {
  const post = postsOf(row.deptId).find((item) => item.id === postId)
  patch(row, {
    postId,
    postName: post?.name || '',
    jobTitle: row.jobTitle || post?.name || '',
  })
}

function confirmReplacePrimary(label: string) {
  const content = `已有主职「${label}」。是否替换为当前任职？原主职将改为兼职。`
  if (dialog && typeof dialog.warning === 'function' && dialog.warning.length <= 1) {
    return new Promise<boolean>((resolve) => {
      dialog.warning({
        title: '替换主职',
        content,
        positiveText: '替换',
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  }
  if (dialog && typeof dialog.confirm === 'function') {
    const result = dialog.confirm(content, '替换主职', {
      type: 'warning',
      confirmButtonText: '替换',
      cancelButtonText: '取消',
    })
    if (result && typeof result.then === 'function') {
      return result.then(() => true).catch(() => false)
    }
  }
  return Promise.resolve(window.confirm(content))
}

async function onTypeChange(row: PersonAssignment, type: string) {
  const next = type === 'part_time' ? 'part_time' : 'primary'
  if (next === row.type) return
  if (next === 'primary') {
    const current = rows.value.find((item) =>
      item.id !== row.id && item.type === 'primary' && item.status !== 'ended',
    )
    if (current) {
      const label = [current.deptName, current.postName || current.jobTitle].filter(Boolean).join(' / ') || '已有任职'
      const ok = await confirmReplacePrimary(label)
      if (!ok) return
      emitRows(rows.value.map((item) => {
        if (item.id === row.id) {
          return { ...item, type: 'primary' as AssignmentType, occupyHeadcount: true }
        }
        if (item.id === current.id) {
          return { ...item, type: 'part_time' as AssignmentType, occupyHeadcount: false }
        }
        return item
      }))
      return
    }
  }
  patch(row, { type: next as AssignmentType, occupyHeadcount: occupyHeadcount(next) })
}

function collaboratorOptionsOf(row: PersonAssignment) {
  return (props.supervisorOptions || []).filter((item) => item.value !== row.supervisorId)
}

function onSupervisorChange(row: PersonAssignment, supervisorId: string) {
  patch(row, {
    supervisorId,
    collaboratorIds: (row.collaboratorIds || []).filter((id) => id !== supervisorId),
  })
}

function onCollaboratorChange(row: PersonAssignment, value: unknown) {
  const ids = Array.isArray(value) ? value.map(String) : []
  patch(row, { collaboratorIds: ids.filter((id) => id && id !== row.supervisorId) })
}

function ensureRow() {
  if (!props.readonly && !props.modelValue.length) {
    emitRows([emptyAssignment()])
  }
}

function add() {
  const hasPrimary = rows.value.some((item) => item.type === 'primary' && item.status !== 'ended')
  emitRows([...rows.value, emptyAssignment(hasPrimary ? 'part_time' : 'primary')])
}

function remove(index: number) {
  if (rows.value.length <= 1) return
  emitRows(rows.value.filter((_, i) => i !== index))
}

onMounted(ensureRow)
watch(() => props.modelValue.length, ensureRow)
watch(
  () => rows.value.map((item) => item.deptId).join(','),
  () => {
    rows.value.forEach((row) => {
      if (row.deptId) void loadPosts(row.deptId)
    })
  },
  { immediate: true },
)
</script>

<style scoped>
.assignment-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assignment-editor__card {
  padding: 8px 12px 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.assignment-editor__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  margin-bottom: 4px;
}

.assignment-editor__headcount {
  flex: 1;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.assignment-editor__divider {
  height: 1px;
  margin: 0 0 8px;
  background: var(--layout-border-color);
}

.assignment-editor :deep(.el-input),
.assignment-editor :deep(.el-select),
.assignment-editor :deep(.el-tree-select),
.assignment-editor :deep(.el-date-editor) {
  width: 100%;
}

.assignment-editor :deep(.el-form-item) {
  margin-bottom: 12px;
}

.assignment-editor__warn {
  margin: 0;
  color: var(--el-color-warning);
  font-size: 12px;
}
</style>
