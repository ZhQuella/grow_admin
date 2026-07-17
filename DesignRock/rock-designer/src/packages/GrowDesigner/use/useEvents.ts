import type { Ref } from "vue";
import { specificComponent } from "../static/moduleMap";
import { nanoid } from "nanoid";
import {
  getAllChilds,
  deleteByUUID,
  findArrayByUUID,
  findParentByUUID,
  findByUUID,
  updateUUIDs,
  deepCloneDesigner
} from '@grow-admin-rock/utils';

interface props {
  draggableConfig: any;
  activeUUID: Ref<string>;
}

export const useEvents = ({ draggableConfig, activeUUID }: props) => {
  const onActivated = (uuid: string) => {
    activeUUID.value = uuid;
  };

  const onGenerateKey = (list, index) => {
    console.log(list, index);
  };

  const onActiveNode = ({ uuid }) => {
    activeUUID.value = uuid;
  };

  const setChildren = (isChild: boolean, structure: any, children: any[]): any => {
    if (isChild) {
      structure.children = children && children.length ? children : [];
    }
    return structure;
  };

  const getIsChild = (obj1: any = {}, obj2: any = {}): boolean => {
    return Boolean(obj1.isChild || obj2.isChild);
  };

  const onDraggableViewAdd = ({ event, list }) => {
    const newIndex = event.newIndex
    const config = list[newIndex]
    if (!config) return

    const uuid = config.uuid || nanoid()
    const { children, uuid: _u, ...otherConfig } = { ...config, uuid }
    const renderArgument = { ...otherConfig }
    const isChild: boolean = getIsChild(renderArgument, draggableConfig.renderArgument[uuid])
    const structure = setChildren(isChild, { uuid }, children)
    list[newIndex] = structure
    draggableConfig.renderArgument[uuid] = {
      ...renderArgument,
      ...(draggableConfig.renderArgument[uuid] || {}),
    }
    const styleSeed: Record<string, string> = {}
    const isInline =
      renderArgument.isInlineBlock || draggableConfig.renderArgument[uuid]?.isInlineBlock
    if (isInline) {
      Object.assign(styleSeed, {
        display: 'inline-block',
        'min-width': '80px',
        'min-height': '36px',
      })
    }
    if (renderArgument.elTagName === 'img') {
      Object.assign(styleSeed, {
        width: '120px',
        height: '80px',
        'object-fit': 'cover',
      })
    }
    if (renderArgument.elTagName === 'BasicTitle') {
      Object.assign(styleSeed, {
        width: '100%',
        'min-height': '48px',
      })
    }
    if (renderArgument.elTagName === 'p') {
      Object.assign(styleSeed, {
        width: '100%',
        'min-height': '40px',
      })
    }
    if (renderArgument.elTagName === 'span') {
      Object.assign(styleSeed, {
        'min-height': '36px',
        'min-width': '96px',
      })
    }
    draggableConfig.styles[uuid] = {
      ...styleSeed,
      ...(draggableConfig.styles[uuid] || {}),
    }
    draggableConfig.events[uuid] = draggableConfig.events[uuid] || {}
    const defaultProps: Record<string, any> = {}
    if (renderArgument.elTagName === 'BasicTitle') {
      Object.assign(defaultProps, { level: 'h3', context: '标题文本' })
    }
    if (renderArgument.elTagName === 'p') {
      Object.assign(defaultProps, { context: '正文内容' })
    }
    if (renderArgument.elTagName === 'span') {
      Object.assign(defaultProps, { context: '短语文本' })
    }
    if (renderArgument.elTagName === 'GrowButton') {
      Object.assign(defaultProps, { content: '按钮', type: 'primary' })
    }
    if (renderArgument.elTagName === 'GrowLink') {
      Object.assign(defaultProps, {
        content: '链接文字',
        type: 'primary',
        href: '#',
        underline: true,
      })
    }
    if (renderArgument.elTagName === 'img') {
      Object.assign(defaultProps, {
        src: 'https://via.placeholder.com/120x80',
        alt: '图片',
      })
    }
    draggableConfig.props[uuid] = {
      ...defaultProps,
      ...(draggableConfig.props[uuid] || {}),
    }
  }

  const onSpecialAdd = ({ structure, renderArgument }) => {
    const uuid = nanoid();
    const { childName } = renderArgument;
    const childRenderArgument = specificComponent.get(childName);
    const isChild = childRenderArgument?.isChild;
    const child = { uuid };
    isChild && Reflect.set(child, "children", []);
    draggableConfig.renderArgument[uuid] = { ...(childRenderArgument || {}) };
    draggableConfig.renderArgument[uuid] = {
      ...renderArgument,
      ...draggableConfig.renderArgument[uuid]
    };
    draggableConfig.styles[uuid] = draggableConfig.styles[uuid] || {};
    draggableConfig.events[uuid] = draggableConfig.events[uuid] || {};
    draggableConfig.props[uuid] = draggableConfig.props[uuid] || {};
    structure.children.push(child);
  };

  const onDeleteItem = (event) => {
    const result = getAllChilds([event]);
    const uuids: string[] = result.map((el) => el.uuid);
    for (let i = 0, item; (item = uuids[i++]); ) {
      Reflect.deleteProperty(draggableConfig.styles, item);
      Reflect.deleteProperty(draggableConfig.props, item);
      Reflect.deleteProperty(draggableConfig.events, item);
      Reflect.deleteProperty(draggableConfig.renderArgument, item);
    }
    draggableConfig.structures = deleteByUUID(draggableConfig.structures, event.uuid);
    activeUUID.value = "";
  };

  const copyObjectConfig = (oldUUID) => {
    const uuid = nanoid();
    let optionsMap = ["styles", "props", "events", "renderArgument"];
    for (let i = 0, key; (key = optionsMap[i++]); ) {
      let obj = draggableConfig[key][oldUUID];
      draggableConfig[key][uuid] = deepCloneDesigner(obj);
    }
    return uuid;
  };

  const onCopyItem = (event) => {
    const { uuid } = event;
    const result = findArrayByUUID(draggableConfig.structures, uuid);
    const parent = findParentByUUID(draggableConfig.structures, uuid);
    const currnet = findByUUID(draggableConfig.structures, uuid);
    const cResult: any[] = deepCloneDesigner(currnet);
    const structure: any[] = updateUUIDs(cResult, copyObjectConfig);
    const index = result.findIndex((elem) => elem.uuid === uuid);
    if (parent) {
      parent.children.splice(index + 1, 0, structure);
    } else {
      draggableConfig.structures.splice(index + 1, 0, structure);
    }
  };

  const onClearCanvas = () => {
    if (!draggableConfig.structures.length) return
    draggableConfig.structures = []
    draggableConfig.renderArgument = {}
    draggableConfig.styles = {}
    draggableConfig.events = {}
    draggableConfig.props = {}
    activeUUID.value = ''
  }

  return {
    onSpecialAdd,
    onDraggableViewAdd,
    onGenerateKey,
    onActivated,
    onDeleteItem,
    onCopyItem,
    onActiveNode,
    onClearCanvas,
  };
};
