<template>
  <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
    <GrowFormItem label="调岗类型" prop="transferType">
      <GrowSelect
        v-model="form.transferType"
        :options="TRANSFER_TYPE_OPTIONS"
        label="label"
        value="value"
        placeholder="请选择"
      />
    </GrowFormItem>
    <template v-if="form.transferType === 'primary'">
      <GrowFormItem label="当前主部门">
        <GrowInput :model-value="primary?.deptName || '-'" disabled />
      </GrowFormItem>
      <GrowFormItem label="当前主岗位">
        <GrowInput :model-value="primary?.postName || '-'" disabled />
      </GrowFormItem>
    </template>
    <GrowFormItem
      v-if="form.transferType === 'part_time_change' || form.transferType === 'part_time_end'"
      label="原兼职"
      prop="assignmentId"
    >
      <GrowSelect
        v-model="form.assignmentId"
        :options="partTimeOptions"
        label="label"
        value="value"
        placeholder="请选择"
      />
    </GrowFormItem>
    <template v-if="form.transferType !== 'part_time_end'">
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
      <p v-if="overstaffHint" class="event-form__warn">{{ overstaffHint }}</p>
    </template>
    <GrowFormItem :label="dateLabel" prop="effectiveDate">
      <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { transferSystemPerson } from '../../../../api/systemPerson'
import { fetchSystemPosts } from '../../../../api/systemPost'
import {
  TRANSFER_TYPE_OPTIONS,
  type PersonAssignment,
  type SystemPersonDetail,
  type SystemPersonListItem,
  type SystemPostOption,
  type TransferType,
} from '../../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../../types/systemRole'
import { pickSelectId, todayText, toPostSelectOptions, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'TransferEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  detail: SystemPersonDetail | null
  deptTree: SystemDeptTreeNode[]
}>()

const formRef = ref()
const posts = ref<SystemPostOption[]>([])
const form = reactive({
  transferType: 'primary' as TransferType,
  assignmentId: '',
  deptId: '',
  postId: '',
  effectiveDate: todayText(),
  remark: '',
})

const assignments = computed(() => props.detail?.assignments || [])
const primary = computed(() =>
  assignments.value.find((item) => item.type === 'primary' && item.status === 'active'),
)
const partTimeOptions = computed(() =>
  assignments.value
    .filter((item) => item.type === 'part_time' && item.status === 'active')
    .map((item) => ({
      value: item.id,
      label: `${item.deptName} / ${item.postName}`,
    })),
)

const postOptions = computed(() => toPostSelectOptions(posts.value))
const deptLabel = computed(() => (form.transferType === 'part_time_add' ? '兼职部门' : '新部门'))
const postLabel = computed(() => (form.transferType === 'part_time_add' ? '兼职岗位' : '新岗位'))
const dateLabel = computed(() => (form.transferType === 'part_time_end' ? '结束日期' : '生效日期'))

const overstaffHint = computed(() => {
  if (form.transferType === 'part_time_add' || form.transferType === 'part_time_end') return ''
  const post = posts.value.find((item) => item.id === form.postId)
  if (!post || post.headcount == null || post.occupied == null) return ''
  if (post.occupied >= post.headcount) {
    return '当前岗位已超出编制人数，系统仅做提示，不阻止继续分配人员。'
  }
  return ''
})

const rules = computed(() => {
  const required = (message: string) => [{ required: true, message, trigger: 'change' }]
  const base = {
    transferType: required('请选择调岗类型'),
    effectiveDate: required('请选择日期'),
  }
  if (form.transferType === 'part_time_end') {
    return { ...base, assignmentId: required('请选择兼职任职') }
  }
  if (form.transferType === 'part_time_change') {
    return {
      ...base,
      assignmentId: required('请选择原兼职'),
      deptId: required('请选择部门'),
      postId: required('请选择岗位'),
    }
  }
  return { ...base, deptId: required('请选择部门'), postId: required('请选择岗位') }
})

async function loadPosts(deptId: string) {
  if (!deptId) {
    posts.value = []
    return
  }
  posts.value = (await fetchSystemPosts(deptId)).filter((item) => item.enabled !== false)
}

function onDeptChange(value: unknown) {
  form.deptId = pickSelectId(value)
  form.postId = ''
  void loadPosts(form.deptId)
}

watch(
  () => form.assignmentId,
  (id) => {
    const row = assignments.value.find((item) => item.id === id) as PersonAssignment | undefined
    if (!row || form.transferType === 'part_time_end') return
    form.deptId = row.deptId
    void loadPosts(row.deptId).then(() => {
      form.postId = row.postId
    })
  },
)

async function submit() {
  await validateGrowForm(formRef)
  const post = posts.value.find((item) => item.id === form.postId)
  await transferSystemPerson({
    userId: props.person.userId,
    transferType: form.transferType,
    assignmentId: form.assignmentId || undefined,
    deptId: form.deptId,
    postId: form.postId,
    post: post?.name,
    effectiveDate: form.effectiveDate,
    remark: form.remark,
  })
}

defineExpose({ submit })
</script>

<style scoped>
.event-form__warn {
  margin: -8px 0 12px 108px;
  color: var(--el-color-warning);
  font-size: 12px;
}
</style>
