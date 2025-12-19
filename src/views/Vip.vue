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
          style="width: 200px"
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
              <a-menu-item key="large">宽松</a-menu-item>
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
        :scroll="{ y: tableScrollY }"
        row-key="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- LOGO列 -->
          <template v-if="column.dataIndex === 'logo'">
            <a-upload
              :show-upload-list="false"
              accept="image/*"
              @change="handleLogoChange($event, record)"
            >
              <img :src="record.logo" class="level-logo" style="cursor: pointer;" />
            </a-upload>
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
            <span class="withdraw-text">{{ record.times }}</span>
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
            <span class="withdraw-text">{{ record.fee }}</span>
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

    <!-- 添加/编辑抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      placement="right"
      :width="620"
      :closable="true"
      :rootClassName="'rounded-drawer'"
      @close="handleDrawerClose"
    >
      <template #extra>
        <a-button type="primary" @click="handleDrawerSubmit">保存&创建</a-button>
      </template>

      <div class="edit-drawer-content">
        <!-- Logo上传 -->
        <div class="logo-upload-section">
          <a-upload
            :show-upload-list="false"
            accept="image/*"
            @change="handleMainLogoChange"
          >
            <div class="upload-box">
              <plus-outlined class="upload-icon" />
              <div class="upload-text">LOGO</div>
            </div>
          </a-upload>
        </div>

        <!-- VIP配置 -->
        <div class="section-title">VIP配置</div>
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 等级</label>
              <a-input v-model:value="formData.level" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 模式</label>
              <a-select v-model:value="formData.mode" style="width: 100%">
                <a-select-option value="根据系统配置">根据系统配置</a-select-option>
              </a-select>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 金额(USD)</label>
              <a-input v-model:value="formData.amount" />
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 任务佣金(0.1=10%)</label>
              <a-input v-model:value="formData.commissionSingle" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 连单任务佣金(0.1=10%)</label>
              <a-input v-model:value="formData.commissionMulti" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 任务数量</label>
              <a-input v-model:value="formData.taskCount" />
            </div>
          </a-col>
        </a-row>

        <!-- 提现 -->
        <div class="section-title">提现</div>
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 次数</label>
              <a-input v-model:value="formData.times" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 单日限制</label>
              <a-input v-model:value="formData.dailyLimit" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 最低数量</label>
              <a-input v-model:value="formData.minAmount" />
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 最高数量</label>
              <a-input v-model:value="formData.maxAmount" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label><span class="required">*</span> 手续费(0.1=10%)</label>
              <a-input v-model:value="formData.fee" />
            </div>
          </a-col>
        </a-row>

        <!-- 背景图片 -->
        <div class="section-title">背景图片</div>
        <div class="bg-upload-row">
          <div class="bg-upload-item">
            <div class="bg-label">当前等级</div>
            <a-upload
              :show-upload-list="false"
              accept="image/*"
              @change="handleBgCurrentChange"
            >
              <div class="upload-box">
                <plus-outlined class="upload-icon" />
                <div class="upload-text">LOGO</div>
              </div>
            </a-upload>
          </div>
          <div class="bg-upload-item">
            <div class="bg-label">小于当前等级</div>
            <a-upload
              :show-upload-list="false"
              accept="image/*"
              @change="handleBgLowerChange"
            >
              <div class="upload-box">
                <plus-outlined class="upload-icon" />
                <div class="upload-text">LOGO</div>
              </div>
            </a-upload>
          </div>
          <div class="bg-upload-item">
            <div class="bg-label">大于当前等级</div>
            <a-upload
              :show-upload-list="false"
              accept="image/*"
              @change="handleBgHigherChange"
            >
              <div class="upload-box">
                <plus-outlined class="upload-icon" />
                <div class="upload-text">LOGO</div>
              </div>
            </a-upload>
          </div>
        </div>

        <!-- VIP等级名称 -->
        <div class="section-title">VIP等级名称</div>
        <div class="name-input-row">
          <a-select v-model:value="newLangCode" style="width: 120px" placeholder="选择语言">
            <a-select-option value="zh-cn">zh-cn</a-select-option>
            <a-select-option value="en-us">en-us</a-select-option>
            <a-select-option value="ja-jp">ja-jp</a-select-option>
          </a-select>
          <a-input v-model:value="newLangText" placeholder="请输入语言标识" style="flex: 1" />
          <a-button type="primary" @click="handleAddLang">添 加</a-button>
          <a-button @click="handleRefLang">参 考</a-button>
        </div>

        <!-- 已添加的语言列表 -->
        <div class="lang-list">
          <div v-for="(item, index) in formData.names" :key="index" class="lang-item">
            <div class="lang-header">
              <span>文本 - {{ item.lang }}</span>
              <a class="delete-link" @click="handleDeleteLang(index)">删除</a>
            </div>
            <a-textarea v-model:value="item.text" :rows="2" />
          </div>
        </div>
      </div>
    </a-drawer>

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
const tableSize = ref('large')

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
    title: '提现',
    children: [
      {
        title: '次数',
        dataIndex: 'times',
        key: 'times',
        width: 60,
        align: 'center'
      },
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
      },
      {
        title: '手续费(%)',
        dataIndex: 'fee',
        key: 'fee',
        width: 90,
        align: 'center'
      }
    ]
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    align: 'center'
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

// 抽屉
const drawerVisible = ref(false)
const drawerTitle = ref('添加数据')
const isEdit = ref(false)

const formData = reactive({
  id: null,
  logo: '',
  level: '',
  mode: '根据系统配置',
  amount: '',
  commissionSingle: '',
  commissionMulti: '',
  taskCount: '',
  times: '',
  dailyLimit: '',
  minAmount: '',
  maxAmount: '',
  fee: '',
  bgCurrent: '',
  bgLower: '',
  bgHigher: '',
  names: []
})

// 语言输入
const newLangCode = ref('zh-cn')
const newLangText = ref('')

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

// Logo修改
const handleLogoChange = (info, record) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      record.logo = e.target.result
      message.success('Logo已更新')
    }
    reader.readAsDataURL(file)
  }
}

// 主Logo上传
const handleMainLogoChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.logo = e.target.result
      message.success('Logo已上传')
    }
    reader.readAsDataURL(file)
  }
}

// 背景图片上传
const handleBgCurrentChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.bgCurrent = e.target.result
      message.success('当前等级背景已上传')
    }
    reader.readAsDataURL(file)
  }
}

const handleBgLowerChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.bgLower = e.target.result
      message.success('小于当前等级背景已上传')
    }
    reader.readAsDataURL(file)
  }
}

const handleBgHigherChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.bgHigher = e.target.result
      message.success('大于当前等级背景已上传')
    }
    reader.readAsDataURL(file)
  }
}

// 密度切换
const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

// 添加
const handleAdd = () => {
  drawerTitle.value = '添加数据'
  isEdit.value = false
  resetForm()
  drawerVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  drawerTitle.value = `编辑VIP等级-${record.level}`
  isEdit.value = true
  Object.assign(formData, {
    id: record.id,
    logo: record.logo,
    level: String(record.level),
    mode: record.mode || '根据系统配置',
    amount: String(record.amount),
    commissionSingle: record.commissionSingle?.replace('%', '') || '',
    commissionMulti: record.commissionMulti?.replace('%', '') || '',
    taskCount: String(record.taskCount),
    times: String(record.times),
    dailyLimit: String(record.dailyLimit),
    minAmount: String(record.minAmount),
    maxAmount: String(record.maxAmount),
    fee: record.fee?.replace('%', '') || '',
    bgCurrent: '',
    bgLower: '',
    bgHigher: '',
    names: [
      { lang: 'zh-cn', text: '导师级别' },
      { lang: 'en-us', text: record.name }
    ]
  })
  drawerVisible.value = true
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
  formData.logo = ''
  formData.level = ''
  formData.mode = '根据系统配置'
  formData.amount = ''
  formData.commissionSingle = ''
  formData.commissionMulti = ''
  formData.taskCount = ''
  formData.times = ''
  formData.dailyLimit = ''
  formData.minAmount = ''
  formData.maxAmount = ''
  formData.fee = ''
  formData.bgCurrent = ''
  formData.bgLower = ''
  formData.bgHigher = ''
  formData.names = []
  newLangCode.value = 'zh-cn'
  newLangText.value = ''
}

// 抽屉关闭
const handleDrawerClose = () => {
  drawerVisible.value = false
}

// 抽屉提交
const handleDrawerSubmit = () => {
  message.success(isEdit.value ? '编辑成功' : '添加成功')
  drawerVisible.value = false
}

// Logo重新上传
const handleReuploadLogo = () => {
  message.info('重新上传Logo')
}

// Logo重置
const handleResetLogo = () => {
  formData.logo = ''
  message.success('Logo已重置')
}

// 添加语言
const handleAddLang = () => {
  if (!newLangText.value) {
    message.warning('请输入语言标识')
    return
  }
  formData.names.push({
    lang: newLangCode.value,
    text: newLangText.value
  })
  newLangText.value = ''
}

// 参考
const handleRefLang = () => {
  message.info('查看参考')
}

// 删除语言
const handleDeleteLang = (index) => {
  formData.names.splice(index, 1)
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
        border-radius: 4px;
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

  .withdraw-text {
    color: #fa541c;
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
    padding: 16px 8px;
    text-align: center;
  }

  .ant-table-tbody > tr > td {
    padding: 16px 8px;
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
    // 佣金表头颜色
    &:nth-child(8) {
      color: #1890ff !important;
    }

    // 提现表头颜色
    &:nth-child(9) {
      color: #fa541c !important;
    }

    // 操作表头黑色
    &:nth-child(10) {
      color: #333 !important;
    }
  }

  // 子表头颜色
  .ant-table-thead > tr:nth-child(2) > th {
    // 佣金子表头
    &:nth-child(1),
    &:nth-child(2) {
      color: #1890ff !important;
    }

    // 提现子表头
    &:nth-child(3),
    &:nth-child(4),
    &:nth-child(5),
    &:nth-child(6),
    &:nth-child(7) {
      color: #fa541c !important;
    }
  }
}

// 抽屉全局样式
.rounded-drawer {
  .ant-drawer-content {
    border-radius: 8px 0 0 8px;
  }

  .ant-drawer-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .ant-drawer-body {
    padding: 16px 24px 24px;
  }

  .ant-drawer-extra {
    .ant-btn-primary {
      height: 32px;
      border-radius: 6px;
      font-size: 14px;
      padding: 0 16px;
    }
  }
}

// 编辑抽屉内容样式
.edit-drawer-content {
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 28px 0 16px;

    &:first-of-type {
      margin-top: 24px;
    }
  }

  .form-item {
    margin-bottom: 18px;

    label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 6px;
      font-weight: 400;

      .required {
        color: #ff4d4f;
        margin-right: 4px;
      }
    }

    .ant-input,
    .ant-select-selector {
      height: 36px !important;
      border-radius: 6px;
      border-color: #d9d9d9;
      font-size: 14px;

      &:hover {
        border-color: #40a9ff;
      }
    }

    .ant-select-selector {
      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 34px !important;
      }
    }
  }

  .logo-upload-section {
    margin-bottom: 8px;
  }

  .upload-box {
    width: 104px;
    height: 104px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #1890ff;
      background: #f0f7ff;

      .upload-icon,
      .upload-text {
        color: #1890ff;
      }
    }

    .upload-icon {
      font-size: 24px;
      color: #bfbfbf;
      margin-bottom: 8px;
      transition: color 0.3s;
    }

    .upload-text {
      font-size: 14px;
      color: #bfbfbf;
      transition: color 0.3s;
    }
  }

  .bg-upload-row {
    display: flex;
    gap: 16px;
  }

  .bg-upload-item {
    .bg-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }
  }

  .name-input-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;

    .ant-select-selector,
    .ant-input {
      height: 36px !important;
      border-radius: 6px;
    }

    .ant-select-selector {
      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 34px !important;
      }
    }

    .ant-btn {
      height: 36px;
      border-radius: 6px;
      min-width: 70px;
    }
  }

  .lang-list {
    .lang-item {
      margin-bottom: 16px;

      .lang-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;
        color: #333;

        .delete-link {
          color: #ff4d4f;
          cursor: pointer;
          font-size: 13px;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .ant-input {
        border-radius: 6px;
      }
    }
  }
}
</style>
