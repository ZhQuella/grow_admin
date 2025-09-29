
export default {
    props: [
        {
            eleType: "ElSelect",
            name: "级别",
            describe: "标题级别",
            modelKey: "level",
            props: {
                placeholder: "请选择标题级别",
                options: [
                    {
                        label: "H1",
                        value: "H1"
                    },
                    {
                        label: "H2",
                        value: "H2"
                    },
                    {
                        label: "H3",
                        value: "H3"
                    },
                    {
                        label: "H4",
                        value: "H4"
                    },
                    {
                        label: "H5",
                        value: "H5"
                    }

                ]
            }
        },
        {
            eleType: "ElInput",
            name: "展示内容",
            describe: "展示在标签中的文字内容",
            modelKey: "context",
            props: {
                placeholder: "请输入展示内容"
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
