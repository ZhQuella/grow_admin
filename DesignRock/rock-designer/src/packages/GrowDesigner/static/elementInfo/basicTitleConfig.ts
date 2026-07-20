/** @deprecated 请使用 layoutConfigs.basicTitleConfig；保留与 elementPropsMap 一致 */
export default {
  props: [
    {
      eleType: 'GrowSelect',
      name: '级别',
      describe: '标题级别',
      modelKey: 'level',
      props: {
        placeholder: '请选择标题级别',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
        ],
      },
    },
    {
      eleType: 'PropVariableBind',
      name: '展示内容',
      describe: '展示在标签中的文字内容，支持变量绑定',
      modelKey: 'context',
      props: {
        placeholder: '请输入展示内容或绑定变量',
      },
    },
  ],
  styles: {},
  events: {},
  renderArgument: {},
}
