/**
 * 聚合各业务包通过 registerMock 注册的 Mock。
 * 新增包时在此 import 对应的 mock/register 即可。
 * Mock 接口路径须使用 mockUrl() 生成，统一以 /mock 为前缀。
 */
import { getMockModules } from '@grow-admin-rock/mock';
import type { MockMethod } from '@grow-admin-rock/mock/types';

export default getMockModules() as MockMethod[];
