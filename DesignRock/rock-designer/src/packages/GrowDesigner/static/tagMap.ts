/** 将旧 Element Plus 标签映射到 Grow*；无对应实现时保留并标记 unsupported */
export const EL_TO_GROW_TAG: Record<string, { tag: string; unsupported?: boolean }> = {
  'el-card': { tag: 'GrowCard' },
  'el-scrollbar': { tag: 'GrowScrollbar' },
  'el-tabs': { tag: 'GrowTabs' },
  'el-tab-pane': { tag: 'GrowTabPane' },
  'el-row': { tag: 'GrowRow' },
  'el-col': { tag: 'GrowCol' },
  'el-collapse': { tag: 'GrowCollapse' },
  'el-collapse-item': { tag: 'GrowCollapseItem' },
  'el-container': { tag: 'GrowLayout' },
  'el-header': { tag: 'GrowLayoutHeader' },
  'el-aside': { tag: 'GrowLayoutSider' },
  'el-main': { tag: 'GrowLayoutContent' },
  'el-footer': { tag: 'GrowLayoutFooter' },
  'el-dialog': { tag: 'GrowModal' },
  'el-drawer': { tag: 'GrowDrawer' },
  'el-popover': { tag: 'GrowPopover' },
  'el-tooltip': { tag: 'GrowTooltip' },
  'el-dropdown': { tag: 'GrowDropdown' },
  'el-table': { tag: 'GrowTable' },
  'el-pagination': { tag: 'GrowPagination' },
  'el-select': { tag: 'GrowSelect' },
  'el-button': { tag: 'GrowButton' },
  'el-link': { tag: 'GrowLink' },
  'el-input': { tag: 'GrowInput' },
  'el-input-number': { tag: 'GrowInputNumber' },
  'el-cascader': { tag: 'GrowCascader' },
  'el-switch': { tag: 'GrowSwitch' },
  'el-time-picker': { tag: 'GrowTimePicker' },
  'el-date-picker': { tag: 'GrowDatePicker' },
  'el-radio': { tag: 'GrowRadio' },
  'el-checkbox': { tag: 'GrowCheckbox' },
  'el-tree-select': { tag: 'GrowTreeSelect' },
  'el-mention': { tag: 'GrowMention' },
  'el-upload': { tag: 'GrowUpload' },
  'el-slider': { tag: 'GrowSlider' },
  'el-transfer': { tag: 'GrowTransfer' },
  'el-form': { tag: 'GrowForm' },
  'el-form-item': { tag: 'GrowFormItem' },
  'el-radio-group': { tag: 'GrowRadioGroup' },
  'el-checkbox-group': { tag: 'GrowCheckboxGroup' },
  'el-avatar': { tag: 'GrowAvatar' },
  'el-badge': { tag: 'GrowBadge' },
  'el-tag': { tag: 'GrowTag' },
  'el-calendar': { tag: 'GrowCalendar' },
  'el-carousel': { tag: 'GrowCarousel' },
  'el-carousel-item': { tag: 'GrowCarouselItem' },
  'el-divider': { tag: 'GrowDivider' },
  'el-timeline': { tag: 'GrowTimeline' },
  'el-timeline-item': { tag: 'GrowTimelineItem' },
  'el-tree': { tag: 'GrowTree' },
  'el-tree-v2': { tag: 'GrowTreeV2', unsupported: true },
  'el-alert': { tag: 'GrowAlert', unsupported: true },
}

export function resolveGrowTag(elTagName: string): { tag: string; unsupported: boolean } {
  const mapped = EL_TO_GROW_TAG[elTagName]
  if (mapped) {
    return { tag: mapped.tag, unsupported: Boolean(mapped.unsupported) }
  }
  if (elTagName.startsWith('Grow') || ['img', 'p', 'span', 'div', 'BasicTitle'].includes(elTagName)) {
    const unsupportedPlaceholders = new Set([
      'GrowTreeV2',
      'GrowAlert',
    ])
    return { tag: elTagName, unsupported: unsupportedPlaceholders.has(elTagName) }
  }
  return { tag: elTagName, unsupported: true }
}
