import type { Menu } from '@grow-admin-rock/types'

const REG_ESCAPE_CHARS = ['$', '(', ')', '*', '+', '.', '[', ']', '?', '\\', '^', '{', '}', '|']

export interface MenuSearchResult {
  title: string
  name: string
  path: string
  icon?: string
}

export function escapeRegExpChar(char: string) {
  return REG_ESCAPE_CHARS.includes(char) ? `\\${char}` : char
}

export function createSearchReg(keyword: string) {
  const pattern = [...keyword].map(escapeRegExpChar).join('.*')
  return new RegExp(pattern, 'i')
}

export function filterMenuTree(
  tree: Menu[],
  predicate: (item: Menu) => boolean,
): Menu[] {
  return tree
    .map((node) => ({ ...node }))
    .filter((node) => {
      const children = node.children ? filterMenuTree(node.children, predicate) : []
      node.children = children.length ? children : undefined
      return predicate(node) || Boolean(node.children?.length)
    })
}

export function collectMenuSearchResults(
  menus: Menu[],
  reg: RegExp,
  parent?: Menu,
): MenuSearchResult[] {
  const results: MenuSearchResult[] = []

  menus.forEach((item) => {
    const { name, title, path, icon, children, isVisible, meta } = item
    const isLeafRoute = !children?.length || meta?.hideChildrenInMenu

    if (
      isVisible
      && isLeafRoute
      && (reg.test(title) || reg.test(name))
    ) {
      results.push({
        name: parent?.name ? `${parent.name} > ${name}` : name,
        title: parent?.title ? `${parent.title} > ${title}` : title,
        path,
        icon,
      })
    }

    if (!meta?.hideChildrenInMenu && children?.length) {
      results.push(...collectMenuSearchResults(children, reg, item))
    }
  })

  return results
}
