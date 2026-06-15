/**
 * 基于模块 URL 解析静态资源地址
 * @param name 资源文件名
 * @param baseUrl 调用方模块的 import.meta.url
 * @param assetsDir 相对 baseUrl 的资源目录，默认 ../assets/images/
 */
export function getImageUrl(
  name: string,
  baseUrl: string | URL,
  assetsDir = '../assets/images/',
): string {
  return new URL(`${assetsDir}${name}`, baseUrl).href
}
