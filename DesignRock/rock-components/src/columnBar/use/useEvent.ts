import type { Ref } from 'vue'
import type { ColumnBarItem } from '../types'
import type { TreeInstance } from './useInitTree'

interface EventProps {
  catchCheckedKeys: () => void | Promise<void>
  allChild: Ref<ColumnBarItem[]>
  getTree: () => TreeInstance | undefined
  state: {
    catchTreeCheckedKeys: Array<string | number>
    catchVisible: Recordable<boolean>
    treeData: ColumnBarItem[]
  }
  getAllChild: (columns: ColumnBarItem[]) => ColumnBarItem[]
  emit: (event: 'confirm', columns: ColumnBarItem[]) => void
  visible: Ref<boolean>
  nodeKey: Ref<string>
}

export const useEvent = ({
  catchCheckedKeys,
  allChild,
  getTree,
  state,
  getAllChild,
  emit,
  visible,
  nodeKey,
}: EventProps) => {
  const onTreeChange = () => {
    void catchCheckedKeys()
  }

  const onAllSelectChange = (value: boolean | string | number) => {
    const checked = Boolean(value)
    const tree = getTree()
    if (!tree) return

    if (checked) {
      const keys = allChild.value.map((el) => el[nodeKey.value] as string | number)
      tree.setCheckedKeys(keys)
      state.catchTreeCheckedKeys = keys
      return
    }

    const keys = allChild.value
      .filter((el) => el.disabled)
      .map((el) => el[nodeKey.value] as string | number)
    tree.setCheckedKeys(keys)
    state.catchTreeCheckedKeys = keys
  }

  const setVisible = (keys: Array<string | number>, children: ColumnBarItem[]) => {
    const key = nodeKey.value
    const columns = children.filter((el) => el[key])
    for (const column of columns) {
      Reflect.set(column, 'visible', keys.includes(column[key] as string | number))
    }
    emit('confirm', [...state.treeData])
    visible.value = false
  }

  const resolveCheckedKeys = (): Array<string | number> => {
    const tree = getTree()
    if (tree) {
      const half =
        typeof tree.getHalfCheckedKeys === 'function' ? tree.getHalfCheckedKeys() : []
      const keys = tree.getCheckedKeys(false)
      return [...half, ...keys]
    }
    // Tree 尚未就绪时用缓存，避免 confirm 静默失败
    return [...state.catchTreeCheckedKeys]
  }

  const onSetColumns = () => {
    setVisible(resolveCheckedKeys(), getAllChild(state.treeData))
  }

  const onResetColumns = () => {
    const { treeData, catchVisible } = state
    const children = getAllChild(treeData)
    const keys = Object.entries(catchVisible)
      .filter(([, value]) => value)
      .map(([key]) => key)
    setVisible(keys, children)
    getTree()?.setCheckedKeys(keys)
    visible.value = false
  }

  return {
    onTreeChange,
    onAllSelectChange,
    onSetColumns,
    onResetColumns,
  }
}
