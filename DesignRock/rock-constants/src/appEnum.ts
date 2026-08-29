export enum ContentLayoutEnum {
  // auto width
  FULL = 'full',
  // fixed width
  FIXED = 'fixed',
}

// menu theme enum
export enum ThemeEnum {
  DARK = 'dark',
  LIGHT = 'light',
}

/** 全局亮暗模式（含跟随系统） */
export enum ThemeModeEnum {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum SettingButtonPositionEnum {
  AUTO = 'auto',
  HEADER = 'header',
  FIXED = 'fixed',
}

export enum SessionTimeoutProcessingEnum {
  ROUTE_JUMP,
  PAGE_COVERAGE,
}

/**
 * 权限模式（登录人角色唯一标识见 UserInfo.roles）
 */
export enum PermissionModeEnum {
  // 后端菜单
  BACK = 'BACK',
  // 前端路由表
  FRONT = 'FRONT',
  // 前后端合集（同名优先后端）
  MIXTURE = 'MIXTURE',
}

// Route switching animation
// 路由切换动画
export enum RouterTransitionEnum {
  ZOOM_FADE = 'zoom-fade',
  ZOOM_OUT = 'zoom-out',
  FADE_SIDE = 'fade-slide',
  FADE = 'fade',
  FADE_BOTTOM = 'fade-bottom',
  FADE_SCALE = 'fade-scale',
}


export type SystemLayoutType = "side" | "roof" | "mixed"

export enum SystemLayoutEnum {
  SIDE = "side",
  ROOF = "roof",
  MIXED = "mixed"
}
