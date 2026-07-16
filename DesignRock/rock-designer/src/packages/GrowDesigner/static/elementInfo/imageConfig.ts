
export default {
    props: [
        {
            eleType: "GrowInput",
            name: "src",
            describe: "图片的路径，用于制定图片的来源地址",
            modelKey: "src",
            props: {
                placeholder: "请输入URL"
            }
        },
        {
            eleType: "GrowInput",
            name: "alt",
            describe: "替代文本，当图片无法家在时显示的文字，提高可访问性",
            modelKey: "alt",
            props: {
                placeholder: "请输入alt"
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
