export default {
    props: [
        {
            eleType: "ElInput",
            name: "文字",
            describe: "按钮文字",
            modelKey: "content",
            props: {
                placeholder: "请输入按钮文字"
            }
        },
        {
            eleType: "ElSelect",
            name: "按钮尺寸",
            describe: "用于控制该表单域下按钮的尺寸",
            modelKey: "size",
            props: {
                placeholder: "请选择按钮尺寸",
                options: [
                {
                    label: "大",
                    value: "large"
                },{
                    label: "默认",
                    value: "default"
                },{
                    label: "小",
                    value: "small"
                }]
            }
        },
        {
            eleType: "ElSelect",
            name: "按钮类型",
            describe: "按钮类型，在设置color时，后者优先。",
            modelKey: "type",
            props: {
                placeholder: "请选择按钮类型",
                options: [
                    {
                        label: "默认",
                        value: "default"
                    },{
                        label: "主要",
                        value: "primary"
                    },{
                        label: "成功",
                        value: "success"
                    },{
                        label: "警告",
                        value: "warning"
                    },{
                        label: "危险",
                        value: "danger"
                    },{
                        label: "信息",
                        value: "info"
                    }]
            }
        },
        {
            eleType: "ElSwitch",
            name: "朴素按钮",
            describe: "是否为朴素按钮",
            modelKey: "plain"
        },
        {
            eleType: "ElSwitch",
            name: "文字按钮",
            describe: "是否为文字按钮",
            modelKey: "text"
        },
        {
            eleType: "ElColorPicker",
            name: "按钮颜色",
            describe: "是否显示文字按钮背景颜色",
            modelKey: "bg"
        },
        {
            eleType: "ElSwitch",
            name: "链接按钮",
            describe: "是否为链接按钮",
            modelKey: "link"
        },
        {
            eleType: "ElSwitch",
            name: "圆角按钮",
            describe: "是否为圆角按钮",
            modelKey: "round"
        },
        {
            eleType: "ElSwitch",
            name: "圆形按钮",
            describe: "是否为圆形按钮",
            modelKey: "circle"
        },
        {
            eleType: "ElSwitch",
            name: "加载状态",
            describe: "是否为加载中状态",
            modelKey: "loading"
        },
        {
            eleType: "",
            name: "加载icon",
            describe: "自定义加载中状态图标组件",
            modelKey: "loading-icon"
        },
        {
            eleType: "ElSwitch",
            name: "禁用状态",
            describe: "按钮是否为禁用状态",
            modelKey: "disabled"
        },
        {
            eleType: "ElSwitch",
            name: "自动聚焦",
            describe: "原生 autofocus 属性",
            modelKey: "autofocus"
        },
        {
            eleType: "ElSelect",
            name: "按钮类型",
            describe: "原生 type 属性",
            modelKey: "native-type",
            props: {
                placeholder: "请选择按钮类型",
                options: [
                    {
                        label: "按钮",
                        value: "button"
                    },{
                        label: "提交",
                        value: "submit"
                    },{
                        label: "重置",
                        value: "reset"
                    }]
            }
        },
        {
            eleType: "ElSwitch",
            name: "自动插入空格",
            describe: "两个中文字符之间自动插入空格(仅当文本长度为 2 且所有字符均为中文时才生效)",
            modelKey: "auto-insert-space"
        },
        {
            eleType: "ElColorPicker",
            name: "自定义按钮颜色",
            describe: "自定义按钮颜色, 并自动计算 hover 和 active 触发后的颜色",
            modelKey: "color"
        },
        {
            eleType: "ElSwitch",
            name: "dark 模式",
            describe: "dark 模式, 意味着自动设置 color 为 dark 模式的颜色",
            modelKey: "dark"
        },
        {
            eleType: "",
            name: "自定义元素",
            describe: "自定义元素标签",
            modelKey: "tag"
        }
    ],
    styles: {

    },
    events: {

    },
    renderArgument: {

    }
}