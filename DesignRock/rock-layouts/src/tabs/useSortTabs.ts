import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import Sortable from 'sortablejs'
import { useTabStore } from '@grow-admin-rock/state'

const TABS_NAV_SELECTOR = '.grow-tabs-bar .el-tabs__nav'

export function useSortTabs(getTabCount: () => number) {
  const tabStore = useTabStore()
  let sortableInstance: Sortable | null = null

  function initSortable() {
    const wrap = document.querySelector(TABS_NAV_SELECTOR) as HTMLElement | null
    if (!wrap || getTabCount() < 2) {
      sortableInstance?.destroy()
      sortableInstance = null
      return
    }

    sortableInstance?.destroy()
    sortableInstance = Sortable.create(wrap, {
      animation: 200,
      draggable: '.el-tabs__item',
      filter: '.el-tabs__active-bar',
      onEnd(event) {
        const { oldIndex, newIndex } = event
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
          return
        }
        tabStore.sortTabs(oldIndex, newIndex)
      },
    })
  }

  onMounted(() => {
    nextTick(initSortable)
  })

  onUnmounted(() => {
    sortableInstance?.destroy()
    sortableInstance = null
  })

  watch(() => getTabCount(), () => {
    nextTick(initSortable)
  })
}
