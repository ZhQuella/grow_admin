import type { PropBindMode } from '../../static/propBindModes'

/** 网页：新窗口；系统内部：当前系统 tab 打开 */
export type CarouselLinkType = 'web' | 'internal'

/** 覆盖 / 铺满 / 自适应 / 拉伸 / 平铺 / 原始 */
export type CarouselImageFit =
  | 'cover'
  | 'full'
  | 'contain'
  | 'fill'
  | 'tile'
  | 'none'

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
  { label: '覆盖', value: 'cover' },
  { label: '铺满', value: 'full' },
  { label: '自适应', value: 'contain' },
  { label: '拉伸', value: 'fill' },
  { label: '平铺', value: 'tile' },
  { label: '原始尺寸', value: 'none' },
]

export const normalizeCarouselImageFit = (
  value: unknown,
): CarouselImageFit => {
  if (
    value === 'full' ||
    value === 'contain' ||
    value === 'fill' ||
    value === 'tile' ||
    value === 'none'
  ) {
    return value
  }
  return 'cover'
}
