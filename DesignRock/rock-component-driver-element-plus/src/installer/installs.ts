import type { App } from 'vue'
import type { Installer } from '@grow-admin-rock/component-driver'
import { RockComponent } from '@grow-admin-rock/components'
import { install } from '#/installer'

export const TooltipInstaller: Installer = (app?: App) => {
  return install(RockComponent.Tooltip, app)
}
export const SelectInstaller: Installer = (app?: App) => {
  return install(RockComponent.Select, app)
}
export const CheckboxGroupInstaller: Installer = (app?: App) => {
  return install(RockComponent.CheckboxGroup, app)
}
export const RadioGroupInstaller: Installer = (app?: App) => {
  return install(RockComponent.RadioGroup, app)
}
export const RadioButtonGroupInstaller: Installer = (app?: App) => {
  return install(RockComponent.RadioButtonGroup, app)
}
export const CascaderInstaller: Installer = (app?: App) => {
  return install(RockComponent.Cascader, app)
}
export const ButtonInstaller: Installer = (app?: App) => {
  return install(RockComponent.Button, app)
}
export const DrawerInstaller: Installer = (app?: App) => {
  return install(RockComponent.Drawer, app)
}
export const ConfigInstaller: Installer = (app?: App) => {
  return install(RockComponent.Config, app)
}
