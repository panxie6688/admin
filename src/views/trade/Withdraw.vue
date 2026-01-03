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
        :scroll="{ x: 2200, y: 'calc(100vh - 260px)' }"
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
      <!-- 底部分页 -->
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
          <div class="form-label">状态</div>
          <a-select
            v-model:value="searchDrawer.status"
            placeholder="全部"
            style="width: 100%;"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">审核通过</a-select-option>
            <a-select-option value="rejected">驳回</a-select-option>
          </a-select>
        </div>
        <div class="form-item">
          <div class="form-label">会员-ID</div>
          <a-input v-model:value="searchDrawer.memberId" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员-用户名</div>
          <a-input v-model:value="searchDrawer.memberUsername" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员-手机号</div>
          <a-input v-model:value="searchDrawer.memberPhone" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员-邮箱</div>
          <a-input v-model:value="searchDrawer.memberEmail" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员邀请码</div>
          <a-input v-model:value="searchDrawer.inviteCode" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">订单号</div>
          <a-input v-model:value="searchDrawer.orderNo" placeholder="输入" />
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
          <div class="form-label">搜索(全称)</div>
          <a-input-search
            v-model:value="searchDrawer.keyword"
            placeholder="搜索内容"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="searchDrawer.sortField"
            placeholder="时间"
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
import { ref, reactive, inject, nextTick, createVNode } from 'vue'
import { message, Modal, Input } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  CaretDownOutlined,
  LinkOutlined,
  ExclamationCircleOutlined
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
  total: 40
})

// 表格数据
const tableData = ref([])

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
  status: undefined,
  memberId: '',
  memberUsername: '',
  memberPhone: '',
  memberEmail: '',
  inviteCode: '',
  orderNo: '',
  startTime: null,
  endTime: null,
  keyword: '',
  sortField: 'time',
  sortType: 'desc'
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
  { label: '数量', value: 'amount' },
  { label: '时间', value: 'time' }
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
  { id: 17, member: '1-8173666490', username: 'Jluytinck1979', orderNo: '20250815175531199581733348', amount: 776.1, fee: 0, realAmount: 776.1, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: 'bc1qpke9vnn6lqtmnczxaqku30yg8nzscf5m3an5 j', reason: '-', time: '2025-08-15 20:39:56', status: '驳回', withdrawType: '加密货币' },
  { id: 18, member: '1-5432198765', username: 'MikeJohnson', orderNo: '20250812175508234567890123', amount: 5280.50, fee: 0, realAmount: 5280.50, todayOrderCount: 12, todayWithdrawCount: 1, withdrawInfo: '0x7aB92cD34E5F6789012345678901234567890123 AB', reason: '-', time: '2025-08-12 14:22:33', status: '待审核', withdrawType: '加密货币' },
  { id: 19, member: '1-9876543210', username: 'JennyLiu', orderNo: '20250810175486345678901234', amount: 15750.00, fee: 0, realAmount: 15750.00, todayOrderCount: 8, todayWithdrawCount: 0, withdrawInfo: '交通银行 6222601234567890123 刘芳', reason: '-', time: '2025-08-10 09:15:28', status: '审核通过', withdrawType: '银行卡' },
  { id: 20, member: '1-3456789012', username: 'DavidChen', orderNo: '20250808175464456789012345', amount: 892.35, fee: 0, realAmount: 892.35, todayOrderCount: 25, todayWithdrawCount: 2, withdrawInfo: 'bc1q8765432109876543210987654321098765432 1a', reason: '-', time: '2025-08-08 16:48:52', status: '驳回', withdrawType: '加密货币' },
  { id: 21, member: '1-7654321098', username: 'SarahWang', orderNo: '20250806175442567890123456', amount: 28500.00, fee: 0, realAmount: 28500.00, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '浦发银行 6222621234567890123 王莎', reason: '-', time: '2025-08-06 11:33:19', status: '审核通过', withdrawType: '银行卡' },
  { id: 22, member: '1-2345678901', username: 'TomHarris', orderNo: '20250804175420678901234567', amount: 4567.89, fee: 0, realAmount: 4567.89, todayOrderCount: 45, todayWithdrawCount: 1, withdrawInfo: '0x1234567890ABCDEF1234567890ABCDEF12345678 CD', reason: '-', time: '2025-08-04 08:25:47', status: '待审核', withdrawType: '加密货币' },
  { id: 23, member: '1-8765432109', username: 'EmilyZhang', orderNo: '20250802175398789012345678', amount: 67890.12, fee: 0, realAmount: 67890.12, todayOrderCount: 33, todayWithdrawCount: 0, withdrawInfo: '兴业银行 6222901234567890123 张艾米', reason: '-', time: '2025-08-02 15:42:08', status: '驳回', withdrawType: '银行卡' },
  { id: 24, member: '1-6543210987', username: 'JackWilson', orderNo: '20250731175376890123456789', amount: 2345.67, fee: 0, realAmount: 2345.67, todayOrderCount: 18, todayWithdrawCount: 1, withdrawInfo: 'bc1qABCDEF123456789012345678901234567890 EF', reason: '-', time: '2025-07-31 12:18:36', status: '审核通过', withdrawType: '加密货币' },
  { id: 25, member: '1-4321098765', username: 'LisaLee', orderNo: '20250729175354901234567890', amount: 98765.43, fee: 0, realAmount: 98765.43, todayOrderCount: 67, todayWithdrawCount: 2, withdrawInfo: '民生银行 6222701234567890123 李丽', reason: '-', time: '2025-07-29 09:55:22', status: '驳回', withdrawType: '银行卡' },
  { id: 26, member: '1-3210987654', username: 'MarkBrown', orderNo: '20250727175332012345678901', amount: 1234.56, fee: 0, realAmount: 1234.56, todayOrderCount: 5, todayWithdrawCount: 0, withdrawInfo: '0xFEDCBA9876543210FEDCBA9876543210FEDCBA98 76', reason: '-', time: '2025-07-27 17:28:44', status: '待审核', withdrawType: '加密货币' },
  { id: 27, member: '1-2109876543', username: 'AmyTaylor', orderNo: '20250725175310123456789012', amount: 45678.90, fee: 0, realAmount: 45678.90, todayOrderCount: 22, todayWithdrawCount: 1, withdrawInfo: '光大银行 6222801234567890123 泰勒艾米', reason: '-', time: '2025-07-25 14:05:17', status: '审核通过', withdrawType: '银行卡' },
  { id: 28, member: '1-1098765432', username: 'ChrisGarcia', orderNo: '20250723175288234567890123', amount: 7890.12, fee: 0, realAmount: 7890.12, todayOrderCount: 88, todayWithdrawCount: 3, withdrawInfo: 'bc1q1234ABCD5678EFGH9012IJKL3456MNOP7890 QR', reason: '-', time: '2025-07-23 10:42:55', status: '驳回', withdrawType: '加密货币' },
  { id: 29, member: '1-9876012345', username: 'KellyMartinez', orderNo: '20250721175266345678901234', amount: 23456.78, fee: 0, realAmount: 23456.78, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '华夏银行 6222401234567890123 马丁凯莉', reason: '-', time: '2025-07-21 08:18:33', status: '审核通过', withdrawType: '银行卡' },
  { id: 30, member: '1-8765901234', username: 'RyanThomas', orderNo: '20250719175244456789012345', amount: 567.89, fee: 0, realAmount: 567.89, todayOrderCount: 15, todayWithdrawCount: 1, withdrawInfo: '0x9876FEDC5432BA1098765432BA1098765432BA10 98', reason: '-', time: '2025-07-19 16:55:27', status: '待审核', withdrawType: '加密货币' },
  { id: 31, member: '1-7654890123', username: 'NancyAnderson', orderNo: '20250717175222567890123456', amount: 89012.34, fee: 0, realAmount: 89012.34, todayOrderCount: 41, todayWithdrawCount: 2, withdrawInfo: '平安银行 6222301234567890123 安德森南希', reason: '-', time: '2025-07-17 13:32:18', status: '驳回', withdrawType: '银行卡' },
  { id: 32, member: '1-6543789012', username: 'PeterJackson', orderNo: '20250715175200678901234567', amount: 3456.78, fee: 0, realAmount: 3456.78, todayOrderCount: 9, todayWithdrawCount: 0, withdrawInfo: 'bc1qSTUVWXYZ123456789012345678901234567890 AB', reason: '-', time: '2025-07-15 10:08:45', status: '审核通过', withdrawType: '加密货币' },
  { id: 33, member: '1-5432678901', username: 'LindaWhite', orderNo: '20250713175178789012345678', amount: 56789.01, fee: 0, realAmount: 56789.01, todayOrderCount: 28, todayWithdrawCount: 1, withdrawInfo: '邮储银行 6222501234567890123 怀特琳达', reason: '-', time: '2025-07-13 07:45:12', status: '驳回', withdrawType: '银行卡' },
  { id: 34, member: '1-4321567890', username: 'SteveHarris', orderNo: '20250711175156890123456789', amount: 9012.34, fee: 0, realAmount: 9012.34, todayOrderCount: 52, todayWithdrawCount: 2, withdrawInfo: '0xABCD1234EFGH5678IJKL9012MNOP3456QRST7890 UV', reason: '-', time: '2025-07-11 15:22:38', status: '待审核', withdrawType: '加密货币' },
  { id: 35, member: '1-3210456789', username: 'KarenClark', orderNo: '20250709175134901234567890', amount: 12345.67, fee: 0, realAmount: 12345.67, todayOrderCount: 0, todayWithdrawCount: 0, withdrawInfo: '北京银行 6222101234567890123 克拉克凯伦', reason: '-', time: '2025-07-09 12:58:56', status: '审核通过', withdrawType: '银行卡' },
  { id: 36, member: '1-2109345678', username: 'JasonLewis', orderNo: '20250707175112012345678901', amount: 678.90, fee: 0, realAmount: 678.90, todayOrderCount: 35, todayWithdrawCount: 1, withdrawInfo: 'bc1qWXYZ1234ABCD5678EFGH9012IJKL3456MNOP 78', reason: '-', time: '2025-07-07 09:35:24', status: '驳回', withdrawType: '加密货币' },
  { id: 37, member: '1-1098234567', username: 'BettyRobinson', orderNo: '20250705175090123456789012', amount: 34567.89, fee: 0, realAmount: 34567.89, todayOrderCount: 19, todayWithdrawCount: 0, withdrawInfo: '上海银行 6222201234567890123 罗宾逊贝蒂', reason: '-', time: '2025-07-05 17:12:47', status: '审核通过', withdrawType: '银行卡' },
  { id: 38, member: '1-9870123456', username: 'KevinWalker', orderNo: '20250703175068234567890123', amount: 4567.89, fee: 0, realAmount: 4567.89, todayOrderCount: 63, todayWithdrawCount: 2, withdrawInfo: '0x5678MNOP9012QRST3456UVWX7890YZAB1234CDEF GH', reason: '-', time: '2025-07-03 14:48:15', status: '待审核', withdrawType: '加密货币' },
  { id: 39, member: '1-8769012345', username: 'SusanHall', orderNo: '20250701175046345678901234', amount: 78901.23, fee: 0, realAmount: 78901.23, todayOrderCount: 7, todayWithdrawCount: 1, withdrawInfo: '宁波银行 6222001234567890123 霍尔苏珊', reason: '-', time: '2025-07-01 11:25:33', status: '驳回', withdrawType: '银行卡' },
  { id: 40, member: '1-7658901234', username: 'BrianAllen', orderNo: '20250629175024456789012345', amount: 2345.67, fee: 0, realAmount: 2345.67, todayOrderCount: 44, todayWithdrawCount: 0, withdrawInfo: 'bc1q7890CDEF1234GHIJ5678KLMN9012OPQR3456 ST', reason: '-', time: '2025-06-29 08:02:51', status: '审核通过', withdrawType: '加密货币' }
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

// 重置搜索
const handleResetSearch = () => {
  searchDrawer.status = undefined
  searchDrawer.memberId = ''
  searchDrawer.memberUsername = ''
  searchDrawer.memberPhone = ''
  searchDrawer.memberEmail = ''
  searchDrawer.inviteCode = ''
  searchDrawer.orderNo = ''
  searchDrawer.startTime = null
  searchDrawer.endTime = null
  searchDrawer.keyword = ''
  searchDrawer.sortField = 'time'
  searchDrawer.sortType = 'desc'
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
  let reasonValue = ''
  Modal.confirm({
    title: '通过提现',
    icon: createVNode(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
    width: 520,
    content: createVNode('div', { class: 'withdraw-confirm-content' }, [
      createVNode('div', { class: 'confirm-table' }, [
        createVNode('div', { class: 'confirm-row' }, [
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '提现金额(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.amount))
          ]),
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '手续费(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.fee))
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '应到账(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.realAmount))
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '订单号'),
            createVNode('div', { class: 'cell-value' }, record.orderNo)
          ])
        ])
      ]),
      createVNode('div', { class: 'reason-label' }, '理由(选填)'),
      createVNode(Input.TextArea, {
        placeholder: '请输入',
        rows: 3,
        onChange: (e) => { reasonValue = e.target.value }
      })
    ]),
    okText: '确 定',
    cancelText: '取 消',
    onOk() {
      record.status = '审核通过'
      record.reason = reasonValue || '-'
      message.success('已通过')
    }
  })
}

// 驳回
const handleReject = (record) => {
  let reasonValue = ''
  Modal.confirm({
    title: '驳回提现',
    icon: createVNode(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
    width: 520,
    content: createVNode('div', { class: 'withdraw-confirm-content' }, [
      createVNode('div', { class: 'confirm-table' }, [
        createVNode('div', { class: 'confirm-row' }, [
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '提现金额(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.amount))
          ]),
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '手续费(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.fee))
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '应到账(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.realAmount))
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '订单号'),
            createVNode('div', { class: 'cell-value' }, record.orderNo)
          ])
        ])
      ]),
      createVNode('div', { class: 'reason-label' }, '拒绝理由(选填)'),
      createVNode(Input.TextArea, {
        placeholder: '请输入',
        rows: 3,
        onChange: (e) => { reasonValue = e.target.value }
      })
    ]),
    okText: '确 定',
    cancelText: '取 消',
    okType: 'primary',
    onOk() {
      record.status = '驳回'
      record.reason = reasonValue || '-'
      message.success('已驳回')
    }
  })
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
