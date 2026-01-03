import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 支持的语言列表
const supportedLocales = ['zhCN', 'enUS']

// 获取保存的语言设置，默认中文
const getStoredLocale = () => {
  const stored = localStorage.getItem('adminLang')
  if (stored) {
    // 转换格式: zh-CN -> zhCN
    const localeKey = stored.replace('-', '')
    // 如果不支持该语言，返回默认语言
    if (!supportedLocales.includes(localeKey)) {
      return 'zhCN'
    }
    return localeKey
  }
  return 'zhCN'
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getStoredLocale(),
  fallbackLocale: 'zhCN',
  messages: {
    zhCN,
    enUS
  }
})

// 切换语言方法
export const setLocale = (locale) => {
  // locale 格式: zh-CN -> zhCN
  const localeKey = locale.replace('-', '')
  // 如果语言不支持，使用中文
  if (!supportedLocales.includes(localeKey)) {
    i18n.global.locale.value = 'zhCN'
    localStorage.setItem('adminLang', 'zh-CN')
    return
  }
  i18n.global.locale.value = localeKey
  localStorage.setItem('adminLang', locale)
}

// 获取当前语言
export const getLocale = () => {
  return i18n.global.locale.value
}

// 导出支持的语言列表
export const getSupportedLocales = () => {
  return supportedLocales
}

export default i18n
