import type { WorkspaceMenuApiItem } from '@grow-admin-cornerstone/apps-workspace/route-config'

/** 模拟接口返回的菜单展示数据（title、icon 由后端控制） */
export const MENU_LIST: WorkspaceMenuApiItem[] = [
  {
    name: 'WorkspaceCatalog',
    title: '工作区',
    icon: 'ant-design:folder-outlined',
    children: [
      {
        name: 'Workspace',
        title: '工作台',
        icon: 'ant-design:appstore-outlined',
      },
      {
        name: 'WorkspaceSettings',
        title: '设置中心',
        icon: 'ant-design:setting-outlined',
      },
      {
        name: 'SharedDemo',
        title: '共享页面',
        icon: 'ant-design:copy-outlined',
        children: [
          {
            name: 'SharedDemoA',
            title: '共享页面 A',
            icon: 'ant-design:copy-outlined',
          },
          {
            name: 'SharedDemoB',
            title: '共享页面 B',
            icon: 'ant-design:copy-outlined',
          },
        ],
      },
    ],
  },
]
