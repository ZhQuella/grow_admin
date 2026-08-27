import { onMounted, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemDeptTree } from '../../../api/systemRole'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import { usePersonActions } from './usePersonActions'
import { usePersonTable } from './usePersonTable'
import { formatDate, formatTime, maskMobile, toMessage } from './helpers'

export function usePersonManage() {
  const message = useMsg()
  const table = usePersonTable()
  const actions = usePersonActions()
  const deptTree = ref<SystemDeptTreeNode[]>([])
  const deptKeyword = ref('')

  async function loadDepts() {
    try {
      const data = await fetchSystemDeptTree()
      deptTree.value = Array.isArray(data) ? data : []
    } catch (error) {
      message.error(toMessage(error, '部门加载失败'))
    }
  }

  onMounted(() => {
    void loadDepts()
    void table.loadList()
  })

  return {
    ...table,
    ...actions,
    deptTree,
    deptKeyword,
    formatDate,
    formatTime,
    maskMobile,
  }
}
