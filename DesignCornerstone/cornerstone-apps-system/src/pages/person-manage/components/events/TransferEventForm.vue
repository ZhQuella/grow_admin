<template>
  <div class="transfer-form">
    <section class="transfer-block">
      <div class="transfer-block__title">当前任职</div>
      <p v-if="!activeRows.length" class="transfer-current__empty">暂无有效任职</p>
      <div v-else class="transfer-current">
        <div
          v-for="row in activeRows"
          :key="row.id"
          class="transfer-current__card"
          :class="{ 'is-active': isSource(row) }"
          @click="selectSource(row)"
        >
          <div class="transfer-current__head">
            <GrowTag :type="displayType(row) === 'primary' ? 'primary' : 'info'" size="small">
              {{ displayType(row) === 'primary' ? '主职' : '兼职' }}
            </GrowTag>
            <span class="transfer-current__meta">{{ displayType(row) === 'primary' ? '占用编制' : '不占编制' }}</span>
            <div v-if="displayType(row) === 'part_time'" class="transfer-current__actions" @click.stop>
              <GrowTooltip content="设置为主岗" placement="top">
                <GrowButton class="transfer-current__icon" link type="primary" @click="setAsPrimary(row)">
                  <GrowIconify icon="ant-design:to-top-outlined" :size="16" />
                </GrowButton>
              </GrowTooltip>
              <GrowTooltip content="停止兼职" placement="top">
                <GrowButton class="transfer-current__icon" link type="danger" @click="endPartTime(row)">
                  <GrowIconify icon="ant-design:minus-circle-outlined" :size="16" />
                </GrowButton>
              </GrowTooltip>
            </div>
          </div>
          <div class="transfer-current__name">{{ row.deptName || '-' }} / {{ row.postName || '-' }}</div>
          <div class="transfer-current__sub">
            {{ [row.jobTitle, row.jobGrade].filter(Boolean).join(' · ') || '未填写职位' }}
          </div>
        </div>
        <button
          type="button"
          class="transfer-current__card is-add"
          :class="{ 'is-active': form.transferType === 'part_time_add' }"
          @click="startAdd"
        >
          <span class="transfer-current__add">+ 新增兼职</span>
        </button>
      </div>
    </section>

    <GrowForm ref="formRef" :model="form" :rules="rules" label-position="top" :validate-on-rule-change="false">
    <section class="transfer-block">
      <div class="transfer-block__title">{{ actionTitle }}</div>
      <p v-if="sourceHint" class="transfer-current__hint">{{ sourceHint }}</p>
      <GrowRow :gutter="16">
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem :label="deptLabel" prop="deptId">
            <GrowTreeSelect
              :model-value="form.deptId"
              :data="deptTree"
              :props="{ label: 'title', value: 'id', children: 'children' }"
              check-strictly
              filterable
              default-expand-all
              placeholder="请选择部门"
              @update:model-value="onDeptChange"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem :label="postLabel" prop="postId">
            <GrowSelect
              v-model="form.postId"
              :options="postOptions"
              label="label"
              value="value"
              filterable
              :disabled="!form.deptId"
              placeholder="请选择岗位"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem label="职位">
            <GrowInput v-model="form.jobTitle" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem label="职级">
            <GrowInput v-model="form.jobGrade" maxlength="16" clearable placeholder="如 P6" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem label="岗位编码">
            <GrowInput v-model="form.jobCode" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="12">
          <GrowFormItem :label="dateLabel" prop="effectiveDate">
            <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem label="主上级">
            <GrowSelect
              v-model="form.supervisorId"
              :options="supervisorOptions"
              label="label"
              value="value"
              filterable
              clearable
              placeholder="最多一个"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol v-show="!isEnd" :span="12">
          <GrowFormItem label="协同上级" prop="collaboratorIds">
            <GrowSelect
              v-model="form.collaboratorIds"
              :options="collaboratorOptions"
              label="label"
              value="value"
              multiple
              filterable
              clearable
              collapse-tags
              placeholder="可多个"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="24">
          <GrowFormItem label="备注">
            <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
      <p v-if="overstaffHint" class="event-form__warn">{{ overstaffHint }}</p>
    </section>
    </GrowForm>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { transferSystemPerson } from '../../../../api/systemPerson'
import { fetchSystemPosts } from '../../../../api/systemPost'
import { fetchSystemPersons } from '../../../../api/systemRole'
import {
  TRANSFER_ACTION_LABELS,
  type AssignmentType,
  type PersonAssignment,
  type SystemPersonDetail,
  type SystemPersonListItem,
  type SystemPostOption,
  type TransferIntent,
  type TransferType,
} from '../../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../../types/systemRole'
import { pickSelectId, todayText, toPostSelectOptions, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'TransferEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  detail: SystemPersonDetail | null
  deptTree: SystemDeptTreeNode[]
  intent?: TransferIntent
}>()

const emit = defineEmits<{
  change: [type: TransferType]
}>()

const formRef = ref()
const posts = ref<SystemPostOption[]>([])
const postLoadSeq = ref(0)
const supervisorOptions = ref<Array<{ label: string; value: string }>>([])
const form = reactive({
  transferType: (props.intent?.transferType || 'primary') as TransferType,
  assignmentId: props.intent?.assignmentId || '',
  assignmentType: 'primary' as AssignmentType,
  deptId: '',
  postId: '',
  jobTitle: '',
  jobGrade: '',
  jobCode: '',
  supervisorId: '',
  collaboratorIds: [] as string[],
  effectiveDate: todayText(),
  remark: '',
})

const assignments = computed(() => props.detail?.assignments || [])
const activeRows = computed(() =>
  assignments.value.filter((item) => item.status === 'active'),
)
const primary = computed(() =>
  activeRows.value.find((item) => item.type === 'primary'),
)
const sourceRow = computed(() =>
  activeRows.value.find((item) => item.id === form.assignmentId)
  || (form.transferType === 'primary' ? primary.value : undefined),
)
const collaboratorOptions = computed(() =>
  supervisorOptions.value.filter((item) => item.value !== form.supervisorId),
)
const postOptions = computed(() => toPostSelectOptions(posts.value))
const isEnd = computed(() => form.transferType === 'part_time_end')
const actionTitle = computed(() => {
  if (form.assignmentType === 'primary' && form.transferType === 'part_time_change') return '设置为主岗'
  return TRANSFER_ACTION_LABELS[form.transferType]
})
const deptLabel = computed(() => (form.transferType === 'part_time_add' ? '兼职部门' : '新部门'))
const postLabel = computed(() => (form.transferType === 'part_time_add' ? '兼职岗位' : '新岗位'))
const dateLabel = computed(() => (form.transferType === 'part_time_end' ? '结束日期' : '生效日期'))
const sourceHint = computed(() => {
  const name = sourceRow.value
    ? `${sourceRow.value.deptName || '-'} / ${sourceRow.value.postName || '-'}`
    : ''
  if (form.transferType === 'part_time_add') return '将新增一条兼职任职'
  if (form.transferType === 'part_time_end') return name ? `将停止兼职「${name}」` : '请选择要停止的兼职'
  if (form.transferType === 'part_time_change' && form.assignmentType === 'primary') {
    return name ? `将「${name}」设为主岗，原主职改为兼职` : '请选择要设为主岗的兼职'
  }
  if (form.transferType === 'part_time_change') return name ? `将调整兼职「${name}」` : '请点选一条兼职'
  return name ? `将调整主职「${name}」` : '请点选主职'
})

const overstaffHint = computed(() => {
  if (form.transferType === 'part_time_add' || form.transferType === 'part_time_end') return ''
  const post = posts.value.find((item) => item.id === form.postId)
  if (!post || post.headcount == null || post.occupied == null) return ''
  if (post.occupied >= post.headcount) {
    return '当前岗位已超出编制人数，系统仅做提示，不阻止继续分配人员。'
  }
  return ''
})

const requiredDept = [{ required: true, message: '请选择部门', trigger: 'change' }]
const requiredPost = [{ required: true, message: '请选择岗位', trigger: 'change' }]
const rules = computed(() => ({
  deptId: isEnd.value ? [] : requiredDept,
  postId: isEnd.value ? [] : requiredPost,
  effectiveDate: [{
    required: true,
    message: isEnd.value ? '请选择结束日期' : '请选择生效日期',
    trigger: 'change',
  }],
  collaboratorIds: [{
    validator: (_rule: unknown, value: string[], callback: (error?: Error) => void) => {
      if (form.supervisorId && (value || []).includes(form.supervisorId)) {
        callback(new Error('同一任职下协同上级不能与主上级重复'))
        return
      }
      callback()
    },
    trigger: 'change',
  }],
}))

function clearFormValidate() {
  nextTick(() => {
    const inst = driverRef(formRef as never) as { clearValidate?: () => void } | undefined
    inst?.clearValidate?.()
  })
}

function isSource(row: PersonAssignment) {
  if (form.transferType === 'part_time_add') return false
  if (form.transferType === 'primary') return row.type === 'primary'
  return !!form.assignmentId && row.id === form.assignmentId
}

function displayType(row: PersonAssignment) {
  if (form.assignmentType === 'primary' && form.transferType === 'part_time_change' && form.assignmentId) {
    if (row.id === form.assignmentId) return 'primary'
    if (row.type === 'primary') return 'part_time'
  }
  return row.type
}

function setAsPrimary(row: PersonAssignment) {
  setAction('part_time_change', row)
  form.assignmentType = 'primary'
}

function applyExtras(row?: PersonAssignment) {
  form.jobTitle = row?.jobTitle || ''
  form.jobGrade = row?.jobGrade || ''
  form.jobCode = row?.jobCode || ''
  form.supervisorId = row?.supervisorId || ''
  form.collaboratorIds = [...(row?.collaboratorIds || [])].filter((id) => id && id !== form.supervisorId)
}

function clearDestination() {
  form.deptId = ''
  form.postId = ''
  posts.value = []
}

function applyDestination(row?: PersonAssignment) {
  if (!row) return
  form.deptId = row.deptId
  applyExtras(row)
  const deptId = row.deptId
  const postId = row.postId
  void loadPosts(deptId).then((seq) => {
    if (seq !== postLoadSeq.value || form.deptId !== deptId) return
    form.postId = postId
  })
}

function setAction(type: TransferType, row?: PersonAssignment) {
  const assignmentId = type === 'part_time_add' ? '' : (row?.id || '')
  const same = form.transferType === type && form.assignmentId === assignmentId
  if (same && type !== 'part_time_add') {
    emit('change', type)
    return
  }
  form.transferType = type
  form.assignmentId = assignmentId
  form.assignmentType = type === 'part_time_add' || type === 'part_time_end'
    ? 'part_time'
    : ((row?.type || 'primary') as AssignmentType)
  if (type === 'part_time_end' || type === 'part_time_add') {
    applyExtras(undefined)
    clearDestination()
  } else {
    applyDestination(row || (type === 'primary' ? primary.value : undefined))
  }
  emit('change', type)
  clearFormValidate()
}

function selectSource(row: PersonAssignment) {
  setAction(row.type === 'primary' ? 'primary' : 'part_time_change', row)
}

function endPartTime(row: PersonAssignment) {
  setAction('part_time_end', row)
}

function startAdd() {
  setAction('part_time_add')
}

async function loadPosts(deptId: string) {
  const seq = postLoadSeq.value + 1
  postLoadSeq.value = seq
  if (!deptId) {
    posts.value = []
    return seq
  }
  const list = (await fetchSystemPosts(deptId)).filter((item) => item.enabled !== false)
  if (seq !== postLoadSeq.value) return seq
  posts.value = list
  return seq
}

function onDeptChange(value: unknown) {
  form.deptId = pickSelectId(value)
  form.postId = ''
  void loadPosts(form.deptId)
}

watch(
  () => form.postId,
  (postId) => {
    const post = posts.value.find((item) => item.id === postId)
    if (post && !form.jobTitle) form.jobTitle = post.name
  },
)

watch(
  () => form.supervisorId,
  (id) => {
    form.collaboratorIds = form.collaboratorIds.filter((item) => item !== id)
  },
)

async function loadSupervisors() {
  const people = await fetchSystemPersons()
  supervisorOptions.value = (Array.isArray(people) ? people : [])
    .filter((item) => item.userId !== props.person.userId)
    .map((item) => ({
      value: item.userId,
      label: `${item.name}（${item.deptName}）`,
    }))
}

async function submit() {
  await validateGrowForm(formRef)
  if (
    (form.transferType === 'part_time_change' || form.transferType === 'part_time_end')
    && !form.assignmentId
  ) {
    throw new Error('请先选择要操作的兼职')
  }
  const post = posts.value.find((item) => item.id === form.postId)
  await transferSystemPerson({
    userId: props.person.userId,
    transferType: form.transferType,
    assignmentId: form.assignmentId || undefined,
    assignmentType: form.assignmentType,
    deptId: form.deptId,
    postId: form.postId,
    post: post?.name,
    jobTitle: form.jobTitle,
    jobGrade: form.jobGrade,
    jobCode: form.jobCode,
    supervisorId: form.supervisorId || undefined,
    collaboratorIds: form.collaboratorIds,
    effectiveDate: form.effectiveDate,
    remark: form.remark,
  })
}

onMounted(() => {
  const type = props.intent?.transferType || 'primary'
  const row = assignments.value.find((item) => item.id === props.intent?.assignmentId)
    || (type === 'primary' ? primary.value : undefined)
  setAction(type, row)
  if (props.intent?.assignmentType) form.assignmentType = props.intent.assignmentType
  void loadSupervisors()
})

defineExpose({ submit })
</script>

<style scoped>
.transfer-form {
  min-width: 0;
  overflow-x: hidden;
}

.transfer-form :deep(.el-input),
.transfer-form :deep(.el-select),
.transfer-form :deep(.el-tree-select),
.transfer-form :deep(.el-date-editor) {
  width: 100%;
}

.transfer-form :deep(.el-row) {
  margin-left: 0;
  margin-right: 0;
}

.transfer-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.transfer-block {
  margin-bottom: 16px;
}

.transfer-block + .transfer-block {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--layout-border-color);
}

.transfer-block__title {
  margin-bottom: 12px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.transfer-current {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.transfer-current__empty,
.transfer-current__hint {
  margin: 0 0 12px;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.transfer-current__card {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 8px 10px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--layout-container-background-color);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.transfer-current__card:hover {
  border-color: var(--el-color-primary-light-5);
}

.transfer-current__card.is-active {
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.transfer-current__card.is-add {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border-style: dashed;
  background: transparent;
}

.transfer-current__add {
  color: var(--el-color-primary);
  font-size: 14px;
}

.transfer-current__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transfer-current__meta,
.transfer-current__sub {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.transfer-current__meta {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transfer-current__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0;
}

.transfer-current__actions :deep(.el-button) {
  padding: 0 2px;
  min-width: auto;
}


.transfer-current__name {
  margin-top: 6px;
  overflow: hidden;
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transfer-current__sub {
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-form__warn {
  margin: 0;
  color: var(--el-color-warning);
  font-size: 12px;
  line-height: 20px;
}
</style>
