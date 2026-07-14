import { nextTick, ref, unref, watch, type Ref } from 'vue'
import { PageOpenModeEnum } from '@grow-admin-rock/constants'
import { useRouteNavigate } from '@grow-admin-rock/hooks'
import { cloneDeep, onKeyStroke, useDebounceFn } from '@grow-admin-rock/utils'
import { useAuthMenuList } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'
import {
  collectMenuSearchResults,
  createSearchReg,
  filterMenuTree,
  type MenuSearchResult,
} from './menuSearchUtils'

interface UseMenuSearchOptions {
  visible: Ref<boolean>
  onClose: () => void
}

export function useMenuSearch({ visible, onClose }: UseMenuSearchOptions) {
  const authMenuList = useAuthMenuList()
  const { go } = useRouteNavigate()

  const keyword = ref('')
  const searchResult = ref<MenuSearchResult[]>([])
  const activeIndex = ref(-1)
  const itemRefs = ref<(HTMLElement | null)[]>([])
  const scrollWrapRef = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)

  let menuList: Menu[] = []

  function resolveScrollWrap() {
    const target = scrollWrapRef.value
    if (!target) {
      return null
    }

    const root = target instanceof HTMLElement ? target : target.$el
    if (!root) {
      return null
    }

    return (
      root.querySelector('.el-scrollbar__wrap')
      ?? root.querySelector('.n-scrollbar-container')
      ?? root.querySelector('.grow-scrollbar')
      ?? root.querySelector('.ant-scrollbar')
      ?? (
        root.classList.contains('el-scrollbar__wrap')
        || root.classList.contains('n-scrollbar-container')
        || root.classList.contains('grow-scrollbar')
          ? root
          : null
      )
    ) as HTMLElement | null
  }

  function loadMenus() {
    menuList = cloneDeep(authMenuList.value)
  }

  function runSearch(value: string) {
    const query = value.trim()
    if (!query) {
      searchResult.value = []
      activeIndex.value = -1
      return
    }

    const reg = createSearchReg(query)
    const filteredMenus = filterMenuTree(menuList, (item) => {
      if (!item.isVisible || item.openMode === PageOpenModeEnum.BROWSER) {
        return false
      }
      return reg.test(item.title) || reg.test(item.name)
    })
    searchResult.value = collectMenuSearchResults(filteredMenus, reg).filter((item) => item.path.startsWith('/'))
    activeIndex.value = searchResult.value.length > 0 ? 0 : -1
  }

  const debouncedRunSearch = useDebounceFn(runSearch, 200)

  function handleKeywordInput(value: string) {
    keyword.value = value
    debouncedRunSearch(value)
  }

  function setItemRef(element: Element | null, index: number) {
    if (element) {
      itemRefs.value[index] = element as HTMLElement
    }
  }

  function handleMouseenter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement | null
    const index = Number(target?.dataset.index)
    if (!Number.isNaN(index)) {
      activeIndex.value = index
    }
  }

  function scrollActiveItemIntoView() {
    const current = itemRefs.value[activeIndex.value]
    if (!current) {
      return
    }

    const wrap = resolveScrollWrap()
    if (!wrap) {
      current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      return
    }

    const wrapRect = wrap.getBoundingClientRect()
    const itemRect = current.getBoundingClientRect()

    if (itemRect.top < wrapRect.top) {
      wrap.scrollTop -= wrapRect.top - itemRect.top
    } else if (itemRect.bottom > wrapRect.bottom) {
      wrap.scrollTop += itemRect.bottom - wrapRect.bottom
    }
  }

  function handleUp() {
    if (!searchResult.value.length) {
      return
    }
    activeIndex.value -= 1
    if (activeIndex.value < 0) {
      activeIndex.value = searchResult.value.length - 1
    }
    scrollActiveItemIntoView()
  }

  function handleDown() {
    if (!searchResult.value.length) {
      return
    }
    activeIndex.value += 1
    if (activeIndex.value > searchResult.value.length - 1) {
      activeIndex.value = 0
    }
    scrollActiveItemIntoView()
  }

  async function handleEnter() {
    const result = unref(searchResult)
    const index = unref(activeIndex)
    if (!result.length || index < 0) {
      return
    }

    const target = result[index]
    handleClose()
    await nextTick()
    go(target.path)
  }

  function handleClose() {
    keyword.value = ''
    searchResult.value = []
    activeIndex.value = -1
    itemRefs.value = []
    onClose()
  }

  watch(visible, (isVisible) => {
    if (!isVisible) {
      return
    }
    loadMenus()
    keyword.value = ''
    searchResult.value = []
    activeIndex.value = -1
    itemRefs.value = []
  })

  onKeyStroke('Enter', () => {
    if (visible.value) {
      handleEnter()
    }
  })
  onKeyStroke('ArrowUp', () => {
    if (visible.value) {
      handleUp()
    }
  })
  onKeyStroke('ArrowDown', () => {
    if (visible.value) {
      handleDown()
    }
  })
  onKeyStroke('Escape', () => {
    if (visible.value) {
      handleClose()
    }
  })

  return {
    keyword,
    searchResult,
    activeIndex,
    scrollWrapRef,
    handleKeywordInput,
    handleMouseenter,
    handleEnter,
    handleClose,
    setItemRef,
  }
}
