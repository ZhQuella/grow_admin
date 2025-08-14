
export default {
    props: [
        {
            eleType: "ElSwitch",
            name: "表单样式",
            describe: "行内表单模式",
            modelKey: "inline",
            props: {

            }
        },
        {
            eleType: "ElSelect",
            name: "标签位置",
            describe: "表单域标签的位置， 当设置为 left 或 right 时，则也需要设置 label-width 属性",
            modelKey: "label-position",
            props: {
                placeholder: "请选择标签位置",
                options: [{
                    label: "左",
                    value: "left"
                },
                {
                    label: "右",
                    value: "right"
                },
                {
                    label: "上",
                    value: "top"
                }]
            }
        },
        {
            eleType: "ElInputNumber",
            name: "标签宽度",
            describe: "标签的长度，例如 '50px'。 作为 Form 直接子元素的 form-item 会继承该值。 可以使用 auto。",
            modelKey: "label-width",
            props: {
                controls: false,
                placeholder: "请输入label宽度"
            }
        },
        {
            eleType: "ElInput",
            name: "标签后缀",
            describe: "表单域标签的后缀",
            modelKey: "label-suffix",
            props: {
                placeholder: "请输入表单域标签的后缀"
            }
        },
        {
            eleType: "ElSwitch",
            name: "隐藏红星",
            describe: "是否隐藏必填字段标签旁边的红色星号。",
            modelKey: "hide-required-asterisk",
            props: {
                placeholder: "请输入表单域标签的后缀"
            }
        },
        {
            eleType: "ElSelect",
            name: "星号位置",
            describe: "星号的位置。",
            modelKey: "require-asterisk-position",
            props: {
                placeholder: "请选择星号位置",
                options: [{
                    label: "左侧",
                    value: "left"
                },{
                    label: "右侧",
                    value: "right"
                }]
            }
        },
        {
            eleType: "ElSwitch",
            name: "显示校验信息",
            describe: "是否显示校验错误信息",
            modelKey: "show-message",
            props: {

            }
        },
        {
            eleType: "ElSwitch",
            name: "行内展示校验信息",
            describe: "是否以行内形式展示校验信息",
            modelKey: "inline-message",
            props: {

            }
        },
        {
            eleType: "ElSwitch",
            name: "显示反馈图标",
            describe: "是否在输入框中显示校验结果反馈图标",
            modelKey: "status-icon",
            props: {

            }
        },
        {
            eleType: "ElSwitch",
            name: "规则变更触发验证",
            describe: "是否在 rules 属性改变后立即触发一次验证",
            modelKey: "validate-on-rule-change"
        },
        {
            eleType: "ElSelect",
            name: "组件尺寸",
            describe: "用于控制该表单内组件的尺寸",
            modelKey: "size",
            props: {
                placeholder: "请选择组件尺寸",
                options: [{
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
            eleType: "ElSwitch",
            name: "禁用",
            describe: "是否禁用该表单内的所有组件。 如果设置为 true, 它将覆盖内部组件的 disabled 属性",
            modelKey: "disabled",
            props: {

            }
        },
        {
            eleType: "ElSwitch",
            name: "错误项定位",
            describe: "当校验失败时，滚动到第一个错误表单项",
            modelKey: "scroll-to-error",
            props: {

            }
        }
    ],
    styles: {

    },
    events: {

    },
    renderArgument: {

    }
}
