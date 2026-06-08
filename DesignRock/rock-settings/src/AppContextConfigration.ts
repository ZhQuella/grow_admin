import { Ref } from "vue"
import { AppStatus } from "./AppStatus"
/**
 * @description: App context configuration
 */
export interface AppContextConfigration {
  appStatus: AppStatus
  appSetting: Ref<boolean>
}

export const createAppContextConfigration = (context: AppContextConfigration) => {
  return {

  }
}