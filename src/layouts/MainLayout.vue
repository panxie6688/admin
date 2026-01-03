<template>
  <a-config-provider :theme="{ algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }">
    <a-layout class="main-layout" :class="{ 'dark-mode': darkMode }">
      <!-- 顶栏（全宽，一体化渐变） -->
      <a-layout-header class="header">
        <div class="header-left">
          <!-- Logo -->
          <div class="header-logo">
            <img :src="siteSettings.logo || defaultLogo" alt="logo" class="logo-img" />
            <span class="logo-text">{{ siteSettings.siteName || 'Kinex Media' }}</span>
          </div>

          <!-- 折叠按钮 -->
          <menu-unfold-outlined
            v-if="!topMenuMode && collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-if="!topMenuMode && !collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />

          <!-- 菜单模式切换按钮 -->
          <a-tooltip :title="topMenuMode ? $t('header.switchSideMenu') : $t('header.switchTopMenu')">
            <appstore-outlined class="trigger" @click="toggleMenuMode" />
          </a-tooltip>

          <!-- 暗黑模式切换按钮 -->
          <a-tooltip :title="darkMode ? $t('header.lightMode') : $t('header.darkMode')">
            <bulb-outlined v-if="darkMode" class="trigger" @click="toggleDarkMode" />
            <bulb-filled v-else class="trigger" @click="toggleDarkMode" />
          </a-tooltip>
        </div>

        <div class="header-right">
          <!-- 语言切换 -->
          <a-dropdown :trigger="['click']">
            <a-button type="text" class="header-btn lang-btn">
              <template #icon><GlobalOutlined /></template>
              {{ currentLang.label }}
              <DownOutlined style="font-size: 10px; margin-left: 4px;" />
            </a-button>
            <template #overlay>
              <a-menu @click="handleLangChange">
                <a-menu-item
                  v-for="lang in languages"
                  :key="lang.code"
                  :class="{ 'ant-dropdown-menu-item-selected': currentLang.code === lang.code }"
                >
                  <span class="lang-flag">{{ lang.flag }}</span>
                  {{ lang.label }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-badge :count="pendingCounts.inbox" class="header-badge">
            <a-button type="text" class="header-btn" @click="goToPage('/message/inbox')">
              <template #icon><message-outlined /></template>
              {{ $t('header.message') }}
            </a-button>
          </a-badge>

          <a-badge :count="pendingCounts.order" class="header-badge">
            <a-button type="text" class="header-btn" @click="goToPage('/trade/order')">
              <template #icon><edit-outlined /></template>
              {{ $t('header.order') }}
            </a-button>
          </a-badge>

          <a-badge :count="pendingCounts.withdraw" class="header-badge">
            <a-button type="text" class="header-btn" @click="goToPage('/trade/withdraw')">
              <template #icon><wallet-outlined /></template>
              {{ $t('header.withdraw') }}
            </a-button>
          </a-badge>

          <a-button type="text" class="header-btn" @click="toggleFullscreen">
            <template #icon>
              <fullscreen-exit-outlined v-if="isFullscreen" />
              <fullscreen-outlined v-else />
            </template>
            {{ isFullscreen ? $t('header.exitFullscreen') : $t('header.fullscreen') }}
          </a-button>

          <div class="user-group">
            <a-dropdown>
              <a-button type="text" class="user-btn">
                {{ userInfo.name || '小陆' }}
                <span class="divider"></span>
                <more-outlined rotate="90" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">{{ $t('header.profile') }}</a-menu-item>
                  <a-menu-item key="password">{{ $t('header.password') }}</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" @click="handleLogout">{{ $t('header.logout') }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <!-- 顶部菜单栏（第二行） -->
      <transition name="slide-down">
        <div v-if="topMenuMode" class="top-menu-bar">
          <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="horizontal"
            :items="menuItems"
            class="top-menu"
            @click="handleMenuClick"
          />
        </div>
      </transition>

      <a-layout class="main-body">
        <!-- 侧边栏菜单 -->
        <a-layout-sider
          v-show="!topMenuMode"
          v-model:collapsed="collapsed"
          :trigger="null"
          collapsible
          :width="hideSider ? 0 : 200"
          :collapsed-width="hideSider ? 0 : 64"
          :theme="darkMode ? 'dark' : 'light'"
          class="sider"
          :class="{ 'sider-hidden': hideSider, 'sider-show': !hideSider }"
        >
          <a-menu
            v-show="!hideSider"
            v-model:selectedKeys="selectedKeys"
            v-model:openKeys="openKeys"
            mode="inline"
            :inline-collapsed="collapsed"
            :theme="darkMode ? 'dark' : 'light'"
            :items="menuItems"
            @click="handleMenuClick"
          />
        </a-layout-sider>

        <!-- 内容区 -->
        <a-layout-content class="content">
          <a-spin :spinning="pageLoading" :tip="$t('common.loading')">
            <router-view v-slot="{ Component, route }">
              <transition name="fade" mode="out-in">
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </a-spin>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, reactive, h, watch, provide, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { theme } from 'ant-design-vue'
import { setLocale } from '@/locales'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  TransactionOutlined,
  ShoppingOutlined,
  SettingOutlined,
  BellOutlined,
  DesktopOutlined,
  FileTextOutlined,
  CommentOutlined,
  MessageOutlined,
  EditOutlined,
  WalletOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownOutlined,
  AppstoreOutlined,
  BulbOutlined,
  BulbFilled,
  MoreOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue'
import defaultLogo from '@/assets/logo.svg'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const collapsed = ref(false)
const hideSider = ref(false)
const selectedKeys = ref(['home'])
const openKeys = ref([])
const topMenuMode = ref(false)
const darkMode = ref(false)
const isFullscreen = ref(false)
const pageLoading = ref(false)

const userInfo = reactive(JSON.parse(localStorage.getItem('userInfo') || '{}'))

// 待处理数量（模拟数据，实际应从后端接口获取）
const pendingCounts = reactive({
  inbox: 28,      // 未回复留言数
  order: 0,       // 待处理订单数
  withdraw: 47    // 待审核提现数
})

// 是否跳过展开菜单（用于顶部快捷按钮跳转）
const skipOpenMenu = ref(false)

// 跳转页面（不展开菜单）
const goToPage = (path) => {
  skipOpenMenu.value = true
  router.push(path)
}

// 语言列表（只显示已支持的语言）
const languages = ref([
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' }
])

// 当前语言
const currentLang = ref(
  languages.value.find(l => l.code === localStorage.getItem('adminLang')) || languages.value[0]
)

// 切换语言
const handleLangChange = ({ key }) => {
  const lang = languages.value.find(l => l.code === key)
  if (lang) {
    currentLang.value = lang
    setLocale(lang.code)
    // 触发语言变更事件，供其他组件监听
    window.dispatchEvent(new CustomEvent('langChange', { detail: lang }))
  }
}

// 网站设置
const siteSettings = reactive({
  logo: '',
  siteName: ''
})

// 加载网站设置
const loadSiteSettings = () => {
  const saved = localStorage.getItem('siteSettings')
  if (saved) {
    const data = JSON.parse(saved)
    siteSettings.logo = data.logo || ''
    siteSettings.siteName = data.siteName || ''
  }
}

// 监听网站设置更新事件
const handleSiteSettingsUpdate = (event) => {
  if (event.detail) {
    siteSettings.logo = event.detail.logo || ''
    siteSettings.siteName = event.detail.siteName || ''
  }
}

onMounted(() => {
  loadSiteSettings()
  window.addEventListener('siteSettingsUpdate', handleSiteSettingsUpdate)
})

onUnmounted(() => {
  window.removeEventListener('siteSettingsUpdate', handleSiteSettingsUpdate)
})

// 切换菜单模式
const toggleMenuMode = () => {
  topMenuMode.value = !topMenuMode.value
  localStorage.setItem('topMenuMode', topMenuMode.value)
}

// 切换暗黑模式
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 初始化设置
const initSettings = () => {
  topMenuMode.value = localStorage.getItem('topMenuMode') === 'true'
  darkMode.value = localStorage.getItem('darkMode') === 'true'
}
initSettings()

// 提供给子组件的方法
const setCollapsed = (value) => {
  hideSider.value = value
}

// 内容区全屏
const contentFullscreen = ref(false)
const toggleContentFullscreen = () => {
  contentFullscreen.value = !contentFullscreen.value
  hideSider.value = contentFullscreen.value
}

provide('setCollapsed', setCollapsed)
provide('hideSider', hideSider)
provide('topMenuMode', topMenuMode)
provide('contentFullscreen', contentFullscreen)
provide('toggleContentFullscreen', toggleContentFullscreen)

// 菜单配置
const menuItems = computed(() => [
  {
    key: 'home',
    icon: () => h(HomeOutlined),
    label: t('menu.home'),
    path: '/'
  },
  {
    key: 'account',
    icon: () => h(UserOutlined),
    label: t('menu.account'),
    children: [
      { key: 'account-admin', label: t('menu.admin'), path: '/account/admin' },
      { key: 'account-member', label: t('menu.member'), path: '/account/member' },
      { key: 'account-online', label: t('menu.online'), path: '/account/online' },
      { key: 'account-auth', label: t('menu.auth'), path: '/account/auth' },
      { key: 'account-level', label: t('menu.level'), path: '/account/level' }
    ]
  },
  {
    key: 'vip',
    icon: () => h(CrownOutlined),
    label: t('menu.vip'),
    path: '/vip'
  },
  {
    key: 'trade',
    icon: () => h(TransactionOutlined),
    label: t('menu.trade'),
    children: [
      { key: 'trade-order', label: t('menu.order'), path: '/trade/order' },
      { key: 'trade-withdraw', label: t('menu.withdraw'), path: '/trade/withdraw' },
      { key: 'trade-recharge', label: t('menu.recharge'), path: '/trade/recharge' },
      { key: 'trade-crypto', label: t('menu.crypto'), path: '/trade/crypto' },
      { key: 'trade-fiat', label: t('menu.fiat'), path: '/trade/fiat' }
    ]
  },
  {
    key: 'shop',
    icon: () => h(ShoppingOutlined),
    label: t('menu.shop'),
    children: [
      { key: 'shop-category', label: t('menu.category'), path: '/shop/category' },
      { key: 'shop-goods', label: t('menu.goods'), path: '/shop/goods' }
    ]
  },
  {
    key: 'system',
    icon: () => h(SettingOutlined),
    label: t('menu.system'),
    children: [
      { key: 'system-setting', label: t('menu.setting'), path: '/system/setting' },
      { key: 'system-level', label: t('menu.levelSetting'), path: '/system/level' },
      { key: 'system-service', label: t('menu.service'), path: '/system/service' },
      { key: 'system-log', label: t('menu.log'), path: '/system/log' },
      { key: 'system-admin-log', label: t('menu.adminLog'), path: '/system/admin-log' }
    ]
  },
  {
    key: 'message',
    icon: () => h(BellOutlined),
    label: t('menu.message'),
    children: [
      { key: 'message-notice', label: t('menu.notice'), path: '/message/notice' },
      { key: 'message-inbox', label: t('menu.inbox'), path: '/message/inbox' },
      { key: 'message-system', label: t('menu.systemMsg'), path: '/message/system' }
    ]
  },
  {
    key: 'display',
    icon: () => h(DesktopOutlined),
    label: t('menu.display'),
    children: [
      { key: 'display-banner', label: t('menu.banner'), path: '/display/banner' },
      { key: 'display-grid', label: t('menu.grid'), path: '/display/grid' }
    ]
  },
  {
    key: 'article',
    icon: () => h(FileTextOutlined),
    label: t('menu.article'),
    path: '/article'
  },
  {
    key: 'comment',
    icon: () => h(CommentOutlined),
    label: t('menu.comment'),
    path: '/comment'
  }
])

// 处理菜单点击
const handleMenuClick = ({ key }) => {
  const findPath = (items) => {
    for (const item of items) {
      if (item.key === key && item.path) {
        return item.path
      }
      if (item.children) {
        const path = findPath(item.children)
        if (path) return path
      }
    }
    return null
  }

  const path = findPath(menuItems.value)
  if (path && path !== route.path) {
    pageLoading.value = true
    router.push(path)
  }
}

// 路由导航完成后关闭 loading
router.afterEach(() => {
  pageLoading.value = false
})

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

// 监听路由变化，更新选中菜单
watch(
  () => route.path,
  (path) => {
    const findKey = (items, parentKey = null) => {
      for (const item of items) {
        if (item.path === path) {
          if (parentKey && !skipOpenMenu.value) {
            openKeys.value = [parentKey]
          }
          return item.key
        }
        if (item.children) {
          const key = findKey(item.children, item.key)
          if (key) return key
        }
      }
      return null
    }

    const key = findKey(menuItems.value)
    if (key) {
      selectedKeys.value = [key]
    }
    // 重置跳过标志
    skipOpenMenu.value = false
  },
  { immediate: true }
)

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})
</script>

<style scoped lang="less">
.main-layout {
  min-height: 100vh;

  &.dark-mode {
    background: #141414;
  }
}

.header {
  background: linear-gradient(to right, #c1edfe 0%, #ead0f7 100%);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  line-height: 64px;

  .header-left {
    display: flex;
    align-items: center;

    .header-logo {
      display: flex;
      align-items: center;
      margin-right: 32px;
      margin-left: -8px;

      .logo-img {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        margin-left: 10px;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        white-space: nowrap;
      }
    }

    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s;
      padding: 8px 12px;
      color: #666;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      border-radius: 6px;
      margin-right: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #7c4dff;
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .header-badge {
      :deep(.ant-badge-count) {
        font-size: 12px;
      }
    }

    .header-btn {
      color: #666;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      border-radius: 6px;
      padding: 4px 12px;
      height: auto;

      &:hover {
        color: #7c4dff;
        background: rgba(255, 255, 255, 0.8);
      }
    }

    .lang-btn {
      min-width: 100px;
    }

    .lang-flag {
      margin-right: 6px;
    }

    .user-group {
      display: flex;
      align-items: center;
      background: #1890ff;
      border-radius: 6px;

      .user-btn {
        display: flex;
        align-items: center;
        color: #fff;
        background: transparent;
        border-radius: 6px;
        padding: 4px 8px;
        height: auto;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.15);
        }

        .divider {
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.4);
          margin: 0 6px;
        }
      }
    }
  }
}

.dark-mode {
  .header {
    background: linear-gradient(to right, #1a237e 0%, #283593 25%, #4a148c 50%, #880e4f 100%);

    .header-left {
      .header-logo .logo-text {
        color: #b388ff;
      }

      .trigger {
        color: #ccc;
        background: rgba(255, 255, 255, 0.1);

        &:hover {
          color: #b388ff;
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .header-right {
      .header-btn {
        color: #ccc;
        background: rgba(255, 255, 255, 0.1);

        &:hover {
          color: #b388ff;
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .user-group {
        background: #1890ff;

        .user-btn {
          color: #fff;

          &:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.2);
          }

          .divider {
            background: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }
  }

  .top-menu-bar {
    background: #1f1f1f;

    .top-menu {
      :deep(.ant-menu-item),
      :deep(.ant-menu-submenu-title) {
        color: #ccc;

        &:hover {
          color: #b388ff;
        }
      }

      :deep(.ant-menu-item-selected) {
        color: #b388ff;
      }
    }
  }

  .main-body {
    .sider {
      background: #1f1f1f;

      :deep(.ant-menu) {
        background: #1f1f1f;
      }

      :deep(.ant-menu-item-selected) {
        background-color: #2d2d2d;
      }
    }

    .content {
      background: #141414;
    }
  }
}

.top-menu-bar {
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .top-menu {
    border-bottom: none;
    background: transparent;

    :deep(.ant-menu-item),
    :deep(.ant-menu-submenu-title) {
      color: #333;

      &:hover {
        color: #7c4dff;
      }
    }

    :deep(.ant-menu-item-selected) {
      color: #7c4dff;
    }

    :deep(.ant-menu-item-selected::after),
    :deep(.ant-menu-submenu-selected::after) {
      border-bottom-color: #7c4dff;
    }
  }
}

.main-body {
  height: calc(100vh - 64px);
  overflow: hidden;

  .sider {
    background: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;

    :deep(.ant-menu) {
      border-right: none;
      transition: opacity 0.2s ease;
    }

    :deep(.ant-menu-item-selected) {
      background-color: #e6f4ff;
    }

    &.sider-hidden {
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      flex: 0 0 0 !important;
      border: none !important;
      box-shadow: none !important;

      :deep(.ant-menu) {
        opacity: 0;
      }
    }
  }

  .content {
    margin: 16px;
    padding: 0;
    background: #f5f7fa;
    border-radius: 8px;
    height: calc(100vh - 64px - 32px);
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container) {
      height: 100%;
    }
  }
}

// 顶部菜单下滑动画
.slide-down-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
  max-height: 0;
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 60px;
}

.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 60px;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
  max-height: 0;
}

// 路由切换动画
.fade-enter-active {
  transition: all 0.12s ease-out;
}

.fade-leave-active {
  transition: all 0.08s ease-in;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
