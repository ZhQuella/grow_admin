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

    const leaves = allChild.value.filter((el) => !el.children?.length)
    if (checked) {
      const keys = leaves.map((el) => el[nodeKey.value] as string | number)
      tree.setCheckedKeys(keys)
      state.catchTreeCheckedKeys = keys
      return
    }

    const keys = leaves
      .filter((el) => el.disabled)
      .map((el) => el[nodeKey.value] as string | number)
    tree.setCheckedKeys(keys)
    state.catchTreeCheckedKeys = keys
  }

  const setVisible = (keys: Array<string | number>, children: ColumnBarItem[]) => {
    const key = nodeKey.value
    const keySet = new Set(keys.map((item) => String(item)))
    const columns = children.filter((el) => el[key] != null && el[key] !== '')
    for (const column of columns) {
      Reflect.set(column, 'visible', keySet.has(String(column[key])))
    }
    // 父节点：有可见子节点则可见，避免半选父 key 在恢复时把子节点再次全选
    for (const column of columns) {
      if (!column.children?.length) continue
      const childList = getAllChild(column.children || [])
      const anyVisible = childList.some((child) => child.visible !== false)
      Reflect.set(column, 'visible', anyVisible)
    }
    const leafChecked = columns
      .filter((el) => !el.children?.length && el.visible !== false)
      .map((el) => el[key] as string | number)
    state.catchTreeCheckedKeys = leafChecked
    emit('confirm', cloneTreeData(state.treeData))
    visible.value = false
  }

  const resolveCheckedKeys = (): Array<string | number> => {
    const tree = getTree()
    if (tree) {
      // 叶子勾选 + 半选父节点，用于回写各节点 visible
      const half =
        typeof tree.getHalfCheckedKeys === 'function' ? tree.getHalfCheckedKeys() : []
      const leaves =
        typeof tree.getCheckedKeys === 'function' ? tree.getCheckedKeys(true) : []
      const checked =
        leaves.length > 0 ? leaves : tree.getCheckedKeys(false)
      return [...half, ...checked]
    }
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

    // 先恢复树勾选，再回写并关弹层（否则先关层会看起来「没反应」）
    const tree = getTree()
    tree?.setCheckedKeys(keys)
    state.catchTreeCheckedKeys = keys
    setVisible(keys, children)
  }

  return {
    onTreeChange,
    onAllSelectChange,
    onSetColumns,
    onResetColumns,
  }
}

function cloneTreeData(list: ColumnBarItem[]): ColumnBarItem[] {
  return list.map((item) => ({
    ...item,
    children: item.children?.length ? cloneTreeData(item.children) : item.children,
  }))
}
