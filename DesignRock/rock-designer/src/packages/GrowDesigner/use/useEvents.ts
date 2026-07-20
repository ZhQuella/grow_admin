import type { Ref } from 'vue'
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

  return {
    onActivated,
    onGenerateKey,
    onActiveNode,
    onDraggableViewAdd: createDraggableViewAddHandler(draggableConfig),
    onSpecialAdd: createSpecialAddHandler(draggableConfig),
    onDeleteItem: createDeleteHandler(draggableConfig, activeUUID, overlayEditUUID),
    onCopyItem: createCopyHandler(draggableConfig),
    onClearCanvas: createClearCanvasHandler(draggableConfig, activeUUID, overlayEditUUID),
  }
}
