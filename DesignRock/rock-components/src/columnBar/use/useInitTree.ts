import type { Ref } from 'vue'
import { computed, nextTick, reactive, ref, unref, watch } from 'vue'
import { cloneDeep } from '@grow-admin-rock/utils'
import { DriverRefKey, driverRef } from '#/utils/refSupport'
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
  getHalfCheckedKeys: () => Array<string | number>
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

  /** 兼容 driverRef / 直接暴露 / 生产态 expose 解包差异 */
  const getTree = (): TreeInstance | undefined => {
    const driven = driverRef(treeRef)
    if (isTreeInstance(driven)) return driven

    const raw = unref(treeRef) as Record<string, unknown> | undefined
    if (!raw) return undefined
    if (isTreeInstance(raw)) return raw

    const exposed = unref(raw[DriverRefKey] as Ref<unknown> | unknown)
    if (isTreeInstance(exposed)) return exposed

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
    const tree = getTree()
    const keys = tree?.getCheckedKeys() ?? []
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

  // 弹层打开后 Tree 才挂载：补一次勾选同步（打包后 Popover 懒挂载更明显）
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
