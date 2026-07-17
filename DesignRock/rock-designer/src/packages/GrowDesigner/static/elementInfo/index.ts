import {
  basicTitleConfig,
  cardConfig,
  colConfig,
  collapseConfig,
  collapseItemConfig,
  divConfig,
  imageConfig,
  paragraphConfig,
  rowConfig,
  spanConfig,
  tabPaneConfig,
  tabsConfig,
} from './layoutConfigs'
import {
  avatarConfig,
  badgeConfig,
  dividerConfig,
  drawerConfig,
  modalConfig,
  popoverConfig,
  tableConfig,
  timelineConfig,
  timelineItemConfig,
  tooltipConfig,
  treeConfig,
} from './displayConfigs'
import {
  buttonConfig,
  cascaderConfig,
  checkboxConfig,
  checkboxGroupConfig,
  datePickerConfig,
  formConfig,
  formItemConfig,
  inputConfig,
  inputNumberConfig,
  linkConfig,
  radioConfig,
  radioGroupConfig,
  selectConfig,
  switchConfig,
  treeSelectConfig,
  uploadConfig,
} from './formControlConfigs'

/** 组件属性配置表：elTagName -> props 配置列表 */
export const elementPropsMap: Record<string, any[]> = {
  // 基础
  img: imageConfig.props,
  BasicTitle: basicTitleConfig.props,
  p: paragraphConfig.props,
  span: spanConfig.props,
  div: divConfig.props,

  // 布局容器
  GrowCard: cardConfig.props,
  GrowTabs: tabsConfig.props,
  GrowTabPane: tabPaneConfig.props,
  GrowRow: rowConfig.props,
  GrowCol: colConfig.props,
  GrowCollapse: collapseConfig.props,
  GrowCollapseItem: collapseItemConfig.props,

  // 反馈 / 浮层
  GrowModal: modalConfig.props,
  GrowDrawer: drawerConfig.props,
  GrowPopover: popoverConfig.props,
  GrowTooltip: tooltipConfig.props,

  // 表单
  GrowForm: formConfig.props,
  GrowFormItem: formItemConfig.props,
  GrowButton: buttonConfig.props,
  GrowLink: linkConfig.props,
  GrowInput: inputConfig.props,
  GrowInputNumber: inputNumberConfig.props,
  GrowSelect: selectConfig.props,
  GrowCascader: cascaderConfig.props,
  GrowSwitch: switchConfig.props,
  GrowDatePicker: datePickerConfig.props,
  GrowRadio: radioConfig.props,
  GrowCheckbox: checkboxConfig.props,
  GrowRadioGroup: radioGroupConfig.props,
  GrowCheckboxGroup: checkboxGroupConfig.props,
  GrowTreeSelect: treeSelectConfig.props,
  GrowUpload: uploadConfig.props,

  // 数据展示
  GrowTable: tableConfig.props,
  GrowAvatar: avatarConfig.props,
  GrowBadge: badgeConfig.props,
  GrowDivider: dividerConfig.props,
  GrowTimeline: timelineConfig.props,
  GrowTimelineItem: timelineItemConfig.props,
  GrowTree: treeConfig.props,
}

export default elementPropsMap
