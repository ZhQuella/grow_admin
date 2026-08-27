<template>
  <div class="family-editor">
    <div v-if="!modelValue.length" class="family-editor__empty">暂无家庭成员，可点击下方添加</div>
    <div v-for="(row, index) in modelValue" :key="row.id" class="family-editor__row">
      <GrowInput v-model="row.name" placeholder="姓名(家人)" />
      <GrowSelect
        v-model="row.relation"
        :options="FAMILY_RELATION_OPTIONS"
        label="label"
        value="value"
        clearable
        placeholder="关系"
      />
      <GrowSelect
        v-model="row.gender"
        :options="GENDER_OPTIONS"
        label="label"
        value="value"
        clearable
        placeholder="性别"
      />
      <GrowDatePicker
        v-model="row.birthday"
        value-format="YYYY-MM-DD"
        placeholder="生日"
        style="width: 100%"
      />
      <GrowInput v-model="row.phone" placeholder="电话" />
      <GrowButton link type="danger" @click="remove(index)">删除</GrowButton>
    </div>
    <GrowButton link type="primary" @click="add">+ 添加家庭成员</GrowButton>
  </div>
</template>

<script lang="ts" setup>
import { FAMILY_RELATION_OPTIONS, GENDER_OPTIONS, type PersonFamilyMember } from '../../../types/systemPerson'
import { nextFamilyId } from '../use/helpers'

defineOptions({ name: 'FamilyEditor' })

const props = defineProps<{
  modelValue: PersonFamilyMember[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonFamilyMember[]]
}>()

function add() {
  emit('update:modelValue', [
    ...props.modelValue,
    { id: nextFamilyId(), name: '', relation: '', gender: '', birthday: '', phone: '' },
  ])
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>

<style scoped>
.family-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.family-editor__empty {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.family-editor__row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr 1fr 1.1fr auto;
  gap: 8px;
  align-items: center;
}

@media (max-width: 1100px) {
  .family-editor__row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
