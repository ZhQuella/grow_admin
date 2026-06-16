/** 基于模块 URL 解析静态图片资源的完整地址 */
export function getImageUrl(
  name: string,
  baseUrl: string | URL,
  assetsDir = '../assets/images/',
): string {
  return new URL(`${assetsDir}${name}`, baseUrl).href
}
