import * as pack from "./package.json"
import { ServiceIdentifier } from '@grow-admin-rock/ioc';
import { App, AppConfigStore, DataEventBus } from "./src";
import { Auth } from "./index";

export default{
  DefineAppConfigOptions: Symbol.for(`${pack.name}/DefineAppConfigOptions`) as ServiceIdentifier<AppConfigStore>,
  DataEventBus: Symbol.for(`${pack.name}/DataEventBus`) as ServiceIdentifier<DataEventBus>,
  AuthStore: Symbol.for(`${pack.name}/AuthStore`) as ServiceIdentifier<Auth.AuthStore>,
  AppStore: Symbol.for(`${pack.name}/AppStore`) as ServiceIdentifier<App.AppStore>,
}