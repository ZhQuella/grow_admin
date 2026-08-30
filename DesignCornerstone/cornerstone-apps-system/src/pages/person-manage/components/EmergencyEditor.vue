<template>
  <div class="emergency-editor">
    <div v-for="(row, index) in modelValue" :key="row.id" class="emergency-editor__row">
      <GrowInput v-model="row.name" maxlength="32" placeholder="姓名(紧急联系人)" />
      <GrowSelect
        v-model="row.relation"
        :options="FAMILY_RELATION_OPTIONS"
        label="label"
        value="value"
        clearable
        placeholder="关系"
      />
      <GrowInput v-model="row.phone" maxlength="11" placeholder="电话" />
      <GrowButton link type="danger" :disabled="modelValue.length <= 1" @click="remove(index)">删除</GrowButton>
    </div>
    <GrowButton link type="primary" @click="add">+ 添加紧急联系人</GrowButton>
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
.emergency-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emergency-editor__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  align-items: center;
}

.emergency-editor__row :deep(.el-input),
.emergency-editor__row :deep(.el-select) {
  width: 100%;
}

@media (max-width: 1100px) {
  .emergency-editor__row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
