import DownExcel from "./packages/DownExcel";
import EventEmiter from "./packages//Emit";
import Storage, { createStorage, storageExample } from "./packages/Storage";
import { addEventResize, removeResizeListener } from "./packages/ElementResize";
import Request from "./packages/AxiosFactory";
import DOMEventManager from "./packages/DOMEventManager";

export {
  DownExcel,
  EventEmiter,
  createStorage,
  storageExample,
  addEventResize,
  removeResizeListener,
  Request,
  DOMEventManager
};

export default {
  DownExcel,
  EventEmiter,
  Storage,
  Request,
  DOMEventManager
};
