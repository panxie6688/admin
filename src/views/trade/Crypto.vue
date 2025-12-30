<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">充币订单</span>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="showMoreSearch = true">
          更多搜索
        </a-button>
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
            <a-menu @click="handleDensityChange">
              <a-menu-item key="default" :class="{ 'active-density': tableSize === 'default' }">
                宽松
              </a-menu-item>
              <a-menu-item key="middle" :class="{ 'active-density': tableSize === 'middle' }">
                中等
              </a-menu-item>
              <a-menu-item key="small" :class="{ 'active-density': tableSize === 'small' }">
                紧凑
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :loading="loading"
        :size="tableSize"
        bordered
        :scroll="{ x: 1600 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 会员 - 下拉菜单 -->
          <template v-if="column.dataIndex === 'member'">
            <a-dropdown>
              <a class="member-link" @click.prevent>
                {{ record.member }} <caret-down-outlined style="font-size: 10px; margin-left: 4px;" />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1">查看详情</a-menu-item>
                  <a-menu-item key="2">发送消息</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <!-- 用户名 -->
          <template v-if="column.dataIndex === 'username'">
            <span class="username-text">{{ record.username }}</span>
          </template>
          <!-- 数量 -->
          <template v-if="column.dataIndex === 'amount'">
            <span class="amount-text">{{ record.amount }}</span>
          </template>
          <!-- 法币状态 -->
          <template v-if="column.dataIndex === 'fiatStatus'">
            <a-tag :color="getFiatStatusColor(record.fiatStatus)">{{ record.fiatStatus }}</a-tag>
          </template>
          <!-- 法币金额 -->
          <template v-if="column.dataIndex === 'fiatAmount'">
            <span class="fiat-amount">{{ record.fiatAmount || '-' }}</span>
          </template>
          <!-- 哈希 -->
          <template v-if="column.dataIndex === 'hash'">
            <span class="hash-text" :title="record.hash">{{ record.hash || '-' }}</span>
          </template>
          <!-- 状态 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <a class="action-link" @click="handleView(record)">查看</a>
              <a class="action-link" @click="handleConfirm(record)" v-if="record.status === '待确认'">确认</a>
              <a class="action-link danger" @click="handleReject(record)" v-if="record.status === '待确认'">驳回</a>
            </div>
          </template>
        </template>
      </a-table>
      <!-- 底部分页 -->
      <div class="page-footer">
        <span class="total-text">统计: {{ pagination.total }}/条</span>
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          size="small"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="showMoreSearch"
      title="筛选"
      placement="right"
      :width="380"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="resetFilter">重置</a-button>
          <a-button type="primary" @click="submitFilter">提交</a-button>
        </a-space>
      </template>
      <a-form layout="vertical" class="filter-form">
        <a-form-item label="状态">
          <a-select v-model:value="filterForm.status" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="confirmed">已确认</a-select-option>
            <a-select-option value="pending">待确认</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="币种">
          <a-select v-model:value="filterForm.coin" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="BTC">BTC</a-select-option>
            <a-select-option value="ETH">ETH</a-select-option>
            <a-select-option value="TRX">TRX</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="链">
          <a-select v-model:value="filterForm.chain" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="TRC20">TRC20</a-select-option>
            <a-select-option value="ERC20">ERC20</a-select-option>
            <a-select-option value="BEP20">BEP20</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会员ID">
          <a-input v-model:value="filterForm.memberId" placeholder="输入会员ID" />
        </a-form-item>
        <a-form-item label="开始时间">
          <a-date-picker
            v-model:value="filterForm.startTime"
            placeholder="选择开始时间"
            style="width: 100%"
            show-time
          />
        </a-form-item>
        <a-form-item label="结束时间">
          <a-date-picker
            v-model:value="filterForm.endTime"
            placeholder="选择结束时间"
            style="width: 100%"
            show-time
          />
        </a-form-item>
        <a-form-item label="排序字段">
          <a-select v-model:value="filterForm.sortField" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="amount">数量</a-select-option>
            <a-select-option value="time">时间</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序类型">
          <a-select v-model:value="filterForm.sortType" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序</a-select-option>
            <a-select-option value="asc">升序</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 查看详情抽屉 -->
    <a-drawer
      v-model:open="viewDrawer.visible"
      title="充币订单详情"
      placement="right"
      :width="500"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-button @click="viewDrawer.visible = false">关闭</a-button>
      </template>
      <div class="view-content" v-if="viewDrawer.record">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="会员">{{ viewDrawer.record.member }}</a-descriptions-item>
          <a-descriptions-item label="用户名">{{ viewDrawer.record.username }}</a-descriptions-item>
          <a-descriptions-item label="币种">{{ viewDrawer.record.coin }}</a-descriptions-item>
          <a-descriptions-item label="数量">{{ viewDrawer.record.amount }}</a-descriptions-item>
          <a-descriptions-item label="链">{{ viewDrawer.record.chain }}</a-descriptions-item>
          <a-descriptions-item label="哈希">
            <span class="hash-detail">{{ viewDrawer.record.hash || '-' }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="法币状态">{{ viewDrawer.record.fiatStatus }}</a-descriptions-item>
          <a-descriptions-item label="法币金额">{{ viewDrawer.record.fiatAmount || '-' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(viewDrawer.record.status)">{{ viewDrawer.record.status }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="时间">{{ viewDrawer.record.time }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CaretDownOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 表格密度
const tableSize = ref('small')
const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

// 搜索
const searchText = ref('')
const onSearch = (value) => {
  console.log('搜索:', value)
}

// 加载状态
const loading = ref(false)

// 刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 表格列配置 - 双层表头
const columns = [
  {
    title: '会员',
    dataIndex: 'member',
    key: 'member',
    width: 160,
    fixed: 'left',
    customHeaderCell: () => ({
      style: { color: '#1890ff' }
    })
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120,
    customHeaderCell: () => ({
      style: { color: '#1890ff' }
    })
  },
  {
    title: '币种',
    dataIndex: 'coin',
    key: 'coin',
    width: 80,
    align: 'center'
  },
  {
    title: '数量',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'center'
  },
  {
    title: '法币相关',
    key: 'fiat',
    customHeaderCell: () => ({
      style: { color: '#ff7875', textAlign: 'center' }
    }),
    children: [
      {
        title: '状态',
        dataIndex: 'fiatStatus',
        key: 'fiatStatus',
        width: 100,
        align: 'center',
        customHeaderCell: () => ({
          style: { color: '#ff7875' }
        })
      },
      {
        title: '金额',
        dataIndex: 'fiatAmount',
        key: 'fiatAmount',
        width: 120,
        align: 'center',
        customHeaderCell: () => ({
          style: { color: '#ff7875' }
        })
      }
    ]
  },
  {
    title: '链',
    dataIndex: 'chain',
    key: 'chain',
    width: 80,
    align: 'center'
  },
  {
    title: '哈希',
    dataIndex: 'hash',
    key: 'hash',
    width: 180,
    ellipsis: true
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    fixed: 'right'
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    align: 'center'
  }
]

// 模拟表格数据
const tableData = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 更多搜索
const showMoreSearch = ref(false)
const filterForm = reactive({
  status: undefined,
  coin: undefined,
  chain: undefined,
  memberId: '',
  startTime: null,
  endTime: null,
  sortField: 'time',
  sortType: 'desc'
})

const resetFilter = () => {
  filterForm.status = undefined
  filterForm.coin = undefined
  filterForm.chain = undefined
  filterForm.memberId = ''
  filterForm.startTime = null
  filterForm.endTime = null
  filterForm.sortField = 'time'
  filterForm.sortType = 'desc'
}

const submitFilter = () => {
  console.log('筛选:', filterForm)
  showMoreSearch.value = false
}

// 分页切换
const handlePageChange = (page) => {
  pagination.current = page
  // 重新加载数据
  handleRefresh()
}

// 查看详情抽屉
const viewDrawer = reactive({
  visible: false,
  record: null
})

const handleView = (record) => {
  viewDrawer.visible = true
  viewDrawer.record = record
}

// 确认操作
const handleConfirm = (record) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要确认订单 ${record.member} 的充币请求吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      message.success('确认成功')
    }
  })
}

// 驳回操作
const handleReject = (record) => {
  Modal.confirm({
    title: '驳回操作',
    content: `确定要驳回订单 ${record.member} 的充币请求吗？`,
    okText: '驳回',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      message.success('已驳回')
    }
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '已确认': 'success',
    '待确认': 'processing',
    '已驳回': 'error'
  }
  return colorMap[status] || 'default'
}

// 获取法币状态颜色
const getFiatStatusColor = (status) => {
  const colorMap = {
    '已兑换': 'success',
    '未兑换': 'warning',
    '兑换中': 'processing'
  }
  return colorMap[status] || 'default'
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
    margin-bottom: 16px;
    padding: 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;

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
    overflow-x: auto;
    overflow-y: auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      display: flex;
      flex-direction: column;

      .ant-spin-nested-loading,
      .ant-spin-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .ant-table {
        flex: 1;
        display: flex;
        flex-direction: column;

        .ant-table-container {
          flex: 1;
          display: flex;
          flex-direction: column;

          .ant-table-content {
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

      .ant-table-placeholder {
        .ant-table-cell {
          padding: 60px 0;
        }
      }
    }

    .member-link {
      color: #1890ff;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
      }
    }

    .username-text {
      color: #1890ff;
    }

    .amount-text {
      color: #333;
      font-weight: 500;
    }

    .fiat-amount {
      color: #ff4d4f;
    }

    .hash-text {
      color: #666;
      max-width: 150px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .action-link {
        color: #1890ff;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          color: #40a9ff;
        }

        &.danger {
          color: #ff4d4f;

          &:hover {
            color: #ff7875;
          }
        }
      }
    }

    // 分页固定在底部 - 使用 sticky
    .page-footer {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      padding: 12px 0;
      height: 48px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
      box-sizing: border-box;
      z-index: 10;
      flex-shrink: 0;

      .total-text {
        margin-right: 16px;
        color: #666;
        font-size: 14px;
        white-space: nowrap;
      }
    }
  }

  // 密度样式
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

// 会员链接
.member-link {
  color: #1890ff;
  cursor: pointer;

  &:hover {
    color: #40a9ff;
  }
}

// 用户名
.username-text {
  color: #1890ff;
}

// 数量
.amount-text {
  color: #333;
  font-weight: 500;
}

// 法币金额
.fiat-amount {
  color: #ff4d4f;
}

// 哈希
.hash-text {
  color: #666;
  max-width: 150px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 操作按钮
.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .action-link {
    color: #1890ff;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      color: #40a9ff;
    }

    &.danger {
      color: #ff4d4f;

      &:hover {
        color: #ff7875;
      }
    }
  }
}

// 密度菜单激活状态
.active-density {
  color: #1890ff;
  background: #e6f7ff;
}

// 筛选表单
.filter-form {
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
}

// 查看详情
.view-content {
  :deep(.ant-descriptions-item-label) {
    width: 100px;
    background: #fafafa;
  }

  .hash-detail {
    word-break: break-all;
  }
}
</style>
