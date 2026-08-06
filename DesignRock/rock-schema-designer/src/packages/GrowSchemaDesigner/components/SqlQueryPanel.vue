<template>
  <div
    class="relative flex h-full min-h-0 w-full flex-col overflow-visible"
    @click.stop
    @mouseup.stop
  >
    <div
      class="flex h-10 shrink-0 items-center justify-end border-b border-solid border-border px-1"
    >
      <GrowButton type="primary" size="small" @click.stop="onCreate">
        <GrowIconify icon="carbon:add" :size="16" class="mr-1" />
        添加
      </GrowButton>
    </div>

    <GrowScrollbar class="min-h-0 flex-1">
      <div class="p-2">
        <div
          v-if="!queryList.length"
          class="px-2 py-6 text-center text-xs text-text-secondary"
        >
          暂无 SQL 查询，点击右上角添加
        </div>

        <div
          v-for="item in queryList"
          :key="item.id"
          class="mb-1.5 rounded border border-solid border-border"
          :class="{ 'bg-primary-a08': drawerVisible && editingId === item.id }"
        >
          <div
            class="flex items-center gap-1 border-b border-solid border-border bg-layout px-1 py-2"
          >
            <div class="min-w-0 flex-1 px-1">
              <p class="truncate text-sm font-medium text-text">
                {{ item.name || '未命名' }}
              </p>
              <p
                v-if="item.description"
                class="mt-0.5 truncate text-[11px] text-text-secondary"
              >
                {{ item.description }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-0">
              <GrowButton
                text
                size="small"
                class="!px-1"
                title="编辑"
                @click.stop="onEdit(item)"
              >
                <GrowIconify icon="carbon:edit" :size="14" />
              </GrowButton>
              <GrowButton
                text
                size="small"
                class="!px-1"
                title="复制新增"
                @click.stop="onDuplicate(item)"
              >
                <GrowIconify icon="carbon:copy" :size="14" />
              </GrowButton>
              <GrowButton
                text
                size="small"
                type="danger"
                class="!px-1"
                title="删除"
                @click.stop="onRemove(item.id)"
              >
                <GrowIconify icon="carbon:trash-can" :size="14" />
              </GrowButton>
            </div>
          </div>
          <pre
            class="m-0 max-h-20 overflow-auto px-2.5 py-2 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap break-words"
          >{{ previewSql(item) }}</pre>
        </div>
      </div>
    </GrowScrollbar>

    <div
      v-if="drawerVisible"
      class="absolute bottom-0 left-full top-0 z-20 flex w-[520px] flex-col border-l border-solid border-border bg-component shadow-card"
    >
      <div
        class="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-solid border-border px-3"
      >
        <h4 class="m-0 text-sm font-medium text-text">
          {{ editingId ? '修改 SQL 查询' : '添加 SQL 查询' }}
        </h4>
        <div class="flex shrink-0 items-center gap-2">
          <GrowButton
            type="primary"
            size="small"
            :disabled="!String(formData.name || '').trim()"
            @click.stop="onSave"
          >
            保存
          </GrowButton>
          <GrowButton type="primary" plain size="small" @click.stop="onClose">取消</GrowButton>
        </div>
      </div>
      <SqlQueryForm :model="formData" :database-name="schema.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { createSchemaSqlQuery } from '../factories'
import type { DatabaseSchema, SchemaSqlQuery } from '../types'
import SqlQueryForm from './SqlQueryForm.vue'

defineOptions({ name: 'SqlQueryPanel' })

const props = defineProps<{
  schema: DatabaseSchema
}>()

const emit = defineEmits<{
  change: [queries: SchemaSqlQuery[]]
}>()

const message = useMsg()
const drawerVisible = ref(false)
const editingId = ref('')
const formData = reactive({
  name: '',
  description: '',
  sql: '',
})

const queryList = computed(() => props.schema.queries ?? [])

const previewSql = (item: SchemaSqlQuery) => {
  const body = String(item.sql || '').trim()
  if (!body) return '-- 空 SQL'
  return body.length > 160 ? `${body.slice(0, 160)}…` : body
}

const nextQueryName = () => {
  const names = new Set(queryList.value.map((q) => q.name))
  let i = 1
  let name = `query_${i}`
  while (names.has(name)) {
    i += 1
    name = `query_${i}`
  }
  return name
}

/** 基于原名称生成不重复的复制名 */
const nextCopyName = (baseRaw: string) => {
  const names = new Set(queryList.value.map((q) => q.name))
  const base = String(baseRaw || 'query').trim() || 'query'
  let name = `${base}_copy`
  let i = 2
  while (names.has(name)) {
    name = `${base}_copy${i}`
    i += 1
  }
  return name
}

const resetForm = (name = nextQueryName()) => {
  Object.assign(formData, {
    name,
    description: '',
    sql: '',
  })
  editingId.value = ''
}

const onCreate = () => {
  resetForm()
  drawerVisible.value = true
}

const onEdit = (item: SchemaSqlQuery) => {
  Object.assign(formData, {
    name: item.name ?? '',
    description: item.description ?? '',
    sql: item.sql ?? '',
  })
  editingId.value = item.id
  drawerVisible.value = true
}

/** 复制当前项内容，以新建方式打开表单 */
const onDuplicate = (item: SchemaSqlQuery) => {
  Object.assign(formData, {
    name: nextCopyName(item.name ?? ''),
    description: item.description ?? '',
    sql: item.sql ?? '',
  })
  editingId.value = ''
  drawerVisible.value = true
}

const onClose = () => {
  drawerVisible.value = false
  editingId.value = ''
}

const onSave = () => {
  const name = String(formData.name || '').trim()
  if (!name) {
    message.warning('请输入查询名称')
    return
  }
  const next = [...queryList.value]
  const oldId = editingId.value
  if (oldId) {
    const idx = next.findIndex((q) => q.id === oldId)
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        name,
        description: String(formData.description || ''),
        sql: formData.sql ?? '',
      }
    }
  } else {
    next.push(
      createSchemaSqlQuery({
        name,
        description: String(formData.description || ''),
        sql: formData.sql ?? '',
      }),
    )
  }
  emit('change', next)
  message.success(oldId ? '修改成功' : '添加成功')
  onClose()
}

const onRemove = (id: string) => {
  const next = queryList.value.filter((q) => q.id !== id)
  emit('change', next)
  if (editingId.value === id) {
    onClose()
  }
  message.success('已删除')
}
</script>
