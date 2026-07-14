import type { AbstractEleConfig } from '../abstractEle/types'

export type SearchBarField = AbstractEleConfig & {
  labelText: string
  isDefault?: boolean
  noDelete?: boolean
}
