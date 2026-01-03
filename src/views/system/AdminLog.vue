<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">{{ $t('adminLog.title') }}</span>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          :placeholder="$t('filter.keyword')"
          style="width: 200px;"
          @search="handleSearch"
        />
        <a-button type="primary" @click="filterDrawer.visible = true">
          {{ $t('common.moreSearch') }}
        </a-button>
        <a-button v-if="isSuperAdmin" @click="handleExport">
          <template #icon><ExportOutlined /></template>
          {{ $t('adminLog.exportLog') }}
        </a-button>
        <a-tooltip :title="contentFullscreen ? $t('common.exitFullscreen') : $t('common.fullscreen')">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip :title="$t('common.refresh')">
          <a-button class="icon-btn" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <a-tooltip :title="$t('density.density')">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleSizeChange">
              <a-menu-item key="default" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'default' }">{{ $t('density.default') }}</a-menu-item>
              <a-menu-item key="middle" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'middle' }">{{ $t('density.middle') }}</a-menu-item>
              <a-menu-item key="small" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'small' }">{{ $t('density.small') }}</a-menu-item>
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
        :scroll="{ x: 1400 }"
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
              {{ record.result === 'success' ? $t('adminLog.success') : $t('adminLog.fail') }}
            </a-tag>
          </template>
          <!-- IP地址 -->
          <template v-if="column.key === 'ip'">
            <a-popover
              v-model:open="record.ipPopoverVisible"
              trigger="click"
              placement="top"
              :arrow="{ pointAtCenter: true }"
            >
              <template #content>
                <div class="ip-popover-content">
                  <div class="ip-info-item">
                    <span class="label">{{ $t('log.ipAddress') }}：</span>
                    <span class="value">{{ ipModal.ip }}</span>
                  </div>
                  <div class="ip-info-item">
                    <span class="label">{{ $t('log.location') }}：</span>
                    <span class="value">{{ ipModal.location }}</span>
                  </div>
                  <div class="ip-info-item">
                    <span class="label">{{ $t('log.isp') }}：</span>
                    <span class="value">{{ ipModal.isp }}</span>
                  </div>
                </div>
              </template>
              <a class="ip-link" @click="handleIpClick(record)">{{ record.ip }}</a>
            </a-popover>
          </template>
          <!-- 详情 -->
          <template v-if="column.key === 'detail'">
            <a class="detail-link" @click="handleViewDetail(record)">{{ $t('adminLog.viewDetail') }}</a>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="page-footer">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          :show-quick-jumper="true"
          size="small"
          @change="handlePageChange"
        />
        <span class="total-text">{{ $t('common.total') }}: {{ pagination.total }}/{{ $t('common.records') }}</span>
      </div>
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="filterDrawer.visible"
      placement="right"
      :width="400"
      :closable="false"
      :header-style="{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }"
      rootClassName="rounded-drawer"
    >
      <template #title>
        <div class="filter-drawer-header">
          <div class="header-left">
            <CloseOutlined class="close-icon" @click="filterDrawer.visible = false" />
            <span class="title">{{ $t('common.filter') }}</span>
          </div>
          <div class="header-right">
            <a-button type="link" @click="handleResetFilter">{{ $t('common.reset') }}</a-button>
            <a-button type="primary" @click="handleFilter">{{ $t('common.submit') }}</a-button>
          </div>
        </div>
      </template>
      <div class="filter-form">
        <div class="filter-item" v-if="isSuperAdmin">
          <div class="filter-label">{{ $t('filter.admin') }}</div>
          <a-select v-model:value="filterDrawer.admin" :placeholder="$t('common.pleaseSelect')" allow-clear style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option v-for="admin in adminList" :key="admin.id" :value="admin.id">
              {{ admin.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.module') }}</div>
          <a-select v-model:value="filterDrawer.module" :placeholder="$t('common.pleaseSelect')" allow-clear style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="member">{{ $t('adminLog.moduleMember') }}</a-select-option>
            <a-select-option value="order">{{ $t('adminLog.moduleOrder') }}</a-select-option>
            <a-select-option value="withdraw">{{ $t('adminLog.moduleWithdraw') }}</a-select-option>
            <a-select-option value="recharge">{{ $t('adminLog.moduleRecharge') }}</a-select-option>
            <a-select-option value="goods">{{ $t('adminLog.moduleGoods') }}</a-select-option>
            <a-select-option value="system">{{ $t('adminLog.moduleSystem') }}</a-select-option>
            <a-select-option value="auth">{{ $t('adminLog.moduleAuth') }}</a-select-option>
            <a-select-option value="login">{{ $t('adminLog.moduleLogin') }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.actionType') }}</div>
          <a-select v-model:value="filterDrawer.action" :placeholder="$t('common.pleaseSelect')" allow-clear style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="login">{{ $t('adminLog.actionLogin') }}</a-select-option>
            <a-select-option value="logout">{{ $t('adminLog.actionLogout') }}</a-select-option>
            <a-select-option value="add">{{ $t('adminLog.actionAdd') }}</a-select-option>
            <a-select-option value="edit">{{ $t('adminLog.actionEdit') }}</a-select-option>
            <a-select-option value="delete">{{ $t('adminLog.actionDelete') }}</a-select-option>
            <a-select-option value="approve">{{ $t('adminLog.actionApprove') }}</a-select-option>
            <a-select-option value="reject">{{ $t('adminLog.actionReject') }}</a-select-option>
            <a-select-option value="export">{{ $t('adminLog.actionExport') }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.result') }}</div>
          <a-select v-model:value="filterDrawer.result" :placeholder="$t('common.pleaseSelect')" allow-clear style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="success">{{ $t('adminLog.success') }}</a-select-option>
            <a-select-option value="fail">{{ $t('adminLog.fail') }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.ip') }}</div>
          <a-input v-model:value="filterDrawer.ip" :placeholder="$t('common.pleaseInput')" allow-clear />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.startTime') }}</div>
          <a-date-picker
            v-model:value="filterDrawer.startTime"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.endTime') }}</div>
          <a-date-picker
            v-model:value="filterDrawer.endTime"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.sortField') }}</div>
          <a-select v-model:value="filterDrawer.sortField" style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="time">{{ $t('filter.operationTime') }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ $t('filter.sortType') }}</div>
          <a-select v-model:value="filterDrawer.sortType" style="width: 100%">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="desc">{{ $t('filter.descending') }}</a-select-option>
            <a-select-option value="asc">{{ $t('filter.ascending') }}</a-select-option>
          </a-select>
        </div>
      </div>
    </a-drawer>

    <!-- 详情抽屉 -->
    <a-drawer
      :open="detailVisible"
      :title="$t('adminLog.detail')"
      placement="right"
      width="600"
      rootClassName="rounded-drawer"
      @close="detailVisible = false"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>

      <div class="detail-content" v-if="currentLog">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item :label="$t('adminLog.logId')">{{ currentLog.id }}</a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.admin')">
            <span>{{ currentLog.adminName }}</span>
            <span style="color: #999; margin-left: 8px;">({{ currentLog.adminAccount }})</span>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.module')">
            <a-tag :color="getModuleColor(currentLog.module)">{{ getModuleName(currentLog.module) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.actionType')">
            <a-tag :color="getActionColor(currentLog.action)">{{ getActionName(currentLog.action) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.result')">
            <a-tag :color="currentLog.result === 'success' ? 'success' : 'error'">
              {{ currentLog.result === 'success' ? $t('adminLog.success') : $t('adminLog.fail') }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.content')">{{ currentLog.content }}</a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.ip')">{{ currentLog.ip }}</a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.browser')">{{ currentLog.browser }}</a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.os')">{{ currentLog.os }}</a-descriptions-item>
          <a-descriptions-item :label="$t('adminLog.time')">{{ currentLog.time }}</a-descriptions-item>
        </a-descriptions>

        <div class="detail-section" v-if="currentLog.requestData">
          <h4>{{ $t('adminLog.requestData') }}</h4>
          <pre class="code-block">{{ JSON.stringify(currentLog.requestData, null, 2) }}</pre>
        </div>

        <div class="detail-section" v-if="currentLog.responseData">
          <h4>{{ $t('adminLog.responseData') }}</h4>
          <pre class="code-block">{{ JSON.stringify(currentLog.responseData, null, 2) }}</pre>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'

// 从 MainLayout 注入
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})
const { t } = useI18n()

// 加载状态
const loading = ref(false)

// 模拟当前用户信息（实际应从store或接口获取）
const isSuperAdmin = ref(true) // true=超级管理员, false=子管理员
const currentAdminId = ref(1)

// 搜索
const searchText = ref('')

// 筛选抽屉
const filterDrawer = reactive({
  visible: false,
  admin: '',
  module: '',
  action: '',
  result: '',
  ip: '',
  startTime: null,
  endTime: null,
  sortField: 'time',
  sortType: 'desc'
})

// IP归属地气泡卡片数据
const ipModal = reactive({
  ip: '',
  location: '',
  isp: ''
})

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
const columns = computed(() => [
  { title: t('adminLog.id'), dataIndex: 'id', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: t('adminLog.admin'), dataIndex: 'adminName', key: 'adminName', width: 140, align: 'center' },
  { title: t('adminLog.module'), dataIndex: 'module', key: 'module', width: 100, align: 'center' },
  { title: t('adminLog.actionType'), dataIndex: 'action', key: 'action', width: 100, align: 'center' },
  { title: t('adminLog.content'), dataIndex: 'content', key: 'content', width: 300, ellipsis: true },
  { title: t('adminLog.result'), dataIndex: 'result', key: 'result', width: 70, align: 'center' },
  { title: t('adminLog.ip'), dataIndex: 'ip', key: 'ip', width: 130, align: 'center' },
  { title: t('adminLog.time'), dataIndex: 'time', key: 'time', width: 160, align: 'center' },
  { title: t('adminLog.detail'), key: 'detail', width: 70, align: 'center', fixed: 'right' }
])

// 模拟日志数据
const logData = ref([
  { id: 1001, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'login', action: 'login', content: '管理员登录系统', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 09:15:23', requestData: { username: 'admin' }, responseData: { code: 200, msg: '登录成功' } },
  { id: 1002, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '修改会员[UID:16267817514]的VIP等级为VIP3', result: 'success', ip: '192.168.1.101', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 09:32:45', requestData: { uid: '16267817514', vipLevel: 3 }, responseData: { code: 200, msg: '修改成功' } },
  { id: 1003, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'withdraw', action: 'approve', content: '审核通过提现订单[WD202501020001]，金额: $5000', result: 'success', ip: '192.168.1.100', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 09:45:12', requestData: { orderId: 'WD202501020001', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1004, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'add', content: '新增商品[iPhone 15 Pro Max 256GB]', result: 'success', ip: '192.168.1.102', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 10:05:33', requestData: { name: 'iPhone 15 Pro Max 256GB', price: 1199 }, responseData: { code: 200, msg: '添加成功', id: 10086 } },
  { id: 1005, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'reject', content: '驳回提现订单[WD202501020002]，原因: 账户异常', result: 'success', ip: '192.168.1.103', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 10:18:56', requestData: { orderId: 'WD202501020002', action: 'reject', reason: '账户异常' }, responseData: { code: 200, msg: '驳回成功' } },
  { id: 1006, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'system', action: 'edit', content: '修改系统设置-提现手续费由0.1改为0.05', result: 'success', ip: '67.170.145.182', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 10:30:00', requestData: { withdrawFee: 0.05 }, responseData: { code: 200, msg: '保存成功' } },
  { id: 1007, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '冻结会员[UID:32134380962]账户', result: 'success', ip: '68.202.239.125', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 10:45:22', requestData: { uid: '32134380962', status: 'frozen' }, responseData: { code: 200, msg: '操作成功' } },
  { id: 1008, adminId: 5, adminName: '技术支持', adminAccount: 'tech01', module: 'auth', action: 'approve', content: '审核通过会员[UID:45678901234]实名认证', result: 'success', ip: '107.77.199.91', browser: 'Edge 120.0', os: 'Windows 11', time: '2025-01-02 11:00:15', requestData: { uid: '45678901234', action: 'approve' }, responseData: { code: 200, msg: '审核成功' } },
  { id: 1009, adminId: 3, adminName: '运营专员', adminAccount: 'operator01', module: 'goods', action: 'delete', content: '删除商品[ID:10025]-已下架商品清理', result: 'success', ip: '99.92.94.175', browser: 'Firefox 121.0', os: 'macOS 14.2', time: '2025-01-02 11:15:44', requestData: { id: 10025 }, responseData: { code: 200, msg: '删除成功' } },
  { id: 1010, adminId: 1, adminName: '超级管理员', adminAccount: 'admin', module: 'recharge', action: 'add', content: '后台充值会员[UID:16267817514]金额$1000', result: 'success', ip: '134.122.34.218', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 11:30:08', requestData: { uid: '16267817514', amount: 1000, type: 'add' }, responseData: { code: 200, msg: '充值成功' } },
  { id: 1011, adminId: 4, adminName: '财务审核', adminAccount: 'finance01', module: 'withdraw', action: 'export', content: '导出提现记录(2025-01-01至2025-01-02)', result: 'success', ip: '166.194.204.13', browser: 'Chrome 120.0', os: 'Windows 10', time: '2025-01-02 11:45:30', requestData: { startDate: '2025-01-01', endDate: '2025-01-02' }, responseData: { code: 200, msg: '导出成功', fileUrl: '/exports/withdraw_20250102.xlsx' } },
  { id: 1012, adminId: 2, adminName: '客服经理', adminAccount: 'cs_manager', module: 'member', action: 'edit', content: '修改会员[UID:78901234567]备注信息', result: 'success', ip: '104.2.53.119', browser: 'Chrome 120.0', os: 'Windows 11', time: '2025-01-02 12:00:45', requestData: { uid: '78901234567', remark: 'VIP客户，重点关注' }, responseData: { code: 200, msg: '修改成功' } }
])

// 筛选后的数据
const filteredData = computed(() => {
  let data = [...logData.value]

  // 非超级管理员只能看自己的日志
  if (!isSuperAdmin.value) {
    data = data.filter(item => item.adminId === currentAdminId.value)
  }

  // 搜索
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    data = data.filter(item =>
      item.content.toLowerCase().includes(keyword) ||
      item.adminName.toLowerCase().includes(keyword) ||
      item.adminAccount.toLowerCase().includes(keyword) ||
      item.ip.toLowerCase().includes(keyword)
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
    member: t('adminLog.moduleMember'),
    order: t('adminLog.moduleOrder'),
    withdraw: t('adminLog.moduleWithdraw'),
    recharge: t('adminLog.moduleRecharge'),
    goods: t('adminLog.moduleGoods'),
    system: t('adminLog.moduleSystem'),
    auth: t('adminLog.moduleAuth'),
    login: t('adminLog.moduleLogin')
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
    login: t('adminLog.actionLogin'),
    logout: t('adminLog.actionLogout'),
    add: t('adminLog.actionAdd'),
    edit: t('adminLog.actionEdit'),
    delete: t('adminLog.actionDelete'),
    approve: t('adminLog.actionApprove'),
    reject: t('adminLog.actionReject'),
    export: t('adminLog.actionExport')
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

// 点击 IP 查询归属地
const handleIpClick = async (record) => {
  // 关闭其他行的popover
  logData.value.forEach(item => {
    if (item.id !== record.id) {
      item.ipPopoverVisible = false
    }
  })

  // 设置加载状态
  ipModal.ip = record.ip
  ipModal.location = '查询中...'
  ipModal.isp = '查询中...'
  record.ipPopoverVisible = true

  try {
    // 使用 ip-api.com 免费API实时查询IP归属地（简体中文）
    const response = await fetch(`http://ip-api.com/json/${record.ip}?lang=zh-CN`)
    const data = await response.json()

    if (data.status === 'success') {
      // 拼接地区信息
      const location = [data.country, data.regionName, data.city]
        .filter(Boolean)
        .join(' ')
      ipModal.location = location || '未知地区'
      ipModal.isp = data.isp || data.org || '未知运营商'
    } else {
      ipModal.location = data.message || '无法查询'
      ipModal.isp = '不适用'
    }
  } catch (error) {
    console.error('IP查询失败:', error)
    ipModal.location = '查询失败'
    ipModal.isp = '网络错误'
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 筛选
const handleFilter = () => {
  filterDrawer.visible = false
  pagination.current = 1
  message.success('筛选完成')
}

// 重置筛选
const handleResetFilter = () => {
  filterDrawer.admin = ''
  filterDrawer.module = ''
  filterDrawer.action = ''
  filterDrawer.result = ''
  filterDrawer.ip = ''
  filterDrawer.startTime = null
  filterDrawer.endTime = null
  filterDrawer.sortField = 'time'
  filterDrawer.sortType = 'desc'
}

// 分页
const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

// 导出
const handleExport = () => {
  loading.value = true
  // 模拟导出
  setTimeout(() => {
    // 创建CSV内容
    const headers = ['ID', '管理员', '账号', '模块', '类型', '内容', '结果', 'IP', '时间']
    const rows = filteredData.value.map(item => [
      item.id,
      item.adminName,
      item.adminAccount,
      getModuleName(item.module),
      getActionName(item.action),
      item.content,
      item.result === 'success' ? '成功' : '失败',
      item.ip,
      item.time
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `管理员日志_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)

    loading.value = false
    message.success('导出成功')
  }, 500)
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 16px;
  flex-shrink: 0;

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
  }
}

.table-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;

  :deep(.ant-table-wrapper) {
    flex: 1;

    .ant-table {
      height: 100%;
    }

    .ant-table-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .ant-table-body {
      flex: 1;
    }
  }

  .page-footer {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    margin-top: auto;

    .total-text {
      color: #666;
      font-size: 14px;
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

// 详情链接和IP链接
.detail-link,
.ip-link {
  color: #1890ff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

// 筛选抽屉样式
.filter-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .close-icon {
      cursor: pointer;
      font-size: 16px;
      color: #666;

      &:hover {
        color: #333;
      }
    }

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.filter-form {
  .filter-item {
    margin-bottom: 20px;

    .filter-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }
  }
}

// IP归属地气泡卡片样式
.ip-popover-content {
  min-width: 200px;

  .ip-info-item {
    display: flex;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 70px;
      color: #666;
      flex-shrink: 0;
      font-size: 13px;
    }

    .value {
      color: #333;
      font-weight: 500;
      font-size: 13px;
    }
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
