<template>
  <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
    <GrowFormItem v-if="mode === 'reinstate'" label="恢复状态" prop="employeeStatus">
      <GrowSelect
        v-model="form.employeeStatus"
        :options="ENABLE_STATUS_OPTIONS"
        label="label"
        value="value"
        placeholder="请选择"
      />
    </GrowFormItem>
    <GrowFormItem label="部门" prop="deptId">
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
    <GrowFormItem label="岗位" prop="postId">
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
    <GrowFormItem v-if="mode === 'rehire'" label="任职类型" prop="assignmentType">
      <GrowSelect
        v-model="form.assignmentType"
        :options="ASSIGNMENT_TYPE_OPTIONS"
        label="label"
        value="value"
      />
    </GrowFormItem>
    <GrowFormItem v-if="mode === 'rehire'" label="主上级" prop="supervisorId">
      <GrowSelect
        v-model="form.supervisorId"
        :options="supervisorOptions"
        label="label"
        value="value"
        filterable
        clearable
        placeholder="请选择"
      />
    </GrowFormItem>
    <GrowFormItem label="账号" prop="accountId">
      <GrowSelect
        v-model="form.accountId"
        :options="accountOptions"
        label="label"
        value="value"
        filterable
        clearable
        placeholder="原账号不可用时改绑已有账号"
      />
    </GrowFormItem>
    <GrowFormItem :label="mode === 'rehire' ? '返聘开始日期' : '生效日期'" prop="effectiveDate">
      <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchSystemAccountBriefs } from '../../../../api/systemAccount'
import { rehireSystemPerson, reinstateSystemPerson } from '../../../../api/systemPerson'
import { fetchSystemPosts } from '../../../../api/systemPost'
import { fetchSystemPersons } from '../../../../api/systemRole'
import {
  ASSIGNMENT_TYPE_OPTIONS,
  ENABLE_STATUS_OPTIONS,
  type AssignmentType,
  type SystemPersonDetail,
  type SystemPersonListItem,
  type SystemPostOption,
} from '../../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../../types/systemRole'
import { pickSelectId, todayText, toPostSelectOptions, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'ReturnEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  detail: SystemPersonDetail | null
  deptTree: SystemDeptTreeNode[]
  mode: 'reinstate' | 'rehire'
}>()

const formRef = ref()
const posts = ref<SystemPostOption[]>([])
const supervisorOptions = ref<Array<{ label: string; value: string }>>([])
const accountOptions = ref<Array<{ label: string; value: string; occupied?: boolean }>>([])

const originalAccountId = computed(() => props.detail?.account?.accountId || props.person.accountId || '')
const postOptions = computed(() => toPostSelectOptions(posts.value))

const form = reactive({
  employeeStatus: 'formal' as 'probation' | 'formal',
  deptId: '',
  postId: '',
  assignmentType: 'primary' as AssignmentType,
  supervisorId: '',
  accountId: originalAccountId.value,
  effectiveDate: todayText(),
  remark: '',
})

const rules = {
  employeeStatus: [{ required: true, message: '请选择恢复状态', trigger: 'change' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  postId: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

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

async function loadMeta() {
  const [people, accounts] = await Promise.all([
    fetchSystemPersons(),
    fetchSystemAccountBriefs(),
  ])
  supervisorOptions.value = (Array.isArray(people) ? people : [])
    .filter((item) => item.userId !== props.person.userId)
    .map((item) => ({ value: item.userId, label: `${item.name}（${item.deptName}）` }))

  const list = Array.isArray(accounts) ? accounts : []
  accountOptions.value = list.map((item) => {
    const boundOther = Boolean(item.personName) && item.accountId !== originalAccountId.value
    return {
      value: item.accountId,
      label: `${item.username}${item.personName ? ` · ${item.personName}` : ' · 未绑定'}${boundOther ? ' · 已占用' : ''}`,
      occupied: boundOther,
    }
  }).filter((item) => !item.occupied || item.value === originalAccountId.value)

  if (originalAccountId.value) form.accountId = originalAccountId.value
}

async function submit() {
  await validateGrowForm(formRef)
  const post = posts.value.find((item) => item.id === form.postId)
  const payload = {
    userId: props.person.userId,
    mode: props.mode,
    deptId: form.deptId,
    postId: form.postId,
    post: post?.name,
    assignmentType: form.assignmentType,
    supervisorId: form.supervisorId || undefined,
    accountId: form.accountId || undefined,
    effectiveDate: form.effectiveDate,
    employeeStatus: props.mode === 'rehire' ? 'rehired' as const : form.employeeStatus,
    remark: form.remark,
  }
  if (props.mode === 'rehire') await rehireSystemPerson(payload)
  else await reinstateSystemPerson(payload)
}

onMounted(() => {
  void loadMeta()
})

defineExpose({ submit })
</script>
