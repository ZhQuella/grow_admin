<template>
  <div class="delete-event">
    <p class="delete-event__hint">
      确认删除人员「{{ person.name }}」？仅离职人员可删除，删除为逻辑删除，历史记录保留。
    </p>
    <GrowForm ref="formRef" :model="form" :rules="rules" label-width="108px">
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
      </GrowFormItem>
    </GrowForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { deleteSystemPerson } from '../../../../api/systemPerson'
import type { SystemPersonListItem } from '../../../../types/systemPerson'
import { validateGrowForm } from '../../use/helpers'

defineOptions({ name: 'DeleteEventForm' })

const props = defineProps<{
  person: SystemPersonListItem
}>()

const formRef = ref()
const form = reactive({ remark: '' })
const rules = {}

async function submit() {
  await validateGrowForm(formRef)
  await deleteSystemPerson({
    userId: props.person.userId,
    remark: form.remark,
  })
}

defineExpose({ submit })
</script>

<style scoped>
.delete-event__hint {
  margin: 0 0 12px;
  color: var(--text-color-secondary);
  line-height: 1.6;
}
</style>
