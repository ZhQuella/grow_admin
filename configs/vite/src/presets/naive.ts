import type { UserConfig } from 'vite';

export async function createNaivePreset(): Promise<UserConfig> {
  return {
    optimizeDeps: {
      include: ['naive-ui', 'dayjs', 'dayjs/locale/zh-cn'],
      exclude: ['vue-demi'],
    },
  };
}
