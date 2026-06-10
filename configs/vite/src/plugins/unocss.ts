/**
 * The instant on-demand atomic CSS engine.
 * @see https://github.com/unocss/unocss
 * @see https://github.com/action-hong/unocss-preset-scrollbar
 */

import Unocss from 'unocss/vite'
import Inspect from 'vite-plugin-inspect'
import { entriesToCss, type Preset, type Preflight, type UserConfig, presetAttributify, presetIcons, presetMini, presetUno, defineConfig } from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'


function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

type CssProperties = Record<string, string | Record<string, string>>

function cssObjectToString(obj: Record<string, CssProperties>) {
  return Object.entries(obj)
    .map(([selector, body]) => {
      if (selector.startsWith('@')) {
        const inner = Object.entries(body)
          .map(([key, val]) => `${key}{${entriesToCss(Object.entries(val as Record<string, string>))}}`)
          .join('')
        return `${selector}{${inner}}`
      }
      return `${selector}{${entriesToCss(Object.entries(body as Record<string, string>))}}`
    })
    .join('\n')
}

function createEnterPreflight(maxOutput = 20): Preflight {
  const createCss = (index: number, d = 'x') => {
    const upd = d.toUpperCase()
    return {
      [`*> .enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(50px) translateZ(0)`,
      },
      [`*> .-enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(-50px) translateZ(0)`,
      },
      [`* > .enter-${d}:nth-child(${index}),* > .-enter-${d}:nth-child(${index})`]: {
        'z-index': `${10 - index}`,
        opacity: '0',
        animation: `enter-${d}-animation 0.4s ease-in-out 0.3s`,
        'animation-fill-mode': 'forwards',
        'animation-delay': `${index / 10}s`,
      },
    }
  }

  return {
    getCSS() {
      const addRawCss: Record<string, CssProperties> = {}
      for (let index = 1; index < (maxOutput + 1); index++) {
        Object.assign(addRawCss, createCss(index, 'x'), createCss(index, 'y'))
      }
      Object.assign(addRawCss, {
        '@keyframes enter-x-animation': {
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        '@keyframes enter-y-animation': {
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      })
      return cssObjectToString(addRawCss)
    },
  }
}


/**
 * 创建Vite插件
 * 
 * @returns 
 */
export function configUnocssPlugin() {
  return [Unocss(configUnocss()), Inspect({
    build: true,
    outputDir: '.vite-inspect'
  })]
}

/**
 * 生成 unocss 配置
 * @param presets 
 * @returns 
 */
export const configUnocss = (
  presets: Preset[] = [
    presetUno(), 
    presetIcons(), 
    presetMini({ dark: 'class' }), 
    presetAttributify(),
    presetScrollbar()
  ]
) => {
  return {
    exclude: ['node_modules', '.git', 'dist'],
    presets,
    preflights: [createEnterPreflight(30)],
    shortcuts: {
      'flex-center': 'flex justify-center items-center',
      'grid-center': 'grid place-content-center',
      'surface-panel': 'bg-component border border-border rounded-lg',
      'text-muted': 'text-text-secondary',
    },
    theme: {
      colors: {
        primary: 'var(--primary-color)',
        layout: 'var(--layout-container-background-color)',
        component: 'var(--component-background-color)',
        text: 'var(--text-color)',
        'text-secondary': 'var(--text-color-secondary)',
        border: 'var(--layout-border-color)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
      backgroundColor: {},
      transitionProperty: [],
    },
  }
}

/**
 * 创建Unocss配置
 * @param command 
 * @param mode 
 * @param cwd 
 * @param param3 
 * @returns 
 */
export const createUnocssConfig = (
  presets?: Preset[]
): UserConfig => {
  return defineConfig(configUnocss(presets))
}