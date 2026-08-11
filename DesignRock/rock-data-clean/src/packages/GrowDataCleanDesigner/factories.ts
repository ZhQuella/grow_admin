import { nanoid } from 'nanoid'
import type {
  CleanFlow,
  CleanFlowEdge,
  CleanFlowNode,
  CleanNodeConfigMap,
  CleanNodeType,
} from './types'
import { NODE_TYPE_META } from './static/nodeCatalog'

export function defaultConfigForType<T extends CleanNodeType>(type: T): CleanNodeConfigMap[T] {
  switch (type) {
    case 'table':
      return {
        sourceKind: 'schema-table',
      } as CleanNodeConfigMap[T]
    case 'api':
      return { method: 'GET', url: '' } as CleanNodeConfigMap[T]
    case 'null-handle':
      return { strategy: 'fill', fields: [], fillValue: '' } as CleanNodeConfigMap[T]
    case 'format':
      return { format: 'date' } as CleanNodeConfigMap[T]
    case 'dedupe':
      return { keep: 'first', fields: [] } as CleanNodeConfigMap[T]
    case 'trim-case':
      return { fields: [], ops: ['trim'] } as CleanNodeConfigMap[T]
    case 'outlier':
      return {
        rule: 'range',
        action: 'mark',
        min: '',
        max: '',
        pattern: '',
        enumValues: '',
      } as CleanNodeConfigMap[T]
    case 'filter':
      return {
        logic: 'and',
        conditions: [{ field: '', op: 'eq', value: '' }],
      } as CleanNodeConfigMap[T]
    case 'condition':
      return {
        logic: 'and',
        conditions: [{ field: '', op: 'eq', value: '' }],
      } as CleanNodeConfigMap[T]
    case 'split-field':
      return {
        field: '',
        mode: 'delimiter',
        delimiter: ',',
        pattern: '',
        outputs: [
          { name: 'field_1' },
          { name: 'field_2' },
        ],
        keepOriginal: true,
        padEmpty: true,
      } as CleanNodeConfigMap[T]
    case 'join':
      return {
        joinType: 'left',
        keys: [{ leftField: '', rightField: '' }],
      } as CleanNodeConfigMap[T]
    case 'union':
      return { dedupe: false, fieldMap: {} } as CleanNodeConfigMap[T]
    case 'groupby':
      return {
        groupFields: [],
        metrics: [{ field: '', fn: 'SUM', alias: 'metric_1' }],
      } as CleanNodeConfigMap[T]
    case 'pivot':
      return { agg: 'SUM' } as CleanNodeConfigMap[T]
    case 'output':
      return {
        outputName: '清洗输出',
        target: 'report',
        trigger: 'on-demand',
        consumers: [],
      } as CleanNodeConfigMap[T]
    default:
      return {} as CleanNodeConfigMap[T]
  }
}

export function createCleanFlowNode(
  type: CleanNodeType,
  patch: Partial<CleanFlowNode> & { position?: { x: number; y: number } } = {},
): CleanFlowNode {
  const meta = NODE_TYPE_META[type]
  return {
    id: patch.id ?? nanoid(10),
    type,
    name: patch.name ?? meta.label,
    position: patch.position ?? { x: 120, y: 80 },
    stats: patch.stats ?? { inputRows: null, outputRows: null },
    config: (patch.config as CleanFlowNode['config']) ?? defaultConfigForType(type),
  }
}

export function createCleanFlowEdge(
  patch: Partial<CleanFlowEdge> & Pick<CleanFlowEdge, 'source' | 'target'>,
): CleanFlowEdge {
  return {
    id: patch.id ?? nanoid(10),
    source: patch.source,
    target: patch.target,
    sourceHandle: patch.sourceHandle ?? 'out-right',
    targetHandle: patch.targetHandle ?? 'in-left',
  }
}

export function createCleanFlow(
  patch: Partial<CleanFlow> & Pick<CleanFlow, 'name'> = { name: '未命名清洗流' },
): CleanFlow {
  return {
    version: 1,
    id: patch.id ?? nanoid(10),
    name: patch.name,
    status: patch.status ?? 'draft',
    nodes: patch.nodes ? [...patch.nodes] : [],
    edges: patch.edges ? [...patch.edges] : [],
    updatedAt: patch.updatedAt,
  }
}

export function cloneCleanFlow(flow: CleanFlow): CleanFlow {
  return JSON.parse(JSON.stringify(flow)) as CleanFlow
}
