import type { ProcessFlow, ProcessFlowNode, ProcessNodeType } from '../types'
import { NODE_TYPE_META } from '../static/nodeCatalog'
import { isBranchHandleId } from './branches'

/** 开始类节点（无入口） */
export function isStartNodeType(type: ProcessNodeType) {
  return NODE_TYPE_META[type].inputs <= 0
}

/** 结束类节点（无出口） */
export function isEndNodeType(type: ProcessNodeType) {
  return NODE_TYPE_META[type].outputs <= 0
}

export function findNode(
  flow: ProcessFlow,
  id: string,
): ProcessFlowNode | undefined {
  return flow.nodes.find((item) => item.id === id)
}

/**
 * 校验连线是否合法：
 * - 禁止自连
 * - 开始节点不可作为目标；结束节点不可作为源
 * - 端口方向必须 out → in
 * - 允许成环（状态回退 / 驳回重做）
 */
export function canConnectNodes(
  flow: ProcessFlow,
  sourceId: string,
  targetId: string,
  options?: {
    sourceHandle?: string | null
    targetHandle?: string | null
    ignoreEdgeId?: string
  },
): boolean {
  if (!sourceId || !targetId || sourceId === targetId) return false

  const sourceNode = findNode(flow, sourceId)
  const targetNode = findNode(flow, targetId)
  if (!sourceNode || !targetNode) return false

  const sourceMeta = NODE_TYPE_META[sourceNode.type]
  const targetMeta = NODE_TYPE_META[targetNode.type]
  if (sourceMeta.outputs <= 0) return false
  if (targetMeta.inputs <= 0) return false

  const sourceHandle = options?.sourceHandle
  const targetHandle = options?.targetHandle
  if (sourceHandle && !String(sourceHandle).startsWith('out')) return false
  if (targetHandle && !String(targetHandle).startsWith('in')) return false

  const normalizedSourceHandle = resolveSourceHandle(sourceHandle)
  const duplicate = flow.edges.some(
    (item) =>
      item.id !== options?.ignoreEdgeId &&
      item.source === sourceId &&
      item.target === targetId &&
      resolveSourceHandle(item.sourceHandle) === normalizedSourceHandle,
  )
  if (duplicate) return false

  return true
}

/** 竖向：默认下出口；兼容旧横向 / 多分支 out-b-* */
export function resolveSourceHandle(handleId?: string | null) {
  if (isBranchHandleId(handleId)) return String(handleId)
  if (
    handleId === 'out-true' ||
    handleId === 'out-false' ||
    handleId === 'out-p1' ||
    handleId === 'out-p2'
  ) {
    return handleId
  }
  if (
    handleId === 'out-bottom' ||
    handleId === 'out-right' ||
    handleId === 'out-right-top' ||
    handleId === 'out-right-bottom'
  ) {
    return 'out-bottom'
  }
  return 'out-bottom'
}

/** 竖向：默认上入口；兼容旧横向 in-left */
export function resolveTargetHandle(handleId?: string | null) {
  if (
    handleId === 'in-top' ||
    handleId === 'in-left' ||
    handleId === 'in-left-top' ||
    handleId === 'in-left-bottom'
  ) {
    return 'in-top'
  }
  return 'in-top'
}
