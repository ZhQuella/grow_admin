<template>
  <div class="emergency-editor">
    <div v-for="(row, index) in modelValue" :key="row.id">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="姓名">
            <GrowInput v-model="row.name" maxlength="32" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="关系">
            <GrowSelect
              v-model="row.relation"
              :options="FAMILY_RELATION_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="电话">
            <GrowInput v-model="row.phone" maxlength="11" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem class="emergency-editor__op" label="&#8203;">
            <GrowTooltip content="删除" placement="top">
              <GrowButton link type="danger" :disabled="modelValue.length <= 1" @click="remove(index)">
                <GrowIconify icon="ant-design:delete-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </div>
    <div class="emergency-editor__add">
      <GrowButton link type="primary" @click="add">
        <GrowIconify icon="ant-design:plus-outlined" :size="16" />
        添加紧急联系人
      </GrowButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { FAMILY_RELATION_OPTIONS, type PersonEmergencyContact } from '../../../types/systemPerson'
import { emptyEmergencyContact } from '../use/helpers'

defineOptions({ name: 'EmergencyEditor' })

const props = defineProps<{
  modelValue: PersonEmergencyContact[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonEmergencyContact[]]
}>()

function ensureRow() {
  if (!props.modelValue.length) {
    emit('update:modelValue', [emptyEmergencyContact()])
  }
}

function add() {
  emit('update:modelValue', [...props.modelValue, emptyEmergencyContact()])
}

function remove(index: number) {
  if (props.modelValue.length <= 1) return
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

onMounted(ensureRow)
watch(() => props.modelValue.length, ensureRow)
</script>

<style scoped>
.emergency-editor :deep(.el-input),
.emergency-editor :deep(.el-select) {
  width: 100%;
}

.emergency-editor :deep(.el-form-item) {
  margin-bottom: 12px;
}

.emergency-editor__op :deep(.el-form-item__label) {
  visibility: hidden;
}

.emergency-editor__add {
  display: flex;
  justify-content: center;
}

.emergency-editor__add :deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: auto;
  padding: 0 8px;
}
</style>
