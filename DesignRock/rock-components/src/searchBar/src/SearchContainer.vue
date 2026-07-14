<template>
  <div class="flex justify-end border-b border-solid border-border p-[10px]">
    <div class="h-[30px] shrink-0 grow-0">
      <GrowButton
        text
        type="primary"
        class="h-full w-full"
        size="small"
        :disabled="state.currentSelect.length === search.length"
        @click="onAddSearchList"
      >
        <GrowIconify icon="ant-design:plus-outlined" :size="14" />
        {{ t('SEARCH_BAR.ADD_SEARCH') }}
      </GrowButton>
    </div>
  </div>
  <GrowScrollbar height="350px" class="overflow-visible">
    <ul v-if="state.currentSelect.length" class="p-[10px]">
      <li
        v-for="(item, index) of state.currentSelect"
        :key="item.model || `empty-${index}`"
        class="flex items-center pb-[10px]"
      >
        <div class="w-[220px] shrink-0 grow-0 pr-[10px]">
          <GrowSelect
            class="w-full"
            :model-value="item.model || undefined"
            :disabled="!!item.model && state.notDeleteModels.includes(item.model)"
            filterable
            clearable
            :teleported="true"
            :placeholder="t('SEARCH_BAR.SEARCH_TYPE_PLACEHOLDER')"
            :options="getRowSelectOptions(item)"
            @update:model-value="onSelectListTypeChange($event, index)"
            @clear="onSearchListTypeClear(index)"
          />
        </div>

        <div class="search-bar__value w-[360px] shrink-0 grow-0 overflow-hidden pr-[10px]">
          <GrowAbstractEle
            v-if="item.elType"
            :search-data="state.searchData"
            :config="item"
          />
        </div>
        <div class="w-[30px] shrink-0 grow-0">
          <GrowButton
            type="danger"
            text
            class="block h-full w-full"
            :disabled="!!item.model && state.notDeleteModels.includes(item.model)"
            @click="onDeleteCurrent(index)"
          >
            <GrowIconify icon="ant-design:delete-outlined" :size="16" />
          </GrowButton>
        </div>
      </li>
    </ul>
    <div v-else class="h-full w-full">
      <GrowEmpty :image-size="200" :description="t('PUBLIC.NOT_DATA_TEXT')" />
    </div>
  </GrowScrollbar>
</template>

<script lang="ts" setup>
import { computed, reactive, toRefs, watch } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import type { SearchBarField } from '../types'

defineOptions({
  name: 'SearchContainer',
})

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    search?: SearchBarField[]
    defaultData?: Recordable<any>
  }>(),
  {
    search: () => [],
    defaultData: () => ({}),
  },
)

const { search, defaultData } = toRefs(props)

const state = reactive<{
  currentSelect: SearchBarField[]
  searchData: Recordable<any>
  notDeleteModels: string[]
}>({
  currentSelect: [],
  searchData: {},
  notDeleteModels: [],
})

watch(
  () => defaultData.value,
  (newValue) => {
    state.searchData = JSON.parse(JSON.stringify({ ...newValue, ...state.searchData }))
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => search.value,
  (newValue) => {
    state.notDeleteModels = []
    state.currentSelect = []
    newValue.forEach((el) => {
      if (el.isDefault && el.noDelete) {
        state.notDeleteModels.push(el.model)
      }
      if (el.isDefault) {
        state.currentSelect.push(el)
      }
    })
  },
  {
    immediate: true,
  },
)

const modelLists = computed(() => {
  return state.currentSelect.map((el) => el.model).filter(Boolean)
})

function toSelectOption(el: SearchBarField) {
  return {
    label: el.labelText,
    value: el.model,
  }
}

function getRowSelectOptions(item: SearchBarField) {
  return search.value
    .filter((el) => el.model === item.model || !modelLists.value.includes(el.model))
    .map(toSelectOption)
}

const onSelectListTypeChange = (value: string | number | null | undefined, index: number) => {
  const fullItem = search.value.find((el) => el.model === value)
  if (!fullItem) return
  onSearchListTypeClear(index, false)
  state.currentSelect.splice(index, 1, fullItem)
}

const onSearchListTypeClear = (index: number, isReset = true) => {
  const current = state.currentSelect[index]
  if (current?.model) {
    Reflect.set(state.searchData, current.model, null)
    if (isReset) {
      state.currentSelect.splice(index, 1, { model: '', labelText: '' } as SearchBarField)
    }
  }
}

const onDeleteCurrent = (index: number) => {
  const current = state.currentSelect[index]
  if (current?.model) {
    Reflect.set(state.searchData, current.model, null)
  }
  state.currentSelect.splice(index, 1)
}

const onAddSearchList = () => {
  state.currentSelect.push({ model: '', labelText: '' } as SearchBarField)
}

const getSearchData = () => state.searchData

const resetSearch = () => {
  state.searchData = { ...defaultData.value }
  return state.searchData
}

const resetDefault = () => {
  state.currentSelect = []
  state.notDeleteModels = []
  search.value.forEach((el) => {
    if (el.isDefault && el.noDelete) {
      state.notDeleteModels.push(el.model)
    }
    if (el.isDefault) {
      state.currentSelect.push(el)
    }
  })
  state.searchData = { ...defaultData.value }
  return state.searchData
}

defineExpose({
  getSearchData,
  resetSearch,
  resetDefault,
})
</script>

<style scoped>
.search-bar__value :deep(> *) {
  width: 100% !important;
  max-width: 100%;
}

.search-bar__value :deep(.el-input),
.search-bar__value :deep(.el-select),
.search-bar__value :deep(.el-date-editor),
.search-bar__value :deep(.n-input),
.search-bar__value :deep(.n-select),
.search-bar__value :deep(.n-date-picker),
.search-bar__value :deep(.ant-input),
.search-bar__value :deep(.ant-select),
.search-bar__value :deep(.ant-picker) {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
