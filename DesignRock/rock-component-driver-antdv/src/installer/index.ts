import type { App } from 'vue';
import { isUndefined } from 'lodash-es';
import { RockComponent } from '@grow-admin-rock/components';
import { type ComponentEntry, withInstall } from '@grow-admin-rock/component-driver';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Cascader,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Tree,
  TreeSelect,
  Typography,
  Upload,
} from 'ant-design-vue';
import ButtonGroup from '#/components/ButtonGroup.vue'
import Config from '#/components/Config.vue'
import Dialog from '#/components/Dialog.vue'
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
import ListItem from '#/components/ListItem.vue'
import MessageProvider from '#/components/MessageProvider.vue'
import NotificationProvider from '#/components/NotificationProvider.vue'
import NumberAnimation from '#/components/NumberAnimation.vue'
import PageHeader from '#/components/PageHeader.vue'
import PopSelect from '#/components/PopSelect.vue'
import RadioButtonGroup from '#/components/RadioButtonGroup.vue'
import Scrollbar from '#/components/Scrollbar.vue'
import Spinner from '#/components/Spinner.vue'
import Statistic from '#/components/Statistic.vue'
import Tab from '#/components/Tab.vue'
import Text from '#/components/Text.vue'
import Thing from '#/components/Thing.vue'
import UploadDragger from '#/components/UploadDragger.vue'

const allComponents: Partial<Record<RockComponent, any>> = {
  [RockComponent.Avatar]: Avatar,
  [RockComponent.Badge]: Badge,
  [RockComponent.Breadcrumb]: Breadcrumb,
  [RockComponent.BreadcrumbItem]: Breadcrumb.Item,
  [RockComponent.Button]: Button,
  [RockComponent.ButtonGroup]: ButtonGroup,
  [RockComponent.Card]: Card,
  [RockComponent.Cascader]: Cascader,
  [RockComponent.Checkbox]: Checkbox,
  [RockComponent.CheckboxGroup]: Checkbox.Group,
  [RockComponent.Col]: Col,
  [RockComponent.Config]: Config,
  [RockComponent.DatePicker]: DatePicker,
  [RockComponent.Descriptions]: Descriptions,
  [RockComponent.DescriptionsItem]: Descriptions.Item,
  [RockComponent.Dialog]: Dialog,
  [RockComponent.DialogProvider]: DialogProvider,
  [RockComponent.Divider]: Divider,
  [RockComponent.Drawer]: Drawer,
  [RockComponent.DrawerContent]: DrawerContent,
  [RockComponent.Dropdown]: Dropdown,
  [RockComponent.DropdownMenu]: Menu,
  [RockComponent.DropdownItem]: Menu.Item,
  [RockComponent.DynamicInput]: DynamicInput,
  [RockComponent.DynamicTags]: DynamicTags,
  [RockComponent.Ellipsis]: Ellipsis,
  [RockComponent.Empty]: Empty,
  [RockComponent.Form]: Form,
  [RockComponent.FormItem]: Form.Item,
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
  [RockComponent.Input]: Input,
  [RockComponent.InputGroup]: InputGroup,
  [RockComponent.InputGroupLabel]: InputGroupLabel,
  [RockComponent.InputNumber]: InputNumber,
  [RockComponent.Layout]: Layout,
  [RockComponent.LayoutContent]: Layout.Content,
  [RockComponent.LayoutFooter]: Layout.Footer,
  [RockComponent.LayoutHeader]: Layout.Header,
  [RockComponent.LayoutSider]: Layout.Sider,
  [RockComponent.List]: List,
  [RockComponent.ListItem]: ListItem,
  [RockComponent.Menu]: Menu,
  [RockComponent.MenuItem]: Menu.Item,
  [RockComponent.SubMenu]: Menu.SubMenu,
  [RockComponent.MessageProvider]: MessageProvider,
  [RockComponent.Modal]: Modal,
  [RockComponent.NotificationProvider]: NotificationProvider,
  [RockComponent.NumberAnimation]: NumberAnimation,
  [RockComponent.PageHeader]: PageHeader,
  [RockComponent.Pagination]: Pagination,
  [RockComponent.PopSelect]: PopSelect,
  [RockComponent.Popover]: Popover,
  [RockComponent.Progress]: Progress,
  [RockComponent.Radio]: Radio,
  [RockComponent.RadioButton]: Radio.Button,
  [RockComponent.RadioButtonGroup]: RadioButtonGroup,
  [RockComponent.RadioGroup]: Radio.Group,
  [RockComponent.Result]: Result,
  [RockComponent.Row]: Row,
  [RockComponent.Scrollbar]: Scrollbar,
  [RockComponent.Select]: Select,
  [RockComponent.Skeleton]: Skeleton,
  [RockComponent.Space]: Space,
  [RockComponent.Spinner]: Spinner,
  [RockComponent.Statistic]: Statistic,
  [RockComponent.Switch]: Switch,
  [RockComponent.Tab]: Tab,
  [RockComponent.TabPane]: Tabs.TabPane,
  [RockComponent.Tabs]: Tabs,
  [RockComponent.Tag]: Tag,
  [RockComponent.Text]: Text,
  [RockComponent.Thing]: Thing,
  [RockComponent.Timeline]: Timeline,
  [RockComponent.TimelineItem]: Timeline.Item,
  [RockComponent.Tooltip]: Tooltip,
  [RockComponent.Tree]: Tree,
  [RockComponent.TreeSelect]: TreeSelect,
  [RockComponent.Upload]: Upload,
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

export { message, notification, Modal as dialog } from 'ant-design-vue';
