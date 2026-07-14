<template>
  <div class="h-full overflow-auto px-5 py-[50px]">
    <div class="mb-4 text-[17px] text-text">
      高级搜索栏
    </div>
    <div class="mb-3 text-sm text-text-secondary">
      点击右侧搜索按钮添加/组合查询条件，支持重置与恢复系统默认。
    </div>

    <div class="mb-4 flex items-center justify-between rounded border border-solid border-border bg-component px-4 py-3">
      <div class="text-sm text-text">
        当前查询参数
      </div>
      <GrowSearchBar :search="searchList" @search="onTableSearch" />
    </div>

    <pre class="overflow-auto rounded border border-solid border-border bg-component p-4 text-sm text-text">{{ prettyResult }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'

defineOptions({
  name: 'SearchBarPage',
})

const accountStates = [
  { label: '启用', code: '1' },
  { label: '禁用', code: '0' },
  { label: '锁定', code: '2' },
]

const searchList: SearchBarField[] = [
  {
    labelText: '账号',
    placeholder: '请输入账号',
    elType: 'GrowInput',
    isDefault: true,
    model: 'account',
    noDelete: true,
  },
  {
    labelText: '创建日期',
    elType: 'GrowDatePicker',
    isDefault: true,
    startPlaceholder: '请选择开始日期',
    endPlaceholder: '请选择结束日期',
    type: 'daterange',
    model: 'createDate',
    valueFormat: 'YYYY-MM-DD',
  },
  {
    isDefault: true,
    collapseTags: true,
    elType: 'GrowSelect',
    labelText: '账号状态',
    multiple: true,
    model: 'cleanSignList',
    label: 'label',
    placeholder: '请选择账号状态',
    value: 'code',
    options: accountStates,
  },
  {
    labelText: '昵称',
    placeholder: '请输入昵称',
    elType: 'GrowInput',
    model: 'nickname',
  },
]

const searchResult = ref<Recordable<any>>({})

const prettyResult = computed(() => JSON.stringify(searchResult.value, null, 2))

function onTableSearch(data: Recordable<any>) {
  searchResult.value = data
}
</script>
