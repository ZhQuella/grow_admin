<template>
  <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
    <GrowFormItem v-if="mode === 'enable'" label="恢复状态" prop="employeeStatus">
      <GrowSelect
        v-model="form.employeeStatus"
        :options="ENABLE_STATUS_OPTIONS"
        label="label"
        value="value"
        placeholder="请选择"
      />
    </GrowFormItem>
    <GrowFormItem :label="dateLabel" prop="effectiveDate">
      <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem label="备注" prop="remark">
      <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import {
  disableSystemPerson,
  enableSystemPerson,
  retireSystemPerson,
} from '../../../../api/systemPerson'
import { ENABLE_STATUS_OPTIONS, type SystemPersonListItem } from '../../../../types/systemPerson'
import { todayText, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'StatusDateEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  mode: 'disable' | 'enable' | 'retire'
}>()

const formRef = ref()
const defaultStatus = props.person.previousStatus === 'probation' ? 'probation' : 'formal'
const form = reactive({
  employeeStatus: defaultStatus as 'probation' | 'formal',
  effectiveDate: todayText(),
  remark: '',
})

const dateLabel = computed(() => {
  if (props.mode === 'disable') return '停用日期'
  if (props.mode === 'retire') return '退休日期'
  return '启用日期'
})

const rules = {
  employeeStatus: [{ required: true, message: '请选择恢复状态', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

async function submit() {
  await validateGrowForm(formRef)
  const payload = {
    userId: props.person.userId,
    effectiveDate: form.effectiveDate,
    remark: form.remark,
    employeeStatus: props.mode === 'enable' ? form.employeeStatus : undefined,
  }
  if (props.mode === 'disable') await disableSystemPerson(payload)
  else if (props.mode === 'retire') await retireSystemPerson(payload)
  else await enableSystemPerson(payload)
}

defineExpose({ submit })
</script>
