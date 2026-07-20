/**
 * 设计器结构树工具：按 uuid 查找 / 删除 / 更新节点。
 * 子节点集合：children（默认）+ footerSlot / optionSlot（GrowCard）+ contentSlot（GrowPopover）
 * + headerSlot / asideSlot（GrowLayout）
 */

const CHILD_KEYS = ['children', 'footerSlot', 'optionSlot', 'contentSlot', 'headerSlot', 'asideSlot'] as const

const pushChildLists = (node: any, sink: any[]) => {
  for (const key of CHILD_KEYS) {
    const list = node?.[key]
    if (Array.isArray(list) && list.length > 0) {
      sink.push(...list)
    }
  }
}

const forEachChildList = (node: any, fn: (list: any[], key: string) => void) => {
  for (const key of CHILD_KEYS) {
    const list = node?.[key]
    if (Array.isArray(list)) {
      fn(list, key)
    }
  }
}

const hasAnyChildList = (node: any) =>
  CHILD_KEYS.some((key) => Array.isArray(node?.[key]) && node[key].length > 0)

export const getAllChilds = (arr: any[], isOnlyChild = false) => {
  const result: any[] = []
  const stack = [...arr]
  while (stack.length > 0) {
    const node = stack.pop()
    if (!isOnlyChild) {
      result.push({
        uuid: node.uuid,
        children: node.children,
        footerSlot: node.footerSlot,
        optionSlot: node.optionSlot,
        contentSlot: node.contentSlot,
        headerSlot: node.headerSlot,
        asideSlot: node.asideSlot,
      })
    }
    if (hasAnyChildList(node)) {
      pushChildLists(node, stack)
    } else if (isOnlyChild) {
      result.push({
        uuid: node.uuid,
        children: node.children,
        footerSlot: node.footerSlot,
        optionSlot: node.optionSlot,
        contentSlot: node.contentSlot,
        headerSlot: node.headerSlot,
        asideSlot: node.asideSlot,
      })
    }
  }
  return result
}

export const deepCloneDesigner = (obj: any) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  const stack: any[] = []
  const result = Array.isArray(obj) ? [] : {}
  stack.push({ original: obj, copy: result })
  while (stack.length) {
    const { original, copy } = stack.pop()

    for (const key in original) {
      if (Object.prototype.hasOwnProperty.call(original, key)) {
        const value = original[key]

        if (value !== null && typeof value === 'object') {
          const newCopy = Array.isArray(value) ? [] : {}
          stack.push({ original: value, copy: newCopy })
          copy[key] = newCopy
        } else {
          copy[key] = value
        }
      }
    }
  }
  return result
}

export const deepCopyArray = (arr: any[]) => {
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array')
  }
  const result: any[] = []
  const queue = [{ src: arr, target: result }]
  while (queue.length > 0) {
    const { src, target } = queue.shift() as any
    for (let i = 0; i < src.length; i++) {
      if (Array.isArray(src[i])) {
        target[i] = []
        queue.push({ src: src[i], target: target[i] })
      } else if (typeof src[i] === 'object' && src[i] !== null) {
        target[i] = {}
        for (const key in src[i]) {
          if (Object.prototype.hasOwnProperty.call(src[i], key)) {
            if (Array.isArray(src[i][key])) {
              target[i][key] = []
              queue.push({ src: src[i][key], target: target[i][key] })
            } else if (typeof src[i][key] === 'object' && src[i][key] !== null) {
              target[i][key] = {}
              queue.push({ src: src[i][key], target: target[i][key] })
            } else {
              target[i][key] = src[i][key]
            }
          }
        }
      } else {
        target[i] = src[i]
      }
    }
  }
  return result
}

export const deleteByUUID = (data: any[], targetUUID: string) => {
  const newData = deepCloneDesigner(data)
  const queue = newData.map((node) => ({ parent: null as any, node }))
  while (queue.length > 0) {
    const { parent, node } = queue.shift() as any
    if (node.uuid === targetUUID) {
      if (parent) {
        let removed = false
        forEachChildList(parent, (list) => {
          if (removed) return
          const index = list.indexOf(node)
          if (index > -1) {
            list.splice(index, 1)
            removed = true
          }
        })
      } else {
        const index = newData.indexOf(node)
        if (index > -1) {
          newData.splice(index, 1)
        }
      }
      break
    }
    forEachChildList(node, (list) => {
      list.forEach((child: any) => queue.push({ parent: node, node: child }))
    })
  }
  return newData
}

export const findArrayByUUID = (data: any, targetUUID: string) => {
  const dataCopy = deepCloneDesigner(data)
  const queue = [{ parent: null as any, children: dataCopy, key: 'children' as string }]
  while (queue.length > 0) {
    const { parent, children, key } = queue.shift() as any
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.uuid === targetUUID) {
        if (!parent) return dataCopy
        return parent[key] || []
      }
      forEachChildList(child, (list, childKey) => {
        queue.push({ parent: child, children: list, key: childKey })
      })
    }
  }
  return []
}

export const findParentByUUID = (data: any[], targetUUID: string) => {
  const queue = [{ parent: null as any, node: data }]
  while (queue.length > 0) {
    const { parent, node } = queue.shift() as any
    for (let i = 0; i < node.length; i++) {
      const child = node[i]
      if (child.uuid === targetUUID) {
        return parent
      }
      forEachChildList(child, (list) => {
        queue.push({ parent: child, node: list })
      })
    }
  }
  return null
}

export const updateArrayUUIDs = (data: any[], callback: (uuid: string) => string) => {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array')
  }
  const dataCopy = deepCopyArray(data)
  const queue: any[] = [...dataCopy]
  while (queue.length > 0) {
    const node = queue.shift() as any
    const oldUUID = node.uuid
    node.uuid = callback(oldUUID)
    pushChildLists(node, queue)
  }
  return dataCopy
}

export const updateUUIDs = (data: any, callback: (uuid: string) => string) => {
  const newData = deepCloneDesigner(data)
  const stack = [newData]
  while (stack.length > 0) {
    const node = stack.pop()
    node.uuid = callback(node.uuid)
    pushChildLists(node, stack)
  }
  return newData
}

export const findByUUID = (data: any[], targetUUID: string) => {
  const stack = [...data]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node.uuid === targetUUID) {
      return node
    }
    pushChildLists(node, stack)
  }
  return null
}
