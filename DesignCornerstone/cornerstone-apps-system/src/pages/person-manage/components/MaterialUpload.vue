<template>
  <div class="material-upload">
    <div v-for="key in MATERIAL_KEYS" :key="key" class="material-upload__item">
      <div class="material-upload__label">{{ MATERIAL_LABELS[key] }}</div>
      <GrowUpload
        :file-list="fileList(key)"
        :limit="1"
        list-type="picture-card"
        :auto-upload="false"
        accept="image/*,.pdf"
        :on-preview="() => undefined"
        :on-remove="() => onRemove(key)"
        :on-change="(_file, files) => onChange(key, files)"
      >
        <span class="material-upload__plus">
          <GrowIconify icon="ant-design:plus-outlined" :size="22" />
        </span>
      </GrowUpload>
      <div class="material-upload__status">
        {{ modelValue[key]?.name ? modelValue[key]?.name : '未上传' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MATERIAL_KEYS, MATERIAL_LABELS, type MaterialKey, type PersonMaterials } from '../../../types/systemPerson'

defineOptions({ name: 'MaterialUpload' })

const props = defineProps<{
  modelValue: PersonMaterials
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonMaterials]
}>()

function fileList(key: MaterialKey) {
  const file = props.modelValue[key]
  if (!file?.name) return []
  return [{ name: file.name, url: file.url || '' }]
}

function patch(key: MaterialKey, file: { name: string; url: string } | null) {
  emit('update:modelValue', { ...props.modelValue, [key]: file })
}

function onRemove(key: MaterialKey) {
  patch(key, null)
}

function onChange(key: MaterialKey, files: Array<{ name?: string; url?: string; raw?: File }>) {
  const last = files?.[files.length - 1]
  if (!last) {
    patch(key, null)
    return
  }
  const name = last.name || last.raw?.name || '未命名'
  if (last.raw) {
    const reader = new FileReader()
    reader.onload = () => {
      patch(key, { name, url: String(reader.result || '') })
    }
    reader.readAsDataURL(last.raw)
    return
  }
  patch(key, { name, url: last.url || '' })
}
</script>

<style scoped>
.material-upload {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.material-upload__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.material-upload__label,
.material-upload__status {
  width: 100%;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-color-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-upload :deep(.el-upload-list--picture-card) {
  margin: 0;
}

.material-upload :deep(.el-upload--picture-card),
.material-upload :deep(.el-upload-list--picture-card .el-upload-list__item) {
  --el-upload-picture-card-size: 96px;
  position: relative;
  width: var(--el-upload-picture-card-size);
  height: var(--el-upload-picture-card-size);
  margin: 0;
  border-radius: 8px;
}

.material-upload :deep(.el-upload--picture-card) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 0 !important;
  color: var(--text-color-secondary);
  background: var(--layout-container-background-color);
}

.material-upload :deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.material-upload__plus {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
}

.material-upload__plus :deep(.grow-iconify) {
  display: flex !important;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.material-upload__plus :deep(svg) {
  display: block;
  width: 22px;
  height: 22px;
}

@media (max-width: 1200px) {
  .material-upload {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
