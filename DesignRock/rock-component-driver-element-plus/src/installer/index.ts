import type { App } from 'vue';
import { isUndefined } from 'lodash-es';
import { RockComponent } from '@grow-admin-rock/components';
import { type ComponentEntry, withInstall } from '@grow-admin-rock/component-driver';
import {
  ElAvatar,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCard,
  ElCascader,
  ElCalendar,
  ElCheckbox,
  ElColorPicker,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElCarousel,
  ElCarouselItem,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElLink,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElPagination,
  ElPopover,
  ElProgress,
  ElRadio,
  ElResult,
  ElRow,
  ElScrollbar,
  ElSkeleton,
  ElSpace,
  ElSwitch,
  ElSlider,
  ElTabPane,
  ElTabs,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  ElTree,
  ElTreeSelect,
  ElTransfer,
  ElMention,
  ElTimePicker,
  ElUpload,
} from 'element-plus';
import ButtonGroup from '#/components/ButtonGroup.vue'
import CheckboxGroup from '#/components/CheckboxGroup.vue'
import Config from '#/components/Config.vue'
import DialogProvider from '#/components/DialogProvider.vue'
import Drawer from '#/components/Drawer.vue'
import DrawerContent from '#/components/DrawerContent.vue'
import DynamicInput from '#/components/DynamicInput.vue'
import DynamicTags from '#/components/DynamicTags.vue'
import Ellipsis from '#/components/Ellipsis.vue'
import FormItemGi from '#/components/FormItemGi.vue'
import GradientText from '#/components/GradientText.vue'
import Grid from '#/components/Grid.vue'
import GridItem from '#/components/GridItem.vue'
import H1 from '#/components/H1.vue'
import H2 from '#/components/H2.vue'
import H3 from '#/components/H3.vue'
import H4 from '#/components/H4.vue'
import H5 from '#/components/H5.vue'
import H6 from '#/components/H6.vue'
import InputGroup from '#/components/InputGroup.vue'
import InputGroupLabel from '#/components/InputGroupLabel.vue'
import Layout from '#/components/Layout.vue'
import LayoutContent from '#/components/LayoutContent.vue'
import LayoutFooter from '#/components/LayoutFooter.vue'
import LayoutHeader from '#/components/LayoutHeader.vue'
import LayoutSider from '#/components/LayoutSider.vue'
import List from '#/components/List.vue'
import ListItem from '#/components/ListItem.vue'
import MessageProvider from '#/components/MessageProvider.vue'
import NotificationProvider from '#/components/NotificationProvider.vue'
import NumberAnimation from '#/components/NumberAnimation.vue'
import PageHeader from '#/components/PageHeader.vue'
import PopSelect from '#/components/PopSelect.vue'
import RadioButton from '#/components/RadioButton.vue'
import RadioButtonGroup from '#/components/RadioButtonGroup.vue'
import RadioGroup from '#/components/RadioGroup.vue'
import Select from '#/components/Select.vue'
import Spinner from '#/components/Spinner.vue'
import Statistic from '#/components/Statistic.vue'
import Tab from '#/components/Tab.vue'
import Text from '#/components/Text.vue'
import Thing from '#/components/Thing.vue'
import Time from '#/components/Time.vue'
import UploadDragger from '#/components/UploadDragger.vue'

const allComponents: Partial<Record<RockComponent, any>> = {
  [RockComponent.Avatar]: ElAvatar,
  [RockComponent.Badge]: ElBadge,
  [RockComponent.Breadcrumb]: ElBreadcrumb,
  [RockComponent.BreadcrumbItem]: ElBreadcrumbItem,
  [RockComponent.Button]: ElButton,
  [RockComponent.ButtonGroup]: ButtonGroup,
  [RockComponent.Card]: ElCard,
  [RockComponent.Cascader]: ElCascader,
  [RockComponent.Calendar]: ElCalendar,
  [RockComponent.Checkbox]: ElCheckbox,
  [RockComponent.CheckboxGroup]: CheckboxGroup,
  [RockComponent.Col]: ElCol,
  [RockComponent.Collapse]: ElCollapse,
  [RockComponent.CollapseItem]: ElCollapseItem,
  [RockComponent.Carousel]: ElCarousel,
  [RockComponent.CarouselItem]: ElCarouselItem,
  [RockComponent.Config]: Config,
  [RockComponent.DatePicker]: ElDatePicker,
  [RockComponent.ColorPicker]: ElColorPicker,
  [RockComponent.Descriptions]: ElDescriptions,
  [RockComponent.DescriptionsItem]: ElDescriptionsItem,
  [RockComponent.Dialog]: ElDialog,
  [RockComponent.DialogProvider]: DialogProvider,
  [RockComponent.Divider]: ElDivider,
  [RockComponent.Drawer]: Drawer,
  [RockComponent.DrawerContent]: DrawerContent,
  [RockComponent.Dropdown]: ElDropdown,
  [RockComponent.DropdownMenu]: ElDropdownMenu,
  [RockComponent.DropdownItem]: ElDropdownItem,
  [RockComponent.DynamicInput]: DynamicInput,
  [RockComponent.DynamicTags]: DynamicTags,
  [RockComponent.Ellipsis]: Ellipsis,
  [RockComponent.Empty]: ElEmpty,
  [RockComponent.Form]: ElForm,
  [RockComponent.FormItem]: ElFormItem,
  [RockComponent.FormItemGi]: FormItemGi,
  [RockComponent.GradientText]: GradientText,
  [RockComponent.Grid]: Grid,
  [RockComponent.GridItem]: GridItem,
  [RockComponent.H1]: H1,
  [RockComponent.H2]: H2,
  [RockComponent.H3]: H3,
  [RockComponent.H4]: H4,
  [RockComponent.H5]: H5,
  [RockComponent.H6]: H6,
  [RockComponent.Input]: ElInput,
  [RockComponent.InputGroup]: InputGroup,
  [RockComponent.InputGroupLabel]: InputGroupLabel,
  [RockComponent.InputNumber]: ElInputNumber,
  [RockComponent.Link]: ElLink,
  [RockComponent.Layout]: Layout,
  [RockComponent.LayoutContent]: LayoutContent,
  [RockComponent.LayoutFooter]: LayoutFooter,
  [RockComponent.LayoutHeader]: LayoutHeader,
  [RockComponent.LayoutSider]: LayoutSider,
  [RockComponent.List]: List,
  [RockComponent.ListItem]: ListItem,
  [RockComponent.Menu]: ElMenu,
  [RockComponent.MenuItem]: ElMenuItem,
  [RockComponent.SubMenu]: ElSubMenu,
  [RockComponent.MessageProvider]: MessageProvider,
  [RockComponent.Modal]: ElDialog,
  [RockComponent.NotificationProvider]: NotificationProvider,
  [RockComponent.NumberAnimation]: NumberAnimation,
  [RockComponent.PageHeader]: PageHeader,
  [RockComponent.Pagination]: ElPagination,
  [RockComponent.PopSelect]: PopSelect,
  [RockComponent.Popover]: ElPopover,
  [RockComponent.Progress]: ElProgress,
  [RockComponent.Radio]: ElRadio,
  [RockComponent.RadioButton]: RadioButton,
  [RockComponent.RadioButtonGroup]: RadioButtonGroup,
  [RockComponent.RadioGroup]: RadioGroup,
  [RockComponent.Result]: ElResult,
  [RockComponent.Row]: ElRow,
  [RockComponent.Scrollbar]: ElScrollbar,
  [RockComponent.Select]: Select,
  [RockComponent.Skeleton]: ElSkeleton,
  [RockComponent.Space]: ElSpace,
  [RockComponent.Spinner]: Spinner,
  [RockComponent.Statistic]: Statistic,
  [RockComponent.Switch]: ElSwitch,
  [RockComponent.Slider]: ElSlider,
  [RockComponent.Transfer]: ElTransfer,
  [RockComponent.Tab]: Tab,
  [RockComponent.TabPane]: ElTabPane,
  [RockComponent.Tabs]: ElTabs,
  [RockComponent.Table]: ElTable,
  [RockComponent.TableColumn]: ElTableColumn,
  [RockComponent.Tag]: ElTag,
  [RockComponent.Text]: Text,
  [RockComponent.Thing]: Thing,
  [RockComponent.Timeline]: ElTimeline,
  [RockComponent.TimelineItem]: ElTimelineItem,
  [RockComponent.Time]: Time,
  [RockComponent.Tooltip]: ElTooltip,
  [RockComponent.Tree]: ElTree,
  [RockComponent.TreeSelect]: ElTreeSelect,
  [RockComponent.Mention]: ElMention,
  [RockComponent.TimePicker]: ElTimePicker,
  [RockComponent.Upload]: ElUpload,
  [RockComponent.UploadDragger]: UploadDragger,
};

export const install = (componentName: string | RockComponent, app?: App) => {
  const component = allComponents[componentName as RockComponent];
  if (!isUndefined(component)) {
    if (component !== null) {
      app?.use(withInstall(component));
    }
    return { key: componentName, value: component } as ComponentEntry;
  }
};

export * from './installs';
