import { reactive } from 'vue'

/** 事件 / watcher / 函数 prop 可访问的 refs 表 */
export type DesignerRuntimeRefs = Record<string, unknown>

type RefSlot = {
  ownerUuid: string
  instances: unknown[]
}

export type RuntimeRefsRegistry = {
  refs: DesignerRuntimeRefs
  register: (refName: string, uuid: string, instance: unknown) => void
  unregister: (refName: string, uuid: string, instance: unknown) => void
  clear: () => void
}

const syncPublicRef = (
  refs: DesignerRuntimeRefs,
  meta: Map<string, RefSlot>,
  refName: string,
) => {
  const slot = meta.get(refName)
  if (!slot || !slot.instances.length) {
    Reflect.deleteProperty(refs, refName)
    meta.delete(refName)
    return
  }
  // 单实例直接挂实例；同 uuid 循环多实例为数组
  refs[refName] =
    slot.instances.length === 1 ? slot.instances[0] : [...slot.instances]
}

/** 创建运行时 refs 收集器（仅配置了 refName 的节点才会 register） */
export const createRuntimeRefsRegistry = (): RuntimeRefsRegistry => {
  const refs = reactive<DesignerRuntimeRefs>({})
  const meta = new Map<string, RefSlot>()

  const register = (refName: string, uuid: string, instance: unknown) => {
    const name = String(refName || '').trim()
    const id = String(uuid || '').trim()
    if (!name || !id || instance == null) return

    const existing = meta.get(name)
    if (!existing) {
      meta.set(name, { ownerUuid: id, instances: [instance] })
      syncPublicRef(refs, meta, name)
      return
    }

    // 不同组件配置了相同 refName：后者覆盖前者
    if (existing.ownerUuid !== id) {
      meta.set(name, { ownerUuid: id, instances: [instance] })
      syncPublicRef(refs, meta, name)
      return
    }

    if (!existing.instances.includes(instance)) {
      existing.instances.push(instance)
    }
    syncPublicRef(refs, meta, name)
  }

  const unregister = (refName: string, uuid: string, instance: unknown) => {
    const name = String(refName || '').trim()
    const id = String(uuid || '').trim()
    if (!name || !id) return
    const existing = meta.get(name)
    if (!existing || existing.ownerUuid !== id) return
    const index = existing.instances.indexOf(instance)
    if (index >= 0) existing.instances.splice(index, 1)
    syncPublicRef(refs, meta, name)
  }

  const clear = () => {
    for (const name of [...meta.keys()]) {
      Reflect.deleteProperty(refs, name)
    }
    meta.clear()
  }

  return { refs, register, unregister, clear }
}
