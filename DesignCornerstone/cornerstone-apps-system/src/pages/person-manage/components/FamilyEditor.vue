<template>
  <div class="family-editor">
    <div v-for="(row, index) in modelValue" :key="row.id">
      <GrowRow :gutter="16">
        <GrowCol :span="4">
          <GrowFormItem label="姓名">
            <GrowInput v-model="row.name" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="4">
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
        <GrowCol :span="4">
          <GrowFormItem label="性别">
            <GrowSelect
              v-model="row.gender"
              :options="GENDER_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="4">
          <GrowFormItem label="生日">
            <GrowDatePicker
              v-model="row.birthday"
              value-format="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="4">
          <GrowFormItem label="电话">
            <GrowInput v-model="row.phone" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="4">
          <GrowFormItem class="family-editor__op" label="&#8203;">
            <GrowTooltip content="删除" placement="top">
              <GrowButton link type="danger" :disabled="modelValue.length <= 1" @click="remove(index)">
                <GrowIconify icon="ant-design:delete-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </div>
    <div class="family-editor__add">
      <GrowButton link type="primary" @click="add">
        <GrowIconify icon="ant-design:plus-outlined" :size="16" />
        添加家庭成员
      </GrowButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { FAMILY_RELATION_OPTIONS, GENDER_OPTIONS, type PersonFamilyMember } from '../../../types/systemPerson'
import { emptyFamilyMember } from '../use/helpers'

defineOptions({ name: 'FamilyEditor' })

const props = defineProps<{
  modelValue: PersonFamilyMember[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonFamilyMember[]]
}>()

function ensureRow() {
  if (!props.modelValue.length) {
    emit('update:modelValue', [emptyFamilyMember()])
  }
}

function add() {
  emit('update:modelValue', [...props.modelValue, emptyFamilyMember()])
}

function remove(index: number) {
  if (props.modelValue.length <= 1) return
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

onMounted(ensureRow)
watch(() => props.modelValue.length, ensureRow)
</script>

<style scoped>
.family-editor :deep(.el-input),
.family-editor :deep(.el-select),
.family-editor :deep(.el-date-editor) {
  width: 100%;
}

.family-editor :deep(.el-form-item) {
  margin-bottom: 12px;
}

.family-editor__op :deep(.el-form-item__label) {
  visibility: hidden;
}

.family-editor__add {
  display: flex;
  justify-content: center;
}

.family-editor__add :deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: auto;
  padding: 0 8px;
}
</style>
