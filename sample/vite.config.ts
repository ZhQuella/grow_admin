import { createViteConfig } from '@grow-admin-config/vite'
import { defineConfig, type UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(async ({ command, mode }): Promise<UserConfig> => { 
  const config:UserConfig = await createViteConfig(command, mode, process.cwd(), { preset: 'ele' })
  return config;
})