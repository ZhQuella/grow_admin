import { useDialog } from '@grow-admin-rock/components'

/** 切换报表类型前确认（兼容 Naive / Element / AntDV dialog） */
export function confirmClearChartConfig(options: {
  fromLabel: string
  toLabel: string
}): Promise<boolean> {
  const dialog = useDialog() as any
  const title = '切换报表类型'
  const content = `从「${options.fromLabel}」切换为「${options.toLabel}」将清空当前图表配置，是否继续？`

  // Naive UI: dialog.warning({...})
  if (dialog && typeof dialog.warning === 'function') {
    return new Promise((resolve) => {
      dialog.warning({
        title,
        content,
        positiveText: '清空并切换',
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  }

  // Element Plus: ElMessageBox.confirm
  if (dialog && typeof dialog.confirm === 'function' && dialog.confirm.length >= 1) {
    return dialog
      .confirm(content, title, {
        type: 'warning',
        confirmButtonText: '清空并切换',
        cancelButtonText: '取消',
      })
      .then(() => true)
      .catch(() => false)
  }

  // Ant Design Vue: Modal.confirm
  if (dialog && typeof dialog.confirm === 'function') {
    return new Promise((resolve) => {
      dialog.confirm({
        title,
        content,
        okText: '清空并切换',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  }

  return Promise.resolve(window.confirm(content))
}
