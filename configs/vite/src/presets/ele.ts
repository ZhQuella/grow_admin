import type { UserConfig } from 'vite';

export async function createElePreset(): Promise<UserConfig> {
  return {
    optimizeDeps: {
      include: [
        'element-plus/es',
        'element-plus/es/components/base/style/css',
        'dayjs',
        'dayjs/locale/zh-cn',
      ],
      exclude: ['vue-demi'],
    },
  };
}
