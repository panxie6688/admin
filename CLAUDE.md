# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 最后更新: 2025-12-25

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
| TinyMCE | 7.x (CDN) | 富文本编辑器 |

---

## 三、完整目录结构

```
admin/
├── package.json                      # 项目依赖配置
├── vite.config.js                    # Vite 构建配置（API代理: /api → localhost:8080）
├── index.html                        # HTML 入口
├── CLAUDE.md                         # 本文档
│
├── public/
│   └── tinymce/
│       └── langs/
│           └── zh_CN.js              # TinyMCE 中文语言包
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
    │   ├── PhoneCodeSelect.vue       # 国家区号选择器（200+国家）
    │   └── RichTextEditor.vue        # 富文本编辑器（TinyMCE封装）
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

### 5.4 RichTextEditor.vue - 富文本编辑器

**基于 TinyMCE 7.x 封装的全局富文本编辑器组件**

**Props**：
```javascript
modelValue: String = ''           // v-model 绑定值（HTML内容）
placeholder: String = '请输入内容'  // 占位文本
height: String|Number = '100%'    // 编辑器高度
menubar: Boolean|String = 'file edit view insert format tools table help'  // 菜单栏
statusbar: Boolean = true         // 是否显示状态栏
```

**使用示例**：
```vue
<template>
  <RichTextEditor
    v-model="content"
    placeholder="请输入内容（en-us）"
    height="400px"
  />
</template>

<script setup>
import RichTextEditor from '@/components/RichTextEditor.vue'
import { ref } from 'vue'

const content = ref('')
</script>
```

**功能特性**：
- 中文界面（语言包：`/tinymce/langs/zh_CN.js`）
- 双行工具栏（toolbar_mode: wrap）
- 本地图片上传（点击图片按钮打开文件选择器）
- 内置插件：表格、代码、表情、链接、图片、媒体、全屏等

**TinyMCE API Key**：
```javascript
const apiKey = 'gi9o0q815ws4m9zlu3e37k1txaet5yi5u9r6a47bticec4zl'
```

**图片上传**：
编辑器使用 `file_picker_callback` 实现本地图片选择，将图片转为 Base64 嵌入内容。

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

## 十三、Vip.vue VIP等级设置

> 更新日期: 2025-12-20

### 13.1 页面功能

VIP等级设置页面，包含等级列表和编辑功能。

**主要功能**：
- VIP等级列表（带合并表头）
- 添加/编辑VIP等级（抽屉）
- VIP说明编辑（抽屉 + 富文本编辑器）
- 多语言支持（语言代码表）

### 13.2 说明抽屉功能

位置：VIP等级列表 → 操作 → 说明

**两栏布局**：
- 左侧：语言列表（可添加/删除）
- 右侧：富文本编辑器（TinyMCE）

**语言列表样式**：
- 未选中：白色背景 + 灰色边框
- 选中：蓝色背景 + 白色文字
- 删除按钮：红色垃圾桶图标（独立显示）

**富文本编辑器**：
- 使用全局组件 `RichTextEditor`
- placeholder 动态显示语言代码：`请输入内容（en-us）`

### 13.3 数据结构

**说明表单数据**：
```javascript
const infoFormData = reactive({
  enabled: false,           // VIP说明开关
  languages: [              // 语言列表
    {
      lang: 'en-us',        // 语言代码
      langName: '英语(美国)', // 语言名称
      content: ''           // 富文本内容
    }
  ]
})
```

**编辑表单数据**：
```javascript
const formData = reactive({
  id: null,
  logo: '',                 // Logo图片
  level: '',                // 等级
  mode: '根据系统配置',      // 模式
  amount: '',               // 金额(USD)
  commissionSingle: '',     // 任务佣金
  commissionMulti: '',      // 连单任务佣金
  taskCount: '',            // 任务数量
  times: '',                // 提现次数
  dailyLimit: '',           // 单日限制
  minAmount: '',            // 最低数量
  maxAmount: '',            // 最高数量
  fee: '',                  // 手续费
  bgCurrent: '',            // 当前等级背景
  bgLower: '',              // 小于当前等级背景
  bgHigher: '',             // 大于当前等级背景
  names: []                 // 多语言名称列表
})
```

### 13.4 相关样式类

| 样式类 | 用途 |
|-------|------|
| `.vip-container` | 页面容器 |
| `.info-drawer-content` | 说明抽屉内容 |
| `.info-two-column` | 两栏布局 |
| `.info-left-panel` | 左侧语言列表 |
| `.info-right-panel` | 右侧编辑器 |
| `.info-lang-item` | 语言列表项 |
| `.edit-drawer-content` | 编辑抽屉内容 |

---

## 十四、全局样式类（global.less）

> 更新日期: 2025-12-23

### 14.1 语言选择行样式 `.lang-add-row`

用于语言选择 + 输入 + 按钮的组合行，适用于 Banner.vue、Grid.vue 等需要多语言管理的抽屉。

**样式特点**：
- `flex-wrap: wrap` 支持自动换行
- 选择框宽度：130px
- 输入框宽度：160px（能完整显示"请输入语言标识"）
- 按钮高度：36px
- 间距：8px

**使用示例**：
```vue
<div class="lang-add-row">
  <a-select v-model:value="newLang" placeholder="选择语言">
    <a-select-option v-for="lang in langs" :key="lang.code" :value="lang.code">
      {{ lang.name }}
    </a-select-option>
  </a-select>
  <a-input v-model:value="newText" placeholder="请输入语言标识" />
  <a-button type="primary" @click="handleAdd">添 加</a-button>
  <a-button @click="refModalVisible = true">参 考</a-button>
</div>
```

**注意**：使用全局类名时，不需要在组件内再写 `style="width: xxx"`，样式由全局控制。

### 14.2 抽屉两栏布局

编辑抽屉常用的两栏布局模式：

```less
.edit-drawer-content {
  .edit-two-column {
    display: flex;
    gap: 24px;
  }

  .edit-left-panel {
    width: 420px;           // 固定宽度
    flex-shrink: 0;
    padding: 16px 24px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
  }

  .edit-right-panel {
    flex: 1;
    min-width: 0;           // 防止内容溢出
    padding: 16px 24px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;       // 防止内容溢出
  }
}
```

**关键点**：
- 右侧面板必须添加 `min-width: 0` 和 `overflow: hidden` 防止内容（图片、按钮）溢出

### 14.3 图片预览悬浮样式

LOGO 风格的图片预览，鼠标悬浮显示操作按钮：

```less
.upload-preview-with-actions {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e8e8e8;

  > img {
    width: 100%;
    display: block;
    object-fit: contain;
  }

  .preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .preview-overlay {
    opacity: 1;
  }
}
```

**使用示例**：
```vue
<div class="upload-preview-with-actions">
  <img :src="imageUrl" alt="预览" />
  <div class="preview-overlay">
    <a-upload :show-upload-list="false" @change="handleUpdate">
      <a-button type="primary" size="small">重新上传</a-button>
    </a-upload>
    <a-button type="primary" danger size="small" @click="handleReset">重 置</a-button>
  </div>
</div>
```

### 14.4 全局样式类速查表

| 类名 | 用途 | 文件 |
|------|------|------|
| `.icon-btn` | 工具栏图标按钮（全屏、刷新、密度） | global.less |
| `.rounded-drawer` | 抽屉圆角（20px） | global.less |
| `.warning-modal` | 警告弹窗样式 | global.less |
| `.warning-tip-box` | 黄色警告提示框 | global.less |
| `.lang-add-row` | 语言选择行（选择框+输入框+按钮） | global.less |

---

## 十五、Banner.vue 轮播图管理

> 更新日期: 2025-12-23

### 15.1 页面功能

轮播图管理页面，包含列表展示和编辑功能。

**表格列**：
- 名称、客户端、显示类型、排序、状态、统一点击配置、图片、操作

### 15.2 编辑抽屉

两栏布局：
- **左侧**：基本信息（名称、显示类型、状态、排序、点击方式、访问权限、路径URL）
- **右侧**：多语言图片管理

**显示类型选项**：
- 首页
- 客户列表
- 首页模版V2
- 首页前-轮播图

### 15.3 多语言图片管理

**数据结构**：
```javascript
const editForm = reactive({
  id: null,
  name: '',
  status: '显示',
  sort: '0',
  displayType: '客户列表',
  clickType: '无操作',
  needLogin: '不需登录',
  url: '',
  images: [           // 多语言图片数组
    {
      lang: 'en-us',  // 语言代码
      image: ''       // 图片URL或Base64
    }
  ]
})
```

**图片上传处理**：
```javascript
// 添加新语言图片
const handleAddImageWithLang = (info) => {
  const lang = newTitleLang.value || newTitleText.value
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.images.push({
      lang: lang,
      image: e.target.result  // Base64
    })
  }
  reader.readAsDataURL(file)
}

// 更新已有图片
const handleUpdateImage = (info, index) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.images[index].image = e.target.result
  }
  reader.readAsDataURL(file)
}
```

---

## 十六、Order.vue 订单列表

> 更新日期: 2025-12-25

### 16.1 页面功能

订单列表页面，与会员列表中的订单功能相同，区别在于查询范围（全部 vs 特定会员）。

**主要功能**：
- Tab 切换（全部/已完成/未完成）
- 订单列表（16列，带分页）
- 财务日志抽屉
- 商品详情抽屉

### 16.2 表格列

| 列名 | 数据字段 | 特殊样式 |
|------|---------|---------|
| ID | id | 固定左侧 |
| 订单号 | orderNo | - |
| 会员 | member | 蓝色，带下拉菜单 |
| 用户名 | username | 蓝色 |
| 单数 | orderCount | - |
| 商品名称 | productName | 左对齐 |
| 价格 | price | 蓝色 |
| 利润 | profit | 绿色 |
| 利率 | rate | 蓝色 |
| VIP等级 | vipLevel | - |
| 方式 | method | 标签（设定=粉色，随机=蓝色） |
| 设定倍数 | multiple | - |
| 时间 | time | - |
| 类型 | type | 标签（连单=绿色，单一=蓝色），固定右侧 |
| 状态 | status | 标签+确认还需金额，固定右侧 |
| 操作 | action | 财务、详情链接，固定右侧 |

### 16.3 商品详情抽屉

**无标题栏设计**：
- 自定义 header（关闭按钮 + 标题）
- 左侧：商品图片（140x140）
- 右侧：商品名称、价格（红色）、利润（绿色）、利率（蓝色）

### 16.4 相关样式类

| 样式类 | 用途 |
|-------|------|
| `.order-tabs` | 顶部 Tab 切换 |
| `.tab-item.active` | 激活的 Tab |
| `.product-detail-content` | 商品详情抽屉 |
| `.product-image` | 商品图片容器 |
| `.product-meta` | 商品信息区 |

---

## 十七、Withdraw.vue 提现管理

> 更新日期: 2025-12-25

### 17.1 页面功能

提现管理页面，用于审核会员的提现申请。

**主要功能**：
- 提现列表（14列，带分页）
- 更多搜索（筛选抽屉）
- 操作抽屉（查看详情并审核）
- 双击编辑提取信息

### 17.2 表格列

| 列名 | 数据字段 | 特殊样式 |
|------|---------|---------|
| 会员 | member | 蓝色表头文字，带下拉菜单，固定左侧 |
| 用户名 | username | 蓝色表头文字，蓝色内容 |
| 订单号 | orderNo | - |
| 数量 | amount | - |
| 手续费 | fee | - |
| 到账数量 | realAmount | - |
| 今天订单数 | todayOrderCount | - |
| 今天提款次数 | todayWithdrawCount | - |
| 提取信息 | withdrawInfo | 双击可编辑，带链接图标 |
| 理由 | reason | - |
| 时间 | time | - |
| 状态 | status | 标签，固定右侧 |
| 提取方式 | withdrawType | 标签，固定右侧 |
| 操作 | action | 通过/驳回按钮，固定右侧 |

### 17.3 状态颜色

| 状态 | 颜色 | Ant Design 标签 |
|------|------|----------------|
| 驳回 | 红色 | `error` |
| 审核通过 | 绿色 | `success` |
| 待审核 | 蓝色 | `processing` |

### 17.4 提取方式颜色

| 类型 | 颜色 | Ant Design 标签 |
|------|------|----------------|
| 加密货币 | 蓝色 | `processing` |
| 银行卡 | 橙色 | `warning` |

### 17.5 操作按钮状态

- **待审核**：显示可操作的"通过"（绿色）和"驳回"（红色）按钮
- **已处理**（驳回/审核通过）：显示灰色禁用按钮

### 17.6 双击编辑提取信息

```javascript
// 编辑状态
const editingWithdrawInfo = reactive({
  id: null,
  value: ''
})

// 开始编辑
const startEditWithdrawInfo = (record) => {
  editingWithdrawInfo.id = record.id
  editingWithdrawInfo.value = record.withdrawInfo
  nextTick(() => {
    withdrawInfoInput.value?.focus()
  })
}

// 保存编辑
const saveWithdrawInfo = (record) => {
  if (editingWithdrawInfo.value !== record.withdrawInfo) {
    record.withdrawInfo = editingWithdrawInfo.value
    message.success('提取信息已更新')
  }
  editingWithdrawInfo.id = null
  editingWithdrawInfo.value = ''
}
```

### 17.7 相关样式类

| 样式类 | 用途 |
|-------|------|
| `.member-link` | 会员链接样式 |
| `.username-text` | 用户名文字（蓝色） |
| `.withdraw-info` | 提取信息容器 |
| `.edit-link` | 编辑链接图标 |
| `.action-btns` | 操作按钮组 |
| `.btn-success` | 通过按钮（绿色） |
| `.btn-danger` | 驳回按钮（红色） |
| `.btn-disabled` | 禁用按钮（灰色） |
| `.operate-content` | 操作抽屉内容 |

---

## 十八、Recharge.vue 后台充值记录

> 更新日期: 2025-12-25

### 18.1 页面功能

后台充值记录页面，用于管理会员的充值/扣减记录。

**主要功能**：
- 充值记录列表（带分页和统计）
- 添加数据（创建充值记录）
- 继续操作（基于已有记录继续操作）
- 更多搜索（筛选抽屉）
- 财务日志查看

### 18.2 表格列

| 列名 | 数据字段 | 说明 |
|------|---------|------|
| 订单号 | orderNo | 蓝色可点击，固定左侧 |
| 会员 | member | 带下拉菜单 |
| 用户名 | username | - |
| 数量 | amount | 增加=绿色，扣减=红色 |
| 类型 | type | 标签样式（success/error） |
| 时间 | time | - |
| 理由 | reason | - |
| 操作 | action | 财务、继续链接，固定右侧 |

### 18.3 添加数据/继续抽屉

创建和继续操作共用同一个抽屉，设计类似上下分弹窗。

**会员信息卡片**：
```javascript
// 顶部显示会员信息
- 会员UID（创建时可输入，继续时只读）
- 用户名
- 可用余额（蓝色高亮）
- 冻结余额
```

**表单字段**：
```javascript
const addDrawer = reactive({
  visible: false,
  isEdit: false,        // true=继续操作, false=创建
  memberUid: '',        // 会员UID
  username: '',         // 用户名
  type: 'add',          // 操作类型: add(增加) / sub(扣减)
  amount: null,         // 数量
  remark: '',           // 说明
  availableAmount: 0,   // 可用余额
  frozenAmount: 0       // 冻结余额
})
```

**变动后余额计算**：
```javascript
const computedNewBalance = computed(() => {
  const available = parseFloat(addDrawer.availableAmount) || 0
  const amount = parseFloat(addDrawer.amount) || 0
  if (addDrawer.type === 'add') {
    return available + amount
  } else {
    return available - amount
  }
})
```

**操作类型按钮样式**：
- 增加按钮：选中时绿色背景 `#52c41a`
- 扣减按钮：选中时红色背景 `#ff4d4f`

### 18.4 更多搜索抽屉

**筛选字段**：
```javascript
const filterForm = reactive({
  status: undefined,     // 状态: 全部/增加/扣减
  memberId: '',          // 会员ID
  startTime: null,       // 开始时间
  endTime: null,         // 结束时间
  keyword: '',           // 搜索关键词
  sortField: 'time',     // 排序字段: 全部/数量/时间
  sortType: 'desc'       // 排序类型: 全部/降序/升序
})
```

### 18.5 底部统计

**分页和统计信息**：
- 左侧：统计数量 + 分页器
- 右侧：本页统计（累计、有效、无效）、全部统计（累计、有效、无效）

```javascript
const stats = reactive({
  pageTotal: '-180170794.13000304',
  pageValid: '494735458.5000002',
  pageInvalid: '314564664.3699971',
  allTotal: '-180170794.13000304',
  allValid: '494735458.5000002',
  allInvalid: '314564664.3699971'
})
```

### 18.6 相关样式类

| 样式类 | 用途 |
|-------|------|
| `.page-container` | 页面容器 |
| `.page-header` | 顶部操作栏 |
| `.page-footer` | 底部分页和统计 |
| `.add-drawer-content` | 添加数据抽屉内容 |
| `.member-info-card` | 会员信息卡片 |
| `.type-radio-group` | 操作类型按钮组 |
| `.result-balance` | 变动后余额显示 |
| `.filter-form` | 筛选表单 |

---

*本文档由 Claude Code 维护，用于快速了解和开发项目*
*最后更新: 2025-12-25*
