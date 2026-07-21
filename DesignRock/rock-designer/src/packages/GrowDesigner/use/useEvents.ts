import { onMounted, onUnmounted, type Ref } from 'vue'
import { findByUUID } from '@grow-admin-rock/utils'
import {
  createClearCanvasHandler,
  createCopyHandler,
  createDeleteHandler,
} from './canvasMutations'
import {
  createDraggableViewAddHandler,
  createSpecialAddHandler,
} from './dropHandlers'

interface UseEventsProps {
  draggableConfig: any
  activeUUID: Ref<string>
  overlayEditUUID?: Ref<string>
}

/** 焦点在可编辑控件内时不响应删除快捷键 */
const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

export const useEvents = ({
  draggableConfig,
  activeUUID,
  overlayEditUUID,
}: UseEventsProps) => {
  const onActivated = (uuid: string) => {
    activeUUID.value = uuid
  }

  const onGenerateKey = (list, index) => {
    console.log(list, index)
  }

  const onActiveNode = ({ uuid }) => {
    activeUUID.value = uuid
  }

  const onDeleteItem = createDeleteHandler(draggableConfig, activeUUID, overlayEditUUID)

  const onDeleteKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return
    if (!activeUUID.value) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isEditableTarget(event.target)) return

    const node = findByUUID(draggableConfig.structures, activeUUID.value)
    if (!node) return

    event.preventDefault()
    onDeleteItem(node)
  }

  onMounted(() => {
    window.addEventListener('keydown', onDeleteKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onDeleteKeydown)
  })

  return {
    onActivated,
    onGenerateKey,
    onActiveNode,
    onDraggableViewAdd: createDraggableViewAddHandler(draggableConfig),
    onSpecialAdd: createSpecialAddHandler(draggableConfig),
    onDeleteItem,
    onCopyItem: createCopyHandler(draggableConfig),
    onClearCanvas: createClearCanvasHandler(draggableConfig, activeUUID, overlayEditUUID),
  }
}
