/**
 * UnoCSS 主题色与 shortcuts，值均引用 rock-styles CSS 变量，便于全局复用。
 */
export const unocssThemeColors = {
  primary: 'var(--primary-color)',
  layout: 'var(--layout-container-background-color)',
  component: 'var(--component-background-color)',
  text: 'var(--text-color)',
  'text-secondary': 'var(--text-color-secondary)',
  border: 'var(--layout-border-color)',
  success: 'var(--success-color)',
  error: 'var(--error-color)',
  warning: 'var(--warning-color)',
  'primary-a04': 'var(--color-primary-a04)',
  'primary-a06': 'var(--color-primary-a06)',
  'primary-a08': 'var(--color-primary-a08)',
  'primary-a10': 'var(--color-primary-a10)',
  'primary-a12': 'var(--color-primary-a12)',
  'primary-a16': 'var(--color-primary-a16)',
  'primary-a28': 'var(--color-primary-a28)',
  'primary-a35': 'var(--color-primary-a35)',
  'login-brand-badge': 'var(--login-brand-badge-bg)',
  'login-brand-badge-border': 'var(--login-brand-badge-border)',
  'login-brand-text': 'var(--login-brand-text)',
  'login-brand-text-muted': 'var(--login-brand-text-muted)',
  'login-brand-text-soft': 'var(--login-brand-text-soft)',
  'accent-indigo-500': 'var(--accent-indigo-500)',
  'accent-indigo-600': 'var(--accent-indigo-600)',
} as const

export const unocssThemeBoxShadow = {
  card: 'var(--card-shadow)',
  'login-logo': 'var(--login-card-logo-shadow)',
} as const

export const unocssColorShortcuts = {
  'flex-center': 'flex justify-center items-center',
  'grid-center': 'grid place-content-center',
  'surface-panel': 'bg-component border border-border rounded-lg',
  'text-muted': 'text-text-secondary',
} as const
