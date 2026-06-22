import { any, string } from 'vue-types'

export type IconifyProps = {
  icon: string
  color?: string
  size: string | number
  prefix: string
  infinite: boolean
  hoverPointer: boolean
  hoverColor: string
}

export const IconifyPropTypes = {
  icon: string().isRequired,
  color: string(),
  size: any<string | number>().def(16),
  infinite: any<boolean>().def(false),
  prefix: string().def(''),
  hoverPointer: any<boolean>().def(false),
  hoverColor: string().def('inherit'),
}
