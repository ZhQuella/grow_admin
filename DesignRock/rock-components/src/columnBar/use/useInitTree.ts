import type { Ref } from 'vue'
import { computed, nextTick, reactive, ref, unref, watch } from 'vue'
import { cloneDeep } from '@grow-admin-rock/utils'
import type { ColumnBarItem } from '../types'

interface InitProps {
  columns: Ref<ColumnBarItem[]>
  nodeKey: Ref<string>
  /** 弹层可见性：打开后再同步勾选（Tree 可能尚未挂载） */
  visible?: Ref<boolean>
}

type TreeInstance = {
  setCheckedKeys: (keys: Array<string | number>) => void
  getCheckedKeys: (leafOnly?: boolean) => Array<string | number>
  getHalfCheckedKeys?: () => Array<string | number>
}

function isTreeInstance(value: unknown): value is TreeInstance {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as TreeInstance).setCheckedKeys === 'function' &&
    typeof (value as TreeInstance).getCheckedKeys === 'function'
  )
}

export const useInitTree = ({ columns, nodeKey, visible }: InitProps) => {
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

  /** treeRef 直接指向驱动 Tree 实例（与原版 el-tree ref 一致） */
  const getTree = (): TreeInstance | undefined => {
    const raw = unref(treeRef)
    if (isTreeInstance(raw)) return raw
    if (raw && typeof raw === 'object') {
      for (const key of ['DriverRef', 'treeRef']) {
        const candidate = unref((raw as Record<string, unknown>)[key])
        if (isTreeInstance(candidate)) return candidate
      }
    }
    return undefined
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

  const applyColumns = async (newValue: ColumnBarItem[]) => {
    await nextTick()
    state.treeData = cloneDeep(newValue)
    setDisabled()
    await nextTick()
    setTreeNodeSelect()
    await catchCheckedKeys()
    catchInitVisible()
  }

  const syncCheckedWhenReady = async () => {
    await nextTick()
    if (!getTree()) return
    setTreeNodeSelect()
    await catchCheckedKeys()
  }

  watch(
    () => columns.value,
    (newValue) => {
      void applyColumns(newValue)
    },
    {
      immediate: true,
      deep: true,
    },
  )

  if (visible) {
    watch(visible, (open) => {
      if (open) void syncCheckedWhenReady()
    })
  }

  watch(treeRef, (el) => {
    if (el) void syncCheckedWhenReady()
  })

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
