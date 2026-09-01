<template>
  <div class="material-upload">
    <div
      v-for="key in MATERIAL_KEYS"
      :key="key"
      class="material-upload__item"
      :class="{ 'is-filled': lists[key].length > 0 }"
    >
      <div class="material-upload__label">{{ MATERIAL_LABELS[key] }}</div>
      <GrowUpload
        :file-list="lists[key]"
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
        {{ lists[key][0]?.name || '未上传' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { MATERIAL_KEYS, MATERIAL_LABELS, type MaterialKey, type PersonMaterials } from '../../../types/systemPerson'

defineOptions({ name: 'MaterialUpload' })

type UploadItem = { name: string; url: string; uid: number; status: 'success' }

const props = defineProps<{
  modelValue: PersonMaterials
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonMaterials]
}>()

const lists = reactive<Record<MaterialKey, UploadItem[]>>(
  Object.fromEntries(MATERIAL_KEYS.map((key) => [key, []])) as Record<MaterialKey, UploadItem[]>,
)

function fromModel(key: MaterialKey): UploadItem[] {
  const file = props.modelValue[key]
  if (!file?.name) return []
  return [{
    name: file.name,
    url: file.url || '',
    uid: lists[key][0]?.uid || Date.now(),
    status: 'success',
  }]
}

function syncFromModel() {
  MATERIAL_KEYS.forEach((key) => {
    const next = fromModel(key)
    const current = lists[key][0]
    const incoming = next[0]
    if (!incoming) {
      if (current) lists[key] = []
      return
    }
    if (current?.name === incoming.name && current.url === incoming.url) return
    lists[key] = next
  })
}

function patch(key: MaterialKey, file: { name: string; url: string } | null) {
  emit('update:modelValue', { ...props.modelValue, [key]: file })
}

function onRemove(key: MaterialKey) {
  const current = lists[key][0]
  if (current?.url.startsWith('blob:')) URL.revokeObjectURL(current.url)
  lists[key] = []
  patch(key, null)
}

function onChange(key: MaterialKey, files: Array<{ name?: string; url?: string; uid?: number; raw?: File }>) {
  const last = files?.[files.length - 1]
  if (!last) {
    onRemove(key)
    return
  }
  const current = lists[key][0]
  const name = last.name || last.raw?.name || '未命名'
  const uid = last.uid || current?.uid || Date.now()
  if (current?.uid === uid && current.url) {
    patch(key, { name, url: current.url })
    return
  }
  const url = last.url || (last.raw ? URL.createObjectURL(last.raw) : '')
  if (current?.url.startsWith('blob:') && current.url !== url) URL.revokeObjectURL(current.url)
  lists[key] = [{ name, url, uid, status: 'success' }]
  patch(key, { name, url })
}

watch(() => props.modelValue, syncFromModel, { immediate: true, deep: true })
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

.material-upload :deep(.el-upload-list__item),
.material-upload :deep(.el-upload-list__item-thumbnail) {
  transition: none !important;
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
  display: inline-flex;
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

.material-upload :deep(.el-upload-list--picture-card:has(.el-upload-list__item) + .el-upload),
.material-upload__item.is-filled :deep(.el-upload-list + .el-upload),
.material-upload__item.is-filled :deep(.el-upload--picture-card) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden;
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
</style>
