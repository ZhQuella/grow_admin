import { defineStore } from 'pinia'
import { FooterLinkOptions, DefineSiteOptions } from '@grow-admin-rock/types'
import { $t } from '@grow-admin-rock/locale'
import { getAppConfig, getGlobalConfig } from '@grow-admin-rock/utils'

// const { t } = useI18n()

// @ts-ignore
const { title } = getGlobalConfig(import.meta.env)


const links: FooterLinkOptions[] = [

]

export const useSiteGeneral = defineStore({
  id: 'APP_SITE_GENERAL_OPTIONS',
  state: (): DefineSiteOptions => ({
    // TODO 解决Logo的默认读取逻辑
    // logo: defaultLogo,
    logo: '',
    // TODO 解决头像和用户名的异步读取逻辑和默认值逻辑
    // avatar: defaultAvatar,
    avatar: '',
    username: 'Randy',
    title,
    copyright: $t('sys.app.copyright'),
    links: links,
    site: getGlobalConfig(import.meta.env),
    env: getAppConfig(import.meta.env),
  }),
})
