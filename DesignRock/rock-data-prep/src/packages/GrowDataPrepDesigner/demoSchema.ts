import type { DataPrepDatabaseSchema, DataPrepSchemaBundle } from './types'

const REGION_COL = 'col_region'
const AMOUNT_COL = 'col_amount'
const QTY_COL = 'col_qty'
const CUSTOMER_ID_COL = 'col_customer_id'
const ORDER_ID_COL = 'col_order_id'
const CUST_ID_COL = 'col_cust_id'
const CUST_NAME_COL = 'col_cust_name'
const CUST_LEVEL_COL = 'col_cust_level'

function col(
  patch: Partial<DataPrepDatabaseSchema['tables'][number]['columns'][number]> &
    Pick<DataPrepDatabaseSchema['tables'][number]['columns'][number], 'id' | 'name' | 'type'>,
): DataPrepDatabaseSchema['tables'][number]['columns'][number] {
  return {
    length: patch.length ?? (patch.type === 'VARCHAR' ? 255 : patch.type === 'NUMERIC' ? 10 : null),
    scale: patch.scale ?? (patch.type === 'NUMERIC' ? 2 : null),
    primaryKey: patch.primaryKey ?? false,
    autoIncrement: patch.autoIncrement ?? false,
    unique: patch.unique ?? false,
    nullable: patch.nullable ?? true,
    indexed: patch.indexed ?? false,
    defaultValue: patch.defaultValue ?? null,
    comment: patch.comment ?? '',
    ...patch,
  }
}

/**
 * Mock Schema：结构与 GrowSchemaDesigner 的 DatabaseSchema 完全一致。
 * 纯数据构造，不依赖 schema-designer 运行时（供 mock esbuild 使用）。
 */
export function createDemoSalesSchemaBundle(): DataPrepSchemaBundle {
  const customers = {
    id: 'tbl_customers',
    name: 'customers',
    comment: '客户',
    position: { x: 80, y: 120 },
    columns: [
      col({
        id: CUST_ID_COL,
        name: 'id',
        type: 'BIGINT',
        length: null,
        primaryKey: true,
        autoIncrement: true,
        nullable: false,
        unique: false,
        comment: '主键',
      }),
      col({
        id: CUST_NAME_COL,
        name: 'name',
        type: 'VARCHAR',
        length: 64,
        comment: '客户名称',
      }),
      col({
        id: CUST_LEVEL_COL,
        name: 'level',
        type: 'VARCHAR',
        length: 32,
        comment: '客户等级',
      }),
    ],
  }

  const orders = {
    id: 'tbl_orders',
    name: 'orders',
    comment: '订单',
    position: { x: 420, y: 120 },
    columns: [
      col({
        id: ORDER_ID_COL,
        name: 'id',
        type: 'BIGINT',
        length: null,
        primaryKey: true,
        autoIncrement: true,
        nullable: false,
        unique: false,
        comment: '主键',
      }),
      col({
        id: CUSTOMER_ID_COL,
        name: 'customer_id',
        type: 'BIGINT',
        length: null,
        nullable: false,
        indexed: true,
        comment: '客户 ID',
      }),
      col({
        id: REGION_COL,
        name: 'region',
        type: 'VARCHAR',
        length: 32,
        comment: '销售区域',
      }),
      col({
        id: AMOUNT_COL,
        name: 'amount',
        type: 'NUMERIC',
        length: 12,
        scale: 2,
        comment: '订单金额',
      }),
      col({
        id: QTY_COL,
        name: 'quantity',
        type: 'INTEGER',
        length: null,
        comment: '数量',
      }),
    ],
  }

  const schema: DataPrepDatabaseSchema = {
    version: 1,
    dialect: 'postgresql',
    name: 'demo_sales',
    comment: '销售演示库（Mock，格式对齐 Schema 设计器）',
    tables: [customers, orders],
    relations: [
      {
        id: 'rel_cust_orders',
        type: 'one-to-many',
        sourceTableId: customers.id,
        sourceColumnId: CUST_ID_COL,
        targetTableId: orders.id,
        targetColumnId: CUSTOMER_ID_COL,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    ],
    queries: [],
  }

  const tableRows: Record<string, Record<string, unknown>[]> = {
    customers: [
      { id: 1, name: '华东商贸', level: 'A' },
      { id: 2, name: '华南科技', level: 'B' },
      { id: 3, name: '华北能源', level: 'A' },
      { id: 4, name: '西南零售', level: 'C' },
    ],
    orders: [
      { id: 1, customer_id: 1, region: '华东', amount: 1200, quantity: 3 },
      { id: 2, customer_id: 1, region: '华东', amount: 800, quantity: 2 },
      { id: 3, customer_id: 2, region: '华南', amount: 1500, quantity: 4 },
      { id: 4, customer_id: 2, region: '华南', amount: 600, quantity: 1 },
      { id: 5, customer_id: 3, region: '华北', amount: 2200, quantity: 5 },
      { id: 6, customer_id: 3, region: '华北', amount: 900, quantity: 2 },
      { id: 7, customer_id: 4, region: '西南', amount: 400, quantity: 1 },
      { id: 8, customer_id: 4, region: '西南', amount: 700, quantity: 2 },
      { id: 9, customer_id: 1, region: '华东', amount: 1100, quantity: 3 },
      { id: 10, customer_id: 2, region: '华南', amount: 1300, quantity: 3 },
    ],
  }

  return {
    id: 'schema_demo_sales',
    schema,
    tableRows,
  }
}

/**
 * 第二套建模：区域主数据（与销售库通过同名列 region 跨建模关联）
 */
export function createDemoRegionSchemaBundle(): DataPrepSchemaBundle {
  const REG_ID = 'col_reg_id'
  const REG_REGION = 'col_reg_region'
  const REG_MANAGER = 'col_reg_manager'
  const REG_TARGET = 'col_reg_target'

  const regions = {
    id: 'tbl_regions',
    name: 'regions',
    comment: '区域主数据',
    position: { x: 120, y: 100 },
    columns: [
      col({
        id: REG_ID,
        name: 'id',
        type: 'BIGINT',
        length: null,
        primaryKey: true,
        autoIncrement: true,
        nullable: false,
        unique: false,
        comment: '主键',
      }),
      col({
        id: REG_REGION,
        name: 'region',
        type: 'VARCHAR',
        length: 32,
        unique: true,
        nullable: false,
        comment: '区域名称（与销售订单 region 对齐）',
      }),
      col({
        id: REG_MANAGER,
        name: 'manager',
        type: 'VARCHAR',
        length: 64,
        comment: '区域经理',
      }),
      col({
        id: REG_TARGET,
        name: 'target_amount',
        type: 'NUMERIC',
        length: 12,
        scale: 2,
        comment: '区域目标金额',
      }),
    ],
  }

  const schema: DataPrepDatabaseSchema = {
    version: 1,
    dialect: 'postgresql',
    name: 'demo_region',
    comment: '区域主数据建模（Mock，用于跨建模演示）',
    tables: [regions],
    relations: [],
    queries: [],
  }

  return {
    id: 'schema_demo_region',
    schema,
    tableRows: {
      regions: [
        { id: 1, region: '华东', manager: '张三', target_amount: 5000 },
        { id: 2, region: '华南', manager: '李四', target_amount: 4000 },
        { id: 3, region: '华北', manager: '王五', target_amount: 4500 },
        { id: 4, region: '西南', manager: '赵六', target_amount: 2000 },
      ],
    },
  }
}

export const DEMO_SCHEMA_BUNDLES: DataPrepSchemaBundle[] = [
  createDemoSalesSchemaBundle(),
  createDemoRegionSchemaBundle(),
]

