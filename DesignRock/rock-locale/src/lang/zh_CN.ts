import { genMessage } from '../helper'

const modules = import.meta.glob('./zh-CN/**/*.ts', { eager: true })

export default {
  message: genMessage(modules as any, 'zh-CN'),
}
