import { createAntdPreset } from './antd'
import { createElePreset } from './ele'
import { createNaivePreset } from './naive'

export type PresetType = 'antd' | 'ele' | 'naive'

export function createPreset(framework: PresetType) {
  const presets = {
    antd: createAntdPreset,
    ele: createElePreset,
    naive: createNaivePreset,
  }
  return presets[framework] ?? createElePreset
}
