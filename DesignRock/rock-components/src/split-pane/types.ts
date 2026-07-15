export interface SplitPaneItem {
  horizontal?: boolean
  size?: number
  /** 最小尺寸百分比（splitpanes min-size） */
  minSize?: number
  /** 最大尺寸百分比（splitpanes max-size） */
  maxSize?: number
  slotKey?: string
  child?: SplitPaneItem[]
}
