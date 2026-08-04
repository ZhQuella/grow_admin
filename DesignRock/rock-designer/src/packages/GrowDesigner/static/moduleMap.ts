/** 表单组件：画布默认铺满宽度（w-full / width:100%） */
export const FORM_MODULE_FULL_WIDTH_TAGS = new Set([
  'GrowInput',
  'GrowInputNumber',
  'GrowSelect',
  'GrowCascader',
  'GrowTimePicker',
  'GrowDatePicker',
  'GrowTreeSelect',
  'GrowMention',
  'GrowSlider',
  'GrowTransfer',
  'GrowRadioGroup',
  'GrowCheckboxGroup',
  'GrowPagination',
])

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
          childName: "",
          isInlineBlock: true
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
          elTagName: "GrowCard",
          elIcon: "IdcardOutlined",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "选项卡",
          elType: "eleModule",
          elTagName: "GrowTabs",
          elIcon: "DataBaseAlt",
          isChild: true,
          isAdd: true,
          childName: "GrowTabPane"
        },
        {
          elName: "弹性盒子",
          elType: "eleModule",
          elTagName: "GrowRow",
          elIcon: "OpenPanelRight",
          isChild: true,
          isAdd: true,
          childName: "GrowCol"
        },
        {
          elName: "折叠面板",
          elType: "eleModule",
          elTagName: "GrowCollapse",
          elIcon: "RowCollapse",
          isChild: true,
          isAdd: true,
          childName: "GrowCollapseItem"
        },
        {
          elName: "滚动条",
          elType: "eleModule",
          elTagName: "GrowScrollbar",
          elIcon: "Scrollbar",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "布局容器",
          elType: "eleModule",
          elTagName: "GrowLayout",
          elIcon: "Container",
          isChild: true,
          isAdd: false,
          childName: ""
        }
      ]
    }
  ],
  [
    "logicElement",
    {
      title: "逻辑组件",
      group: [
        {
          elName: "循环",
          elType: "eleModule",
          elTagName: "GrowLoop",
          elIcon: "Loop",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "判断",
          elType: "eleModule",
          elTagName: "GrowCondition",
          elIcon: "Condition",
          isChild: true,
          isAdd: false,
          childName: ""
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
          elTagName: "GrowModal",
          elIcon: "Chat",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "抽屉",
          elType: "eleModule",
          elTagName: "GrowDrawer",
          elIcon: "Notebook",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "弹出框",
          elType: "eleModule",
          elTagName: "GrowPopover",
          elIcon: "Popover",
          isChild: true,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "文字提示",
          elType: "eleModule",
          elTagName: "GrowTooltip",
          elIcon: "Tooltip",
          isChild: true,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "下拉菜单",
          elType: "eleModule",
          elTagName: "GrowDropdown",
          elIcon: "Dropdown",
          isChild: true,
          isAdd: false,
          childName: "",
          isInlineBlock: true
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
          elTagName: "GrowTable",
          elIcon: "DataTable",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "分页",
          elType: "eleModule",
          elTagName: "GrowPagination",
          elIcon: "Pagination",
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
          elTagName: "GrowSelect",
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
          elTagName: "GrowButton",
          elIcon: "TouchInteraction",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "链接",
          elType: "eleModule",
          elTagName: "GrowLink",
          elIcon: "Link",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "高级搜索",
          elType: "eleModule",
          elTagName: "GrowSearchBar",
          elIcon: "SearchBar",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "列设置",
          elType: "eleModule",
          elTagName: "GrowColumnBar",
          elIcon: "ColumnBar",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "图片",
          elType: "eleModule",
          elTagName: "GrowImage",
          elIcon: "Image",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
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
          elTagName: "GrowInput",
          elIcon: "Erase",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "数字输入框",
          elType: "eleModule",
          elTagName: "GrowInputNumber",
          elIcon: "ListNumbered",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "选择器",
          elType: "eleModule",
          elTagName: "GrowSelect",
          elIcon: "StorageRequest",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "级联选择器",
          elType: "eleModule",
          elTagName: "GrowCascader",
          elIcon: "TextIndentMore",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "开关",
          elType: "eleModule",
          elTagName: "GrowSwitch",
          elIcon: "JoinLeft",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "时间选择器",
          elType: "eleModule",
          elTagName: "GrowTimePicker",
          elIcon: "Timer",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "日期选择器",
          elType: "eleModule",
          elTagName: "GrowDatePicker",
          elIcon: "EventSchedule",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "单选",
          elType: "eleModule",
          elTagName: "GrowRadioGroup",
          elIcon: "RadioButtonChecked",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "多选",
          elType: "eleModule",
          elTagName: "GrowCheckboxGroup",
          elIcon: "CheckboxChecked",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "树形选择",
          elType: "eleModule",
          elTagName: "GrowTreeSelect",
          elIcon: "DecisionTree",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "提及",
          elType: "eleModule",
          elTagName: "GrowMention",
          elIcon: "Mention",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "上传",
          elType: "eleModule",
          elTagName: "GrowUpload",
          elIcon: "CloudUpload",
          isChild: true,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "滑块",
          elType: "eleModule",
          elTagName: "GrowSlider",
          elIcon: "Slider",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "穿梭框",
          elType: "eleModule",
          elTagName: "GrowTransfer",
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
          elTagName: "GrowForm",
          elIcon: "DataFormat",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "表单项",
          elType: "eleModule",
          elTagName: "GrowFormItem",
          elIcon: "HorizontalView",
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
          elTagName: "GrowAvatar",
          elIcon: "UserAvatar",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "徽章数",
          elType: "eleModule",
          elTagName: "GrowBadge",
          elIcon: "Badge",
          isChild: true,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "标签",
          elType: "eleModule",
          elTagName: "GrowTag",
          elIcon: "Tag",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "时间",
          elType: "eleModule",
          elTagName: "GrowTime",
          elIcon: "Time",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "文本省略",
          elType: "eleModule",
          elTagName: "GrowEllipsis",
          elIcon: "Ellipsis",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "图标",
          elType: "eleModule",
          elTagName: "GrowIconify",
          elIcon: "Iconify",
          isChild: false,
          isAdd: false,
          childName: "",
          isInlineBlock: true
        },
        {
          elName: "日历",
          elType: "eleModule",
          elTagName: "GrowCalendar",
          elIcon: "CalendarHeatMap",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "走马灯",
          elType: "eleModule",
          elTagName: "GrowCarousel",
          elIcon: "CarouselHorizontal",
          isChild: true,
          isAdd: false,
          childName: "GrowCarouselItem"
        },
        {
          elName: "分割线",
          elType: "eleModule",
          elTagName: "GrowDivider",
          elIcon: "BorderVerticleOutlined",
          isChild: false,
          isAdd: false,
          childName: ""
        },
        {
          elName: "时间线",
          elType: "eleModule",
          elTagName: "GrowTimeline",
          elIcon: "BoxPlotOutlined",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "时间项",
          elType: "eleModule",
          elTagName: "GrowTimelineItem",
          elIcon: "IdcardOutlined",
          isChild: true,
          isAdd: false,
          childName: ""
        },
        {
          elName: "树形组件",
          elType: "eleModule",
          elTagName: "GrowTree",
          elIcon: "TreeViewAlt",
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
    "GrowTabPane",
    {
      elName: "选项",
      elType: "eleModule",
      elTagName: "GrowTabPane",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "GrowCol",
    {
      elName: "布局",
      elType: "eleModule",
      elTagName: "GrowCol",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "GrowCollapseItem",
    {
      elName: "折叠项",
      elType: "eleModule",
      elTagName: "GrowCollapseItem",
      elIcon: "IdcardOutlined",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ],
  [
    "GrowCarouselItem",
    {
      elName: "走马灯项",
      elType: "eleModule",
      elTagName: "GrowCarouselItem",
      elIcon: "CarouselHorizontal",
      isChild: true,
      isAdd: false,
      childName: ""
    }
  ]
]);
