import type { Edge, Node } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'
import { RELATION_TYPE_LABEL } from './mysqlTypes'
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

type FlowEdgeData = {
  relationId: string
  segment: 'direct' | 'junction-source' | 'junction-target'
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
}): Edge<FlowEdgeData> {
  return {
    id: options.id,
    source: options.source,
    sourceHandle: options.sourceHandle,
    target: options.target,
    targetHandle: options.targetHandle,
    label: options.label,
    type: 'smoothstep',
    animated: options.active,
    style: edgeStyle(options.active),
    labelStyle: {
      fill: options.active ? 'var(--primary-color)' : 'var(--text-color-secondary)',
      fontSize: 11,
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: 'var(--component-background-color)',
    },
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
