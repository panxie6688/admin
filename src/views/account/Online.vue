<template>
  <div class="online-container" :class="`size-${tableSize}`">
    <!-- 页面标题和搜索区域 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">在线管理</h2>
      </div>
      <div class="header-right">
        <a-input
          v-model:value="searchForm.keyword"
          placeholder="单号、会员信息"
          style="width: 180px"
          allow-clear
        >
          <template #suffix>
            <SearchOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
        <a-button type="primary" @click="openSearchDrawer">更多搜索</a-button>
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
        <a-dropdown>
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleDensityChange" :selectedKeys="[tableSize]">
              <a-menu-item key="large">宽松</a-menu-item>
              <a-menu-item key="middle">中等</a-menu-item>
              <a-menu-item key="small">紧凑</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        :size="tableSize"
        :scroll="{ x: 980, y: tableScrollY }"
        row-key="id"
        bordered
      >
        <!-- 会员列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'member'">
            <div class="member-cell">
              <a class="member-id">{{ record.memberId }}</a>
              <a-dropdown>
                <DownOutlined class="dropdown-icon" />
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1">查看详情</a-menu-item>
                    <a-menu-item key="2">编辑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>

          <!-- 用户名列 -->
          <template v-else-if="column.key === 'username'">
            <span class="username-text">{{ record.username }}</span>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a class="action-link" @click="handleForceLogout(record)">强制退出</a>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 固定分页 -->
    <TablePagination
      v-model:current="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :show-quick-jumper="true"
    />

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawerVisible"
      title="筛选"
      placement="right"
      :width="450"
      class="search-drawer"
      root-class-name="rounded-drawer"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="handleResetSearch">重置</a-button>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </a-space>
      </template>

      <a-form layout="vertical" :model="advancedSearch">
        <a-form-item label="总代理">
          <a-select
            v-model:value="advancedSearch.topAgent"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="代理">
          <a-select
            v-model:value="advancedSearch.agent"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="会员UID" class="uid-form-item">
          <div style="display: flex; gap: 8px;">
            <a-input
              v-model:value="advancedSearch.memberUid"
              placeholder="请输入会员ID"
              style="flex: 1;"
              size="large"
            />
            <a-button type="primary" @click="handleSearchUid" size="large">搜 索</a-button>
          </div>
        </a-form-item>

        <a-form-item label="客户端">
          <a-input
            v-model:value="advancedSearch.client"
            placeholder="输入"
          />
        </a-form-item>

        <a-form-item label="IP">
          <a-input
            v-model:value="advancedSearch.ip"
            placeholder="输入"
          />
        </a-form-item>

        <a-form-item label="登录方式">
          <a-select
            v-model:value="advancedSearch.loginType"
            placeholder="选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="none">无</a-select-option>
            <a-select-option value="email">邮箱</a-select-option>
            <a-select-option value="phone">手机号</a-select-option>
            <a-select-option value="scan">扫码</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="开始时间" class="time-form-item">
          <a-date-picker
            v-model:value="advancedSearch.startTime"
            placeholder="请选择日期"
            style="width: 100%"
            size="large"
          />
        </a-form-item>

        <a-form-item label="结束时间" class="time-form-item">
          <a-date-picker
            v-model:value="advancedSearch.endTime"
            placeholder="请选择日期"
            style="width: 100%"
            size="large"
          />
        </a-form-item>

        <a-form-item label="搜索(手机号、邮箱等等)">
          <a-input
            v-model:value="advancedSearch.searchContent"
            placeholder="搜索内容"
          >
            <template #suffix>
              <SearchOutlined style="color: #bfbfbf" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="排序字段">
          <a-select
            v-model:value="advancedSearch.sortField"
            placeholder="请选择"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="time">时间</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序类型">
          <a-select
            v-model:value="advancedSearch.sortType"
            placeholder="请选择"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import {
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode')
const contentFullscreen = inject('contentFullscreen')
const toggleContentFullscreen = inject('toggleContentFullscreen')

// 表格滚动高度
const tableScrollY = ref(400)

const calcTableHeight = () => {
  const headerHeight = 64
  const contentMargin = 32
  const pageHeader = 56
  const paginationHeight = 56
  const extra = 24
  tableScrollY.value = window.innerHeight - headerHeight - contentMargin - pageHeader - paginationHeight - extra
}

onMounted(() => {
  calcTableHeight()
  window.addEventListener('resize', calcTableHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calcTableHeight)
})

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 更多搜索抽屉
const searchDrawerVisible = ref(false)
const advancedSearch = reactive({
  topAgent: undefined,
  agent: undefined,
  memberUid: '',
  client: '',
  ip: '',
  loginType: undefined,
  startTime: null,
  endTime: null,
  searchContent: '',
  sortField: 'time',
  sortType: 'desc'
})

// 打开搜索抽屉
const openSearchDrawer = () => {
  searchDrawerVisible.value = true
}

// 重置搜索
const handleResetSearch = () => {
  advancedSearch.topAgent = undefined
  advancedSearch.agent = undefined
  advancedSearch.memberUid = ''
  advancedSearch.client = ''
  advancedSearch.ip = ''
  advancedSearch.loginType = undefined
  advancedSearch.startTime = null
  advancedSearch.endTime = null
  advancedSearch.searchContent = ''
  advancedSearch.sortField = 'time'
  advancedSearch.sortType = 'desc'
}

// 提交搜索
const handleSubmitSearch = () => {
  searchDrawerVisible.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('搜索完成')
  }, 500)
}

// 搜索UID
const handleSearchUid = () => {
  if (advancedSearch.memberUid) {
    message.info(`搜索会员UID: ${advancedSearch.memberUid}`)
  }
}

// 加载状态
const loading = ref(false)

// 表格密度
const tableSize = ref('large')

// 表格列配置
const columns = [
  {
    title: '会员',
    key: 'member',
    dataIndex: 'memberId',
    width: 150,
    align: 'center',
    ellipsis: true
  },
  {
    title: '用户名',
    key: 'username',
    dataIndex: 'username',
    width: 120,
    align: 'center',
    ellipsis: true
  },
  {
    title: '登录账户',
    dataIndex: 'loginAccount',
    key: 'loginAccount',
    width: 130,
    align: 'center',
    ellipsis: true
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
    width: 80,
    align: 'center'
  },
  {
    title: '设备',
    dataIndex: 'device',
    key: 'device',
    width: 280,
    align: 'center',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 90,
    align: 'center',
    fixed: 'right'
  }
]

// 模拟数据
const tableData = ref([
  { id: 1, memberId: '1-12352136489', username: 'jj03', loginAccount: 'JJ03', ip: '128.14.78.178', client: 'h5', device: 'Edge v 143.0.0.0(Windows v 10.0)' },
  { id: 2, memberId: '1-2233445566677', username: '0003', loginAccount: '0003', ip: '175.100.59.110', client: 'h5', device: 'Chrome v 143.0.0.0(Windows v 10.0)' },
  { id: 3, memberId: '1-4255550100', username: '4255550100', loginAccount: '4255550100', ip: '36.37.253.114', client: 'h5', device: 'Chrome v 143.0.0.0(Windows v 10.0)' },
  { id: 4, memberId: '1-8609927282', username: '8609927282', loginAccount: '8609927282', ip: '146.70.24.106', client: 'h5', device: 'Safari v 18.6.2(iOS v 18.6.2)' },
  { id: 5, memberId: '1-7277447888', username: 'Vin123', loginAccount: 'Vin123', ip: '172.56.103.10', client: 'h5', device: 'Safari v 18.6(iOS v 18.6.2)' },
  { id: 6, memberId: '1-4077445596', username: 'Caesford', loginAccount: 'Caesford', ip: '68.202.239.125', client: 'h5', device: 'Edge v 143.0.0.0(Windows v 10.0)' },
  { id: 7, memberId: '1-937-475-0912', username: 'Michael1212', loginAccount: 'Michael1212', ip: '174.200.121.156', client: 'h5', device: 'Samsung Browser v 29.0(Android v 10)' },
  { id: 8, memberId: '1-9729216784', username: 'josemorales704', loginAccount: 'Josemorales704', ip: '108.249.177.162', client: 'h5', device: 'Chrome v 143.0.0.0(Android v 10)' },
  { id: 9, memberId: '1-1681681688', username: '小陆168', loginAccount: '小陆168', ip: '128.14.78.181', client: 'h5', device: 'Chrome v 142.0.0.0(Windows v 10.0)' },
  { id: 10, memberId: '1-4707174248', username: 'Shaneikque1', loginAccount: 'Shaneikque1', ip: '104.28.39.141', client: 'h5', device: 'Safari v 26.1(iOS v 18.7)' },
  { id: 11, memberId: '1-3609479257', username: 'Raal777', loginAccount: '1-3609479257', ip: '174.204.194.103', client: 'h5', device: 'Safari v 18.7(iOS v 18.7.1)' },
  { id: 12, memberId: '1-6133062544', username: 'Skysthelimit', loginAccount: 'Skysthelimit', ip: '65.95.151.142', client: 'h5', device: 'Chrome v 142.0.0.0(Android v 10)' },
  { id: 13, memberId: '1268-7735626', username: 'Pluto', loginAccount: 'Pluto', ip: '216.48.98.238', client: 'h5', device: 'Safari v 18.5(iOS v 18.5)' },
  { id: 14, memberId: '1-15644914484', username: 'canglong002', loginAccount: 'canglong002', ip: '98.98.93.68', client: 'h5', device: 'Chrome v 142.0.0.0(Windows v 10.0)' },
  { id: 15, memberId: '1-123654789//', username: 'daxin111', loginAccount: 'daxin111', ip: '98.98.93.68', client: 'h5', device: 'Chrome v 142.0.0.0(Windows v 10.0)' },
  { id: 16, memberId: '1-817-897-5229', username: 'YellowGirl', loginAccount: '1-817-897-5229', ip: '47.32.201.14', client: 'h5', device: 'Chrome v 142.0.0.0(Android v 10)' },
  { id: 17, memberId: '1-15498745612', username: '白泽', loginAccount: '白泽', ip: '98.98.93.68', client: 'h5', device: 'Chrome v 142.0.0.0(Windows v 10.0)' },
  { id: 18, memberId: '1-7602299834', username: 'Smithjane', loginAccount: '1-7602299834', ip: '102.88.112.242', client: 'h5', device: 'Safari v 15.6.7(iOS v 15.8.4)' },
  { id: 19, memberId: '1-4076634901', username: 'Bcabre', loginAccount: 'Bcabre', ip: '174.227.237.246', client: 'h5', device: 'Chrome v 141.0.0.0(Android v 10)' },
  { id: 20, memberId: '1-9804280512', username: 'Sylenam', loginAccount: 'Sylenam', ip: '166.194.204.13', client: 'h5', device: 'Chrome v 141.0.0.0(Android v 10)' }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 1855
})

// 刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('刷新完成')
  }, 500)
}

// 密度切换
const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

// 强制退出
const handleForceLogout = (record) => {
  Modal.confirm({
    title: '确认强制退出',
    content: `确认要强制退出用户 "${record.username}" 登录信息吗？退出后需要重新登录`,
    okText: '确定',
    cancelText: '取消',
    class: 'warning-modal',
    onOk() {
      message.success(`已强制退出用户: ${record.username}`)
    }
  })
}
</script>

<style scoped lang="less">
.online-container {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  .page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        margin: 0;
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
    overflow: hidden;
    padding: 0 16px;
    min-height: 0;
  }

  .member-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .member-id {
      color: #1890ff;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
      }
    }

    .dropdown-icon {
      margin-left: 6px;
      font-size: 10px;
      color: #999;
      cursor: pointer;
    }
  }

  .username-text {
    color: #1890ff;
  }

  .action-link {
    color: #ff4d4f;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: #ff7875;
    }
  }

  // 密度样式
  &.size-large :deep(.ant-table) {
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
}

:deep(.ant-table-wrapper) {
  height: 100%;

  .ant-spin-nested-loading {
    height: 100%;

    .ant-spin-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .ant-table {
    flex: 1;
    overflow: hidden;
  }
}

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 500;
    color: #333;
    font-size: 14px;
    text-align: center;

    &::before {
      display: none !important;
    }
  }

  .ant-table-tbody > tr > td {
    font-size: 14px;
    color: #333;
    text-align: center;
  }

  .ant-table-tbody > tr:hover > td {
    background: #fafafa;
  }
}

:deep(.ant-pagination) {
  margin: 0;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  border-radius: 4px;
}

// 搜索抽屉样式
:deep(.ant-drawer) {
  .ant-drawer-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .ant-drawer-body {
    padding: 16px 24px;
  }

  .ant-form-item {
    margin-bottom: 16px;

    .ant-form-item-label > label {
      color: #333;
      font-size: 14px;
    }
  }

  .uid-form-item,
  .time-form-item {
    margin-bottom: 20px;

    .ant-form-item-label > label {
      font-weight: 500;
    }
  }

  .ant-select,
  .ant-input,
  .ant-picker {
    border-radius: 4px;
  }
}
</style>
