export function confirmWarning(dialog: any, options: {
  title: string
  content: string
  confirmText: string
}): Promise<boolean> {
  const { title, content, confirmText } = options

  if (dialog && typeof dialog.warning === 'function' && dialog.warning.length <= 1) {
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

  if (dialog && typeof dialog.confirm === 'function') {
    const result = dialog.confirm(content, title, {
      type: 'warning',
      confirmButtonText: confirmText,
      cancelButtonText: '取消',
    })
    if (result && typeof result.then === 'function') {
      return result.then(() => true).catch(() => false)
    }
  }

  return Promise.resolve(window.confirm(content))
}
