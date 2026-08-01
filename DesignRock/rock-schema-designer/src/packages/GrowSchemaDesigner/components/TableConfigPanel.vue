<template>
  <div class="box-border flex h-full min-h-0 flex-col">
    <div class="box-border flex-1 overflow-auto px-3 py-3">
      <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
        <GrowFormItem label="表名">
          <GrowInput
            :model-value="table.name"
            size="small"
            placeholder="table_name"
            :maxlength="MAX_TABLE_NAME_LENGTH"
            show-word-limit
            @update:model-value="onNameChange"
          />
        </GrowFormItem>
        <GrowFormItem label="注释">
          <GrowInput
            :model-value="table.comment || ''"
            size="small"
            placeholder="表注释"
            @update:model-value="onCommentChange"
          />
        </GrowFormItem>
      </GrowForm>

      <div class="mb-2 mt-1 flex items-center justify-between">
        <span class="text-[13px] font-semibold text-text">字段</span>
        <GrowButton size="small" type="primary" @click="$emit('add-column')">
          <GrowIconify icon="carbon:add" :size="14" class="mr-1 align-[-2px]" />
          添加字段
        </GrowButton>
      </div>

      <div v-if="!table.columns.length" class="py-6 text-center text-xs text-text-secondary">
        暂无字段
      </div>

      <div
        v-for="(col, index) in table.columns"
        :key="col.id"
        class="field-card mb-2"
        :class="{ 'is-active': activeColumnId === col.id }"
        @click="$emit('select-column', col.id)"
      >
        <div class="field-card__head mb-2">
          <span class="field-card__title" :title="`#${index + 1} ${col.name}`">
            <span class="field-card__index">#{{ index + 1 }}</span>
            <span class="field-card__name">{{ col.name }}</span>
          </span>
          <GrowButton
            type="danger"
            text
            size="small"
            class="field-card__delete !px-1"
            title="删除字段"
            @click.stop="$emit('remove-column', col.id)"
          >
            <GrowIconify icon="carbon:trash-can" :size="14" />
          </GrowButton>
        </div>

        <GrowForm label-width="64px" label-position="left" size="small" :show-message="false">
          <GrowFormItem label="名称">
            <GrowInput
              :model-value="col.name"
              size="small"
              :maxlength="MAX_COLUMN_NAME_LENGTH"
              show-word-limit
              @update:model-value="(v) => patchColumn(col.id, { name: clampIdentifier(String(v ?? ''), MAX_COLUMN_NAME_LENGTH) })"
            />
          </GrowFormItem>
          <GrowFormItem label="类型">
            <GrowSelect
              :model-value="col.type"
              :options="SCHEMA_COLUMN_TYPE_OPTIONS"
              size="small"
              class="w-full"
              @update:model-value="(v) => onTypeChange(col.id, String(v))"
            />
          </GrowFormItem>
          <GrowFormItem v-if="typeNeedsLength(col.type)" :label="col.type === 'NUMERIC' ? '精度' : '长度'">
            <GrowInputNumber
              :model-value="col.length ?? undefined"
              size="small"
              class="w-full"
              :min="0"
              @update:model-value="(v) => patchColumn(col.id, { length: Number(v) || null })"
            />
          </GrowFormItem>
          <GrowFormItem v-if="typeNeedsScale(col.type)" label="小数位">
            <GrowInputNumber
              :model-value="col.scale ?? undefined"
              size="small"
              class="w-full"
              :min="0"
              @update:model-value="(v) => patchColumn(col.id, { scale: Number(v) || null })"
            />
          </GrowFormItem>
          <GrowFormItem label="默认值">
            <GrowInput
              :model-value="col.defaultValue ?? ''"
              size="small"
              placeholder="可空"
              clearable
              @update:model-value="(v) => patchColumn(col.id, { defaultValue: String(v ?? '') || null })"
            />
          </GrowFormItem>
          <GrowFormItem label="注释">
            <GrowInput
              :model-value="col.comment || ''"
              size="small"
              @update:model-value="(v) => patchColumn(col.id, { comment: String(v ?? '') })"
            />
          </GrowFormItem>
          <GrowFormItem label="约束">
            <div class="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
              <label class="inline-flex items-center gap-1 text-xs text-text">
                <GrowCheckbox
                  :model-value="col.primaryKey"
                  @update:model-value="(v) => onPrimaryKey(col.id, !!v)"
                />
                主键
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-text">
                <GrowCheckbox
                  :model-value="col.autoIncrement"
                  @update:model-value="(v) => patchColumn(col.id, { autoIncrement: !!v })"
                />
                自增 (IDENTITY)
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-text">
                <GrowCheckbox
                  :model-value="!col.nullable"
                  @update:model-value="(v) => patchColumn(col.id, { nullable: !v })"
                />
                非空
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-text">
                <GrowCheckbox
                  :model-value="col.unique"
                  @update:model-value="(v) => patchColumn(col.id, { unique: !!v })"
                />
                唯一
              </label>
              <label class="inline-flex items-center gap-1 text-xs text-text">
                <GrowCheckbox
                  :model-value="col.indexed"
                  @update:model-value="(v) => patchColumn(col.id, { indexed: !!v })"
                />
                索引
              </label>
            </div>
          </GrowFormItem>
        </GrowForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SCHEMA_COLUMN_TYPE_OPTIONS,
  MAX_TABLE_NAME_LENGTH,
  MAX_COLUMN_NAME_LENGTH,
  clampIdentifier,
  typeNeedsLength,
  typeNeedsScale,
} from '../postgresTypes'
import type { SchemaColumn, SchemaColumnType, SchemaTable } from '../types'

defineOptions({
  name: 'TableConfigPanel',
})

const props = defineProps<{
  table: SchemaTable
  activeColumnId?: string | null
}>()

const emit = defineEmits<{
  'update-table': [patch: Partial<Pick<SchemaTable, 'name' | 'comment'>>]
  'update-column': [columnId: string, patch: Partial<SchemaColumn>]
  'add-column': []
  'remove-column': [columnId: string]
  'select-column': [columnId: string]
}>()

const onNameChange = (value: string | number | null) => {
  emit('update-table', { name: clampIdentifier(String(value ?? ''), MAX_TABLE_NAME_LENGTH) })
}

const onCommentChange = (value: string | number | null) => {
  emit('update-table', { comment: String(value ?? '') })
}

const patchColumn = (columnId: string, patch: Partial<SchemaColumn>) => {
  emit('update-column', columnId, patch)
}

const onTypeChange = (columnId: string, typeRaw: string) => {
  const type = typeRaw as SchemaColumnType
  const patch: Partial<SchemaColumn> = { type }
  if (type === 'VARCHAR' || type === 'CHAR') {
    const col = props.table.columns.find((c) => c.id === columnId)
    if (!col?.length) patch.length = 255
  } else if (type === 'NUMERIC') {
    const col = props.table.columns.find((c) => c.id === columnId)
    if (!col?.length) patch.length = 10
    if (col?.scale == null) patch.scale = 2
  } else {
    patch.scale = null
    if (type !== 'VARCHAR' && type !== 'CHAR') patch.length = null
  }
  patchColumn(columnId, patch)
}

const onPrimaryKey = (columnId: string, primaryKey: boolean) => {
  patchColumn(columnId, {
    primaryKey,
    nullable: primaryKey ? false : undefined,
    autoIncrement: primaryKey ? true : undefined,
  } as Partial<SchemaColumn>)
}
</script>

<style scoped>
.field-card {
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px;
  background: color-mix(in srgb, var(--layout-container-background-color) 70%, var(--component-background-color));
  cursor: pointer;
}

.field-card.is-active {
  border-color: var(--primary-color);
}

.field-card__head {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field-card__title {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
}

.field-card__index {
  flex-shrink: 0;
}

.field-card__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-card__delete {
  flex-shrink: 0 !important;
}
</style>
