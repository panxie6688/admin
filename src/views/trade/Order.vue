<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <div class="order-tabs">
          <span
            :class="['tab-item', { active: activeTab === 'all' }]"
            @click="activeTab = 'all'; loadData()"
          >全部</span>
          <span
            :class="['tab-item', { active: activeTab === 'completed' }]"
            @click="activeTab = 'completed'; loadData()"
          >已完成</span>
          <span
            :class="['tab-item', { active: activeTab === 'pending' }]"
            @click="activeTab = 'pending'; loadData()"
          >未完成</span>
        </div>
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
        :scroll="{ x: 1800, y: 'calc(100vh - 260px)' }"
        :row-class-name="() => 'order-table-row'"
      >
        <template #bodyCell="{ column, record }">
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
          <template v-if="column.dataIndex === 'username'">
            <span style="color: #1890ff; font-size: 16px;">{{ record.username }}</span>
          </template>
          <template v-if="column.dataIndex === 'orderCount'">
            <span style="font-size: 16px;">{{ record.orderCount }}</span>
          </template>
          <template v-if="column.dataIndex === 'price'">
            <span style="color: #1890ff; font-size: 16px;">{{ record.price }}</span>
          </template>
          <template v-if="column.dataIndex === 'profit'">
            <span style="color: #52c41a; font-size: 16px;">{{ record.profit }}</span>
          </template>
          <template v-if="column.dataIndex === 'rate'">
            <span style="color: #1890ff; font-size: 16px;">{{ record.rate }}</span>
          </template>
          <template v-if="column.dataIndex === 'multiple'">
            <span style="font-size: 16px;">{{ record.multiple }}</span>
          </template>
          <template v-if="column.dataIndex === 'method'">
            <a-tag
              :style="record.method === '设定'
                ? 'background: #fff0f6; border-color: #ffadd2; color: #eb2f96;'
                : 'background: #e6f7ff; border-color: #91d5ff; color: #1890ff;'"
            >{{ record.method }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'type'">
            <a-tag
              :style="record.type === '连单'
                ? 'background: #f6ffed; border-color: #b7eb8f; color: #52c41a;'
                : 'background: #e6f7ff; border-color: #91d5ff; color: #1890ff;'"
            >{{ record.type }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <a-tag
                :style="record.status === '已完成'
                  ? 'background: #f6ffed; border-color: #b7eb8f; color: #52c41a;'
                  : 'background: #fff1f0; border-color: #ffa39e; color: #ff4d4f;'"
              >{{ record.status }}</a-tag>
              <div v-if="record.status === '未完成' && record.needConfirm > 0" style="font-size: 14px; color: #000; line-height: 1.4; text-align: center; font-weight: 500;">
                确认还需:<br/>{{ record.needConfirm }}
              </div>
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
              <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleFinance(record)">财务</a>
              <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleDetail(record)">详情</a>
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

    <!-- 搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawer.visible"
      title="筛选"
      placement="right"
      :width="400"
      :closable="true"
      class="order-search-drawer"
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
          <div class="form-label">商品ID</div>
          <a-input v-model:value="searchDrawer.productId" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员UID</div>
          <div style="display: flex; gap: 8px;">
            <a-input v-model:value="searchDrawer.memberUid" placeholder="输入" style="flex: 1;" />
            <a-button type="primary" @click="handleSearchMemberUid">搜 索</a-button>
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">最低价格</div>
          <a-input v-model:value="searchDrawer.minPrice" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">最高价格</div>
          <a-input v-model:value="searchDrawer.maxPrice" placeholder="输入" />
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

    <!-- 财务日志抽屉 -->
    <a-drawer
      v-model:open="financeDrawer.visible"
      title="财务日志"
      placement="right"
      :width="860"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <div class="finance-content">
        <a-table
          :columns="financeColumns"
          :data-source="financeDrawer.list"
          :loading="financeDrawer.loading"
          :pagination="false"
          bordered
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'direction'">
              <a-tag :color="record.direction === '增加' ? 'success' : 'error'">{{ record.direction }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <span :style="{ color: record.direction === '增加' ? '#52c41a' : '#ff4d4f' }">
                {{ record.direction === '增加' ? '+' : '-' }}{{ record.amount }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-drawer>

    <!-- 商品详情抽屉 -->
    <a-drawer
      v-model:open="detailDrawer.visible"
      placement="right"
      :width="500"
      :closable="false"
      :headerStyle="{ display: 'none' }"
      class="product-detail-drawer"
      rootClassName="rounded-drawer"
    >
      <div class="product-detail-content">
        <div class="drawer-header">
          <CloseOutlined class="close-btn" @click="detailDrawer.visible = false" />
          <span class="drawer-title">商品详情</span>
          <span></span>
        </div>
        <div class="product-info" v-if="detailDrawer.record">
          <div class="product-image">
            <img :src="detailDrawer.image" alt="商品图片" />
          </div>
          <div class="product-meta">
            <div class="product-title">{{ detailDrawer.record.productName }}</div>
            <div class="meta-row">
              <span class="meta-label">价格：</span>
              <span class="meta-value price">{{ detailDrawer.record.price }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">利润：</span>
              <span class="meta-value profit">{{ detailDrawer.record.profit }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">利率：</span>
              <span class="meta-value rate">{{ detailDrawer.record.rate }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  CaretDownOutlined
} from '@ant-design/icons-vue'

// 注入布局相关
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 状态
const loading = ref(false)
const searchText = ref('')
const activeTab = ref('all')
const tableSize = ref('small')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 100
})

// 表格数据
const tableData = ref([])

// 列配置
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 220, align: 'center' },
  { title: '会员', dataIndex: 'member', key: 'member', width: 160, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 100, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '单数', dataIndex: 'orderCount', key: 'orderCount', width: 80, align: 'center' },
  { title: '商品名称', dataIndex: 'productName', key: 'productName', width: 200, align: 'left' },
  { title: '价格', dataIndex: 'price', key: 'price', width: 110, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '利润', dataIndex: 'profit', key: 'profit', width: 100, align: 'center', customHeaderCell: () => ({ style: { color: '#52c41a' } }) },
  { title: '利率', dataIndex: 'rate', key: 'rate', width: 80, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: 'VIP等级', dataIndex: 'vipLevel', key: 'vipLevel', width: 140, align: 'center' },
  { title: '方式', dataIndex: 'method', key: 'method', width: 90, align: 'center' },
  { title: '设定倍数', dataIndex: 'multiple', key: 'multiple', width: 100, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 170, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center', fixed: 'right' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center', fixed: 'right' },
  { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right' }
]

// 搜索抽屉
const searchDrawer = reactive({
  visible: false,
  productId: '',
  memberUid: '',
  minPrice: '',
  maxPrice: '',
  orderNo: '',
  keyword: '',
  startTime: null,
  endTime: null,
  sortField: undefined,
  sortType: undefined
})

// 排序选项
const sortFieldOptions = [
  { label: '全部', value: '' },
  { label: '创建时间', value: 'createTime' },
  { label: '按ID', value: 'id' },
  { label: 'VIP等级', value: 'vipLevel' },
  { label: '返佣率', value: 'rate' },
  { label: '收益', value: 'profit' },
  { label: '价格', value: 'price' }
]

const sortTypeOptions = [
  { label: '全部', value: '' },
  { label: '降序排序', value: 'desc' },
  { label: '升序排序', value: 'asc' }
]

// 财务日志抽屉
const financeDrawer = reactive({
  visible: false,
  record: null,
  loading: false,
  list: []
})

// 财务日志列配置
const financeColumns = [
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 100, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120, align: 'center' },
  { title: '前数量', dataIndex: 'beforeAmount', key: 'beforeAmount', width: 140, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 120, align: 'center' },
  { title: '后数量', dataIndex: 'afterAmount', key: 'afterAmount', width: 140, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 140, align: 'center' }
]

// 详情抽屉
const detailDrawer = reactive({
  visible: false,
  record: null,
  image: ''
})

// 模拟数据
const mockData = [
  { id: 250639, orderNo: '20251216176587079690301', member: '1-223344556677', username: '0003', orderCount: 10, productName: 'Wholesale Eyeglasses Frames of all Original Brands', price: 18101.32, profit: 6516.4, rate: '3.6%', vipLevel: 'Mid-level employees(2)', method: '设定', multiple: 10, time: '2025-12-16 01:40:00', type: '连单', status: '未完成', needConfirm: 14991.59 },
  { id: 250638, orderNo: '20251216176587079830363', member: '1-223344556677', username: '0003', orderCount: 9, productName: 'RENNES Eyewear Factory Custom Glasses Fashion Sunglasses Optical Frame Spectacle Reading Glasses Mold Personalized Design', price: 1650, profit: 9.9, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:58', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250637, orderNo: '20251216176587079717441', member: '1-223344556677', username: '0003', orderCount: 8, productName: '24H Self-service pharmacy vending machine for drug and medicines', price: 2018.5, profit: 12.11, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:57', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250636, orderNo: '20251216176587079598819', member: '1-223344556677', username: '0003', orderCount: 7, productName: 'High Quality Elegant Model of Medical Equipment Dental chair Treatment tools', price: 2035, profit: 12.21, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:56', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250635, orderNo: '20251216176587079425756', member: '1-223344556677', username: '0003', orderCount: 6, productName: 'Latest home furniture living room sofas leather luxury smart sofa l shape sofa set', price: 1848, profit: 11.08, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:54', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250634, orderNo: '20251216176587079245719', member: '1-223344556677', username: '0003', orderCount: 5, productName: 'Automatic Espresso Machine Coffee Machine Coffee Maker for Office Home Business', price: 1419, profit: 8.51, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:52', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250633, orderNo: '20251216176587079055744', member: '1-223344556677', username: '0003', orderCount: 4, productName: 'new design women winter coats and colorful jackets', price: 1755, profit: 10.53, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:51', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250632, orderNo: '20251216176587078786091', member: '1-223344556677', username: '0003', orderCount: 3, productName: 'Electric oven 110V 4 Burner Cooker Range Top Stove', price: 2223.7, profit: 13.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:48', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250631, orderNo: '20251216176587078596386', member: '1-223344556677', username: '0003', orderCount: 2, productName: 'Sony KD-75X80J 75inch 4K HDR Android AI SMART LCD TV for home comfortably Dolby Panorama sound', price: 2078.7, profit: 12.47, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:46', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250630, orderNo: '20251216176587078423512', member: '1-223344556677', username: '0003', orderCount: 1, productName: 'Professional Studio Microphone Recording Condenser Microphone for Broadcasting', price: 1580, profit: 9.48, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:44', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250629, orderNo: '20251216176587078234567', member: '1-112233445566', username: 'user01', orderCount: 15, productName: 'Gaming Laptop 17.3 inch RTX 4080 Intel Core i9 32GB RAM 1TB SSD', price: 3500, profit: 21.0, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:42', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250628, orderNo: '20251216176587078123456', member: '1-998877665544', username: 'user02', orderCount: 14, productName: 'Wireless Bluetooth Headphones Active Noise Cancelling Over Ear Headset', price: 890, profit: 5.34, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:39:40', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250627, orderNo: '20251216176587078012345', member: '1-556677889900', username: 'user03', orderCount: 13, productName: 'Smart Watch Series 9 GPS Cellular 45mm Titanium Case Sport Band', price: 1299, profit: 7.79, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:38', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250626, orderNo: '20251216176587077901234', member: '1-334455667788', username: 'user04', orderCount: 12, productName: 'Drone with 4K Camera Professional Aerial Photography Quadcopter', price: 2450, profit: 14.7, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:36', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250625, orderNo: '20251216176587077790123', member: '1-223344556677', username: '0003', orderCount: 11, productName: 'Electric Standing Desk Height Adjustable Home Office Workstation', price: 1680, profit: 10.08, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:34', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250624, orderNo: '20251216176587077679012', member: '1-112233445566', username: 'user01', orderCount: 20, productName: 'Robot Vacuum Cleaner with Mop Self-Emptying Station LiDAR Navigation', price: 1890, profit: 11.34, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:32', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250623, orderNo: '20251216176587077567901', member: '1-998877665544', username: 'user02', orderCount: 19, productName: 'Air Purifier HEPA Filter Large Room Coverage Smart WiFi Control', price: 780, profit: 4.68, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:39:30', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250622, orderNo: '20251216176587077456790', member: '1-556677889900', username: 'user03', orderCount: 18, productName: 'Massage Chair Full Body Zero Gravity Shiatsu Recliner with Heat', price: 4500, profit: 27.0, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '设定', multiple: 5, time: '2025-12-16 01:39:28', type: '连单', status: '未完成', needConfirm: 8500.50 },
  { id: 250621, orderNo: '20251216176587077345679', member: '1-334455667788', username: 'user04', orderCount: 17, productName: 'Portable Power Station 2000W Solar Generator for Camping Emergency', price: 2200, profit: 13.2, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:26', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250620, orderNo: '20251216176587077234568', member: '1-223344556677', username: '0003', orderCount: 16, productName: 'Electric Bike 750W Motor Fat Tire Mountain Bicycle 48V Battery', price: 1950, profit: 11.7, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:24', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250619, orderNo: '20251216176587077123457', member: '1-445566778899', username: 'user05', orderCount: 25, productName: 'Industrial 3D Printer Large Format FDM Professional Rapid Prototyping', price: 8500, profit: 51.0, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '设定', multiple: 8, time: '2025-12-16 01:39:22', type: '连单', status: '未完成', needConfirm: 12500.75 },
  { id: 250618, orderNo: '20251216176587077012346', member: '1-667788990011', username: 'user06', orderCount: 24, productName: 'Commercial Ice Cream Machine Soft Serve Frozen Yogurt Maker', price: 3200, profit: 19.2, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:20', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250617, orderNo: '20251216176587076901235', member: '1-889900112233', username: 'user07', orderCount: 23, productName: 'Medical Grade Pulse Oximeter Fingertip Blood Oxygen Monitor', price: 450, profit: 2.7, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:39:18', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250616, orderNo: '20251216176587076790124', member: '1-001122334455', username: 'user08', orderCount: 22, productName: 'Professional Camera Stabilizer Gimbal 3-Axis for DSLR Mirrorless', price: 1280, profit: 7.68, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:16', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250615, orderNo: '20251216176587076679013', member: '1-445566778899', username: 'user05', orderCount: 21, productName: 'Smart Home Security Camera System 4K POE NVR 8 Channel', price: 2890, profit: 17.34, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:14', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250614, orderNo: '20251216176587076567902', member: '1-667788990011', username: 'user06', orderCount: 30, productName: 'Commercial Blender Heavy Duty Smoothie Maker Professional Grade', price: 980, profit: 5.88, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:12', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250613, orderNo: '20251216176587076456791', member: '1-889900112233', username: 'user07', orderCount: 29, productName: 'Wireless Charging Pad Fast Charger Station for Multiple Devices', price: 350, profit: 2.1, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:39:10', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250612, orderNo: '20251216176587076345680', member: '1-001122334455', username: 'user08', orderCount: 28, productName: 'Ergonomic Office Chair Mesh High Back Computer Gaming Swivel', price: 1450, profit: 8.7, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '设定', multiple: 3, time: '2025-12-16 01:39:08', type: '连单', status: '未完成', needConfirm: 5600.25 },
  { id: 250611, orderNo: '20251216176587076234569', member: '1-778899001122', username: 'user09', orderCount: 27, productName: 'Digital Piano 88 Keys Weighted Hammer Action Electronic Keyboard', price: 2680, profit: 16.08, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:06', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250610, orderNo: '20251216176587076123458', member: '1-990011223344', username: 'user10', orderCount: 26, productName: 'Projector 4K Native Resolution Home Theater Cinema 3000 Lumens', price: 1890, profit: 11.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:04', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250609, orderNo: '20251216176587076012347', member: '1-112233445566', username: 'user01', orderCount: 35, productName: 'Professional Microphone Boom Arm Stand Heavy Duty Studio Mount', price: 280, profit: 1.68, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:39:02', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250608, orderNo: '20251216176587075901236', member: '1-998877665544', username: 'user02', orderCount: 34, productName: 'Electric Kettle Smart Temperature Control Gooseneck Pour Over', price: 180, profit: 1.08, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:39:00', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250607, orderNo: '20251216176587075790125', member: '1-556677889900', username: 'user03', orderCount: 33, productName: 'Mechanical Keyboard RGB Hot Swappable Gaming Custom DIY Kit', price: 650, profit: 3.9, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:38:58', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250606, orderNo: '20251216176587075679014', member: '1-334455667788', username: 'user04', orderCount: 32, productName: 'Noise Cancelling Earbuds True Wireless Bluetooth 5.3 ANC', price: 420, profit: 2.52, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:38:56', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250605, orderNo: '20251216176587075567903', member: '1-445566778899', username: 'user05', orderCount: 31, productName: 'Tablet PC 12.9 inch OLED Display 5G Cellular WiFi 256GB', price: 1599, profit: 9.59, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '设定', multiple: 6, time: '2025-12-16 01:38:54', type: '连单', status: '未完成', needConfirm: 7200.80 },
  { id: 250604, orderNo: '20251216176587075456792', member: '1-667788990011', username: 'user06', orderCount: 40, productName: 'Smart TV 85 inch 8K QLED Neo Quantum Processor Gaming Mode', price: 5800, profit: 34.8, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:38:52', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250603, orderNo: '20251216176587075345681', member: '1-889900112233', username: 'user07', orderCount: 39, productName: 'Desktop Computer All-in-One 27 inch 4K Intel i7 32GB RAM', price: 2450, profit: 14.7, rate: '0.6%', vipLevel: 'Junior employees(1)', method: '随机', multiple: 1, time: '2025-12-16 01:38:50', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250602, orderNo: '20251216176587075234570', member: '1-001122334455', username: 'user08', orderCount: 38, productName: 'Electric Scooter Foldable Adult Commuter 25mph Long Range', price: 1280, profit: 7.68, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:38:48', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250601, orderNo: '20251216176587075123459', member: '1-778899001122', username: 'user09', orderCount: 37, productName: 'Action Camera 5K Waterproof Sports Cam WiFi Touch Screen', price: 480, profit: 2.88, rate: '0.6%', vipLevel: 'Senior employees(3)', method: '随机', multiple: 1, time: '2025-12-16 01:38:46', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250600, orderNo: '20251216176587075012348', member: '1-990011223344', username: 'user10', orderCount: 36, productName: 'Portable SSD External Hard Drive 4TB USB 3.2 Gen 2 Type-C', price: 890, profit: 5.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:38:44', type: '单一', status: '已完成', needConfirm: 0 }
]

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let data = [...mockData]
    // 根据 tab 筛选
    if (activeTab.value === 'completed') {
      data = data.filter(item => item.status === '已完成')
    } else if (activeTab.value === 'pending') {
      data = data.filter(item => item.status === '未完成')
    }
    tableData.value = data
    pagination.total = data.length
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
  searchDrawer.productId = ''
  searchDrawer.memberUid = ''
  searchDrawer.minPrice = ''
  searchDrawer.maxPrice = ''
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

// 搜索会员UID
const handleSearchMemberUid = () => {
  message.info('搜索会员: ' + searchDrawer.memberUid)
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

// 财务日志
const handleFinance = (record) => {
  financeDrawer.visible = true
  financeDrawer.record = record
  financeDrawer.loading = true
  setTimeout(() => {
    financeDrawer.list = [
      { id: 1, direction: '增加', type: '利润', beforeAmount: 3055.92, amount: record.profit, afterAmount: 3055.92 + record.profit, time: record.time.substring(5, 16) }
    ]
    financeDrawer.loading = false
  }, 200)
}

// 详情
const handleDetail = (record) => {
  detailDrawer.visible = true
  detailDrawer.record = record
  detailDrawer.image = 'https://ae01.alicdn.com/kf/S3c3a56c0d0b64a52960f7c3f1c4d9c6dS.jpg_220x220.jpg'
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
      display: flex;
      align-items: center;

      .order-tabs {
        display: flex;
        align-items: center;
        gap: 24px;

        .tab-item {
          font-size: 15px;
          font-weight: 600;
          color: #000;
          cursor: pointer;
          padding-bottom: 8px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;

          &:hover {
            color: #1890ff;
          }

          &.active {
            color: #1890ff;
            border-bottom-color: #1890ff;
          }
        }
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
        font-size: 15px;
        white-space: nowrap;
        text-align: center;
        color: #000;
      }

      .ant-table-tbody > tr > td {
        font-size: 14px;
        vertical-align: middle;
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

// 财务内容
.finance-content {
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }
  }
}

// 商品详情抽屉样式
.product-detail-content {
  margin: -24px;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;

    .close-btn {
      font-size: 16px;
      color: #666;
      cursor: pointer;

      &:hover {
        color: #333;
      }
    }

    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .product-info {
    padding: 20px;
    display: flex;
    gap: 20px;

    .product-image {
      flex-shrink: 0;

      img {
        width: 140px;
        height: 140px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
      }
    }

    .product-meta {
      flex: 1;

      .product-title {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .meta-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .meta-label {
          font-size: 14px;
          color: #666;
          min-width: 50px;
        }

        .meta-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;

          &.price {
            color: #ff4d4f;
          }

          &.profit {
            color: #52c41a;
          }

          &.rate {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>
