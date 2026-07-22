import {
  boolSwitch,
  createConfig,
  defaultValueBind,
  modelBind,
  numberInput,
  selectInput,
  sizeSelect,
  textInput,
  variableBindInput,
} from './shared'

/** 表单 GrowForm */
export const formConfig = createConfig([
  boolSwitch('行内表单', 'inline', '行内表单模式'),
  selectInput(
    '标签位置',
    'label-position',
    [
      { label: '左', value: 'left' },
      { label: '右', value: 'right' },
      { label: '上', value: 'top' },
    ],
    '表单域标签位置；设为 left / right 时还需设置 label-width',
  ),
  numberInput('标签宽度', 'label-width', '标签长度，例如 50；子 form-item 会继承该值', '请输入 label 宽度'),
  textInput('标签后缀', 'label-suffix', '表单域标签的后缀'),
  boolSwitch('隐藏红星', 'hide-required-asterisk', '是否隐藏必填字段标签旁的红色星号'),
  selectInput(
    '星号位置',
    'require-asterisk-position',
    [
      { label: '左侧', value: 'left' },
      { label: '右侧', value: 'right' },
    ],
    '必填星号的位置',
  ),
  boolSwitch('显示校验信息', 'show-message', '是否显示校验错误信息'),
  boolSwitch('行内展示校验信息', 'inline-message', '是否以行内形式展示校验信息'),
  boolSwitch('显示反馈图标', 'status-icon', '是否在输入框中显示校验结果反馈图标'),
  boolSwitch('规则变更触发验证', 'validate-on-rule-change', 'rules 变更后是否立即触发一次验证'),
  sizeSelect('用于控制该表单内组件的尺寸'),
  boolSwitch('禁用', 'disabled', '是否禁用表单内所有组件；为 true 时覆盖内部 disabled'),
  boolSwitch('错误项定位', 'scroll-to-error', '校验失败时滚动到第一个错误表单项'),
])

/** 表单项 GrowFormItem */
export const formItemConfig = createConfig([
  textInput(
    '属性值',
    'prop',
    'model 的键名，可为 a.b.0 或路径数组；使用 validate / resetFields 时必填',
  ),
  textInput('标签名', 'label', '标签文本'),
  selectInput(
    '标签位置',
    'label-position',
    [
      { label: '左', value: 'left' },
      { label: '右', value: 'right' },
      { label: '上', value: 'top' },
    ],
    '表单域标签位置；默认继承 Form 的 label-position',
  ),
  numberInput('标签宽度', 'label-width', '标签宽度，例如 50，可使用 auto', '请输入 label 宽度'),
  boolSwitch('必填', 'required', '是否为必填项；未设置时根据校验规则确认'),
  textInput(
    '错误提示信息',
    'error',
    '验证错误时的提示信息；设置后校验状态变为 error 并显示该信息',
  ),
  boolSwitch('显示校验信息', 'show-message', '是否显示校验错误信息'),
  boolSwitch('行内展示校验信息', 'inline-message', '以行内形式展示校验信息'),
  sizeSelect('用于控制该表单域下组件的尺寸'),
  textInput('关联表单元素', 'for', '关联表单元素'),
  selectInput(
    '表单验证状态',
    'validate-status',
    [
      { label: '默认', value: '' },
      { label: '错误', value: 'error' },
      { label: '验证中', value: 'validating' },
      { label: '成功', value: 'success' },
    ],
    'form-item 校验状态',
  ),
])

/** 按钮 GrowButton */
export const buttonConfig = createConfig([
  variableBindInput('文字', 'content', '按钮文字，支持变量绑定', '请输入按钮文字或绑定变量'),
  sizeSelect('用于控制该表单域下按钮的尺寸'),
  selectInput(
    '按钮类型',
    'type',
    [
      { label: '默认', value: 'default' },
      { label: '主要', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '信息', value: 'info' },
    ],
    '按钮类型，在设置 color 时后者优先',
  ),
  boolSwitch('朴素按钮', 'plain', '是否为朴素按钮'),
  boolSwitch('文字按钮', 'text', '是否为文字按钮'),
  textInput('按钮颜色', 'bg', '是否显示文字按钮背景颜色'),
  boolSwitch('链接按钮', 'link', '是否为链接按钮'),
  boolSwitch('圆角按钮', 'round', '是否为圆角按钮'),
  boolSwitch('圆形按钮', 'circle', '是否为圆形按钮'),
  boolSwitch('加载状态', 'loading', '是否为加载中状态'),
  textInput('加载图标', 'loading-icon', '自定义加载中状态图标组件'),
  boolSwitch('禁用状态', 'disabled', '按钮是否为禁用状态'),
  boolSwitch('自动聚焦', 'autofocus', '原生 autofocus 属性'),
  selectInput(
    '原生类型',
    'native-type',
    [
      { label: '按钮', value: 'button' },
      { label: '提交', value: 'submit' },
      { label: '重置', value: 'reset' },
    ],
    '原生 type 属性',
  ),
  boolSwitch(
    '自动插入空格',
    'auto-insert-space',
    '两个中文字符之间自动插入空格（仅当文本长度为 2 且均为中文时生效）',
  ),
  textInput('自定义颜色', 'color', '自定义按钮颜色，并自动计算 hover / active 颜色'),
  boolSwitch('dark 模式', 'dark', 'dark 模式，自动设置 color 为 dark 模式颜色'),
  textInput('自定义元素', 'tag', '自定义元素标签'),
])

/** 链接 */
export const linkConfig = createConfig([
  variableBindInput('文字', 'content', '链接显示文字，支持变量绑定'),
  variableBindInput('链接地址', 'href', '原生 href 属性，支持变量绑定', '请输入 URL 或绑定变量'),
  selectInput(
    '类型',
    'type',
    [
      { label: '默认', value: 'default' },
      { label: '主要', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '信息', value: 'info' },
    ],
    '类型',
  ),
  selectInput(
    '打开方式',
    'target',
    [
      { label: '当前窗口', value: '_self' },
      { label: '新窗口', value: '_blank' },
      { label: '父窗口', value: '_parent' },
      { label: '顶级窗口', value: '_top' },
    ],
    '原生 target 属性',
  ),
  boolSwitch('下划线', 'underline', '是否下划线'),
  boolSwitch('禁用', 'disabled', '是否禁用状态'),
])

/** 输入框 */
export const inputConfig = createConfig([
  modelBind(),
  defaultValueBind('输入框初始默认值，支持变量绑定'),
  textInput('占位文本', 'placeholder', '输入框占位文本'),
  selectInput(
    '类型',
    'type',
    [
      { label: '文本', value: 'text' },
      { label: '多行', value: 'textarea' },
      { label: '密码', value: 'password' },
      { label: '数字', value: 'number' },
    ],
    '输入框类型',
  ),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('只读', 'readonly', '是否只读'),
  boolSwitch('可清空', 'clearable', '是否可清空'),
  boolSwitch('显示密码', 'show-password', '是否显示切换密码图标'),
  boolSwitch('显示字数', 'show-word-limit', '是否显示输入字数统计'),
  numberInput('最大长度', 'maxlength', '原生 maxlength 属性'),
  numberInput('最小长度', 'minlength', '原生 minlength 属性'),
  sizeSelect(),
])

/** 数字输入框 */
export const inputNumberConfig = createConfig([
  modelBind(),
  defaultValueBind('数字输入框初始默认值，支持变量绑定'),
  numberInput('最小值', 'min', '设置计数器允许的最小值'),
  numberInput('最大值', 'max', '设置计数器允许的最大值'),
  numberInput('步长', 'step', '计数器步长'),
  boolSwitch('严格步长', 'step-strictly', '是否只能输入 step 的倍数'),
  numberInput('精度', 'precision', '数值精度'),
  boolSwitch('禁用', 'disabled', '是否禁用计数器'),
  boolSwitch('使用控制按钮', 'controls', '是否使用控制按钮'),
  selectInput(
    '控制按钮位置',
    'controls-position',
    [
      { label: '默认', value: '' },
      { label: '右侧', value: 'right' },
    ],
    '控制按钮位置',
  ),
  sizeSelect(),
])

/** 选择器 */
export const selectConfig = createConfig([
  modelBind(),
  defaultValueBind('选择器初始默认值，支持变量绑定'),
  variableBindInput(
    '选项数据',
    'options',
    '下拉选项，支持变量绑定（如 state.options）',
    '请输入数据或绑定变量',
  ),
  textInput('占位文本', 'placeholder', '占位符'),
  boolSwitch('多选', 'multiple', '是否多选'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('可清空', 'clearable', '是否可以清空选项'),
  boolSwitch('可过滤', 'filterable', '是否可过滤'),
  boolSwitch('允许创建条目', 'allow-create', '是否允许用户创建新条目'),
  boolSwitch('折叠标签', 'collapse-tags', '多选时是否将选中值按文字的形式展示'),
  sizeSelect(),
])

/** 级联选择器 */
export const cascaderConfig = createConfig([
  modelBind(),
  defaultValueBind('级联选择器初始默认值，支持变量绑定'),
  variableBindInput(
    '选项数据',
    'options',
    '级联选项，支持变量绑定（如 state.options）',
    '请输入数据或绑定变量',
  ),
  textInput('占位文本', 'placeholder', '输入框占位文本'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('可清空', 'clearable', '是否支持清空选项'),
  boolSwitch('可过滤', 'filterable', '是否可搜索选项'),
  boolSwitch('显示完整路径', 'show-all-levels', '输入框中是否显示选中值的完整路径'),
  boolSwitch('折叠标签', 'collapse-tags', '多选模式下是否折叠 Tag'),
  sizeSelect(),
])

/** 开关 */
export const switchConfig = createConfig([
  modelBind(),
  defaultValueBind('开关初始默认值，支持变量绑定（如 true / false）'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('加载中', 'loading', '是否显示加载中'),
  boolSwitch('行内提示', 'inline-prompt', '无论图标或文本是否显示都会居中'),
  textInput('打开时文字', 'active-text', 'switch 打开时的文字描述'),
  textInput('关闭时文字', 'inactive-text', 'switch 关闭时的文字描述'),
  sizeSelect(),
])

/** 滑块 */
export const sliderConfig = createConfig([
  modelBind(),
  defaultValueBind('滑块初始默认值，支持变量绑定'),
  numberInput('最小值', 'min', '最小值'),
  numberInput('最大值', 'max', '最大值'),
  numberInput('步长', 'step', '步长'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('显示间断点', 'show-stops', '是否显示间断点'),
  boolSwitch('显示提示', 'show-tooltip', '是否显示 tooltip'),
  boolSwitch('范围选择', 'range', '是否为范围选择'),
  boolSwitch('竖向模式', 'vertical', '是否竖向模式'),
  textInput('竖向高度', 'height', '竖向模式时的高度', '如 200px'),
  boolSwitch('显示输入框', 'show-input', '是否显示输入框（仅非范围选择）'),
  boolSwitch('输入框控制按钮', 'show-input-controls', '输入框控制按钮'),
  numberInput('输入防抖', 'debounce', '输入时的去抖延迟（毫秒）'),
  sizeSelect(),
])

/** 穿梭框 */
export const transferConfig = createConfig([
  modelBind(),
  defaultValueBind('穿梭框选中值（右侧列表 key 数组），支持变量绑定'),
  variableBindInput(
    '数据源',
    'data',
    '穿梭框数据源，支持变量绑定（如 state.list）',
    '请输入数据或绑定变量',
  ),
  boolSwitch('可搜索', 'filterable', '是否可搜索'),
  textInput('搜索占位', 'filter-placeholder', '搜索框占位符'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  selectInput(
    '右侧排序策略',
    'target-order',
    [
      { label: '原始顺序', value: 'original' },
      { label: '追加到末尾', value: 'push' },
      { label: '保持勾选顺序', value: 'unshift' },
    ],
    '右侧列表元素的排序策略',
  ),
])

/** 日期选择器 */
export const datePickerConfig = createConfig([
  modelBind(),
  defaultValueBind('日期选择器初始默认值，支持变量绑定'),
  selectInput(
    '显示类型',
    'type',
    [
      { label: '日期', value: 'date' },
      { label: '日期时间', value: 'datetime' },
      { label: '周', value: 'week' },
      { label: '月', value: 'month' },
      { label: '年', value: 'year' },
      { label: '日期范围', value: 'daterange' },
      { label: '日期时间范围', value: 'datetimerange' },
    ],
    '显示类型',
  ),
  textInput('占位文本', 'placeholder', '非范围选择时的占位内容'),
  textInput('格式', 'format', '显示在输入框中的格式'),
  textInput('值格式', 'value-format', '绑定值的格式'),
  boolSwitch('禁用', 'disabled', '禁用'),
  boolSwitch('只读', 'readonly', '完全只读'),
  boolSwitch('可清空', 'clearable', '是否显示清除按钮'),
  sizeSelect(),
])

/** 时间选择器（Naive UI NTimePicker） */
export const timePickerConfig = createConfig([
  modelBind(),
  defaultValueBind('时间选择器初始默认值，支持变量绑定'),
  textInput('占位文本', 'placeholder', '未选择时的占位文案'),
  textInput('格式', 'format', '时间显示格式（date-fns），如 HH:mm:ss', 'HH:mm:ss'),
  textInput('值格式', 'value-format', 'formatted-value 的格式，默认跟随 format'),
  boolSwitch('可清空', 'clearable', '是否显示清除按钮'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('输入框只读', 'input-readonly', '输入框只读，避免移动端弹出键盘'),
  boolSwitch('12 小时制', 'use-12-hours', '是否使用 12 小时制面板'),
  numberInput('小时步进', 'hours', '小时步进；也可在数据中配置为数组限定可选小时'),
  numberInput('分钟步进', 'minutes', '分钟步进；也可在数据中配置为数组限定可选分钟'),
  numberInput('秒步进', 'seconds', '秒步进；也可在数据中配置为数组限定可选秒'),
  selectInput(
    '尺寸',
    'size',
    [
      { label: 'tiny', value: 'tiny' },
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
    ],
    '组件尺寸（Naive UI）',
  ),
  selectInput(
    '面板位置',
    'placement',
    [
      { label: 'bottom-start', value: 'bottom-start' },
      { label: 'bottom', value: 'bottom' },
      { label: 'bottom-end', value: 'bottom-end' },
      { label: 'top-start', value: 'top-start' },
      { label: 'top', value: 'top' },
      { label: 'top-end', value: 'top-end' },
    ],
    '面板弹出位置',
  ),
  textInput('时区', 'time-zone', '格式化使用的 IANA 时区，如 Asia/Shanghai'),
])

/** 单选（单选项，兼容旧 schema） */
export const radioConfig = createConfig([
  textInput('label', 'label', '单选框的 value'),
  textInput('value', 'value', '单选框的值'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('边框', 'border', '是否显示边框'),
  sizeSelect(),
])

/** 多选（单选项，兼容旧 schema） */
export const checkboxConfig = createConfig([
  textInput('label', 'label', '选中状态的值'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('边框', 'border', '是否显示边框'),
  boolSwitch('半选', 'indeterminate', '设置不确定状态'),
  sizeSelect(),
])

/** 单选组 */
export const radioGroupConfig = createConfig([
  modelBind(),
  defaultValueBind('单选组初始默认值，支持变量绑定'),
  variableBindInput(
    '选项数据',
    'options',
    '单选选项，支持变量绑定（如 state.options）',
    '请输入数据或绑定变量',
  ),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  sizeSelect(),
])

/** 多选组 */
export const checkboxGroupConfig = createConfig([
  modelBind(),
  defaultValueBind('多选组初始默认值（数组），支持变量绑定'),
  variableBindInput(
    '选项数据',
    'options',
    '多选选项，支持变量绑定（如 state.options）',
    '请输入数据或绑定变量',
  ),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  numberInput('最小数量', 'min', '可被勾选的最小数量'),
  numberInput('最大数量', 'max', '可被勾选的最大数量'),
  sizeSelect(),
])

/** 树形选择（Naive UI NTreeSelect） */
export const treeSelectConfig = createConfig([
  modelBind(),
  defaultValueBind('树形选择初始默认值，支持变量绑定'),
  variableBindInput(
    '数据源',
    'data',
    '树形数据，支持变量绑定（如 state.tree）；也可使用 options',
    '请输入数据或绑定变量',
  ),
  textInput('占位文本', 'placeholder', '未选择时的占位文案'),
  boolSwitch('多选', 'multiple', '是否支持多选'),
  boolSwitch('可勾选', 'checkable', '节点是否显示复选框'),
  boolSwitch('级联勾选', 'cascade', '是否关联父子节点勾选'),
  selectInput(
    '勾选策略',
    'check-strategy',
    [
      { label: '全部', value: 'all' },
      { label: '只返回父节点', value: 'parent' },
      { label: '只返回子节点', value: 'child' },
    ],
    '多选勾选时的值回填策略',
  ),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('可清空', 'clearable', '是否可清空'),
  boolSwitch('可过滤', 'filterable', '是否可搜索过滤'),
  boolSwitch('显示路径', 'show-path', '选中后是否展示完整路径'),
  textInput('路径分隔符', 'separator', 'show-path 时的路径分隔符', '/'),
  boolSwitch('默认展开全部', 'default-expand-all', '是否默认展开全部节点'),
  boolSwitch('点击展开', 'expand-on-click', '是否点击节点时展开'),
  boolSwitch('菜单宽度一致', 'consistent-menu-width', '下拉菜单是否与触发器同宽'),
  numberInput('最多标签数', 'max-tag-count', '多选时最多显示的标签数量'),
  textInput('key 字段', 'key-field', '节点 key 对应字段名', 'key'),
  textInput('label 字段', 'label-field', '节点文案对应字段名', 'label'),
  textInput('children 字段', 'children-field', '子节点对应字段名', 'children'),
  selectInput(
    '尺寸',
    'size',
    [
      { label: 'tiny', value: 'tiny' },
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
    ],
    '组件尺寸（Naive UI）',
  ),
])

/** 提及（Naive UI NMention） */
export const mentionConfig = createConfig([
  modelBind(),
  defaultValueBind('提及初始默认值，支持变量绑定'),
  variableBindInput(
    '选项数据',
    'options',
    '提及候选列表，支持变量绑定（如 state.mentions）',
    '请输入数据或绑定变量',
  ),
  textInput('占位文本', 'placeholder', '未输入时的占位文案'),
  textInput('触发前缀', 'prefix', '触发提及的前缀字符，长度须为 1', '@'),
  textInput('分隔符', 'separator', '切分提及使用的字符，长度须为 1', ' '),
  selectInput(
    '输入类型',
    'type',
    [
      { label: '单行', value: 'text' },
      { label: '多行', value: 'textarea' },
    ],
    '输入框类型',
  ),
  boolSwitch('自适应高度', 'autosize', 'type 为 textarea 时是否自动调整高度'),
  boolSwitch('显示边框', 'bordered', '是否显示输入框边框'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('加载中', 'loading', '选择面板是否显示加载状态'),
  selectInput(
    '尺寸',
    'size',
    [
      { label: 'tiny', value: 'tiny' },
      { label: 'small', value: 'small' },
      { label: 'medium', value: 'medium' },
      { label: 'large', value: 'large' },
    ],
    '组件尺寸（Naive UI）',
  ),
  selectInput(
    '面板位置',
    'placement',
    [
      { label: 'bottom-start', value: 'bottom-start' },
      { label: 'bottom', value: 'bottom' },
      { label: 'bottom-end', value: 'bottom-end' },
      { label: 'top-start', value: 'top-start' },
      { label: 'top', value: 'top' },
      { label: 'top-end', value: 'top-end' },
    ],
    '提及候选面板弹出位置',
  ),
])

/** 上传 */
export const uploadConfig = createConfig([
  modelBind(),
  defaultValueBind('上传文件列表默认值，支持变量绑定', 'file-list'),
  textInput('上传地址', 'action', '请求 URL'),
  textInput('接受类型', 'accept', '接受上传的文件类型'),
  boolSwitch('多选文件', 'multiple', '是否支持多选文件'),
  boolSwitch('禁用', 'disabled', '是否禁用'),
  boolSwitch('自动上传', 'auto-upload', '是否自动上传'),
  boolSwitch('显示文件列表', 'show-file-list', '是否显示已上传文件列表'),
  boolSwitch('拖拽上传', 'drag', '是否启用拖拽上传'),
  numberInput('限制数量', 'limit', '允许上传文件的最大数量'),
  selectInput(
    '列表类型',
    'list-type',
    [
      { label: '文本', value: 'text' },
      { label: '图片', value: 'picture' },
      { label: '照片墙', value: 'picture-card' },
    ],
    '文件列表的类型',
  ),
])
