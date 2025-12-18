# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 最后更新: 2025-12-18

---

## 一、快速命令

```bash
npm run dev      # 启动开发服务器 http://localhost:3000
npm run build    # 生产环境构建
npm run preview  # 预览生产构建
```

---

## 二、技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.0 | 前端框架 (Composition API + `<script setup>`) |
| Vite | - | 构建工具 |
| Ant Design Vue | 4.1.0 | UI 组件库 |
| Pinia | 2.1.7 | 状态管理（已安装未使用） |
| Vue Router | 4.2.5 | 路由管理 |
| Axios | 1.6.0 | HTTP 客户端 |
| Less | - | CSS 预处理器 |
| Dayjs | 1.11.10 | 日期处理 |

---

## 三、完整目录结构

```
admin/
├── package.json                      # 项目依赖配置
├── vite.config.js                    # Vite 构建配置（API代理: /api → localhost:8080）
├── index.html                        # HTML 入口
├── CLAUDE.md                         # 本文档
│
└── src/
    ├── main.js                       # 应用入口，注册 Pinia/Router/AntDesignVue
    ├── App.vue                       # 根组件，设置中文国际化 (zh_CN)
    │
    ├── assets/
    │   └── styles/
    │       └── global.less           # 全局样式
    │
    ├── router/
    │   └── index.js                  # 路由配置（28条路由 + 认证守卫）
    │
    ├── layouts/
    │   └── MainLayout.vue            # 主布局（侧边/顶部菜单 + 暗黑模式 + 全屏）
    │
    ├── components/
    │   └── PhoneCodeSelect.vue       # 国家区号选择器（200+国家）
    │
    ├── utils/
    │   └── phoneCode.js              # 手机区号数据 + 工具函数
    │
    └── views/                        # 页面组件（25个）
        ├── Home.vue                  # 首页（数据总览仪表盘）
        ├── Login.vue                 # 登录页（模拟登录）
        ├── Vip.vue                   # VIP等级设置
        ├── Article.vue               # 文章管理
        ├── Comment.vue               # 评论管理
        │
        ├── account/                  # 账户管理模块
        │   ├── Admin.vue             # 管理员列表
        │   ├── Member.vue            # 会员列表（核心复杂页面，2000+行）
        │   ├── Auth.vue              # 身份认证审核
        │   ├── Level.vue             # 层级查询
        │   └── Online.vue            # 在线用户管理
        │
        ├── trade/                    # 交易管理模块
        │   ├── Order.vue             # 订单列表
        │   ├── Withdraw.vue          # 提现管理
        │   ├── Recharge.vue          # 后台充值记录
        │   ├── Crypto.vue            # 充币订单（加密货币）
        │   └── Fiat.vue              # 法币转账充值
        │
        ├── shop/                     # 商品管理模块
        │   ├── Category.vue          # 分类管理
        │   └── Goods.vue             # 商品列表
        │
        ├── system/                   # 系统管理模块
        │   ├── Setting.vue           # 系统设置
        │   ├── Level.vue             # 层级设置
        │   ├── Service.vue           # 在线客服配置
        │   └── Log.vue               # 发送日志
        │
        ├── message/                  # 消息管理模块
        │   ├── Notice.vue            # 公告管理
        │   ├── Inbox.vue             # 站内信
        │   └── System.vue            # 系统通知
        │
        └── display/                  # 前端展示模块
            ├── Banner.vue            # 轮播图管理
            └── Grid.vue              # 宫格列表管理
```

---

## 四、路由配置

### 4.1 认证守卫

```javascript
// src/router/index.js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')    // 无token重定向登录
  } else if (to.path === '/login' && token) {
    next('/')         // 已登录跳转首页
  } else {
    next()
  }
})
```

### 4.2 路由模块

| 模块 | 路径前缀 | 页面 |
|------|---------|------|
| 账户管理 | `/account/` | admin, member, online, auth, level |
| 交易管理 | `/trade/` | order, withdraw, recharge, crypto, fiat |
| 商品管理 | `/shop/` | category, goods |
| 系统管理 | `/system/` | setting, level, service, log |
| 消息管理 | `/message/` | notice, inbox, system |
| 前端展示 | `/display/` | banner, grid |
| 其他 | `/` | vip, article, comment |

---

## 五、核心组件详解

### 5.1 MainLayout.vue - 主布局

**功能特性**：
- 菜单模式切换：侧边栏 ↔ 顶部水平菜单
- 暗黑模式：亮色/暗黑主题切换
- 全屏功能：浏览器全屏 / 内容区全屏
- 响应式侧边栏：可折叠

**Provide/Inject 通信**：
```javascript
provide('setCollapsed', setCollapsed)           // 侧边栏折叠控制
provide('hideSider', hideSider)                 // 侧边栏显示状态
provide('topMenuMode', topMenuMode)             // 菜单模式
provide('contentFullscreen', contentFullscreen) // 内容全屏状态
provide('toggleContentFullscreen', fn)          // 切换内容全屏
```

**Header 渐变色**：
- 亮色：`#c1edfe → #ead0f7`
- 暗黑：`#1a237e → #4a148c → #880e4f`

### 5.2 Member.vue - 会员列表（核心复杂页面）

**项目中最复杂的页面，约2000+行代码**

**表格特点**：
- 30+ 列，多级表头分组（蓝色=当前用户、红色=上级用户、绿色=登录信息）
- 4个状态开关列（账户/交易/提现/评论）
- 520px 固定右侧操作列

**20+ 个操作弹窗/抽屉**：
- VIP等级、备注、信用积分、邀请码编辑
- 余额上下分、连单管理、财务日志
- 钱包地址、提取资料、密码修改
- 上级/邀请码/VIP等级修改
- 登录验证、实名信息、认证状态
- 禁用开关（账户/交易/提现/评论）
- 订单列表、赠送记录

### 5.3 PhoneCodeSelect.vue - 国家区号选择器

**Props**：
```javascript
modelValue: String              // v-model 绑定值
placeholder: String = '请选择区号'
disabled: Boolean = false
allowClear: Boolean = false
size: String = 'middle'         // small | middle | large
width: String = '100%'
showFlag: Boolean = false       // 显示国旗 Emoji
```

**Value 格式**：`区号-英文国名`（如 `86-China`）

**工具函数** (`src/utils/phoneCode.js`)：
```javascript
export const phoneCodeOptions = [...]                          // 200+ 国家数据
export const filterPhoneCodeOption = (input, option) => {...}  // 搜索过滤
export const getPhoneCode = (value) => {...}                   // 提取区号
export const getPhoneCountry = (value) => {...}                // 获取国家信息
```

---

## 六、数据存储

**当前状态**：使用 localStorage 模拟，无真实后端

| Key | 用途 |
|-----|------|
| `token` | 登录令牌 |
| `userInfo` | 用户信息 JSON |
| `topMenuMode` | 菜单模式（true=顶部） |
| `darkMode` | 暗黑模式开关 |

---

## 七、开发注意事项

### 7.1 表格密度切换实现方式

**重要**: 本项目的表格密度切换**不依赖** Ant Design Vue 的 `size` 属性，而是通过 **CSS 类** 控制。

**实现原理**:
```vue
<!-- 在容器上绑定动态类 -->
<div class="page-container" :class="`size-${tableSize}`">
  <a-table :size="tableSize" ... />
</div>
```

```less
// CSS 通过类名控制 padding
&.size-default :deep(.ant-table) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 16px 8px;
  }
}

&.size-middle :deep(.ant-table) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 12px 8px;
  }
}

&.size-small :deep(.ant-table) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px 4px;
  }
}
```

**为什么这样做**: 项目中已有自定义的表格样式（固定 padding），会覆盖 Ant Design 的 `size` 属性效果。必须同时：
1. 在容器上添加 `size-xxx` 类
2. 通过 CSS 手动控制对应的 padding 值

**新增表格页面时**: 必须在表格外层容器添加 `:class="`size-${tableSize}`"` 并添加对应 CSS 样式。

### 7.2 路径别名

`@` 别名指向 `src/` 目录

### 7.3 API 代理

开发服务器将 `/api` 请求代理到 `http://localhost:8080`

---

## 八、快速定位表

| 需要修改 | 文件位置 |
|---------|---------|
| 添加新路由 | `src/router/index.js` |
| 修改布局/菜单 | `src/layouts/MainLayout.vue` |
| 修改首页 | `src/views/Home.vue` |
| 修改登录 | `src/views/Login.vue` |
| 修改会员管理 | `src/views/account/Member.vue` |
| 添加全局样式 | `src/assets/styles/global.less` |
| 添加公共组件 | `src/components/` |
| 添加工具函数 | `src/utils/` |
| 添加 API 接口 | `src/api/`（待创建） |
| 添加 Store | `src/stores/`（待创建） |

---

## 九、代码审查报告

> 审查日期: 2025-12-18

### 9.1 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 项目结构 | ★★★★☆ | 清晰但可增加更多目录 |
| 代码质量 | ★★★★☆ | 规范但缺少 TypeScript |
| 安全性 | ★★★☆☆ | 需完善认证机制 |
| 性能 | ★★★★☆ | 基础优化到位 |
| 可维护性 | ★★★★☆ | 模块化良好 |

**综合评分**: ★★★★☆ (4/5)

### 9.2 优点

- 模块划分清晰，按业务功能分组
- 统一使用 `<script setup>` 语法
- Props 定义包含类型和默认值
- 路由懒加载 + 完整的认证守卫
- 使用 Less 预处理器 + scoped 样式隔离
- MainLayout 功能丰富（暗黑模式、菜单切换、全屏）

### 9.3 安全问题

| 级别 | 问题描述 | 位置 |
|------|----------|------|
| **中** | 使用模拟登录，Token 为硬编码字符串 | `Login.vue:77` |
| **中** | localStorage 存储敏感信息无加密 | `Login.vue:78` |
| **低** | 未实现 Token 过期刷新机制 | 路由守卫 |

### 9.4 页面完成状态

| 页面 | 状态 | 说明 |
|------|------|------|
| MainLayout | 🟢 完成 | 功能完整 |
| Login | 🟡 模拟 | 需对接真实接口 |
| Home | 🟡 静态 | 需对接统计接口 |
| Member | 🟢 完成 | 功能完整（2000+行） |
| 其他页面 | 🔴 骨架 | 需逐步实现 |

### 9.5 缺失功能清单

- [ ] API 请求封装 (创建 `src/api/` 目录)
- [ ] 全局状态管理 (创建 `src/stores/` 目录)
- [ ] 错误边界处理
- [ ] 国际化支持 (i18n)
- [ ] 单元测试
- [ ] ESLint + Prettier 配置
- [ ] 路由权限控制 (role-based access)

---

## 十、待改进项（优先级排序）

| 优先级 | 问题 | 建议 |
|--------|------|------|
| **高** | 登录使用模拟数据 | 对接真实后端 API |
| **高** | 缺少 API 封装 | 创建 `src/api/` 目录，封装 Axios |
| **中** | Pinia 未实际使用 | 创建 `src/stores/` 管理全局状态 |
| **中** | 缺少 TypeScript | 考虑迁移到 TS 提升类型安全 |
| **中** | Member.vue 过于复杂 | 拆分为多个子组件 |
| **中** | Token 安全问题 | 使用 httpOnly Cookie 或加密存储 |
| **低** | 无 ESLint/Prettier | 添加代码规范配置 |
| **低** | 缺少加载进度条 | 添加 NProgress |

---

## 十一、Member.vue 新增功能详解

> 更新日期: 2025-12-19

### 11.1 赠送记录功能（更多菜单）

位置：会员列表 → 更多 → 赠送记录

**包含组件**：

| 组件 | 触发方式 | 功能说明 |
|------|---------|---------|
| 后台充值记录页面 | 点击"赠送记录" | 全屏覆盖式页面，显示充值记录表格 |
| 后台充值-创建抽屉 | 点击"添加数据" | 创建新的充值记录 |
| 后台充值-筛选抽屉 | 点击"更多搜索" | 筛选充值记录 |
| 财务日志抽屉 | 点击"财务"按钮 | 查看财务日志 |
| 继续操作 | 点击"继续"按钮 | 复用创建抽屉，显示可用/冻结数量 |

**后台充值-创建抽屉字段**：
```javascript
const addGiftRecordDrawer = reactive({
  visible: false,
  memberUid: '',           // 会员UID
  type: 'add',             // 方式: add(增加) / sub(扣减)
  amount: '',              // 数量
  remark: '',              // 说明(选填)
  availableAmount: null,   // 可用数量(继续操作时显示)
  frozenAmount: null       // 冻结数量(继续操作时显示)
})
```

**后台充值-筛选抽屉字段**：
```javascript
const giftRecordSearchDrawer = reactive({
  visible: false,
  status: undefined,       // 状态: 全部/扣减/增加
  memberId: '',            // 会员ID
  startTime: null,         // 开始时间
  endTime: null,           // 结束时间
  keyword: '',             // 搜索关键词
  sortField: 'time',       // 排序字段: 全部/数量/时间
  sortType: 'desc'         // 排序类型: 全部/降序/升序
})
```

### 11.2 下级用户层级页面（更多菜单）

位置：会员列表 → 更多 → 下级用户

**功能特点**：
- 全屏覆盖式页面（`position: absolute`，不覆盖左侧菜单）
- 树形层级结构展示（支持多级嵌套）
- 工具栏：竖向布局开关、是否往上查询开关、会员UID搜索
- 右上角：刷新、关闭、全屏按钮

**状态数据**：
```javascript
const subUsersModal = reactive({
  visible: false,
  record: null,
  isVertical: true,      // 竖向布局
  isUpQuery: false,      // 是否往上查询
  searchUid: '',         // 搜索UID
  treeData: null,        // 树形数据
  isFullscreen: false    // 全屏状态
})
```

**树形数据结构**：
```javascript
{
  id: '1-16267817514',
  count: 6,              // 下级人数
  children: [
    {
      id: '1-3213438096',
      count: 1,
      children: [...]
    }
  ]
}
```

### 11.3 相关样式类

| 样式类 | 用途 |
|-------|------|
| `.gift-record-page` | 赠送记录页面容器 |
| `.add-gift-record-drawer` | 后台充值-创建抽屉 |
| `.gift-record-search-form` | 筛选抽屉表单 |
| `.gift-record-finance-content` | 财务日志抽屉 |
| `.sub-users-page` | 下级用户层级页面 |
| `.tree-container.vertical` | 树形结构竖向布局 |

---

## 十二、Online.vue 密度切换

> 更新日期: 2025-12-19

在线管理页面已支持表格密度切换：

```vue
<div class="online-container" :class="`size-${tableSize}`">
```

**密度样式**：
- `size-large`: padding 16px（默认）
- `size-middle`: padding 12px（中等）
- `size-small`: padding 8px（紧凑）

---

*本文档由 Claude Code 维护，用于快速了解和开发项目*
*最后更新: 2025-12-19*
