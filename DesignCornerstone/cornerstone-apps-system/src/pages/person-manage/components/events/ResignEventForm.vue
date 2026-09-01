<template>
  <div class="resign-event">
    <p class="resign-event__tip">
      人员{{ actionName }}后，当前有效任职关系将结束，绑定账号将自动停用，角色绑定关系保留。
    </p>
    <div class="resign-event__impact">
      <div>有效任职关系：{{ activeCount }} 条</div>
      <div>绑定账号：{{ accountText }}</div>
      <div>账号是否将被停用：{{ willDisableAccount }}</div>
      <div>角色绑定关系是否保留：是</div>
      <div>编制释放：{{ occupyCount }} 个岗位</div>
    </div>
    <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
      <GrowFormItem :label="`${actionName}日期`" prop="effectiveDate">
        <GrowDatePicker v-model="form.effectiveDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
      </GrowFormItem>
      <GrowFormItem :label="`${actionName}原因`" prop="reason">
        <GrowInput v-model="form.reason" maxlength="64" clearable :placeholder="`请填写${actionName}原因`" />
      </GrowFormItem>
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
      </GrowFormItem>
    </GrowForm>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { resignSystemPerson, retireSystemPerson } from '../../../../api/systemPerson'
import type { SystemPersonDetail, SystemPersonListItem } from '../../../../types/systemPerson'
import { todayText, validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'ResignEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
  detail: SystemPersonDetail | null
  mode?: 'resign' | 'retire'
}>()

const formRef = ref()
const isRetire = computed(() => props.mode === 'retire')
const actionName = computed(() => (isRetire.value ? '退休' : '离职'))
const form = reactive({
  effectiveDate: todayText(),
  reason: '',
  remark: '',
})

const rules = computed(() => ({
  effectiveDate: [{ required: true, message: `请选择${actionName.value}日期`, trigger: 'change' }],
}))

const activeAssignments = computed(() =>
  (props.detail?.assignments || []).filter((item) => item.status === 'active'),
)
const activeCount = computed(() => activeAssignments.value.length)
const occupyCount = computed(() => activeAssignments.value.filter((item) => item.occupyHeadcount).length)
const accountText = computed(() => {
  const account = props.detail?.account
  if (!account?.accountId && !props.person.accountUsername) return '未绑定'
  return account?.username || props.person.accountUsername || '-'
})
const willDisableAccount = computed(() => (accountText.value === '未绑定' ? '否' : '是'))

async function submit() {
  await validateGrowForm(formRef)
  if (isRetire.value) {
    await retireSystemPerson({
      userId: props.person.userId,
      effectiveDate: form.effectiveDate,
      reason: form.reason || undefined,
      remark: form.remark,
    })
    return
  }
  await resignSystemPerson({
    userId: props.person.userId,
    resignDate: form.effectiveDate,
    reason: form.reason || undefined,
    remark: form.remark,
  })
}

defineExpose({ submit })
</script>

<style scoped>
.resign-event__tip,
.resign-event__impact {
  margin: 0 0 12px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.resign-event__impact {
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--layout-container-background-color);
}
</style>
