<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <!-- Tab 切换 -->
        <div class="log-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            全部
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'email' }"
            @click="activeTab = 'email'"
          >
            邮箱
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'phone' }"
            @click="activeTab = 'phone'"
          >
            手机号
          </div>
        </div>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="filterDrawer.visible = true">
          更多搜索
        </a-button>
        <a-tooltip :title="contentFullscreen ? '退出全屏' : '全屏'">
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
              <a-menu-item key="default" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'default' }">
                默认
              </a-menu-item>
              <a-menu-item key="middle" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'middle' }">
                中等
              </a-menu-item>
              <a-menu-item key="small" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'small' }">
                紧凑
              </a-menu-item>
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
        bordered
        :scroll="{ x: 1200 }"
        row-key="id"
      >
        <!-- 方式列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'type'">
            <a-tag color="processing">{{ record.type }}</a-tag>
          </template>

          <!-- IP列 -->
          <template v-else-if="column.dataIndex === 'ip'">
            <a-popover
              v-model:open="record.ipPopoverVisible"
              trigger="click"
              placement="top"
              :arrow="{ pointAtCenter: true }"
            >
              <template #content>
                <div class="ip-popover-content">
                  <div class="ip-info-item">
                    <span class="label">IP地址：</span>
                    <span class="value">{{ ipModal.ip }}</span>
                  </div>
                  <div class="ip-info-item">
                    <span class="label">归属地：</span>
                    <span class="value">{{ ipModal.location }}</span>
                  </div>
                  <div class="ip-info-item">
                    <span class="label">运营商：</span>
                    <span class="value">{{ ipModal.isp }}</span>
                  </div>
                </div>
              </template>
              <a class="ip-link" @click="handleIpClick(record)">{{ record.ip }}</a>
            </a-popover>
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
          show-quick-jumper
          :show-total="(total, range) => `${range[0]}-${range[1]} / ${total}`"
          @change="handlePageChange"
        />
        <span class="total-text">统计: {{ pagination.total }}/条</span>
      </div>
    </div>

    <!-- 筛选抽屉 -->
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
            <span class="title">筛选</span>
          </div>
          <div class="header-right">
            <a-button type="link" @click="handleResetFilter">重置</a-button>
            <a-button type="primary" @click="handleFilter">提 交</a-button>
          </div>
        </div>
      </template>
      <div class="filter-form">
        <div class="filter-item">
          <div class="filter-label">发送方式</div>
          <a-select v-model:value="filterDrawer.type" placeholder="请选择" allow-clear style="width: 100%">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="手机号">手机号</a-select-option>
            <a-select-option value="邮箱">邮箱</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">发送账户</div>
          <a-input v-model:value="filterDrawer.account" placeholder="输入" allow-clear />
        </div>
        <div class="filter-item">
          <div class="filter-label">IP</div>
          <a-input v-model:value="filterDrawer.ip" placeholder="输入" allow-clear />
        </div>
        <div class="filter-item">
          <div class="filter-label">客户端</div>
          <a-input v-model:value="filterDrawer.client" placeholder="输入" allow-clear />
        </div>
        <div class="filter-item">
          <div class="filter-label">开始时间</div>
          <a-date-picker
            v-model:value="filterDrawer.startTime"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">结束时间</div>
          <a-date-picker
            v-model:value="filterDrawer.endTime"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">排序字段</div>
          <a-select v-model:value="filterDrawer.sortField" style="width: 100%">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="time">发送时间</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">排序类型</div>
          <a-select v-model:value="filterDrawer.sortType" style="width: 100%">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 全屏功能（从 MainLayout 注入）
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// Tab 状态
const activeTab = ref('all')

// 搜索
const searchText = ref('')

// 表格密度
const tableSize = ref('default')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 40
})

// 筛选抽屉
const filterDrawer = reactive({
  visible: false,
  type: undefined,
  account: '',
  ip: '',
  client: '',
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

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '发送账户',
    dataIndex: 'account',
    key: 'account',
    width: 140,
    align: 'center'
  },
  {
    title: '发送内容',
    dataIndex: 'content',
    key: 'content',
    width: 300,
    align: 'center'
  },
  {
    title: '方式',
    dataIndex: 'type',
    key: 'type',
    width: 80,
    align: 'center'
  },
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
    width: 130,
    align: 'center'
  },
  {
    title: '客户端',
    dataIndex: 'client',
    key: 'client',
    width: 180,
    align: 'center'
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 110,
    align: 'center'
  }
]

// 模拟数据
const tableData = ref([
  { id: 625, account: '1-3609479257', content: 'The verification code is: 050792, valid within 30 minutes', type: '手机号', ip: '67.170.145.182', client: 'Chrome v 141.0.7390.96(iOS v 18.7.1)', time: '10/31 10:43' },
  { id: 624, account: '1-4077445596', content: 'The verification code is: 475178, valid within 30 minutes', type: '手机号', ip: '68.202.239.125', client: 'Edge v 141.0.0.0(Windows v 10.0)', time: '10/23 18:48' },
  { id: 623, account: '1-4696057304', content: 'The verification code is: 610518, valid within 30 minutes', type: '手机号', ip: '107.77.199.91', client: 'Chrome v 141.0.0.0(Android v 10)', time: '10/22 18:17' },
  { id: 622, account: '1-5109783313', content: 'The verification code is: 449348, valid within 30 minutes', type: '手机号', ip: '99.92.94.175', client: 'Safari v 18.6(iOS v 18.6.2)', time: '10/08 09:07' },
  { id: 621, account: '1-6133062544', content: 'The verification code is: 892236, valid within 30 minutes', type: '手机号', ip: '134.122.34.218', client: 'Chrome v 140.0.0.0(Android v 10)', time: '10/04 19:42' },
  { id: 620, account: '1-9804280512', content: 'The verification code is: 504601, valid within 30 minutes', type: '手机号', ip: '166.194.204.13', client: 'Chrome v 140.0.0.0(Android v 10)', time: '09/30 15:51' },
  { id: 619, account: '1-8324347342', content: 'The verification code is: 735031, valid within 30 minutes', type: '手机号', ip: '104.2.53.119', client: 'Chrome v 140.0.0.0(Windows v 10.0)', time: '09/16 16:13' },
  { id: 618, account: '1-8324347342', content: 'The verification code is: 998411, valid within 30 minutes', type: '手机号', ip: '104.2.53.119', client: 'Chrome v 140.0.0.0(Windows v 10.0)', time: '09/16 16:12' },
  { id: 617, account: '1-248.755.9829', content: 'The verification code is: 993547, valid within 30 minutes', type: '手机号', ip: '174.245.17.78', client: 'Chrome v 138.0.0.0(Android v 10)', time: '09/15 18:14' },
  { id: 616, account: '1-248.755.9829', content: 'The verification code is: 653257, valid within 30 minutes', type: '手机号', ip: '174.245.17.78', client: 'Chrome v 138.0.0.0(Android v 10)', time: '09/15 18:12' },
  { id: 615, account: '1-9804280512', content: 'The verification code is: 420236, valid within 30 minutes', type: '手机号', ip: '98.24.22.138', client: 'Chrome v 139.0.0.0(Android v 10)', time: '09/08 10:10' },
  { id: 614, account: '1-8179195152', content: 'The verification code is: 760692, valid within 30 minutes', type: '手机号', ip: '75.141.152.135', client: 'Chrome v 139.0.0.0(Android v 10)', time: '09/02 15:00' },
  { id: 613, account: 'user123@gmail.com', content: 'Your verification code is: 182736, expires in 30 minutes', type: '邮箱', ip: '192.168.1.100', client: 'Chrome v 142.0.0.0(Windows v 10.0)', time: '09/01 14:25' },
  { id: 612, account: '1-7892345671', content: 'The verification code is: 293847, valid within 30 minutes', type: '手机号', ip: '45.67.89.123', client: 'Safari v 17.0(macOS v 14.0)', time: '08/30 11:32' },
  { id: 611, account: 'test456@outlook.com', content: 'Your verification code is: 847261, expires in 30 minutes', type: '邮箱', ip: '78.90.12.34', client: 'Firefox v 120.0(Windows v 11)', time: '08/28 09:15' },
  { id: 610, account: '1-5678901234', content: 'The verification code is: 192837, valid within 30 minutes', type: '手机号', ip: '123.45.67.89', client: 'Chrome v 141.0.0.0(Android v 13)', time: '08/25 16:48' },
  { id: 609, account: 'admin@company.com', content: 'Your verification code is: 374859, expires in 30 minutes', type: '邮箱', ip: '56.78.90.12', client: 'Edge v 140.0.0.0(Windows v 10.0)', time: '08/22 13:20' },
  { id: 608, account: '1-4567890123', content: 'The verification code is: 928374, valid within 30 minutes', type: '手机号', ip: '89.12.34.56', client: 'Chrome v 140.0.0.0(iOS v 17.5)', time: '08/20 10:05' },
  { id: 607, account: 'support@service.net', content: 'Your verification code is: 564738, expires in 30 minutes', type: '邮箱', ip: '34.56.78.90', client: 'Safari v 16.5(iOS v 16.5)', time: '08/18 17:33' },
  { id: 606, account: '1-3456789012', content: 'The verification code is: 847293, valid within 30 minutes', type: '手机号', ip: '67.89.01.23', client: 'Chrome v 139.0.0.0(Android v 12)', time: '08/15 08:47' },
  { id: 605, account: '1-2345678901', content: 'The verification code is: 192847, valid within 30 minutes', type: '手机号', ip: '90.12.34.56', client: 'Firefox v 119.0(Android v 11)', time: '08/12 14:22' },
  { id: 604, account: 'info@example.org', content: 'Your verification code is: 738291, expires in 30 minutes', type: '邮箱', ip: '12.34.56.78', client: 'Chrome v 138.0.0.0(Windows v 10.0)', time: '08/10 11:56' },
  { id: 603, account: '1-1234567890', content: 'The verification code is: 829374, valid within 30 minutes', type: '手机号', ip: '45.67.89.01', client: 'Safari v 16.0(macOS v 13.0)', time: '08/08 09:30' },
  { id: 602, account: 'hello@world.com', content: 'Your verification code is: 293847, expires in 30 minutes', type: '邮箱', ip: '78.90.12.34', client: 'Edge v 139.0.0.0(Windows v 11)', time: '08/05 16:15' },
  { id: 601, account: '1-9876543210', content: 'The verification code is: 473829, valid within 30 minutes', type: '手机号', ip: '23.45.67.89', client: 'Chrome v 137.0.0.0(Android v 14)', time: '08/02 13:48' },
  { id: 600, account: 'contact@demo.io', content: 'Your verification code is: 847261, expires in 30 minutes', type: '邮箱', ip: '56.78.90.12', client: 'Firefox v 118.0(Linux)', time: '07/30 10:22' },
  { id: 599, account: '1-8765432109', content: 'The verification code is: 293847, valid within 30 minutes', type: '手机号', ip: '89.01.23.45', client: 'Chrome v 136.0.0.0(iOS v 17.0)', time: '07/28 17:05' },
  { id: 598, account: 'user@platform.com', content: 'Your verification code is: 192837, expires in 30 minutes', type: '邮箱', ip: '34.56.78.90', client: 'Safari v 15.5(iOS v 15.5)', time: '07/25 14:38' },
  { id: 597, account: '1-7654321098', content: 'The verification code is: 847293, valid within 30 minutes', type: '手机号', ip: '67.89.01.23', client: 'Chrome v 135.0.0.0(Android v 13)', time: '07/22 11:12' },
  { id: 596, account: 'tech@startup.co', content: 'Your verification code is: 374859, expires in 30 minutes', type: '邮箱', ip: '90.12.34.56', client: 'Edge v 138.0.0.0(Windows v 10.0)', time: '07/20 08:45' },
  { id: 595, account: '1-6543210987', content: 'The verification code is: 928374, valid within 30 minutes', type: '手机号', ip: '12.34.56.78', client: 'Firefox v 117.0(Windows v 11)', time: '07/18 15:20' },
  { id: 594, account: 'dev@coding.dev', content: 'Your verification code is: 564738, expires in 30 minutes', type: '邮箱', ip: '45.67.89.01', client: 'Chrome v 134.0.0.0(macOS v 14.0)', time: '07/15 12:55' },
  { id: 593, account: '1-5432109876', content: 'The verification code is: 192847, valid within 30 minutes', type: '手机号', ip: '78.90.12.34', client: 'Safari v 17.0(iOS v 17.0)', time: '07/12 09:28' },
  { id: 592, account: 'sales@business.biz', content: 'Your verification code is: 738291, expires in 30 minutes', type: '邮箱', ip: '23.45.67.89', client: 'Chrome v 133.0.0.0(Windows v 10.0)', time: '07/10 16:02' },
  { id: 591, account: '1-4321098765', content: 'The verification code is: 829374, valid within 30 minutes', type: '手机号', ip: '56.78.90.12', client: 'Edge v 137.0.0.0(Windows v 11)', time: '07/08 13:35' },
  { id: 590, account: 'hr@company.org', content: 'Your verification code is: 293847, expires in 30 minutes', type: '邮箱', ip: '89.01.23.45', client: 'Firefox v 116.0(Linux)', time: '07/05 10:08' },
  { id: 589, account: '1-3210987654', content: 'The verification code is: 473829, valid within 30 minutes', type: '手机号', ip: '34.56.78.90', client: 'Chrome v 132.0.0.0(Android v 12)', time: '07/02 17:42' },
  { id: 588, account: 'ops@server.net', content: 'Your verification code is: 847261, expires in 30 minutes', type: '邮箱', ip: '67.89.01.23', client: 'Safari v 16.5(macOS v 13.5)', time: '06/30 14:15' },
  { id: 587, account: '1-2109876543', content: 'The verification code is: 293847, valid within 30 minutes', type: '手机号', ip: '90.12.34.56', client: 'Chrome v 131.0.0.0(iOS v 16.5)', time: '06/28 11:48' },
  { id: 586, account: 'legal@firm.law', content: 'Your verification code is: 192837, expires in 30 minutes', type: '邮箱', ip: '12.34.56.78', client: 'Edge v 136.0.0.0(Windows v 10.0)', time: '06/25 08:22' }
])

// 过滤数据
const filteredData = computed(() => {
  let data = [...tableData.value]

  // 按 Tab 过滤
  if (activeTab.value === 'email') {
    data = data.filter(item => item.type === '邮箱')
  } else if (activeTab.value === 'phone') {
    data = data.filter(item => item.type === '手机号')
  }

  // 按搜索关键词过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    data = data.filter(item =>
      item.account.toLowerCase().includes(keyword) ||
      item.content.toLowerCase().includes(keyword) ||
      item.ip.toLowerCase().includes(keyword)
    )
  }

  return data
})

// 搜索
const handleSearch = () => {
  pagination.current = 1
  message.success('搜索完成')
}

// 点击 IP 查询归属地
const handleIpClick = async (record) => {
  // 关闭其他行的popover
  tableData.value.forEach(item => {
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

// 刷新
const handleRefresh = () => {
  message.success('刷新成功')
}

// 密度切换
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 分页
const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

// 筛选
const handleFilter = () => {
  filterDrawer.visible = false
  pagination.current = 1
  message.success('筛选完成')
}

// 重置筛选
const handleResetFilter = () => {
  filterDrawer.type = undefined
  filterDrawer.account = ''
  filterDrawer.ip = ''
  filterDrawer.client = ''
  filterDrawer.startTime = null
  filterDrawer.endTime = null
  filterDrawer.sortField = 'time'
  filterDrawer.sortType = 'desc'
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
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// Tab 切换样式
.log-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid transparent;

  .tab-item {
    padding: 8px 16px;
    cursor: pointer;
    color: #666;
    position: relative;
    transition: all 0.3s;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #1890ff;
      }
    }
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

// IP 链接样式
.ip-link {
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
</style>
