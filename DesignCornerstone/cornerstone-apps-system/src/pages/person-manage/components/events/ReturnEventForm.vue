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
    <GrowFormItem :label="mode === 'rehire' ? '返聘日期' : '复职日期'" prop="effectiveDate">
      <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
    </GrowFormItem>
    <GrowFormItem label="分配账号" prop="accountId">
      <GrowSelect
        v-model="form.accountId"
        :options="accountOptions"
        label="label"
        value="value"
        filterable
        clearable
        placeholder="选填"
      />
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
import { ENABLE_STATUS_OPTIONS, type SystemPersonDetail, type SystemPersonListItem } from '../../../../types/systemPerson'
import { todayText, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'ReturnEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  detail?: SystemPersonDetail | null
  mode: 'reinstate' | 'rehire'
}>()

const formRef = ref()
const originalAccountId = computed(() => props.detail?.account?.accountId || props.person.accountId || '')
const accountOptions = ref<Array<{ label: string; value: string }>>([])
const form = reactive({
  employeeStatus: 'formal' as 'probation' | 'formal',
  accountId: originalAccountId.value,
  effectiveDate: todayText(),
  remark: '',
})

const required = (message: string) => [{ required: true, message, trigger: 'change' }]
const rules = computed(() => ({
  employeeStatus: required('请选择恢复状态'),
  effectiveDate: required(props.mode === 'rehire' ? '请选择返聘日期' : '请选择复职日期'),
}))

async function loadAccounts() {
  const accounts = await fetchSystemAccountBriefs()
  const list = Array.isArray(accounts) ? accounts : []
  accountOptions.value = list
    .filter((item) => !item.personName || item.accountId === originalAccountId.value)
    .map((item) => ({
      value: item.accountId,
      label: item.accountId === originalAccountId.value
        ? `${item.username}（原账号）`
        : item.username,
    }))
  if (originalAccountId.value) form.accountId = originalAccountId.value
}

async function submit() {
  await validateGrowForm(formRef)
  const payload = {
    userId: props.person.userId,
    mode: props.mode,
    accountId: form.accountId || undefined,
    effectiveDate: form.effectiveDate,
    employeeStatus: props.mode === 'rehire' ? 'rehired' as const : form.employeeStatus,
    remark: form.remark,
  }
  if (props.mode === 'rehire') await rehireSystemPerson(payload)
  else await reinstateSystemPerson(payload)
}

onMounted(() => {
  void loadAccounts()
})

defineExpose({ submit })
</script>
