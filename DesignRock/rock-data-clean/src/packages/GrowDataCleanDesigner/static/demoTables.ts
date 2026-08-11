/**
 * 数据清洗专用 Mock 表数据（含空值、空格、重复等脏数据，便于验证清洗算子）。
 * 纯 TS，可供设计器本地引擎与 sample/mock 共用。
 */

export type CleanDemoTable = {
  id: string
  schemaId: string
  schemaName: string
  tableName: string
  label: string
  columns: Array<{ key: string; title: string; dataType?: string }>
  rows: Record<string, unknown>[]
}

export const DEMO_CLEAN_TABLES: CleanDemoTable[] = [
  {
    id: 'schema_demo_sales::orders',
    schemaId: 'schema_demo_sales',
    schemaName: 'demo_sales',
    tableName: 'orders',
    label: 'demo_sales · orders',
    columns: [
      { key: 'id', title: 'id', dataType: 'INT' },
      { key: 'customer_id', title: 'customer_id', dataType: 'INT' },
      { key: 'region', title: 'region', dataType: 'STRING' },
      { key: 'amount', title: 'amount', dataType: 'DECIMAL' },
      { key: 'status', title: 'status', dataType: 'STRING' },
      { key: 'remark', title: 'remark', dataType: 'STRING' },
    ],
    rows: [
      { id: 1, customer_id: 101, region: ' 华东 ', amount: 120.5, status: 'paid', remark: ' 正常 ' },
      { id: 2, customer_id: 102, region: '华北', amount: null, status: 'paid', remark: '' },
      { id: 3, customer_id: 101, region: '华东', amount: 88, status: ' refund ', remark: null },
      { id: 4, customer_id: 103, region: '华南', amount: 200, status: 'paid', remark: 'vip' },
      { id: 5, customer_id: 102, region: '华北', amount: null, status: 'paid', remark: '' },
      { id: 6, customer_id: 104, region: '  西南', amount: 56.3, status: 'pending', remark: ' 待审' },
      { id: 7, customer_id: 101, region: '华东', amount: 120.5, status: 'paid', remark: '正常' },
      { id: 8, customer_id: null, region: '西北', amount: 15, status: 'paid', remark: '缺客户' },
      { id: 9, customer_id: 105, region: '华东', amount: 0, status: 'cancelled', remark: '  ' },
      { id: 10, customer_id: 103, region: '华南', amount: 200, status: 'paid', remark: 'vip' },
      { id: 11, customer_id: 106, region: '华北', amount: 99.9, status: 'PAID', remark: '大小写' },
      { id: 12, customer_id: 107, region: null, amount: 40, status: 'paid', remark: '无区域' },
    ],
  },
  {
    id: 'schema_demo_sales::customers',
    schemaId: 'schema_demo_sales',
    schemaName: 'demo_sales',
    tableName: 'customers',
    label: 'demo_sales · customers',
    columns: [
      { key: 'id', title: 'id', dataType: 'INT' },
      { key: 'name', title: 'name', dataType: 'STRING' },
      { key: 'level', title: 'level', dataType: 'STRING' },
      { key: 'phone', title: 'phone', dataType: 'STRING' },
    ],
    rows: [
      { id: 101, name: ' 张三 ', level: 'gold', phone: '13800000001' },
      { id: 102, name: '李四', level: null, phone: ' 13800000002 ' },
      { id: 103, name: '王五', level: 'silver', phone: null },
      { id: 104, name: ' 赵六', level: 'bronze', phone: '13800000004' },
      { id: 105, name: '钱七', level: 'gold', phone: '' },
      { id: 106, name: '孙八', level: 'SILVER', phone: '13800000006' },
      { id: 107, name: '周九', level: 'gold', phone: '13800000007' },
      { id: 108, name: ' 张三 ', level: 'gold', phone: '13800000001' },
    ],
  },
  {
    id: 'schema_demo_region::regions',
    schemaId: 'schema_demo_region',
    schemaName: 'demo_region',
    tableName: 'regions',
    label: 'demo_region · regions',
    columns: [
      { key: 'code', title: 'code', dataType: 'STRING' },
      { key: 'name', title: 'name', dataType: 'STRING' },
      { key: 'manager', title: 'manager', dataType: 'STRING' },
    ],
    rows: [
      { code: 'east', name: '华东', manager: 'A' },
      { code: 'north', name: '华北', manager: 'B' },
      { code: 'south', name: '华南', manager: null },
      { code: 'west', name: ' 西南 ', manager: 'C' },
      { code: 'nw', name: '西北', manager: 'D' },
    ],
  },
]

/** Dataset 原始表 / 输出（与 DEMO_SOURCE_OPTIONS 对齐，便于非 schema-table 源预览） */
export const DEMO_CLEAN_DATASET_TABLES: CleanDemoTable[] = [
  {
    id: 'ds_sales::orders',
    schemaId: 'ds_sales',
    schemaName: '销售数据集',
    tableName: 'orders',
    label: '销售数据集 · orders（原始表）',
    columns: DEMO_CLEAN_TABLES[0].columns,
    rows: DEMO_CLEAN_TABLES[0].rows.map((row) => ({ ...row, _source: 'dataset-table' })),
  },
  {
    id: 'ds_sales::customers',
    schemaId: 'ds_sales',
    schemaName: '销售数据集',
    tableName: 'customers',
    label: '销售数据集 · customers（原始表）',
    columns: DEMO_CLEAN_TABLES[1].columns,
    rows: DEMO_CLEAN_TABLES[1].rows.map((row) => ({ ...row, _source: 'dataset-table' })),
  },
  {
    id: 'ds_sales::output',
    schemaId: 'ds_sales',
    schemaName: '销售数据集',
    tableName: 'dataset_output',
    label: '销售数据集 · 查询输出',
    columns: [
      { key: 'region', title: 'region', dataType: 'STRING' },
      { key: 'amount', title: 'amount', dataType: 'DECIMAL' },
      { key: 'order_count', title: 'order_count', dataType: 'INT' },
    ],
    rows: [
      { region: '华东', amount: 329, order_count: 3 },
      { region: '华北', amount: 99.9, order_count: 2 },
      { region: '华南', amount: 400, order_count: 2 },
      { region: null, amount: 40, order_count: 1 },
    ],
  },
]

/** API 源 Mock：按 url（去 query）匹配；未匹配时用默认样例 */
export const DEMO_API_FRAMES: Record<
  string,
  { columns: Array<{ key: string; title: string; dataType?: string }>; rows: Record<string, unknown>[] }
> = {
  default: {
    columns: [
      { key: 'id', title: 'id', dataType: 'INT' },
      { key: 'name', title: 'name', dataType: 'STRING' },
      { key: 'score', title: 'score', dataType: 'DECIMAL' },
      { key: 'tag', title: 'tag', dataType: 'STRING' },
    ],
    rows: [
      { id: 1, name: ' alpha ', score: 95, tag: 'A' },
      { id: 2, name: 'beta', score: null, tag: ' b ' },
      { id: 3, name: 'gamma', score: 80, tag: 'A' },
      { id: 4, name: ' alpha ', score: 95, tag: 'A' },
      { id: 5, name: '', score: 12, tag: null },
    ],
  },
  '/demo/orders': {
    columns: DEMO_CLEAN_TABLES[0].columns,
    rows: DEMO_CLEAN_TABLES[0].rows.slice(0, 6),
  },
}

/** schema-table 源选项（与 DEMO_SOURCE_OPTIONS['schema-table'] 对齐） */
export const DEMO_CLEAN_SCHEMA_TABLE_OPTIONS = DEMO_CLEAN_TABLES.map((item) => ({
  id: item.id,
  label: item.label,
  tableName: item.tableName,
}))

export const ALL_DEMO_CLEAN_TABLES: CleanDemoTable[] = [
  ...DEMO_CLEAN_TABLES,
  ...DEMO_CLEAN_DATASET_TABLES,
]

export type CleanTableRowsMap = Record<string, Record<string, unknown>[]>

export function buildCleanTableRowsMap(
  tables: CleanDemoTable[] = ALL_DEMO_CLEAN_TABLES,
): CleanTableRowsMap {
  const map: CleanTableRowsMap = {}
  for (const table of tables) {
    map[table.id] = table.rows.map((row) => ({ ...row }))
    map[table.tableName] = table.rows.map((row) => ({ ...row }))
    map[`${table.schemaId}::${table.tableName}`] = table.rows.map((row) => ({ ...row }))
  }
  return map
}

export function findDemoTable(refIdOrName?: string): CleanDemoTable | undefined {
  if (!refIdOrName) return undefined
  return ALL_DEMO_CLEAN_TABLES.find(
    (item) =>
      item.id === refIdOrName ||
      item.tableName === refIdOrName ||
      `${item.schemaId}::${item.tableName}` === refIdOrName,
  )
}

export function resolveDemoApiFrame(url?: string) {
  const raw = String(url || '').trim()
  if (!raw) return DEMO_API_FRAMES.default
  try {
    const path = raw.includes('://') ? new URL(raw).pathname : raw.split('?')[0]
    return DEMO_API_FRAMES[path] || DEMO_API_FRAMES.default
  } catch {
    return DEMO_API_FRAMES[raw] || DEMO_API_FRAMES.default
  }
}
