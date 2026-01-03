import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

// 预加载大型组件的 Promise
let memberPreload = null
let adminPreload = null

// 预加载大型组件（在空闲时加载）
const preloadComponents = () => {
  const doPreload = () => {
    // 预加载 Member.vue（最大的文件）
    memberPreload = import('@/views/account/Member.vue')
    // 预加载 Admin.vue
    adminPreload = import('@/views/account/Admin.vue')
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(doPreload, { timeout: 3000 })
  } else {
    setTimeout(doPreload, 1000)
  }
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      // 账户管理
      {
        path: 'account/admin',
        name: 'AccountAdmin',
        component: () => adminPreload || import('@/views/account/Admin.vue'),
        meta: { title: '管理员' }
      },
      {
        path: 'account/member',
        name: 'AccountMember',
        component: () => memberPreload || import('@/views/account/Member.vue'),
        meta: { title: '会员列表' }
      },
      {
        path: 'account/online',
        name: 'AccountOnline',
        component: () => import('@/views/account/Online.vue'),
        meta: { title: '在线管理' }
      },
      {
        path: 'account/auth',
        name: 'AccountAuth',
        component: () => import('@/views/account/Auth.vue'),
        meta: { title: '身份认证' }
      },
      {
        path: 'account/level',
        name: 'AccountLevel',
        component: () => import('@/views/account/Level.vue'),
        meta: { title: '层级查询' }
      },
      // 等级设置
      {
        path: 'vip',
        name: 'Vip',
        component: () => import('@/views/Vip.vue'),
        meta: { title: '等级设置' }
      },
      // 交易管理
      {
        path: 'trade/order',
        name: 'TradeOrder',
        component: () => import('@/views/trade/Order.vue'),
        meta: { title: '订单列表' }
      },
      {
        path: 'trade/withdraw',
        name: 'TradeWithdraw',
        component: () => import('@/views/trade/Withdraw.vue'),
        meta: { title: '提现管理' }
      },
      {
        path: 'trade/recharge',
        name: 'TradeRecharge',
        component: () => import('@/views/trade/Recharge.vue'),
        meta: { title: '后台充值记录' }
      },
      {
        path: 'trade/crypto',
        name: 'TradeCrypto',
        component: () => import('@/views/trade/Crypto.vue'),
        meta: { title: '充币订单' }
      },
      {
        path: 'trade/fiat',
        name: 'TradeFiat',
        component: () => import('@/views/trade/Fiat.vue'),
        meta: { title: '法币转账充值' }
      },
      // 商品管理
      {
        path: 'shop/category',
        name: 'ShopCategory',
        component: () => import('@/views/shop/Category.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'shop/goods',
        name: 'ShopGoods',
        component: () => import('@/views/shop/Goods.vue'),
        meta: { title: '商品列表' }
      },
      // 系统管理
      {
        path: 'system/setting',
        name: 'SystemSetting',
        component: () => import('@/views/system/Setting.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'system/level',
        name: 'SystemLevel',
        component: () => import('@/views/system/Level.vue'),
        meta: { title: '层级设置' }
      },
      {
        path: 'system/service',
        name: 'SystemService',
        component: () => import('@/views/system/Service.vue'),
        meta: { title: '在线客服' }
      },
      {
        path: 'system/log',
        name: 'SystemLog',
        component: () => import('@/views/system/Log.vue'),
        meta: { title: '发送日志' }
      },
      {
        path: 'system/admin-log',
        name: 'AdminLog',
        component: () => import('@/views/system/AdminLog.vue'),
        meta: { title: '管理员日志' }
      },
      // 消息
      {
        path: 'message/notice',
        name: 'MessageNotice',
        component: () => import('@/views/message/Notice.vue'),
        meta: { title: '公告' }
      },
      {
        path: 'message/inbox',
        name: 'MessageInbox',
        component: () => import('@/views/message/Inbox.vue'),
        meta: { title: '站内信' }
      },
      {
        path: 'message/system',
        name: 'MessageSystem',
        component: () => import('@/views/message/System.vue'),
        meta: { title: '系统通知' }
      },
      // 前端展示
      {
        path: 'display/banner',
        name: 'DisplayBanner',
        component: () => import('@/views/display/Banner.vue'),
        meta: { title: '轮播图' }
      },
      {
        path: 'display/grid',
        name: 'DisplayGrid',
        component: () => import('@/views/display/Grid.vue'),
        meta: { title: '宫格列表' }
      },
      // 文章管理
      {
        path: 'article',
        name: 'Article',
        component: () => import('@/views/Article.vue'),
        meta: { title: '文章管理' }
      },
      // 评论
      {
        path: 'comment',
        name: 'Comment',
        component: () => import('@/views/Comment.vue'),
        meta: { title: '评论' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 后台管理` : '后台管理'

  // 登录验证
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

// 首次路由完成后预加载大型组件
router.isReady().then(() => {
  preloadComponents()
})

export default router
