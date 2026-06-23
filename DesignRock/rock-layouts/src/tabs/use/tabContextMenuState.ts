import { computed, inject, provide, ref, type InjectionKey, type Ref } from 'vue'

type TabContextMenuState = {
  openTabPath: Ref<string | null>
  setOpenTabPath: (path: string | null) => void
}

const TAB_CONTEXT_MENU_KEY: InjectionKey<TabContextMenuState> = Symbol('tabContextMenu')

export function provideTabContextMenu() {
  const openTabPath = ref<string | null>(null)

  function setOpenTabPath(path: string | null) {
    openTabPath.value = path
  }

  const state = { openTabPath, setOpenTabPath }
  provide(TAB_CONTEXT_MENU_KEY, state)
  return state
}

export function useTabContextMenu(tabFullPath: string) {
  const state = inject(TAB_CONTEXT_MENU_KEY)
  if (!state) {
    throw new Error('useTabContextMenu must be used within provideTabContextMenu')
  }

  const dropdownVisible = computed({
    get: () => state.openTabPath.value === tabFullPath,
    set: (visible: boolean) => {
      if (visible) {
        state.setOpenTabPath(tabFullPath)
        return
      }
      if (state.openTabPath.value === tabFullPath) {
        state.setOpenTabPath(null)
      }
    },
  })

  return { dropdownVisible }
}
