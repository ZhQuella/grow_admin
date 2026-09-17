import * as pack from './package.json'
import { install } from '@grow-admin-rock/base-package'

export const Lib: ModuleLibContext<'types', any> = {
  install,
  name: pack.name,
  version: pack.version,
  routes: [],
}
