<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">管理员日志</span>
        <a-button v-if="isSuperAdmin" @click="handleExport">
          <template #icon><ExportOutlined /></template>
          导出日志
        </a-button>
      </div>
      <div class="header-right">
        <!-- 快捷日期筛选 -->
        <a-radio-group v-model:value="quickDateFilter" size="small" @change="handleQuickDateChange">
          <a-radio-button value="today">今天</a-radio-button>
          <a-radio-button value="yesterday">昨天</a-radio-button>
          <a-radio-button value="week">近7天</a-radio-button>
          <a-radio-button value="month">近30天</a-radio-button>
          <a-radio-button value="custom">自定义</a-radio-button>
        </a-radio-group>
        <a-range-picker
          v-if="quickDateFilter === 'custom'"
          v-model:value="dateRange"
          style="width: 220px;"
          :placeholder="['开始日期', '结束日期']"
          @change="handleDateChange"
        />
        <a-select
          v-if="isSuperAdmin"
          v-model:value="filterAdmin"
          style="width: 130px;"
          placeholder="管理员"
          allow-clear
          @change="handleFilter"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="admin in adminList" :key="admin.id" :value="admin.id">
            {{ admin.name }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="filterModule"
          style="width: 110px;"
          placeholder="模块"
          allow-clear
          @change="handleFilter"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="member">会员</a-select-option>
          <a-select-option value="order">订单</a-select-option>
          <a-select-option value="withdraw">提现</a-select-option>
          <a-select-option value="recharge">充值</a-select-option>
          <a-select-option value="goods">商品</a-select-option>
          <a-select-option value="system">系统</a-select-option>
          <a-select-option value="auth">认证</a-select-option>
          <a-select-option value="login">登录</a-select-option>
        </a-select>
        <a-select
          v-model:value="filterAction"
          style="width: 100px;"
          placeholder="类型"
          allow-clear
          @change="handleFilter"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="login">登录</a-select-option>
          <a-select-option value="logout">登出</a-select-option>
          <a-select-option value="add">新增</a-select-option>
          <a-select-option value="edit">编辑</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <a-select-option value="approve">通过</a-select-option>
          <a-select-option value="reject">驳回</a-select-option>
          <a-select-option value="export">导出</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索内容"
          style="width: 150px;"
          @search="handleSearch"
        />
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? '退出全屏' : '全屏'">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleSizeChange">
              <a-menu-item key="default" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'default' }">默认</a-menu-item>
              <a-menu-item key="middle" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'middle' }">中等</a-menu-item>
              <a-menu-item key="small" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'small' }">紧凑</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="false"
        :size="tableSize"
        :loading="loading"
        bordered
        :scroll="{ x: 1400, y: 'calc(100vh - 280px)' }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 管理员 -->
          <template v-if="column.key === 'adminName'">
            <div class="admin-info">
              <span class="admin-name">{{ record.adminName }}</span>
              <span class="admin-account">{{ record.adminAccount }}</span>
            </div>
          </template>
          <!-- 操作模块 -->
          <template v-if="column.key === 'module'">
            <a-tag :color="getModuleColor(record.module)">{{ getModuleName(record.module) }}</a-tag>
          </template>
          <!-- 操作类型 -->
          <template v-if="column.key === 'action'">
            <a-tag :color="getActionColor(record.action)">{{ getActionName(record.action) }}</a-tag>
          </template>
          <!-- 操作内容 -->
          <template v-if="column.key === 'content'">
            <a-tooltip :title="record.content">
              <span class="content-text">{{ record.content }}</span>
            </a-tooltip>
          </template>
          <!-- 操作结果 -->
          <template v-if="column.key === 'result'">
            <a-tag :color="record.result === 'success' ? 'success' : 'error'">
              {{ record.result === 'success' ? '成功' : '失败' }}
            </a-tag>
          </template>
          <!-- 详情 -->
          <template v-if="column.key === 'detail'">
            <a class="detail-link" @click="handleViewDetail(record)">查看</a>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="page-footer">
        <span class="total-text">统计: {{ pagination.total }}/条</span>
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          :show-quick-jumper="true"
          size="small"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <a-drawer
      :open="detailVisible"
      title="操作详情"
      placement="right"
      width="600"
      :rootClassName="'rounded-drawer'"
      @close="detailVisible = false"
    >
      <template #closeIcon>
        <close-outlined style="font-size: 16px;" />
      </template>

      <div class="detail-content" v-if="currentLog">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="日志ID">{{ currentLog.id }}</a-descriptions-item>
          <a-descriptions-item label="管理员">
            <span>{{ currentLog.adminName }}</span>
            <span style="color: #999; margin-left: 8px;">({{ currentLog.adminAccount }})</span>
          </a-descriptions-item>
          <a-descriptions-item label="操作模块">
            <a-tag :color="getModuleColor(currentLog.module)">{{ getModuleName(currentLog.module) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作类型">
            <a-tag :color="getActionColor(currentLog.action)">{{ getActionName(currentLog.action) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作结果">
            <a-tag :color="currentLog.result === 'success' ? 'success' : 'error'">
              {{ currentLog.result === 'success' ? '成功' : '失败' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作内容">{{ currentLog.content }}</a-descriptions-item>
          <a-descriptions-item label="IP地址">{{ currentLog.ip }}</a-descriptions-item>
          <a-descriptions-item label="浏览器">{{ currentLog.browser }}</a-descriptions-item>
          <a-descriptions-item label="操作系统">{{ currentLog.os }}</a-descriptions-item>
          <a-descriptions-item label="操作时间">{{ currentLog.time }}</a-descriptions-item>
        </a-descriptions>

        <div class="detail-section" v-if="currentLog.requestData">
          <h4>请求数据</h4>
          <pre class="code-block">{{ JSON.stringify(currentLog.requestData, null, 2) }}</pre>
        </div>

        <div class="detail-section" v-if="currentLog.responseData">
          <h4>响应数据</h4>
          <pre class="code-block">{{ JSON.stringify(currentLog.responseData, null, 2) }}</pre>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'

// 从 MainLayout 注入
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 加载状态
const loading = ref(false)

// 模拟当前用户信息（实际应从store或接口获取）
const isSuperAdmin = ref(true) // true=超级管理员, false=子管理员
const currentAdminId = ref(1)

// 搜索和筛选
const searchText = ref('')
const dateRange = ref(null)
const quickDateFilter = ref('today')
const filterAdmin = ref('')
const filterModule = ref('')
const filterAction = ref('')

// 表格密度
const tableSize = ref('default')
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 管理员列表（超级管理员可见）
const adminList = ref([
  { id: 1, name: '超级管理员', account: 'admin' },
  { id: 2, name: '客服经理', account: 'cs_manager' },
  { id: 3, name: '运营专员', account: 'operator01' },
  { id: 4, name: '财务审核', account: 'finance01' },
  { id: 5, name: '技术支持', account: 'tech01' }
])

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: '管理员', dataIndex: 'adminName', key: 'adminName', width: 140, align: 'center' },
  { title: '模块', dataIndex: 'module', key: 'module', width: 100, align: 'center' },
  { title: '类型', dataIndex: 'action', key: 'action', width: 100, align: 'center' },
  { title: '操作内容', dataIndex: 'content', key: 'content', width: 300, ellipsis: true },
  { title: '结果', dataIndex: 'result', key: 'result', width: 70, align: 'center' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130, align: 'center' },
  { title: '操作时间', dataIndex: 'time', key: 'time', width: 160, align: 'center' },
  { title: '详情', key: 'detail', width: 70, align: 'center', fixed: 'right' }
]

// 模拟日志数据
const logData = ref([
  { id: 1001, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'login', action: 'login', content: '管理员登录系统', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 09:15:23', requestData: { username: 'admin' }, responseData: { code: 200, msg: '登录成功' } },
  { id: 1002, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '修改会员[UID:16267817514]的VIP等级为VIP3', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 09:32:45', requestData: { uid: '16267817514', vipLevel: 3 }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1003, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'withdraw', action: 'approve', content: '审核通过提现订单[WD202501020001]，金额: $5000', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 09:45:12', requestData: { orderId: 'WD202501020001', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1004, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'add', content: '新增商品[iPhone 15 Pro Max 256GB]', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 10:05:33', requestData: { name: 'iPhone 15 Pro Max 256GB', price: 1199 }, responseData: { code: 200, msg: '添加成功', id: 10086 } },
  { id: 1005, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'reject', content: '驳回提现订单[WD202501020002]，原因: 账户异常', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 10:18:56', requestData: { orderId: 'WD202501020002', action: 'reject', reason: '账户异常' }, responseData: { code: 200, msg: '驳回成功' } },
  { id: 1006, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'system', action: 'edit', content: '修改系统设置-提现手续费由0.1改为0.05', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 10:30:00', requestData: { withdrawFee: 0.05 }, responseData: { code: 200, msg: '保存成功' } },
  { id: 1007, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '冻结会员[UID:32134380962]账户', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 10:45:22', requestData: { uid: '32134380962', status: 'frozen' }, responseData: { code: 200, msg: '操作成功' } },
  { id: 1008, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'approve', content: '审核通过会员[UID:45678901234]实名认证', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2025-01-02 11:00:15', requestData: { uid: '45678901234', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1009, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'delete', content: '删除商品[ID:10025]-已下架商品清理', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 11:15:44', requestData: { id: 10025 }, responseData: { code: 200, msg: '删除成功' } },
  { id: 1010, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'recharge', action: 'add', content: '后台充值会员[UID:16267817514]金额$1000', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 11:30:08', requestData: { uid: '16267817514', amount: 1000, type: 'add' }, responseData: { code: 200, msg: '充值成功' } },
  { id: 1011, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'export', content: '导出提现记录(2025-01-01至2025-01-02)', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 11:45:30', requestData: { startDate: '2025-01-01', endDate: '2025-01-02' }, responseData: { code: 200, msg: '导出成功', fileUrl: '/exports/withdraw_20250102.xlsx' } },
  { id: 1012, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '修改会员[UID:78901234567]备注信息', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 12:00:45', requestData: { uid: '78901234567', remark: 'VIP客户，重点关注' }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1013, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'login', action: 'logout', content: '管理员退出系统', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 12:30:00', requestData: null, responseData: { code: 200, msg: '退出成功' } },
  { id: 1014, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'edit', content: '修改商品[ID:10086]价格由$1199改为$1099', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 14:15:22', requestData: { id: 10086, price: 1099 }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1015, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'reject', content: '驳回会员[UID:11223344556]实名认证，原因: 证件照片模糊', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2025-01-02 14:30:18', requestData: { uid: '11223344556', action: 'reject', reason: '证件照片模糊' }, responseData: { code: 200, msg: '驳回成功' } },
  { id: 1016, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'member', action: 'add', content: '创建新会员账号[UID:99887766554]', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 15:00:00', requestData: { phone: '138****8888' }, responseData: { code: 200, msg: '创建成功' } },
  { id: 1017, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'order', action: 'edit', content: '修改订单[ORD202501020001]状态为已完成', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 15:30:22', requestData: { orderId: 'ORD202501020001', status: 'completed' }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1018, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'recharge', action: 'approve', content: '审核通过充值订单[RC202501020003]，金额: $2000', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 16:00:15', requestData: { orderId: 'RC202501020003' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1019, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'edit', content: '批量上架商品(共15件)', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 16:30:00', requestData: { ids: [10001, 10002, 10003], action: 'online' }, responseData: { code: 200, msg: '操作成功' } },
  { id: 1020, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'system', action: 'edit', content: '修改VIP等级配置-VIP5任务数量改为80', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 17:00:00', requestData: { vipLevel: 5, taskCount: 80 }, responseData: { code: 200, msg: '保存成功' } },
  // 更多历史数据
  { id: 1021, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'login', action: 'login', content: '管理员登录系统', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 08:30:00', requestData: { username: 'admin' }, responseData: { code: 200, msg: '登录成功' } },
  { id: 1022, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '解冻会员[UID:55667788990]账户', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-01 09:15:33', requestData: { uid: '55667788990', status: 'active' }, responseData: { code: 200, msg: '操作成功' } },
  { id: 1023, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'add', content: '新增商品[Samsung Galaxy S24 Ultra]', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-01 10:00:00', requestData: { name: 'Samsung Galaxy S24 Ultra', price: 1299 }, responseData: { code: 200, msg: '添加成功', id: 10087 } },
  { id: 1024, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'approve', content: '审核通过提现订单[WD202501010001]，金额: $3500', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 10:30:22', requestData: { orderId: 'WD202501010001', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1025, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'approve', content: '审核通过会员[UID:66778899001]实名认证', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2025-01-01 11:00:45', requestData: { uid: '66778899001', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1026, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'system', action: 'edit', content: '修改网站Logo和名称', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 11:30:00', requestData: { logo: 'new_logo.png', siteName: 'Kinex Media' }, responseData: { code: 200, msg: '保存成功' } },
  { id: 1027, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '修改会员[UID:88990011223]提现密码', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-01 12:15:18', requestData: { uid: '88990011223', type: 'withdrawPassword' }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1028, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'edit', content: '修改商品[ID:10087]库存由100改为200', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-01 14:00:33', requestData: { id: 10087, stock: 200 }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1029, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'reject', content: '驳回提现订单[WD202501010002]，原因: 余额不足', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 14:30:00', requestData: { orderId: 'WD202501010002', action: 'reject', reason: '余额不足' }, responseData: { code: 200, msg: '驳回成功' } },
  { id: 1030, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'reject', content: '驳回会员[UID:99001122334]实名认证，原因: 信息不匹配', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2025-01-01 15:00:22', requestData: { uid: '99001122334', action: 'reject', reason: '信息不匹配' }, responseData: { code: 200, msg: '驳回成功' } },
  { id: 1031, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'recharge', action: 'add', content: '后台充值会员[UID:32134380962]金额$500', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 15:30:00', requestData: { uid: '32134380962', amount: 500, type: 'add' }, responseData: { code: 200, msg: '充值成功' } },
  { id: 1032, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'order', action: 'edit', content: '取消订单[ORD202501010001]', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-01 16:00:45', requestData: { orderId: 'ORD202501010001', status: 'cancelled' }, responseData: { code: 200, msg: '取消成功' } },
  { id: 1033, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'delete', content: '删除商品[ID:10020]-违规商品下架', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-01 16:30:00', requestData: { id: 10020 }, responseData: { code: 200, msg: '删除成功' } },
  { id: 1034, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'recharge', action: 'approve', content: '审核通过充值订单[RC202501010001]，金额: $1500', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 17:00:18', requestData: { orderId: 'RC202501010001' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1035, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'login', action: 'logout', content: '管理员退出系统', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-01 18:00:00', requestData: null, responseData: { code: 200, msg: '退出成功' } },
  { id: 1036, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'login', action: 'login', content: '管理员登录系统', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2024-12-31 09:00:00', requestData: { username: 'cs_manager' }, responseData: { code: 200, msg: '登录成功' } },
  { id: 1037, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'add', content: '新增商品[MacBook Pro 16寸 M3 Max]', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2024-12-31 10:15:00', requestData: { name: 'MacBook Pro 16寸 M3 Max', price: 3499 }, responseData: { code: 200, msg: '添加成功', id: 10088 } },
  { id: 1038, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'approve', content: '审核通过提现订单[WD202412310001]，金额: $8000', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2024-12-31 11:00:33', requestData: { orderId: 'WD202412310001', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1039, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'system', action: 'edit', content: '更新系统版本至v2.5.0', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2024-12-31 14:00:00', requestData: { version: '2.5.0' }, responseData: { code: 200, msg: '更新成功' } },
  { id: 1040, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'member', action: 'edit', content: '批量修改会员VIP等级(共50人)', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2024-12-31 15:30:00', requestData: { count: 50, vipLevel: 2 }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1041, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'add', content: '创建新会员账号[UID:11223344556]', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2024-12-31 16:00:22', requestData: { phone: '139****9999' }, responseData: { code: 200, msg: '创建成功' } },
  { id: 1042, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'edit', content: '批量下架商品(共8件)', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2024-12-31 16:30:45', requestData: { ids: [10010, 10011, 10012], action: 'offline' }, responseData: { code: 200, msg: '操作成功' } },
  { id: 1043, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'export', content: '导出2024年12月提现报表', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2024-12-31 17:00:00', requestData: { month: '2024-12' }, responseData: { code: 200, msg: '导出成功', fileUrl: '/exports/withdraw_202412.xlsx' } },
  { id: 1044, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'approve', content: '批量审核通过实名认证(共12人)', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2024-12-31 17:30:18', requestData: { count: 12, action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1045, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'system', action: 'edit', content: '修改年终活动配置', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2024-12-31 18:00:00', requestData: { activityId: 'NY2025', status: 'active' }, responseData: { code: 200, msg: '保存成功' } },
  { id: 1046, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'login', action: 'logout', content: '管理员退出系统', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2024-12-31 18:30:00', requestData: null, responseData: { code: 200, msg: '退出成功' } },
  { id: 1047, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'login', action: 'login', content: '管理员登录系统', result: 'fail', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2024-12-30 09:00:00', requestData: { username: 'operator01' }, responseData: { code: 401, msg: '密码错误' } },
  { id: 1048, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'login', action: 'login', content: '管理员登录系统', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2024-12-30 09:01:00', requestData: { username: 'operator01' }, responseData: { code: 200, msg: '登录成功' } },
  { id: 1049, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'recharge', action: 'add', content: '后台扣减会员[UID:77889900112]金额$200', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2024-12-30 10:00:00', requestData: { uid: '77889900112', amount: 200, type: 'sub' }, responseData: { code: 200, msg: '扣减成功' } },
  { id: 1050, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'system', action: 'edit', content: '清理系统缓存', result: 'success', ip: '192.168.1.104', browser: 'Edge 120.0', os: 'Windows 11', time: '2024-12-30 11:00:00', requestData: { type: 'cache' }, responseData: { code: 200, msg: '清理成功' } }
])

// 筛选后的数据
const filteredData = computed(() => {
  let data = [...logData.value]

  // 非超级管理员只能看自己的日志
  if (!isSuperAdmin.value) {
    data = data.filter(item => item.adminId === currentAdminId.value)
  }

  // 管理员筛选
  if (filterAdmin.value) {
    data = data.filter(item => item.adminId === filterAdmin.value)
  }

  // 模块筛选
  if (filterModule.value) {
    data = data.filter(item => item.module === filterModule.value)
  }

  // 操作类型筛选
  if (filterAction.value) {
    data = data.filter(item => item.action === filterAction.value)
  }

  // 搜索
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    data = data.filter(item =>
      item.content.toLowerCase().includes(keyword) ||
      item.adminName.toLowerCase().includes(keyword) ||
      item.adminAccount.toLowerCase().includes(keyword)
    )
  }

  return data
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: computed(() => filteredData.value.length)
})

// 获取模块名称
const getModuleName = (module) => {
  const map = {
    member: '会员',
    order: '订单',
    withdraw: '提现',
    recharge: '充值',
    goods: '商品',
    system: '系统',
    auth: '认证',
    login: '登录'
  }
  return map[module] || module
}

// 获取模块颜色
const getModuleColor = (module) => {
  const map = {
    member: 'blue',
    order: 'cyan',
    withdraw: 'orange',
    recharge: 'green',
    goods: 'purple',
    system: 'red',
    auth: 'magenta',
    login: 'default'
  }
  return map[module] || 'default'
}

// 获取操作名称
const getActionName = (action) => {
  const map = {
    login: '登录',
    logout: '登出',
    add: '新增',
    edit: '编辑',
    delete: '删除',
    approve: '通过',
    reject: '驳回',
    export: '导出'
  }
  return map[action] || action
}

// 获取操作颜色
const getActionColor = (action) => {
  const map = {
    login: 'processing',
    logout: 'default',
    add: 'success',
    edit: 'warning',
    delete: 'error',
    approve: 'success',
    reject: 'error',
    export: 'cyan'
  }
  return map[action] || 'default'
}

// 详情弹窗
const detailVisible = ref(false)
const currentLog = ref(null)

const handleViewDetail = (record) => {
  currentLog.value = record
  detailVisible.value = true
}

// 刷新
const handleRefresh = () => {
  message.success('刷新成功')
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 快捷日期筛选
const handleQuickDateChange = () => {
  pagination.current = 1
  // 实际项目中这里会根据选择计算日期范围
}

// 日期筛选
const handleDateChange = () => {
  pagination.current = 1
}

// 筛选
const handleFilter = () => {
  pagination.current = 1
}

// 分页
const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

// 导出
const handleExport = () => {
  message.success('正在导出日志...')
}
</script>

<style scoped lang="less">
.page-container {
  padding: 24px 0;
  padding-bottom: 0;
  background: #fff;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .icon-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;

      .ant-spin-nested-loading {
        height: 100%;
      }

      .ant-spin-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ant-table {
        flex: 1;
        overflow: hidden;

        .ant-table-container {
          height: 100%;
          display: flex;
          flex-direction: column;

          .ant-table-header {
            flex-shrink: 0;
          }

          .ant-table-body {
            flex: 1;
            overflow: auto !important;
          }
        }
      }
    }

    :deep(.ant-table) {
      font-size: 14px;

      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        text-align: center;
        color: #333;
      }

      .ant-table-tbody > tr > td {
        font-size: 13px;
        vertical-align: middle;
      }
    }

    .page-footer {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      height: 48px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
      box-sizing: border-box;
      z-index: 10;
      flex-shrink: 0;

      .total-text {
        font-size: 14px;
        color: #666;
        white-space: nowrap;
      }
    }
  }

  // 管理员信息
  .admin-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .admin-name {
      font-weight: 500;
      color: #333;
    }

    .admin-account {
      font-size: 12px;
      color: #999;
    }
  }

  // 内容文本
  .content-text {
    color: #333;
  }

  // 详情链接
  .detail-link {
    color: #1890ff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  // 表格密度样式
  &.size-default {
    :deep(.ant-table) {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        padding: 16px 8px;
      }
    }
  }

  &.size-middle {
    :deep(.ant-table) {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        padding: 12px 8px;
      }
    }
  }

  &.size-small {
    :deep(.ant-table) {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        padding: 8px 4px;
      }
    }
  }
}

// 详情抽屉
.detail-content {
  .detail-section {
    margin-top: 24px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .code-block {
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      padding: 12px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      color: #333;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
