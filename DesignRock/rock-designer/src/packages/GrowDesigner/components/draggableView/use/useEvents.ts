import type { Fn } from '../../../types'

interface props {
  emits: Fn;
}

export const useEvents = ({ emits }: props) => {
  const onDraggableAdd = (event) => {
    emits("add", event);
  };

  const onSpecialAdd = (event) => {
    emits("special", event);
  };

  const onActive = (event) => {
    emits("active", event);
  };

  const onDeleteItem = (event) => {
    emits("delete", event);
  };

  const onCopyItem = (event) => {
    emits("copy", event);
  };

  return {
    onDraggableAdd,
    onSpecialAdd,
    onActive,
    onDeleteItem,
    onCopyItem
  };
};
