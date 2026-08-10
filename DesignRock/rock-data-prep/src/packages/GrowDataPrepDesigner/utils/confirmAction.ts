import { useDialog } from '@grow-admin-rock/components'

export function confirmAction(options: {
  title: string
  content: string
  confirmText?: string
}): Promise<boolean> {
  const dialog = useDialog() as any
  const { title, content, confirmText = '确定' } = options

  if (dialog && typeof dialog.warning === 'function') {
    return new Promise((resolve) => {
      dialog.warning({
        title,
        content,
        positiveText: confirmText,
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  }

  if (dialog && typeof dialog.confirm === 'function' && dialog.confirm.length >= 1) {
    return dialog
      .confirm(content, title, {
        type: 'warning',
        confirmButtonText: confirmText,
        cancelButtonText: '取消',
      })
      .then(() => true)
      .catch(() => false)
  }

  if (dialog && typeof dialog.confirm === 'function') {
    return new Promise((resolve) => {
      dialog.confirm({
        title,
        content,
        okText: confirmText,
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  }

  return Promise.resolve(window.confirm(content))
}
