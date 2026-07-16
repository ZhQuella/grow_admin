<template>
  <div class="h-full overflow-hidden">
    <GrowCodeSandbox
      v-model="editorCode"
      :expose="sandboxExpose"
      :dependencies="dependencies"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { CodeDependency, SandboxExpose } from '@grow-admin-rock/code-sandbox'
import {
  GrowCodeSandbox,
  composeVueSfc,
  DEFAULT_SANDBOX_DEPENDENCIES,
  mergeDependencies,
} from '@grow-admin-rock/code-sandbox'
import { useMsg } from '@grow-admin-rock/components'
import * as GrowState from '@grow-admin-rock/state'
import * as GrowRouter from '@grow-admin-rock/middleware-router'
import * as GrowUtils from '@grow-admin-rock/utils'
import * as GrowHooks from '@grow-admin-rock/hooks'
import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'

defineOptions({
  name: 'CodeSandboxDemoPage',
})

const editorCode = ref(
  composeVueSfc({
    template: `<div class="list-demo">
    <GrowRow justify="space-between" class="list-demo__toolbar">
      <GrowCol :span="14">
        <GrowButton type="primary" @click="onAdd">新增</GrowButton>
      </GrowCol>
      <GrowCol :span="10">
        <div class="list-demo__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="list-demo__table">
      <GrowWatchBox class="list-demo__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="pagedData"
            :height="height + 'px'"
            border
          >
            <GrowTableColumn
              v-for="col in leafColumns"
              :key="String(col.field)"
              :prop="String(col.field)"
              :label="col.title"
              min-width="120"
            />
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="list-demo__pager">
      <GrowPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        :total="filteredData.length"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>`,
    script: `import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'

const message = useMsg()

const accountStates = [
  { label: '启用', code: '1' },
  { label: '禁用', code: '0' },
  { label: '锁定', code: '2' },
]

const searchList = [
  {
    labelText: '账号',
    placeholder: '请输入账号',
    elType: 'GrowInput',
    isDefault: true,
    model: 'account',
    noDelete: true,
    clearable: true
  },
  {
    labelText: '昵称',
    placeholder: '请输入昵称',
    elType: 'GrowInput',
    isDefault: true,
    model: 'nickname',
    clearable: true
  },
  {
    isDefault: true,
    elType: 'GrowSelect',
    labelText: '账号状态',
    model: 'status',
    label: 'label',
    value: 'code',
    placeholder: '请选择账号状态',
    options: accountStates,
    clearable: true
  },
]

const tableColumns = ref([
  { title: '序号', field: 'serial', visible: true },
  { title: '账号', field: 'account', visible: true },
  { title: '昵称', field: 'nickname', visible: true },
  { title: '账号状态', field: 'status', visible: true },
  { title: '创建日期', field: 'createDate', visible: true },
  { title: '邮箱', field: 'email', visible: false },
])

const allData = ref([
  { serial: 1, account: 'admin', nickname: '管理员', status: '启用', createDate: '2024-01-12', email: 'admin@example.com' },
  { serial: 2, account: 'demo', nickname: '演示账号', status: '锁定', createDate: '2024-06-03', email: 'demo@example.com' },
  { serial: 3, account: 'alice', nickname: '爱丽丝', status: '启用', createDate: '2024-08-20', email: 'alice@example.com' },
  { serial: 4, account: 'bob', nickname: '鲍勃', status: '禁用', createDate: '2024-09-01', email: 'bob@example.com' },
  { serial: 5, account: 'carol', nickname: '卡萝尔', status: '启用', createDate: '2025-01-15', email: 'carol@example.com' },
  { serial: 6, account: 'dave', nickname: '戴夫', status: '锁定', createDate: '2025-02-10', email: 'dave@example.com' },
  { serial: 7, account: 'erin', nickname: '艾琳', status: '启用', createDate: '2025-03-08', email: 'erin@example.com' },
  { serial: 8, account: 'frank', nickname: '弗兰克', status: '禁用', createDate: '2025-04-22', email: 'frank@example.com' },
])

const query = ref({})
const page = ref(1)
const pageSize = ref(5)

const statusCodeMap = { '1': '启用', '0': '禁用', '2': '锁定' }

const filteredData = computed(() => {
  const q = query.value || {}
  return allData.value.filter((row) => {
    if (q.account && !String(row.account).includes(String(q.account))) return false
    if (q.nickname && !String(row.nickname).includes(String(q.nickname))) return false
    if (q.status != null && q.status !== '' && row.status !== statusCodeMap[q.status]) return false
    return true
  })
})

const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

function collectLeafColumns(list) {
  const result = []
  list.forEach((item) => {
    if (item.visible === false) return
    if (item.children?.length) {
      result.push(...collectLeafColumns(item.children))
    } else if (item.field) {
      result.push(item)
    }
  })
  return result
}

const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

function onSearch(data) {
  query.value = data || {}
  page.value = 1
}

function onColumnsConfirm(columns) {
  tableColumns.value = columns
}

function onPageChange(val) {
  page.value = val
}

function onSizeChange(val) {
  pageSize.value = val
  page.value = 1
}
  
function onAdd() {
  message.success('点击了新增')
}
`,
    style: `.list-demo {
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-sizing: border-box;
  height: 100%;
}
.list-demo__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--layout-color);
}
.list-demo__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.list-demo__table {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-color, #fff);
}
.list-demo__watch {
  height: 100%;
  min-height: 0;
}
.list-demo__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-color, #fff);
}`,
    scriptLang: 'ts',
    styleScoped: true,
  }),
)

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

const sandboxExpose = computed<SandboxExpose>(() => ({
  apis: { useRequest },
  modules: {
    '@grow-admin-rock/components': { useMsg },
    '@grow-admin-rock/state': GrowState,
    '@grow-admin-rock/middleware-router': GrowRouter,
    '@grow-admin-rock/utils': GrowUtils,
    '@grow-admin-rock/hooks': GrowHooks,
  },
}))

const dependencies = ref<CodeDependency[]>(
  mergeDependencies(DEFAULT_SANDBOX_DEPENDENCIES, [
    {
      name: '@grow-admin-rock/components',
      source: 'host',
      kind: 'util',
      enabled: true,
    },
  ]),
)
</script>
