import type { Ref } from 'vue'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { cloneDeep } from '@grow-admin-rock/utils'
import { driverRef } from '#/utils/refSupport'
import type { ColumnBarItem } from '../types'

interface InitProps {
  columns: Ref<ColumnBarItem[]>
  nodeKey: Ref<string>
}

type TreeInstance = {
  setCheckedKeys: (keys: Array<string | number>) => void
  getCheckedKeys: (leafOnly?: boolean) => Array<string | number>
  getHalfCheckedKeys: () => Array<string | number>
}

export const useInitTree = ({ columns, nodeKey }: InitProps) => {
  const treeRef = ref()
  const state = reactive<{
    catchTreeCheckedKeys: Array<string | number>
    catchVisible: Recordable<boolean>
    treeData: ColumnBarItem[]
  }>({
    catchTreeCheckedKeys: [],
    catchVisible: {},
    treeData: [],
  })

  const getTree = (): TreeInstance | undefined => {
    return driverRef(treeRef) as TreeInstance | undefined
  }

  const getAllChild = (list: ColumnBarItem[]) => {
    const arr = [...list]
    for (const item of arr) {
      if (item.children?.length) {
        arr.push(...item.children)
      }
    }
    return arr
  }

  const allChild = computed(() => getAllChild(state.treeData))

  const renderLabel = (data: ColumnBarItem) => data.title ?? ''

  const setTreeNodeSelect = () => {
    const key = nodeKey.value
    const visibleKeys = getAllChild(state.treeData)
      .filter((el) => el.visible !== false && el[key])
      .map((el) => el[key] as string | number)
    getTree()?.setCheckedKeys(visibleKeys)
  }

  const setDisabled = () => {
    const key = nodeKey.value
    for (const item of getAllChild(state.treeData)) {
      if (['operate', 'serial'].includes(String(item[key]))) {
        Reflect.set(item, 'disabled', true)
      }
    }
  }

  const catchCheckedKeys = async () => {
    await nextTick()
    const keys = getTree()?.getCheckedKeys() ?? []
    state.catchTreeCheckedKeys = keys.filter((el) => el !== undefined && el !== null && el !== '')
  }

  const catchInitVisible = () => {
    const key = nodeKey.value
    for (const item of allChild.value) {
      Reflect.set(state.catchVisible, String(item[key]), item.visible !== false)
    }
  }

  watch(
    () => columns.value,
    async (newValue) => {
      await nextTick()
      state.treeData = cloneDeep(newValue)
      setDisabled()
      await nextTick()
      setTreeNodeSelect()
      await catchCheckedKeys()
      catchInitVisible()
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const isAllChecked = computed(() => {
    return state.catchTreeCheckedKeys.length === allChild.value.length
  })

  return {
    catchCheckedKeys,
    renderLabel,
    treeRef,
    getTree,
    state,
    allChild,
    isAllChecked,
    getAllChild,
  }
}

export type { TreeInstance }
