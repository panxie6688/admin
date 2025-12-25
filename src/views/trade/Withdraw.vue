<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">提现</span>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="searchDrawer.visible = true">
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
          <a-button class="icon-btn" @click="loadData">
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
        :scroll="{ x: 2200, y: tableHeight }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 会员 -->
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
          <!-- 到账数量 -->
          <template v-if="column.dataIndex === 'realAmount'">
            <span class="amount-text">{{ record.realAmount }}</span>
          </template>
          <!-- 提取信息 - 双击可编辑 -->
          <template v-if="column.dataIndex === 'withdrawInfo'">
            <div class="withdraw-info" v-if="editingWithdrawInfo.id !== record.id" @dblclick="startEditWithdrawInfo(record)">
              <span>{{ record.withdrawInfo }}</span>
              <a class="edit-link">
                <link-outlined />
              </a>
            </div>
            <a-input
              v-else
              v-model:value="editingWithdrawInfo.value"
              size="small"
              @blur="saveWithdrawInfo(record)"
              @pressEnter="saveWithdrawInfo(record)"
              style="width: 100%;"
              ref="withdrawInfoInput"
            />
          </template>
          <!-- 状态 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <!-- 提取方式 -->
          <template v-if="column.dataIndex === 'withdrawType'">
            <a-tag :color="record.withdrawType === '加密货币' ? 'processing' : 'warning'">{{ record.withdrawType }}</a-tag>
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <template v-if="record.status === '待审核'">
                <a-button type="link" size="small" class="btn-success" @click="handlePass(record)">通过</a-button>
                <a-button type="link" size="small" class="btn-danger" @click="handleReject(record)">驳回</a-button>
              </template>
              <template v-else>
                <a-button type="link" size="small" class="btn-disabled" disabled>通过</a-button>
                <a-button type="link" size="small" class="btn-disabled" disabled>驳回</a-button>
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 底部分页 -->
    <div class="page-footer">
      <span class="total-text">统计: {{ pagination.total }}/条</span>
      <a-pagination
        v-model:current="pagination.current"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        size="small"
        show-quick-jumper
        :show-size-changer="false"
        @change="handlePageChange"
      />
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawer.visible"
      title="筛选"
      placement="right"
      :width="400"
      :closable="true"
      rootClassName="rounded-drawer"
      @close="searchDrawer.visible = false"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a style="color: #ff4d4f; cursor: pointer;" @click="handleResetSearch">重置</a>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </div>
      </template>
      <div class="search-form">
        <div class="form-item">
          <div class="form-label">会员UID</div>
          <div style="display: flex; gap: 8px;">
            <a-input v-model:value="searchDrawer.memberUid" placeholder="输入" style="flex: 1;" />
            <a-button type="primary" @click="handleSearchMemberUid">搜 索</a-button>
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">最低数量</div>
          <a-input v-model:value="searchDrawer.minAmount" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">最高数量</div>
          <a-input v-model:value="searchDrawer.maxAmount" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">订单号</div>
          <a-input v-model:value="searchDrawer.orderNo" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">搜索</div>
          <a-input v-model:value="searchDrawer.keyword" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">开始时间</div>
          <a-date-picker
            v-model:value="searchDrawer.startTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">结束时间</div>
          <a-date-picker
            v-model:value="searchDrawer.endTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="searchDrawer.sortField"
            placeholder="创建时间"
            style="width: 100%;"
            :options="sortFieldOptions"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序类型</div>
          <a-select
            v-model:value="searchDrawer.sortType"
            placeholder="降序排序"
            style="width: 100%;"
            :options="sortTypeOptions"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 操作抽屉 -->
    <a-drawer
      v-model:open="operateDrawer.visible"
      title="操作"
      placement="right"
      :width="500"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <div class="operate-content" v-if="operateDrawer.record">
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">订单号：</span>
            <span class="info-value">{{ operateDrawer.record.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">会员：</span>
            <span class="info-value">{{ operateDrawer.record.member }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">数量：</span>
            <span class="info-value">{{ operateDrawer.record.amount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">提取信息：</span>
            <span class="info-value">{{ operateDrawer.record.withdrawInfo }}</span>
          </div>
        </div>
        <div class="action-section">
          <a-space>
            <a-button type="primary" @click="handleConfirmPass">通过</a-button>
            <a-button danger @click="handleConfirmReject">驳回</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  CaretDownOutlined,
  LinkOutlined
} from '@ant-design/icons-vue'

// 注入布局相关
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 状态
const loading = ref(false)
const searchText = ref('')
const tableSize = ref('small')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 1248
})

// 表格数据
const tableData = ref([])

// 表格高度
const tableHeight = computed(() => {
  return 'calc(100vh - 280px)'
})

// 列配置
const columns = [
  { title: '会员', dataIndex: 'member', key: 'member', width: 140, align: 'center', fixed: 'left', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 100, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 220, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 100, align: 'center' },
  { title: '手续费', dataIndex: 'fee', key: 'fee', width: 80, align: 'center' },
  { title: '到账数量', dataIndex: 'realAmount', key: 'realAmount', width: 100, align: 'center' },
  { title: '今天订单数', dataIndex: 'todayOrderCount', key: 'todayOrderCount', width: 100, align: 'center' },
  { title: '今天提款次数', dataIndex: 'todayWithdrawCount', key: 'todayWithdrawCount', width: 110, align: 'center' },
  { title: '提取信息', dataIndex: 'withdrawInfo', key: 'withdrawInfo', width: 280, align: 'left' },
  { title: '理由', dataIndex: 'reason', key: 'reason', width: 80, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 150, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center', fixed: 'right' },
  { title: '提取方式', dataIndex: 'withdrawType', key: 'withdrawType', width: 100, align: 'center', fixed: 'right' },
  { title: '操作', key: 'action', width: 90, align: 'center', fixed: 'right' }
]

// 搜索抽屉
const searchDrawer = reactive({
  visible: false,
  memberUid: '',
  minAmount: '',
  maxAmount: '',
  orderNo: '',
  keyword: '',
  startTime: null,
  endTime: null,
  sortField: undefined,
  sortType: undefined
})

// 操作抽屉
const operateDrawer = reactive({
  visible: false,
  record: null
})

// 提取信息编辑状态
const editingWithdrawInfo = reactive({
  id: null,
  value: ''
})
const withdrawInfoInput = ref(null)

// 排序选项
const sortFieldOptions = [
  { label: '全部', value: '' },
  { label: '创建时间', value: 'createTime' },
  { label: '数量', value: 'amount' },
  { label: '手续费', value: 'fee' }
]

const sortTypeOptions = [
  { label: '全部', value: '' },
  { label: '降序排序', value: 'desc' },
  { label: '升序排序', value: 'asc' }
]

// 模拟数据
const mockData = [
  { id: 1, member: '1-4707174248', username: 'Shaneikque1', orderNo: '20251026176152226167520024', amount: 86.14, fee: 0, realAmount: 86.14, todayOrderCount: 59, todayWithdrawCount: 1, withdrawInfo: '0x9824Aa02a43282F1E7B38a3597dcfe2F279814 7B', reason: '-', time: '2025-10-26 17:44:22', status: '驳回', withdrawType: '加密货币' },
  { id: 2, member: '1-8609927282', username: '8609927282', orderNo: '20251024176133879176685000', amount: 371384.19, fee: 0, realAmount: 371384.19, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '3DxKinCNCnjKxaVB7hnufAsRBH8P5vuAMS', reason: '-', time: '2025-10-24 14:46:32', status: '驳回', withdrawType: '加密货币' },
  { id: 3, member: '1-2162889383', username: 'Millie', orderNo: '20250926175892084304018942', amount: 83.26, fee: 0, realAmount: 83.26, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '中国银行 6228480012345678901 张三', reason: '-', time: '2025-09-26 15:07:23', status: '驳回', withdrawType: '银行卡' },
  { id: 4, member: '1-6052154537', username: '2girlsD43', orderNo: '20250917175814379016721138', amount: 134208.5, fee: 0, realAmount: 134208.5, todayOrderCount: 55, todayWithdrawCount: 1, withdrawInfo: '0x484b5e166605172331E169cFC18C49eb4fCc097B 93', reason: '-', time: '2025-09-17 15:16:30', status: '审核通过', withdrawType: '加密货币' },
  { id: 5, member: '1-6052154537', username: '2girlsD43', orderNo: '20250916175803894095223311', amount: 103209.5, fee: 0, realAmount: 103209.5, todayOrderCount: 55, todayWithdrawCount: 1, withdrawInfo: '0x484b5e166605172331E169cFC18C49eb4fCc097B 93', reason: '-', time: '2025-09-16 10:09:01', status: '审核通过', withdrawType: '加密货币' },
  { id: 6, member: '1-248.755.9829', username: 'TomE', orderNo: '20250915175798361269348832', amount: 99681.29, fee: 0, realAmount: 99681.29, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '工商银行 6222021234567890123 李四', reason: '-', time: '2025-09-15 18:46:53', status: '驳回', withdrawType: '银行卡' },
  { id: 7, member: '1-8179195152', username: 'Star12', orderNo: '20250902175686016635500091', amount: 135.7, fee: 0, realAmount: 135.7, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: 'bc1qewd3040acw00k0q3xvdmkch6etnn8gyOar 8g', reason: '-', time: '2025-09-02 18:42:46', status: '驳回', withdrawType: '加密货币' },
  { id: 8, member: '1-8179195152', username: 'Star12', orderNo: '20250902175685969782765533', amount: 122.91, fee: 0, realAmount: 122.91, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: 'bc1qewd3040acw00k0q3xvdmkch6etnn8gyOar 8g', reason: '-', time: '2025-09-02 18:34:58', status: '驳回', withdrawType: '加密货币' },
  { id: 9, member: '1-4014501096', username: 'CriszSanti', orderNo: '20250828175643166848456638', amount: 37835.61, fee: 0, realAmount: 37835.61, todayOrderCount: 116, todayWithdrawCount: 2, withdrawInfo: '0xc49E97d699cE379dfF88Fle811A812d2ABc7be 19', reason: '-', time: '2025-08-28 19:41:05', status: '待审核', withdrawType: '加密货币' },
  { id: 10, member: '1-7132583745', username: 'Bolouis33', orderNo: '20250827175633529327311889', amount: 140948.14, fee: 0, realAmount: 140948.14, todayOrderCount: 120, todayWithdrawCount: 1, withdrawInfo: '建设银行 6227001234567890123 王五', reason: '-', time: '2025-08-27 16:54:53', status: '审核通过', withdrawType: '银行卡' },
  { id: 11, member: '1-6624188841', username: 'Calcal', orderNo: '20250827175632649478978', amount: 42685.88, fee: 0, realAmount: 42685.88, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: 'bc1pk6h3yub8cfunp05qdw7q34054cmhhjjqcxje4 synemmhjutrs4nq2mx35', reason: '-', time: '2025-08-27 14:24:09', status: '驳回', withdrawType: '加密货币' },
  { id: 12, member: '1-6052154537', username: '2girlsD43', orderNo: '20250826175622606314312944', amount: 79170.28, fee: 0, realAmount: 79170.28, todayOrderCount: 55, todayWithdrawCount: 1, withdrawInfo: '0x484b5e166605172331E169cFC18C49eb4fCc097B 93', reason: '-', time: '2025-08-26 10:34:23', status: '驳回', withdrawType: '加密货币' },
  { id: 13, member: '1-701-840-7768', username: 'rlw120', orderNo: '20250825175616579322588914', amount: 196058.81, fee: 0, realAmount: 196058.81, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '农业银行 6228481234567890123 赵六', reason: '-', time: '2025-08-25 17:49:53', status: '驳回', withdrawType: '银行卡' },
  { id: 14, member: '1-206-565-9108', username: 'smehdi2025', orderNo: '20250821175582253766550259', amount: 22668.85, fee: 0, realAmount: 22668.85, todayOrderCount: 3, todayWithdrawCount: 0, withdrawInfo: '0x3be88F71159EcE0BF3b51961be108984A4bE48 eE', reason: '-', time: '2025-08-21 18:28:58', status: '驳回', withdrawType: '加密货币' },
  { id: 15, member: '1-7045770269', username: 'doomguy0269', orderNo: '20250821175580268482666661', amount: 193.43, fee: 0, realAmount: 193.43, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '0x8cD22634E4F7DDEE2F7408FF8aE82464c2fBe 68', reason: '-', time: '2025-08-21 12:58:08', status: '驳回', withdrawType: '加密货币' },
  { id: 16, member: '1-8173666490', username: 'Jluytinck1979', orderNo: '20250818175553542712877242', amount: 36318.33, fee: 0, realAmount: 36318.33, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '招商银行 6225881234567890123 孙七', reason: '-', time: '2025-08-18 10:43:47', status: '驳回', withdrawType: '银行卡' },
  { id: 17, member: '1-8173666490', username: 'Jluytinck1979', orderNo: '20250815175531199581733348', amount: 776.1, fee: 0, realAmount: 776.1, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: 'bc1qpke9vnn6lqtmnczxaqku30yg8nzscf5m3an5 j', reason: '-', time: '2025-08-15 20:39:56', status: '驳回', withdrawType: '加密货币' }
]

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '驳回': 'error',
    '审核通过': 'success',
    '待审核': 'processing'
  }
  return colorMap[status] || 'default'
}

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [...mockData]
    loading.value = false
  }, 300)
}

// 搜索
const onSearch = (value) => {
  console.log('搜索:', value)
  loadData()
}

// 搜索会员UID
const handleSearchMemberUid = () => {
  message.info('搜索会员: ' + searchDrawer.memberUid)
}

// 重置搜索
const handleResetSearch = () => {
  searchDrawer.memberUid = ''
  searchDrawer.minAmount = ''
  searchDrawer.maxAmount = ''
  searchDrawer.orderNo = ''
  searchDrawer.keyword = ''
  searchDrawer.startTime = null
  searchDrawer.endTime = null
  searchDrawer.sortField = undefined
  searchDrawer.sortType = undefined
}

// 提交搜索
const handleSubmitSearch = () => {
  searchDrawer.visible = false
  loadData()
}

// 密度切换
const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

// 分页切换
const handlePageChange = (page) => {
  pagination.current = page
  loadData()
}

// 复制
const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('复制成功')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 开始编辑提取信息
const startEditWithdrawInfo = (record) => {
  editingWithdrawInfo.id = record.id
  editingWithdrawInfo.value = record.withdrawInfo
  nextTick(() => {
    withdrawInfoInput.value?.focus()
  })
}

// 保存提取信息
const saveWithdrawInfo = (record) => {
  if (editingWithdrawInfo.value !== record.withdrawInfo) {
    record.withdrawInfo = editingWithdrawInfo.value
    message.success('提取信息已更新')
  }
  editingWithdrawInfo.id = null
  editingWithdrawInfo.value = ''
}

// 通过
const handlePass = (record) => {
  message.info('驳回: ' + record.orderNo)
}

// 驳回
const handleReject = (record) => {
  message.info('通过: ' + record.orderNo)
}

// 操作
const handleOperate = (record) => {
  operateDrawer.visible = true
  operateDrawer.record = record
}

// 确认通过
const handleConfirmPass = () => {
  message.success('操作成功')
  operateDrawer.visible = false
  loadData()
}

// 确认驳回
const handleConfirmReject = () => {
  message.success('操作成功')
  operateDrawer.visible = false
  loadData()
}

// 初始加载
loadData()
</script>

<style scoped lang="less">
.page-container {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .header-left {
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
    overflow: hidden;

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
    }

    .withdraw-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .edit-link {
        color: #1890ff;
        cursor: pointer;

        &:hover {
          color: #40a9ff;
        }
      }
    }

    .action-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .btn-success {
        color: #52c41a;
        padding: 0 4px;
      }

      .btn-danger {
        color: #ff4d4f;
        padding: 0 4px;
      }

      .btn-disabled {
        color: #d9d9d9 !important;
        padding: 0 4px;
        cursor: not-allowed;
      }
    }
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #f0f0f0;

    .total-text {
      font-size: 14px;
      color: #666;
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

// 激活密度样式
:deep(.active-density) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

// 搜索表单
.search-form {
  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }
  }
}

// 操作内容
.operate-content {
  .info-section {
    margin-bottom: 24px;

    .info-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 14px;

      .info-label {
        color: #666;
        width: 80px;
        flex-shrink: 0;
      }

      .info-value {
        color: #333;
        flex: 1;
        word-break: break-all;
      }
    }
  }

  .action-section {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
