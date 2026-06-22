import { type ServiceIdentifier, diKT } from '@grow-admin-rock/ioc';
import { Beans, type GlobConfig } from '@grow-admin-rock/types';

/**
 * 全局配置获取（配置文件）
 */
export const useGlobConfig = () => {
  return diKT(Beans.GlobConfig as ServiceIdentifier<GlobConfig>)
};
