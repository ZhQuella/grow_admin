export interface DesignerDataSourceItem {
  id: string
  name: string
  description: string
  data: string
}

export type DesignerDataSourceFormModel = Omit<DesignerDataSourceItem, 'id'>
