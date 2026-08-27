<template>
  <GrowDialog
    v-model="visible"
    :title="title"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <GrowForm
      v-if="visible"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
    >
      <template v-if="mode === 'transfer' || mode === 'reinstate'">
        <GrowFormItem label="调入部门" prop="deptId" v-if="mode === 'transfer'">
          <GrowTreeSelect
            v-model="form.deptId"
            :data="deptTree"
            :props="{ label: 'title', value: 'id', children: 'children' }"
            check-strictly
            filterable
            default-expand-all
            placeholder="请选择部门"
          />
        </GrowFormItem>
        <GrowFormItem label="复职部门" prop="deptId" v-else>
          <GrowTreeSelect
            v-model="form.deptId"
            :data="deptTree"
            :props="{ label: 'title', value: 'id', children: 'children' }"
            check-strictly
            filterable
            default-expand-all
            placeholder="请选择部门"
          />
        </GrowFormItem>
        <GrowFormItem label="岗位" prop="post">
          <GrowInput v-model="form.post" maxlength="32" clearable placeholder="岗位名称" />
        </GrowFormItem>
      </template>

      <GrowFormItem v-if="mode === 'reinstate'" label="员工状态" prop="employeeStatus">
        <GrowSelect
          v-model="form.employeeStatus"
          :options="statusOptions"
          label="label"
          value="value"
          placeholder="请选择"
        />
      </GrowFormItem>

      <GrowFormItem :label="dateLabel" prop="effectiveDate">
        <GrowDatePicker
          v-model="form.effectiveDate"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期"
          style="width: 100%"
        />
      </GrowFormItem>

      <GrowFormItem :label="remarkLabel" prop="remark">
        <GrowInput
          v-model="form.remark"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          :placeholder="remarkPlaceholder"
        />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="submitting" @click="submit">确定</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import {
  confirmSystemPerson,
  reinstateSystemPerson,
  resignSystemPerson,
  transferSystemPerson,
} from '../../../api/systemPerson'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import type { SystemPersonListItem } from '../../../types/systemPerson'
import { todayText, toMessage } from '../use/helpers'

defineOptions({ name: 'PersonEventDialog' })

const emit = defineEmits<{
  success: []
}>()

type EventMode = 'transfer' | 'confirm' | 'resign' | 'reinstate'

const message = useMsg()
const visible = ref(false)
const submitting = ref(false)
const mode = ref<EventMode>('transfer')
const person = ref<SystemPersonListItem | null>(null)
const deptTree = ref<SystemDeptTreeNode[]>([])
const formRef = ref()
const form = reactive({
  deptId: '',
  post: '',
  employeeStatus: 'formal',
  effectiveDate: '',
  remark: '',
})

const statusOptions = [
  { label: '正式', value: 'formal' },
  { label: '试用', value: 'probation' },
]

const title = computed(() => {
  const name = person.value?.name || ''
  const map = { transfer: '调岗', confirm: '转正', resign: '离职', reinstate: '复职' }
  return name ? `${map[mode.value]} · ${name}` : map[mode.value]
})

const dateLabel = computed(() => {
  if (mode.value === 'confirm') return '转正日期'
  if (mode.value === 'resign') return '离职日期'
  return '生效日期'
})

const remarkLabel = computed(() => (mode.value === 'resign' ? '离职原因' : '备注'))
const remarkPlaceholder = computed(() => (mode.value === 'resign' ? '请填写离职原因' : '选填'))

const rules = computed(() => {
  const required = (message: string) => [{ required: true, message, trigger: 'change' }]
  if (mode.value === 'transfer' || mode.value === 'reinstate') {
    return {
      deptId: required('请选择部门'),
      post: [{ required: true, message: '请填写岗位', trigger: 'blur' }],
      effectiveDate: required('请选择日期'),
    }
  }
  return {
    effectiveDate: required('请选择日期'),
  }
})

async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) {
    throw new Error('表单未就绪')
  }
  const result = await form.validate()
  if (result === false) {
    throw new Error('校验未通过')
  }
}

function resetForm(row: SystemPersonListItem) {
  form.deptId = row.deptId
  form.post = row.post
  form.employeeStatus = 'formal'
  form.effectiveDate = todayText()
  form.remark = ''
}

function open(nextMode: EventMode, row: SystemPersonListItem, tree: SystemDeptTreeNode[]) {
  mode.value = nextMode
  person.value = row
  deptTree.value = tree
  resetForm(row)
  visible.value = true
}

async function submit() {
  try {
    await validateGrowForm(formRef)
  } catch {
    return
  }
  const userId = person.value?.userId
  if (!userId) return
  submitting.value = true
  try {
    if (mode.value === 'transfer') {
      await transferSystemPerson({
        userId,
        deptId: form.deptId,
        post: form.post,
        effectiveDate: form.effectiveDate,
        reason: form.remark,
      })
    } else if (mode.value === 'confirm') {
      await confirmSystemPerson({
        userId,
        actualConfirmDate: form.effectiveDate,
        remark: form.remark,
      })
    } else if (mode.value === 'resign') {
      await resignSystemPerson({
        userId,
        resignDate: form.effectiveDate,
        reason: form.remark,
      })
    } else {
      await reinstateSystemPerson({
        userId,
        deptId: form.deptId,
        post: form.post,
        effectiveDate: form.effectiveDate,
        employeeStatus: form.employeeStatus as 'formal' | 'probation',
        remark: form.remark,
      })
    }
    message.success('操作成功')
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(toMessage(error, '操作失败'))
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>
