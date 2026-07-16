
export default {
    props: [
        {
            eleType: "GrowInput",
            name: "属性值",
            describe: "model 的键名。 它可以是一个属性的值(如 a.b.0 或 ['a', 'b', '0'])。 在使用了 validate、resetFields 的方法时，该属性是必填的。",
            modelKey: "prop",
            props: {
                placeholder: "请输入属性值"
            }
        },
        {
            eleType: "GrowInput",
            name: "标签名",
            describe: "标签文本",
            modelKey: "label",
            props: {
                placeholder: "请输入标签名"
            }
        },
        {
            eleType: "GrowSelect",
            name: "标签位置",
            describe: "表单域标签的位置， 当设置为 left 或 right 时，则也需要设置 label-width 属性 默认会继承 Form的label-position",
            modelKey: "label-position",
            props: {
                placeholder: "请输入标签名",
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
            eleType: "GrowInputNumber",
            name: "标签宽度",
            describe: "标签宽度，例如 '50px'。 可以使用 auto。",
            modelKey: "label-width",
            props: {
                controls: false,
                placeholder: "请输入label宽度"
            }
        },
        {
            eleType: "GrowSwitch",
            name: "必填",
            describe: "是否为必填项，如不设置，则会根据校验规则确认",
            modelKey: "required",
            props: {
                placeholder: "请输入表单域标签的后缀"
            }
        },
        {
            eleType: "GrowInput",
            name: "错误提示信息",
            describe: "表单域验证错误时的提示信息。设置该值会导致表单验证状态变为 error，并显示该错误信息。",
            modelKey: "error",
            props: {
                placeholder: "请输入错误提示信息"
            }
        },
        {
            eleType: "GrowSwitch",
            name: "显示校验信息",
            describe: "是否显示校验错误信息",
            modelKey: "show-message",
            props: {

            }
        },
        {
            eleType: "GrowSwitch",
            name: "行内展示校验信息",
            describe: "以行内形式展示校验信息",
            modelKey: "inline-message",
            props: {

            }
        },
        {
            eleType: "GrowSelect",
            name: "组件尺寸",
            describe: "用于控制该表单域下组件的尺寸",
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
            eleType: "GrowInput",
            name: "关联表单元素",
            describe: "关联表单元素",
            modelKey: "for",
            props: {
                placeholder: "请输入关联表单元素"
            }
        },
        {
            eleType: "GrowSelect",
            name: "表单验证状态",
            describe: "formitem 校验的状态",
            modelKey: "size",
            props: {
                placeholder: "请选择组件尺寸",
                options: [{
                    label: "默认",
                    value: ""
                },{
                    label: "错误",
                    value: "error"
                },{
                    label: "验证中",
                    value: "validating"
                },{
                    label: "成功",
                    value: "success"
                }]
            }
        },
    ],
    styles: {

    },
    events: {

    },
    renderArgument: {

    }
}
