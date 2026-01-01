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
          <a-tooltip :title="topMenuMode ? '切换侧边菜单' : '切换顶部菜单'">
            <appstore-outlined class="trigger" @click="toggleMenuMode" />
          </a-tooltip>

          <!-- 暗黑模式切换按钮 -->
          <a-tooltip :title="darkMode ? '切换亮色模式' : '切换暗黑模式'">
            <bulb-outlined v-if="darkMode" class="trigger" @click="toggleDarkMode" />
            <bulb-filled v-else class="trigger" @click="toggleDarkMode" />
          </a-tooltip>
        </div>

        <div class="header-right">
          <a-badge :count="28" class="header-badge">
            <a-button type="text" class="header-btn">
              <template #icon><message-outlined /></template>
              留言
            </a-button>
          </a-badge>

          <a-button type="text" class="header-btn">
            <template #icon><edit-outlined /></template>
            订单
          </a-button>

          <a-badge :count="48" class="header-badge">
            <a-button type="text" class="header-btn">
              <template #icon><wallet-outlined /></template>
              提现
            </a-button>
          </a-badge>

          <a-button type="text" class="header-btn" @click="toggleFullscreen">
            <template #icon>
              <fullscreen-exit-outlined v-if="isFullscreen" />
              <fullscreen-outlined v-else />
            </template>
            {{ isFullscreen ? '退出全屏' : '打开全屏' }}
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
                  <a-menu-item key="profile">个人信息</a-menu-item>
                  <a-menu-item key="password">修改密码</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
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
          <a-spin :spinning="pageLoading" tip="加载中...">
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
import { ref, reactive, h, watch, provide, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { theme } from 'ant-design-vue'
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
  MoreOutlined
} from '@ant-design/icons-vue'
import defaultLogo from '@/assets/logo.svg'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const hideSider = ref(false)
const selectedKeys = ref(['home'])
const openKeys = ref([])
const topMenuMode = ref(false)
const darkMode = ref(false)
const isFullscreen = ref(false)
const pageLoading = ref(false)

const userInfo = reactive(JSON.parse(localStorage.getItem('userInfo') || '{}'))

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
const menuItems = [
  {
    key: 'home',
    icon: () => h(HomeOutlined),
    label: '首页',
    path: '/'
  },
  {
    key: 'account',
    icon: () => h(UserOutlined),
    label: '账户管理',
    children: [
      { key: 'account-admin', label: '管理员', path: '/account/admin' },
      { key: 'account-member', label: '会员列表', path: '/account/member' },
      { key: 'account-online', label: '在线管理', path: '/account/online' },
      { key: 'account-auth', label: '身份认证', path: '/account/auth' },
      { key: 'account-level', label: '层级查询', path: '/account/level' }
    ]
  },
  {
    key: 'vip',
    icon: () => h(CrownOutlined),
    label: '等级设置',
    path: '/vip'
  },
  {
    key: 'trade',
    icon: () => h(TransactionOutlined),
    label: '交易管理',
    children: [
      { key: 'trade-order', label: '订单列表', path: '/trade/order' },
      { key: 'trade-withdraw', label: '提现管理', path: '/trade/withdraw' },
      { key: 'trade-recharge', label: '后台充值记录', path: '/trade/recharge' },
      { key: 'trade-crypto', label: '充币订单', path: '/trade/crypto' },
      { key: 'trade-fiat', label: '法币转账充值', path: '/trade/fiat' }
    ]
  },
  {
    key: 'shop',
    icon: () => h(ShoppingOutlined),
    label: '商品管理',
    children: [
      { key: 'shop-category', label: '分类管理', path: '/shop/category' },
      { key: 'shop-goods', label: '商品列表', path: '/shop/goods' }
    ]
  },
  {
    key: 'system',
    icon: () => h(SettingOutlined),
    label: '系统管理',
    children: [
      { key: 'system-setting', label: '系统设置', path: '/system/setting' },
      { key: 'system-level', label: '层级设置', path: '/system/level' },
      { key: 'system-service', label: '在线客服', path: '/system/service' },
      { key: 'system-log', label: '发送日志', path: '/system/log' }
    ]
  },
  {
    key: 'message',
    icon: () => h(BellOutlined),
    label: '消息',
    children: [
      { key: 'message-notice', label: '公告', path: '/message/notice' },
      { key: 'message-inbox', label: '站内信', path: '/message/inbox' },
      { key: 'message-system', label: '系统通知', path: '/message/system' }
    ]
  },
  {
    key: 'display',
    icon: () => h(DesktopOutlined),
    label: '前端展示',
    children: [
      { key: 'display-banner', label: '轮播图', path: '/display/banner' },
      { key: 'display-grid', label: '宫格列表', path: '/display/grid' }
    ]
  },
  {
    key: 'article',
    icon: () => h(FileTextOutlined),
    label: '文章管理',
    path: '/article'
  },
  {
    key: 'comment',
    icon: () => h(CommentOutlined),
    label: '评论',
    path: '/comment'
  }
]

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

  const path = findPath(menuItems)
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
          if (parentKey) {
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

    const key = findKey(menuItems)
    if (key) {
      selectedKeys.value = [key]
    }
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
