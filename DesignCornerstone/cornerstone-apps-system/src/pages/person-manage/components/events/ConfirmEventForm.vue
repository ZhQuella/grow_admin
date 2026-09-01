<template>
  <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
    <GrowFormItem v-if="isPending" label="转正结果" prop="targetStatus">
      <GrowRadioGroup
        v-model="form.targetStatus"
        :options="[
          { label: '转入试用', value: 'probation' },
          { label: '直接正式', value: 'formal' },
        ]"
      />
    </GrowFormItem>
    <GrowFormItem v-if="showProbation" label="试用期开始" prop="probationStart">
      <GrowDatePicker v-model="form.probationStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem v-if="showProbation" label="试用期结束" prop="probationEnd">
      <GrowDatePicker v-model="form.probationEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem v-if="form.targetStatus === 'formal'" label="实际转正日期" prop="actualConfirmDate">
      <GrowDatePicker v-model="form.actualConfirmDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { confirmSystemPerson } from '../../../../api/systemPerson'
import type { SystemPersonListItem } from '../../../../types/systemPerson'
import { todayText, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'ConfirmEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
}>()

const formRef = ref()
const isPending = computed(() => props.person.employeeStatus === 'pending')
const form = reactive({
  targetStatus: (props.person.employeeStatus === 'pending' ? 'probation' : 'formal') as 'probation' | 'formal',
  probationStart: '',
  probationEnd: '',
  actualConfirmDate: todayText(),
  remark: '',
})

const showProbation = computed(() => form.targetStatus === 'probation' || isPending.value)

const rules = computed(() => ({
  targetStatus: [{ required: true, message: '请选择转正结果', trigger: 'change' }],
  actualConfirmDate: form.targetStatus === 'formal'
    ? [{ required: true, message: '请选择转正日期', trigger: 'change' }]
    : [],
}))

async function submit() {
  await validateGrowForm(formRef)
  await confirmSystemPerson({
    userId: props.person.userId,
    targetStatus: form.targetStatus,
    probationStart: form.probationStart || undefined,
    probationEnd: form.probationEnd || undefined,
    actualConfirmDate: form.targetStatus === 'formal' ? form.actualConfirmDate : undefined,
    remark: form.remark,
  })
}

defineExpose({ submit })
</script>
