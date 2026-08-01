import type { Edge, Node } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'
import { RELATION_TYPE_LABEL } from './postgresTypes'
import type { DatabaseSchema, SchemaRelation, SchemaTable } from './types'

export type TableNodeData = {
  table: SchemaTable
  selected: boolean
}

export function tablesToNodes(
  tables: SchemaTable[],
  activeTableId?: string | null,
): Node<TableNodeData>[] {
  return tables.map((table) => ({
    id: table.id,
    type: 'schema-table',
    position: { ...table.position },
    data: {
      table,
      selected: table.id === activeTableId,
    },
    draggable: true,
    deletable: false,
    selectable: true,
  }))
}

export type FlowEdgeData = {
  relationId: string
  segment: 'direct' | 'junction-source' | 'junction-target'
  label: string
  active?: boolean
  onSelect?: (relationId: string) => void
  onRemove?: (relationId: string) => void
}

function edgeStyle(active: boolean) {
  return {
    stroke: active ? 'var(--primary-color)' : 'var(--text-color-secondary)',
    strokeWidth: active ? 2 : 1.5,
  }
}

export function relationsToEdges(
  schema: DatabaseSchema,
  activeRelationId?: string | null,
  actions?: {
    onSelect?: (relationId: string) => void
    onRemove?: (relationId: string) => void
  },
): Edge<FlowEdgeData>[] {
  const edges: Edge<FlowEdgeData>[] = []

  for (const rel of schema.relations) {
    const active = rel.id === activeRelationId
    const label = RELATION_TYPE_LABEL[rel.type]

    if (rel.type === 'many-to-many' && rel.junctionTableId) {
      edges.push(
        makeEdge({
          id: `${rel.id}__src`,
          source: rel.sourceTableId,
          sourceHandle: `out-${rel.sourceColumnId}`,
          target: rel.junctionTableId,
          targetHandle: `in-${rel.junctionSourceColumnId}`,
          label: '1:N',
          relationId: rel.id,
          segment: 'junction-source',
          active,
          actions,
        }),
        makeEdge({
          id: `${rel.id}__tgt`,
          source: rel.targetTableId,
          sourceHandle: `out-${rel.targetColumnId}`,
          target: rel.junctionTableId,
          targetHandle: `in-${rel.junctionTargetColumnId}`,
          label: '1:N',
          relationId: rel.id,
          segment: 'junction-target',
          active,
          actions,
        }),
      )
      continue
    }

    edges.push(
      makeEdge({
        id: rel.id,
        source: rel.sourceTableId,
        sourceHandle: `out-${rel.sourceColumnId}`,
        target: rel.targetTableId,
        targetHandle: `in-${rel.targetColumnId}`,
        label,
        relationId: rel.id,
        segment: 'direct',
        active,
        actions,
      }),
    )
  }

  return edges
}

function makeEdge(options: {
  id: string
  source: string
  sourceHandle?: string
  target: string
  targetHandle?: string
  label: string
  relationId: string
  segment: FlowEdgeData['segment']
  active: boolean
  actions?: {
    onSelect?: (relationId: string) => void
    onRemove?: (relationId: string) => void
  }
}): Edge<FlowEdgeData> {
  return {
    id: options.id,
    source: options.source,
    sourceHandle: options.sourceHandle,
    target: options.target,
    targetHandle: options.targetHandle,
    type: 'schema-relation',
    animated: options.active,
    style: edgeStyle(options.active),
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: options.active ? 'var(--primary-color)' : 'var(--text-color-secondary)',
    },
    selectable: true,
    deletable: true,
    focusable: true,
    selected: options.active,
    interactionWidth: 24,
    data: {
      relationId: options.relationId,
      segment: options.segment,
      label: options.label,
      active: options.active,
      onSelect: options.actions?.onSelect,
      onRemove: options.actions?.onRemove,
    },
  }
}

export function findRelationByEdgeId(
  relations: SchemaRelation[],
  edgeId: string,
): SchemaRelation | undefined {
  if (edgeId.endsWith('__src') || edgeId.endsWith('__tgt')) {
    const relationId = edgeId.replace(/__(src|tgt)$/, '')
    return relations.find((r) => r.id === relationId)
  }
  return relations.find((r) => r.id === edgeId)
}
