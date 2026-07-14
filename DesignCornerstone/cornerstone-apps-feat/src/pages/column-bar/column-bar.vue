<template>
  <div class="h-full overflow-auto px-5 py-[50px]">
    <div class="mb-4 text-[17px] text-text">
      表格列设置
    </div>
    <div class="mb-3 text-sm text-text-secondary">
      点击右侧按钮配置列显隐，支持多级表头；序号与操作列默认不可取消。
    </div>

    <div class="mb-4 flex items-center justify-between rounded border border-solid border-border bg-component px-4 py-3">
      <div class="text-sm text-text">
        列配置
      </div>
      <GrowColumnBar :columns="tableColumns" @confirm="onColumnsBarConfirm" />
    </div>

    <div class="overflow-hidden rounded border border-solid border-border bg-component p-2">
      <GrowTable :data="tableData" border>
        <TableColumnNode
          v-for="column in visibleColumns"
          :key="String(column.field)"
          :column="column"
        />
      </GrowTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, h, ref, resolveComponent } from 'vue'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'

defineOptions({
  name: 'ColumnBarPage',
})

const TableColumnNode = defineComponent({
  name: 'TableColumnNode',
  props: {
    column: {
      type: Object as () => ColumnBarItem,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const GrowTableColumn = resolveComponent('GrowTableColumn')
      const children = (props.column.children || []).filter((item) => item.visible !== false)

      if (children.length) {
        return h(
          GrowTableColumn,
          { label: props.column.title, align: 'center' },
          () => children.map((child) => h(TableColumnNode, { column: child, key: String(child.field) })),
        )
      }

      return h(GrowTableColumn, {
        prop: String(props.column.field),
        label: props.column.title,
        minWidth: 120,
      })
    }
  },
})

const tableColumns = ref<ColumnBarItem[]>([
  { title: '序号', field: 'serial', visible: true },
  { title: '账号', field: 'account', visible: true },
  { title: '昵称', field: 'nickname', visible: true },
  {
    title: '状态信息',
    field: 'statusGroup',
    visible: true,
    children: [
      { title: '账号状态', field: 'status', visible: true },
      { title: '创建日期', field: 'createDate', visible: true },
    ],
  },
  { title: '邮箱', field: 'email', visible: false },
  { title: '操作', field: 'operate', visible: true },
])

const tableData = [
  {
    id: 1,
    serial: 1,
    account: 'admin',
    nickname: '管理员',
    status: '启用',
    createDate: '2024-01-12',
    email: 'admin@example.com',
    operate: '详情',
  },
  {
    id: 2,
    serial: 2,
    account: 'demo',
    nickname: '演示账号',
    status: '锁定',
    createDate: '2024-06-03',
    email: 'demo@example.com',
    operate: '详情',
  },
]

function filterVisibleColumns(list: ColumnBarItem[]): ColumnBarItem[] {
  return list
    .map((item) => {
      if (item.children?.length) {
        const children = filterVisibleColumns(item.children)
        if (!children.length || item.visible === false) {
          return null
        }
        return { ...item, children }
      }
      return item.visible !== false ? item : null
    })
    .filter(Boolean) as ColumnBarItem[]
}

const visibleColumns = computed(() => filterVisibleColumns(tableColumns.value))

function onColumnsBarConfirm(columns: ColumnBarItem[]) {
  tableColumns.value = columns
}
</script>
