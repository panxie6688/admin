<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">后台充值记录</span>
        <a-button type="primary" @click="handleAdd">
          <plus-outlined /> 添加数据
        </a-button>
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
        :scroll="{ x: 1200, y: 'calc(100vh - 280px)' }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 订单号 - 蓝色可点击 -->
          <template v-if="column.dataIndex === 'orderNo'">
            <span style="color: #1890ff; cursor: pointer;">{{ record.orderNo }}</span>
          </template>
          <!-- 会员 - 下拉菜单 -->
          <template v-if="column.dataIndex === 'member'">
            <a-dropdown>
              <a style="color: #1890ff; cursor: pointer;" @click.prevent>
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
          <!-- 数量 - 绿色/红色 -->
          <template v-if="column.dataIndex === 'amount'">
            <span :style="{ color: record.type === '增加' ? '#52c41a' : '#ff4d4f', fontSize: '16px' }">{{ record.amount }}</span>
          </template>
          <!-- 类型 - 标签 -->
          <template v-if="column.dataIndex === 'type'">
            <a-tag :color="record.type === '增加' ? 'success' : 'error'">{{ record.type }}</a-tag>
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
              <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleFinance(record)">财务</a>
              <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleContinue(record)">继续</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 底部分页和统计 -->
    <div class="page-footer">
      <div class="footer-left">
        <span class="total-text">统计: {{ pagination.total }}/条</span>
        <a-pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          size="small"
          show-quick-jumper
          :show-size-changer="false"
        />
      </div>
      <div class="footer-right">
        <span class="stats-item">本页统计  累计: <span class="stats-value blue">{{ stats.pageTotal }}</span>  有效: <span class="stats-value green">{{ stats.pageValid }}</span>  无效: <span class="stats-value red">{{ stats.pageInvalid }}</span></span>
        <span class="stats-item">全部统计  累计: <span class="stats-value blue">{{ stats.allTotal }}</span>  有效: <span class="stats-value green">{{ stats.allValid }}</span>  无效: <span class="stats-value red">{{ stats.allInvalid }}</span></span>
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
            <a-select-option value="add">增加</a-select-option>
            <a-select-option value="sub">扣减</a-select-option>
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
        <a-form-item label="搜索">
          <a-input v-model:value="filterForm.keyword" placeholder="搜索关键词" />
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

    <!-- 添加数据抽屉 -->
    <a-drawer
      v-model:open="addDrawer.visible"
      :title="addDrawer.isEdit ? '后台充值-继续' : '后台充值-创建'"
      placement="right"
      :width="480"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button @click="addDrawer.visible = false">取消</a-button>
          <a-button type="primary" @click="submitAdd">提交</a-button>
        </a-space>
      </template>
      <div class="add-drawer-content">
        <!-- 会员信息卡片 -->
        <div class="member-info-card">
          <div class="info-row">
            <span class="info-label">会员UID</span>
            <span class="info-value" v-if="addDrawer.isEdit">{{ addDrawer.memberUid }}</span>
            <a-input v-else v-model:value="addDrawer.memberUid" placeholder="输入会员UID" style="width: 200px;" @blur="handleMemberUidBlur" />
          </div>
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ addDrawer.username || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">可用余额</span>
            <span class="info-value highlight">{{ addDrawer.availableAmount.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">冻结余额</span>
            <span class="info-value">{{ addDrawer.frozenAmount.toFixed(2) }}</span>
          </div>
        </div>

        <a-form layout="vertical" class="add-form">
          <a-form-item label="操作类型" required>
            <a-radio-group v-model:value="addDrawer.type" button-style="solid" class="type-radio-group">
              <a-radio-button value="add" class="add-btn">
                <plus-outlined /> 增加
              </a-radio-button>
              <a-radio-button value="sub" class="subtract-btn">
                <minus-outlined /> 扣减
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="数量" required>
            <a-input-number
              v-model:value="addDrawer.amount"
              placeholder="请输入数量"
              :min="0"
              :precision="2"
              style="width: 100%"
              size="large"
            />
          </a-form-item>

          <a-form-item label="变动后余额">
            <div class="result-balance" :class="{ 'is-negative': computedNewBalance < 0 }">
              {{ computedNewBalance.toFixed(2) }}
            </div>
          </a-form-item>

          <a-form-item label="说明">
            <a-textarea v-model:value="addDrawer.remark" placeholder="输入说明（选填）" :rows="3" show-count :maxlength="200" />
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>

    <!-- 财务日志抽屉 -->
    <a-drawer
      v-model:open="financeDrawer.visible"
      title="财务日志"
      placement="right"
      :width="600"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-button @click="financeDrawer.visible = false">关闭</a-button>
      </template>
      <div class="finance-content">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="订单号">{{ financeDrawer.record?.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="会员">{{ financeDrawer.record?.member }}</a-descriptions-item>
          <a-descriptions-item label="用户名">{{ financeDrawer.record?.username }}</a-descriptions-item>
          <a-descriptions-item label="数量">{{ financeDrawer.record?.amount }}</a-descriptions-item>
          <a-descriptions-item label="类型">{{ financeDrawer.record?.type }}</a-descriptions-item>
          <a-descriptions-item label="时间">{{ financeDrawer.record?.time }}</a-descriptions-item>
          <a-descriptions-item label="理由">{{ financeDrawer.record?.reason || '-' }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed } from 'vue'
import {
  PlusOutlined,
  MinusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CaretDownOutlined
} from '@ant-design/icons-vue'

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

// 表格列配置
const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 200,
    fixed: 'left'
  },
  {
    title: '会员',
    dataIndex: 'member',
    key: 'member',
    width: 150
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120
  },
  {
    title: '数量',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'center'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 80,
    align: 'center'
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: '理由',
    dataIndex: 'reason',
    key: 'reason',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    align: 'center'
  }
]

// 模拟表格数据
const tableData = ref([
  { id: 1, orderNo: '20251124176400045613505263', member: '1-12548754125', username: 'QQ7788', amount: 500, type: '增加', time: '2025-11-24 10:07:36', reason: '赠送余额' },
  { id: 2, orderNo: '20251122176385625388523422', member: '1-8609927282', username: '8609927282', amount: 5230, type: '增加', time: '2025-11-22 18:04:14', reason: '赠送余额' },
  { id: 3, orderNo: '20251120176366397967874844', member: '1-937-475-0912', username: 'Michael1212', amount: 100, type: '增加', time: '2025-11-20 12:39:40', reason: '赠送余额' },
  { id: 4, orderNo: '20251115176325330423275511', member: '1-937-475-0912', username: 'Michael1212', amount: 100, type: '增加', time: '2025-11-15 18:35:04', reason: '赠送余额' },
  { id: 5, orderNo: '20251108176264116053787163', member: '1-937-475-0912', username: 'Michael1212', amount: 100, type: '增加', time: '2025-11-08 16:32:41', reason: '赠送余额' },
  { id: 6, orderNo: '20251030176184081191097082', member: '1-937-475-0912', username: 'Michael1212', amount: 100, type: '增加', time: '2025-10-30 10:13:32', reason: '赠送余额' },
  { id: 7, orderNo: '20251026176152669439860932', member: '1-4707174248', username: 'Shaneikque1', amount: 14, type: '增加', time: '2025-10-26 18:58:14', reason: '赠送余额' },
  { id: 8, orderNo: '20251026176149843249258582', member: '1-1649', username: 'Ashley9621', amount: 1592.17, type: '扣减', time: '2025-10-26 11:07:12', reason: '' },
  { id: 9, orderNo: '20251025176140436386485103', member: '1-937-475-0912', username: 'Michael1212', amount: 100, type: '增加', time: '2025-10-25 08:59:24', reason: '赠送余额' },
  { id: 10, orderNo: '20251024176133327739393', member: '1-1649', username: 'Ashley9621', amount: 244, type: '增加', time: '2025-10-24 13:15:28', reason: '赠送余额' },
  { id: 11, orderNo: '20251024176133115433884582', member: '1-1649', username: 'Ashley9621', amount: 1060, type: '增加', time: '2025-10-24 12:39:14', reason: '' },
  { id: 12, orderNo: '20251024176132520251449035', member: '1-8609927282', username: '8609927282', amount: 52724, type: '增加', time: '2025-10-24 11:00:03', reason: '赠送余额' },
  { id: 13, orderNo: '20251024176132460872127129', member: '1-8609927282', username: '8609927282', amount: 11100, type: '增加', time: '2025-10-24 10:50:09', reason: '赠送余额' },
  { id: 14, orderNo: '20251023176127203431479471', member: '1-4696057304', username: 'Maktx', amount: 1997, type: '增加', time: '2025-10-23 20:13:54', reason: '赠送余额' },
  { id: 15, orderNo: '20251023176127120108179123', member: '1-9804280512', username: 'Sylenam', amount: 11, type: '增加', time: '2025-10-23 20:00:01', reason: '赠送余额' },
  { id: 16, orderNo: '20251023176126981677965861', member: '1-9804280512', username: 'Sylenam', amount: 93.25, type: '增加', time: '2025-10-23 19:36:57', reason: '赠送余额' },
  { id: 17, orderNo: '20251023176126677081833537', member: '1-9804280512', username: 'Sylenam', amount: 1593, type: '增加', time: '2025-10-23 18:46:11', reason: '赠送余额' },
  { id: 18, orderNo: '20251023176125936789214874', member: '1-9804280512', username: 'Sylenam', amount: 2902, type: '增加', time: '2025-10-23 16:42:48', reason: '赠送余额' }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 7701
})

// 统计数据
const stats = reactive({
  pageTotal: '-180170794.13000304',
  pageValid: '494735458.5000002',
  pageInvalid: '314564664.3699971',
  allTotal: '-180170794.13000304',
  allValid: '494735458.5000002',
  allInvalid: '314564664.3699971'
})

// 更多搜索
const showMoreSearch = ref(false)
const filterForm = reactive({
  status: undefined,
  memberId: '',
  startTime: null,
  endTime: null,
  keyword: '',
  sortField: 'time',
  sortType: 'desc'
})

const resetFilter = () => {
  filterForm.status = undefined
  filterForm.memberId = ''
  filterForm.startTime = null
  filterForm.endTime = null
  filterForm.keyword = ''
  filterForm.sortField = 'time'
  filterForm.sortType = 'desc'
}

const submitFilter = () => {
  console.log('筛选:', filterForm)
  showMoreSearch.value = false
}

// 添加数据抽屉
const addDrawer = reactive({
  visible: false,
  isEdit: false,
  memberUid: '',
  username: '',
  type: 'add',
  amount: null,
  remark: '',
  availableAmount: 0,
  frozenAmount: 0
})

// 计算变动后余额
const computedNewBalance = computed(() => {
  const available = parseFloat(addDrawer.availableAmount) || 0
  const amount = parseFloat(addDrawer.amount) || 0
  if (addDrawer.type === 'add') {
    return available + amount
  } else {
    return available - amount
  }
})

const handleAdd = () => {
  addDrawer.visible = true
  addDrawer.isEdit = false
  addDrawer.memberUid = ''
  addDrawer.username = ''
  addDrawer.type = 'add'
  addDrawer.amount = null
  addDrawer.remark = ''
  addDrawer.availableAmount = 0
  addDrawer.frozenAmount = 0
}

const handleContinue = (record) => {
  addDrawer.visible = true
  addDrawer.isEdit = true
  addDrawer.memberUid = record.member
  addDrawer.username = record.username
  addDrawer.type = 'add'
  addDrawer.amount = null
  addDrawer.remark = ''
  addDrawer.availableAmount = 1000.00
  addDrawer.frozenAmount = 200.00
}

// 输入会员UID后查询会员信息
const handleMemberUidBlur = () => {
  if (addDrawer.memberUid) {
    // 模拟查询会员信息
    addDrawer.username = 'TestUser'
    addDrawer.availableAmount = 500.00
    addDrawer.frozenAmount = 100.00
  }
}

const submitAdd = () => {
  console.log('提交:', addDrawer)
  addDrawer.visible = false
}

// 财务日志抽屉
const financeDrawer = reactive({
  visible: false,
  record: null
})

const handleFinance = (record) => {
  financeDrawer.visible = true
  financeDrawer.record = record
}
</script>

<style scoped lang="less">
.page-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    overflow: hidden;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0;
    flex-shrink: 0;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .total-text {
        font-size: 14px;
        color: #666;
      }
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 24px;

      .stats-item {
        font-size: 13px;
        color: #666;

        .stats-value {
          font-weight: 500;

          &.blue {
            color: #1890ff;
          }

          &.green {
            color: #52c41a;
          }

          &.red {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  // 表格样式
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
      white-space: nowrap;
    }

    .ant-table-tbody > tr > td {
      white-space: nowrap;
    }
  }

  // 密度控制
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

// 添加表单
.add-form {
  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }
}

// 添加抽屉内容
.add-drawer-content {
  // 会员信息卡片
  .member-info-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 24px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #d9d9d9;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        color: #666;
        font-size: 14px;
      }

      .info-value {
        color: #333;
        font-size: 14px;
        font-weight: 500;

        &.highlight {
          color: #1890ff;
          font-size: 18px;
          font-weight: 600;
        }
      }
    }
  }

  // 操作类型按钮组
  .type-radio-group {
    display: flex;
    width: 100%;

    :deep(.ant-radio-button-wrapper) {
      flex: 1;
      text-align: center;
      height: 44px;
      line-height: 42px;
      font-size: 15px;
      border-radius: 0;

      &:first-child {
        border-radius: 6px 0 0 6px;
      }

      &:last-child {
        border-radius: 0 6px 6px 0;
      }
    }

    .add-btn {
      &.ant-radio-button-wrapper-checked {
        background: #52c41a !important;
        border-color: #52c41a !important;
        color: #fff !important;

        &:hover {
          background: #73d13d !important;
          border-color: #73d13d !important;
        }
      }
    }

    .subtract-btn {
      &.ant-radio-button-wrapper-checked {
        background: #ff4d4f !important;
        border-color: #ff4d4f !important;
        color: #fff !important;

        &:hover {
          background: #ff7875 !important;
          border-color: #ff7875 !important;
        }
      }
    }
  }

  // 变动后余额
  .result-balance {
    font-size: 24px;
    font-weight: 600;
    color: #52c41a;
    padding: 12px 16px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    text-align: center;

    &.is-negative {
      color: #ff4d4f;
      background: #fff2f0;
      border-color: #ffccc7;
    }
  }
}

// 财务内容
.finance-content {
  :deep(.ant-descriptions-item-label) {
    width: 100px;
    background: #fafafa;
  }
}
</style>
