import { createAppMockServer } from '@grow-admin-rock/mock';

const modules = import.meta.glob('@/mock/**/*.ts', { eager: true });

export const setupProdMockServer = () => createAppMockServer(modules);
