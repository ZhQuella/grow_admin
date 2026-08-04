import type { PropBindMode } from '../../static/propBindModes'

/** 网页：新窗口；系统内部：当前系统 tab 打开 */
export type CarouselLinkType = 'web' | 'internal'

/** 与 GrowImage object-fit 一致 */
export type CarouselImageFit =
  | 'fill'
  | 'contain'
  | 'cover'
  | 'none'
  | 'scale-down'

export type CarouselItemDraft = {
  id: string
  /** 幻灯片名字，可用作 setActiveItem 参数 */
  name: string
  /** 指示器文本，可为空 */
  label: string
  src: string
  href: string
  linkType: CarouselLinkType
  imageFit: CarouselImageFit
  bindModes: {
    src?: PropBindMode
    href?: PropBindMode
  }
}

export const CAROUSEL_IMAGE_FIT_OPTIONS: {
  label: string
  value: CarouselImageFit
}[] = [
  { label: '拉伸填充', value: 'fill' },
  { label: '等比包含', value: 'contain' },
  { label: '等比覆盖', value: 'cover' },
  { label: '保持原尺寸', value: 'none' },
  { label: '缩小适配', value: 'scale-down' },
]

export const normalizeCarouselImageFit = (
  value: unknown,
): CarouselImageFit => {
  if (value === 'full') return 'cover'
  if (value === 'tile') return 'none'
  if (
    value === 'fill' ||
    value === 'contain' ||
    value === 'cover' ||
    value === 'none' ||
    value === 'scale-down'
  ) {
    return value
  }
  return 'cover'
}
