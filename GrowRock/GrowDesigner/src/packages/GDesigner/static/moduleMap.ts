export const BaseComponent = new Map([
  [
    "basicsElement",
    {
      title: "基础元素",
      group: [
        {
          elName: "图片",
          elType: "basic",
          elTagName: "img",
          elIcon: "Image",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "标题",
          elType: "basic",
          elTagName: "BasicTitle",
          elIcon: "FontColorsOutlined",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "正文",
          elType: "basic",
          elTagName: "p",
          elIcon: "FontSizeOutlined",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "短语",
          elType: "basic",
          elTagName: "span",
          elIcon: "ItalicOutlined",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "容器",
          elType: "basic",
          elTagName: "div",
          elIcon: "Box",
          isChild: true,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "layoutElement",
    {
      title: "布局容器",
      group: [
        {
          elName: "卡片",
          elType: "eleModule",
          elTagName: "el-card",
          elIcon: "IdcardOutlined",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "选项卡",
          elType: "eleModule",
          elTagName: "el-tabs",
          elIcon: "DataBaseAlt",
          isChild: true,
          isAdd: true,
          childName: "el-tab-pane"
        },
        {
          elName: "弹性盒子",
          elType: "eleModule",
          elTagName: "el-row",
          elIcon: "OpenPanelRight",
          isChild: true,
          isAdd: true,
          childName: "el-col"
        },
        {
          elName: "折叠面板",
          elType: "eleModule",
          elTagName: "el-collapse",
          elIcon: "RowCollapse",
          isChild: true,
          isAdd: true,
          childName: "el-collapse-item"
        }
      ]
    }
  ],
  [
    "interactionElement",
    {
      title: "交互组件",
      group: [
        {
          elName: "弹窗",
          elType: "eleModule",
          elTagName: "el-dialog",
          elIcon: "Chat",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "抽屉",
          elType: "eleModule",
          elTagName: "el-drawer",
          elIcon: "Notebook",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "弹出框",
          elType: "eleModule",
          elTagName: "el-popover",
          elIcon: "CloudAlerting",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "弹出框",
          elType: "eleModule",
          elTagName: "el-tooltip",
          elIcon: "Slisor",
          isChild: true,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "tableElement",
    {
      title: "表格组件",
      group: [
        {
          elName: "表格",
          elType: "eleModule",
          elTagName: "el-table",
          elIcon: "DataTable",
          isChild: false,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ]
]);

export const BusinessComponent = new Map([
  [
    "personnelElement",
    {
      title: "人员相关",
      group: [
        {
          elName: "人员选择",
          elType: "eleModule",
          elTagName: "el-select",
          elIcon: "UserMultiple",
          isChild: false,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ]
]);

export const AtomicComponent = new Map([
  [
    "baseElement",
    {
      title: "交互组件",
      group: [
        {
          elName: "按钮",
          elType: "eleModule",
          elTagName: "el-button",
          elIcon: "TouchInteraction",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "链接",
          elType: "eleModule",
          elTagName: "el-link",
          elIcon: "Link",
          isChild: false,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "formElement",
    {
      title: "表单组件",
      group: [
        {
          elName: "输入框",
          elType: "eleModule",
          elTagName: "el-input",
          elIcon: "Erase",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "数字输入框",
          elType: "eleModule",
          elTagName: "el-input-number",
          elIcon: "ListNumbered",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "选择器",
          elType: "eleModule",
          elTagName: "el-select",
          elIcon: "StorageRequest",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "级联选择器",
          elType: "eleModule",
          elTagName: "el-cascader",
          elIcon: "TextIndentMore",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "开关",
          elType: "eleModule",
          elTagName: "el-switch",
          elIcon: "JoinLeft",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "时间选择器",
          elType: "eleModule",
          elTagName: "el-time-picker",
          elIcon: "Timer",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "日期选择器",
          elType: "eleModule",
          elTagName: "el-date-picker",
          elIcon: "EventSchedule",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "单选",
          elType: "eleModule",
          elTagName: "el-radio",
          elIcon: "RadioButtonChecked",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "多选",
          elType: "eleModule",
          elTagName: "el-checkbox",
          elIcon: "CheckboxChecked",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "树形选择",
          elType: "eleModule",
          elTagName: "el-tree-select",
          elIcon: "DecisionTree",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "上传",
          elType: "eleModule",
          elTagName: "el-upload",
          elIcon: "CloudUpload",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "滑块",
          elType: "eleModule",
          elTagName: "el-slider",
          elIcon: "NotAvailable",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "穿梭框",
          elType: "eleModule",
          elTagName: "el-transfer",
          elIcon: "StudyTransfer",
          isChild: false,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "gropFormElement",
    {
      title: "表单组",
      group: [
        {
          elName: "表单",
          elType: "eleModule",
          elTagName: "el-form",
          elIcon: "DataFormat",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "表单项",
          elType: "eleModule",
          elTagName: "el-form-item",
          elIcon: "HorizontalView",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "单选组",
          elType: "eleModule",
          elTagName: "el-radio-group",
          elIcon: "ListBulleted",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "多选组",
          elType: "eleModule",
          elTagName: "el-checkbox-group",
          elIcon: "ListChecked",
          isChild: true,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "displayInformationElement",
    {
      title: "展示信息",
      group: [
        {
          elName: "头像",
          elType: "eleModule",
          elTagName: "el-avatar",
          elIcon: "UserAvatar",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "徽章数",
          elType: "eleModule",
          elTagName: "el-badge",
          elIcon: "Badge",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "日历",
          elType: "eleModule",
          elTagName: "el-calendar",
          elIcon: "CalendarHeatMap",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "走马灯",
          elType: "eleModule",
          elTagName: "el-calendar",
          elIcon: "CarouselHorizontal",
          isChild: true,
          isAdd: true,
          childName: "el-carousel-item"
        },
        {
          elName: "分割线",
          elType: "eleModule",
          elTagName: "el-divider",
          elIcon: "BorderVerticleOutlined",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "时间线",
          elType: "eleModule",
          elTagName: "el-timeline",
          elIcon: "BoxPlotOutlined",
          isChild: true,
          isAdd: true,
          childName: "el-timeline-item"
        },
        {
          elName: "树形组件",
          elType: "eleModule",
          elTagName: "el-tree",
          elIcon: "TreeViewAlt",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "虚拟树形组件",
          elType: "eleModule",
          elTagName: "el-tree-v2",
          elIcon: "TreeViewAlt",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "提示",
          elType: "eleModule",
          elTagName: "el-alert",
          elIcon: "Drought",
          isChild: false,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ]
]);

export const specificComponent = new Map([
  [
    "el-tab-pane",
    {
      elName: "选项",
      elType: "eleModule",
      elTagName: "el-tab-pane",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "el-col",
    {
      elName: "布局",
      elType: "eleModule",
      elTagName: "el-col",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "el-collapse-item",
    {
      elName: "折叠项",
      elType: "eleModule",
      elTagName: "el-collapse-item",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "el-timeline-item",
    {
      elName: "时间项",
      elType: "eleModule",
      elTagName: "el-timeline-item",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ]
]);
