<template>
  <div class="vip-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">VIP等级设置</h2>
        <a-button type="primary" class="add-btn" @click="handleAdd">
          <plus-outlined /> 添加数据
        </a-button>
      </div>
      <div class="header-right">
        <a-input
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 160px"
          allow-clear
        >
          <template #suffix>
            <search-outlined style="color: #bfbfbf" />
          </template>
        </a-input>
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? '退出全屏' : '全屏'">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <fullscreen-exit-outlined v-if="contentFullscreen" />
              <fullscreen-outlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="handleRefresh">
            <template #icon><reload-outlined /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown>
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <template #icon><column-height-outlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleDensityChange" :selectedKeys="[tableSize]">
              <a-menu-item key="default">默认</a-menu-item>
              <a-menu-item key="middle">中等</a-menu-item>
              <a-menu-item key="small">紧凑</a-menu-item>
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
        :loading="loading"
        :pagination="false"
        :size="tableSize"
        :scroll="{ x: 1800, y: tableScrollY }"
        row-key="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- LOGO列 -->
          <template v-if="column.dataIndex === 'logo'">
            <img :src="record.logo" class="level-logo" />
          </template>
          <!-- 名称列 -->
          <template v-else-if="column.dataIndex === 'name'">
            <span class="level-name">{{ record.name }}</span>
          </template>
          <!-- 等级列 -->
          <template v-else-if="column.dataIndex === 'level'">
            <span>{{ record.level }}</span>
          </template>
          <!-- 佣金单一 -->
          <template v-else-if="column.dataIndex === 'commissionSingle'">
            <span class="commission-text">{{ record.commissionSingle }}</span>
          </template>
          <!-- 佣金连单 -->
          <template v-else-if="column.dataIndex === 'commissionMulti'">
            <span class="commission-text">{{ record.commissionMulti }}</span>
          </template>
          <!-- 次数 -->
          <template v-else-if="column.dataIndex === 'times'">
            <span class="times-text">{{ record.times }}</span>
          </template>
          <!-- 单日限制 -->
          <template v-else-if="column.dataIndex === 'dailyLimit'">
            <span class="withdraw-text">{{ record.dailyLimit }}</span>
          </template>
          <!-- 最低数量 -->
          <template v-else-if="column.dataIndex === 'minAmount'">
            <span class="withdraw-text">{{ record.minAmount }}</span>
          </template>
          <!-- 最高数量 -->
          <template v-else-if="column.dataIndex === 'maxAmount'">
            <span class="withdraw-text">{{ record.maxAmount }}</span>
          </template>
          <!-- 手续费 -->
          <template v-else-if="column.dataIndex === 'fee'">
            <span class="fee-text">{{ record.fee }}</span>
          </template>
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space :size="12">
              <a class="action-link edit" @click="handleEdit(record)">编辑</a>
              <a class="action-link info" @click="handleInfo(record)">说明</a>
              <a class="action-link delete" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <span class="total-text">统计: {{ pagination.total }}/条</span>
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="false"
        :show-quick-jumper="false"
        simple
      />
    </div>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="等级名称">
          <a-input v-model:value="formData.name" placeholder="请输入等级名称" />
        </a-form-item>
        <a-form-item label="等级">
          <a-input-number v-model:value="formData.level" placeholder="请输入等级" style="width: 100%" />
        </a-form-item>
        <a-form-item label="金额(USD)">
          <a-input-number v-model:value="formData.amount" placeholder="请输入金额" style="width: 100%" />
        </a-form-item>
        <a-form-item label="任务数量">
          <a-input-number v-model:value="formData.taskCount" placeholder="请输入任务数量" style="width: 100%" />
        </a-form-item>
        <a-form-item label="组数">
          <a-input-number v-model:value="formData.groupCount" placeholder="请输入组数" style="width: 100%" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="佣金-单一(%)">
              <a-input-number v-model:value="formData.commissionSingle" placeholder="请输入" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="佣金-连单(%)">
              <a-input-number v-model:value="formData.commissionMulti" placeholder="请输入" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="次数">
          <a-input-number v-model:value="formData.times" placeholder="请输入次数" style="width: 100%" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="单日限制">
              <a-input-number v-model:value="formData.dailyLimit" placeholder="请输入" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最低数量">
              <a-input-number v-model:value="formData.minAmount" placeholder="请输入" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最高数量">
              <a-input-number v-model:value="formData.maxAmount" placeholder="请输入" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="手续费(%)">
          <a-input-number v-model:value="formData.fee" placeholder="请输入手续费" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 说明弹窗 -->
    <a-modal
      v-model:open="infoModalVisible"
      title="等级说明"
      :footer="null"
      :width="500"
    >
      <div class="info-content">
        <p><strong>等级名称：</strong>{{ currentRecord?.name }}</p>
        <p><strong>等级：</strong>{{ currentRecord?.level }}</p>
        <p><strong>金额(USD)：</strong>{{ currentRecord?.amount }}</p>
        <p><strong>任务数量：</strong>{{ currentRecord?.taskCount }}</p>
        <p><strong>组数：</strong>{{ currentRecord?.groupCount }}</p>
        <p><strong>佣金(单一)：</strong>{{ currentRecord?.commissionSingle }}</p>
        <p><strong>佣金(连单)：</strong>{{ currentRecord?.commissionMulti }}</p>
        <p><strong>次数：</strong>{{ currentRecord?.times }}</p>
        <p><strong>单日限制：</strong>{{ currentRecord?.dailyLimit }}</p>
        <p><strong>最低数量：</strong>{{ currentRecord?.minAmount }}</p>
        <p><strong>最高数量：</strong>{{ currentRecord?.maxAmount }}</p>
        <p><strong>手续费：</strong>{{ currentRecord?.fee }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import {
  PlusOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode')
const contentFullscreen = inject('contentFullscreen')
const toggleContentFullscreen = inject('toggleContentFullscreen')

// 搜索
const searchText = ref('')

// 表格滚动高度
const tableScrollY = ref(400)

const calcTableHeight = () => {
  const headerHeight = 64
  const contentMargin = 32
  const pageHeader = 56
  const paginationHeight = 56
  const extra = 20
  tableScrollY.value = window.innerHeight - headerHeight - contentMargin - pageHeader - paginationHeight - extra
}

onMounted(() => {
  calcTableHeight()
  window.addEventListener('resize', calcTableHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calcTableHeight)
})

// 加载状态
const loading = ref(false)

// 表格密度
const tableSize = ref('default')

// 表格列配置 - 带合并表头
const columns = [
  {
    title: 'LOGO',
    dataIndex: 'logo',
    key: 'logo',
    width: 80,
    align: 'center'
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    align: 'center'
  },
  {
    title: '等级',
    dataIndex: 'level',
    key: 'level',
    width: 60,
    align: 'center'
  },
  {
    title: '模式',
    dataIndex: 'mode',
    key: 'mode',
    width: 100,
    align: 'center'
  },
  {
    title: '金额(USD)',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    align: 'center'
  },
  {
    title: '任务数量',
    dataIndex: 'taskCount',
    key: 'taskCount',
    width: 80,
    align: 'center'
  },
  {
    title: '组数',
    dataIndex: 'groupCount',
    key: 'groupCount',
    width: 60,
    align: 'center'
  },
  {
    title: '佣金(%)',
    children: [
      {
        title: '单一',
        dataIndex: 'commissionSingle',
        key: 'commissionSingle',
        width: 80,
        align: 'center'
      },
      {
        title: '连单',
        dataIndex: 'commissionMulti',
        key: 'commissionMulti',
        width: 80,
        align: 'center'
      }
    ]
  },
  {
    title: '次数',
    dataIndex: 'times',
    key: 'times',
    width: 60,
    align: 'center',
    customHeaderCell: () => ({
      style: { color: '#1890ff' }
    })
  },
  {
    title: '提现',
    children: [
      {
        title: '单日限制',
        dataIndex: 'dailyLimit',
        key: 'dailyLimit',
        width: 100,
        align: 'center'
      },
      {
        title: '最低数量',
        dataIndex: 'minAmount',
        key: 'minAmount',
        width: 80,
        align: 'center'
      },
      {
        title: '最高数量',
        dataIndex: 'maxAmount',
        key: 'maxAmount',
        width: 100,
        align: 'center'
      }
    ]
  },
  {
    title: '手续费(%)',
    dataIndex: 'fee',
    key: 'fee',
    width: 90,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    align: 'center',
    fixed: 'right'
  }
]

// 模拟数据
const tableData = ref([
  {
    id: 1,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0ZGRjNFMCIvPjxwYXRoIGQ9Ik0yMCAxMEwyNSAyMEgyMEwxNSAzMEwyMCAyMEgxNUwyMCAxMFoiIGZpbGw9IiNGRkM0N0QiLz48L3N2Zz4=',
    name: 'Mentor-level employee',
    level: 4,
    mode: '根据系统配置',
    amount: 5000,
    taskCount: 55,
    groupCount: 6,
    commissionSingle: '1%',
    commissionMulti: '6%',
    times: 6,
    dailyLimit: 1000000000,
    minAmount: 5000,
    maxAmount: 1000000000,
    fee: '0%'
  },
  {
    id: 2,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0ZGRjNFMCIvPjxwYXRoIGQ9Ik0yMCAxMEwyNSAyMEgyMEwxNSAzMEwyMCAyMEgxNUwyMCAxMFoiIGZpbGw9IiNGRkM0N0QiLz48L3N2Zz4=',
    name: 'Senior-level employee',
    level: 3,
    mode: '根据系统配置',
    amount: 1500,
    taskCount: 50,
    groupCount: 5,
    commissionSingle: '0.8%',
    commissionMulti: '4.8%',
    times: 5,
    dailyLimit: 10000,
    minAmount: 2000,
    maxAmount: 10000,
    fee: '0%'
  },
  {
    id: 3,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0ZGRjNFMCIvPjxwYXRoIGQ9Ik0yMCAxMEwyNSAyMEgyMEwxNSAzMEwyMCAyMEgxNUwyMCAxMFoiIGZpbGw9IiNGRkM0N0QiLz48L3N2Zz4=',
    name: 'Mid-level employees',
    level: 2,
    mode: '根据系统配置',
    amount: 500,
    taskCount: 45,
    groupCount: 4,
    commissionSingle: '0.6%',
    commissionMulti: '3.6%',
    times: 4,
    dailyLimit: 10000,
    minAmount: 500,
    maxAmount: 5000,
    fee: '0%'
  },
  {
    id: 4,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0ZGRjNFMCIvPjxwYXRoIGQ9Ik0yMCAxMEwyNSAyMEgyMEwxNSAzMEwyMCAyMEgxNUwyMCAxMFoiIGZpbGw9IiNGRkM0N0QiLz48L3N2Zz4=',
    name: 'Junior-level employee',
    level: 1,
    mode: '根据系统配置',
    amount: 100,
    taskCount: 40,
    groupCount: 3,
    commissionSingle: '0.4%',
    commissionMulti: '2.4%',
    times: 4,
    dailyLimit: 3000,
    minAmount: 70,
    maxAmount: 1000,
    fee: '0%'
  }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 4
})

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('添加数据')
const isEdit = ref(false)

const formData = reactive({
  id: null,
  name: '',
  level: null,
  amount: null,
  taskCount: null,
  groupCount: null,
  commissionSingle: null,
  commissionMulti: null,
  times: null,
  dailyLimit: null,
  minAmount: null,
  maxAmount: null,
  fee: null
})

// 说明弹窗
const infoModalVisible = ref(false)
const currentRecord = ref(null)

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

// 添加
const handleAdd = () => {
  modalTitle.value = '添加数据'
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑数据'
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    level: record.level,
    amount: record.amount,
    taskCount: record.taskCount,
    groupCount: record.groupCount,
    commissionSingle: parseFloat(record.commissionSingle),
    commissionMulti: parseFloat(record.commissionMulti),
    times: record.times,
    dailyLimit: record.dailyLimit,
    minAmount: record.minAmount,
    maxAmount: record.maxAmount,
    fee: parseFloat(record.fee)
  })
  modalVisible.value = true
}

// 说明
const handleInfo = (record) => {
  currentRecord.value = record
  infoModalVisible.value = true
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除等级 "${record.name}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      message.success('删除成功')
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.level = null
  formData.amount = null
  formData.taskCount = null
  formData.groupCount = null
  formData.commissionSingle = null
  formData.commissionMulti = null
  formData.times = null
  formData.dailyLimit = null
  formData.minAmount = null
  formData.maxAmount = null
  formData.fee = null
}

// 弹窗确认
const handleModalOk = () => {
  message.success(isEdit.value ? '编辑成功' : '添加成功')
  modalVisible.value = false
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
}
</script>

<style scoped lang="less">
.vip-container {
  background: #fff;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;

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

      .add-btn {
        background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
        border: none;
        border-radius: 4px;

        &:hover {
          background: linear-gradient(135deg, #ff5a8a 0%, #ff7a70 100%);
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;

      .icon-btn {
        padding: 4px 8px;
        border: none;
        background: transparent;
        box-shadow: none;

        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    padding: 0 16px;
  }

  .pagination-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    background: #fff;

    .total-text {
      margin-right: 16px;
      color: #666;
      font-size: 14px;
    }
  }

  .level-logo {
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }

  .level-name {
    color: #333;
  }

  .commission-text {
    color: #1890ff;
  }

  .times-text {
    color: #1890ff;
  }

  .withdraw-text {
    color: #fa541c;
  }

  .fee-text {
    color: #ff4d4f;
  }

  .action-link {
    cursor: pointer;
    font-size: 13px;

    &.edit {
      color: #1890ff;
    }

    &.info {
      color: #1890ff;
    }

    &.delete {
      color: #ff4d4f;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  .info-content {
    p {
      margin-bottom: 12px;
      font-size: 14px;
      color: #333;

      strong {
        color: #666;
        margin-right: 8px;
      }
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
    font-weight: 600;
    color: #333;
    font-size: 14px;
    padding: 12px 8px;
    text-align: center;
  }

  .ant-table-tbody > tr > td {
    padding: 12px 8px;
    font-size: 14px;
    color: #333;
  }

  .ant-table-tbody > tr:hover > td {
    background: #fafafa;
  }
}

// 合并表头样式
:deep(.ant-table-thead) {
  tr:first-child th {
    &[colspan] {
      border-bottom: 1px solid #f0f0f0;
    }
  }

  // 佣金表头颜色
  th:has(> .ant-table-column-title:contains('佣金')),
  th[title*='佣金'] {
    .ant-table-column-title {
      color: #1890ff;
    }
  }

  // 提现表头颜色
  th:has(> .ant-table-column-title:contains('提现')),
  th[title*='提现'] {
    .ant-table-column-title {
      color: #fa541c;
    }
  }
}

:deep(.ant-pagination) {
  margin: 0;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
}
</style>

<style lang="less">
// 表头颜色 - 全局样式
.vip-container {
  .ant-table-thead > tr > th {
    &:nth-child(n+8):nth-child(-n+9) {
      color: #1890ff !important;
    }

    &:nth-child(n+11):nth-child(-n+13) {
      color: #fa541c !important;
    }
  }

  // 子表头颜色
  .ant-table-thead > tr:nth-child(2) > th {
    &:nth-child(1),
    &:nth-child(2) {
      color: #1890ff !important;
    }

    &:nth-child(3),
    &:nth-child(4),
    &:nth-child(5) {
      color: #fa541c !important;
    }
  }

  // 手续费表头颜色
  .ant-table-thead > tr > th:last-child {
    color: #ff4d4f !important;
  }
}
</style>
