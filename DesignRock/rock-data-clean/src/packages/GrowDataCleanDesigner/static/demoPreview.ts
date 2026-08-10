import type { CleanFlowNode, CleanPreviewResult, CleanSplitFieldConfig } from '../types'

/** M1：选中节点时展示的采样预览（占位，后续接本地引擎） */
export function buildDemoPreview(
  nodeName: string,
  node?: CleanFlowNode | null,
): CleanPreviewResult {
  if (node?.type === 'split-field') {
    const cfg = (node.config || {}) as CleanSplitFieldConfig
    const sourceField = cfg.field?.trim() || 'source_field'
    const outputs = cfg.outputs?.length
      ? cfg.outputs
      : [{ name: 'field_1' }, { name: 'field_2' }]
    const columns = [
      ...(cfg.keepOriginal === false
        ? []
        : [{ key: sourceField, title: sourceField, dataType: 'STRING' }]),
      ...outputs.map((item) => ({
        key: item.name || 'field',
        title: item.name || 'field',
        dataType: 'STRING',
      })),
    ]
    const sampleRaw =
      cfg.mode === 'regex'
        ? '2026-08-10'
        : cfg.mode === 'fixed-width'
          ? 'CN110000Beijing'
          : '张三,北京,10001'
    const parts =
      cfg.mode === 'regex'
        ? ['2026', '08', '10']
        : cfg.mode === 'fixed-width'
          ? ['CN', '110000', 'Beijing']
          : sampleRaw.split(cfg.delimiter || ',')

    const row: Record<string, unknown> = {}
    if (cfg.keepOriginal !== false) row[sourceField] = sampleRaw
    outputs.forEach((item, index) => {
      row[item.name || `field_${index + 1}`] =
        parts[index] ?? (cfg.padEmpty === false ? undefined : '')
    })

    return {
      columns,
      rows: [row, { ...row }],
    }
  }

  return {
    columns: [
      { key: 'id', title: 'id', dataType: 'INT' },
      { key: 'name', title: 'name', dataType: 'STRING' },
      { key: 'amount', title: 'amount', dataType: 'DECIMAL' },
      { key: 'created_at', title: 'created_at', dataType: 'DATE' },
    ],
    rows: [
      { id: 1, name: `${nodeName}-样例A`, amount: 120.5, created_at: '2026-08-01' },
      { id: 2, name: `${nodeName}-样例B`, amount: 88, created_at: '2026-08-02' },
      { id: 3, name: `${nodeName}-样例C`, amount: null, created_at: '2026-08-03' },
    ],
  }
}
