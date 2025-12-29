<template>
  <div class="page-container" :class="`size-${tableSize}`">
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
              <a-menu-item key="default">宽松</a-menu-item>
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
            <img v-if="record.logo" :src="record.logo" class="level-logo" />
            <div v-else class="logo-placeholder">LOGO</div>
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
      <!-- 分页 -->
      <TablePagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
      />
    </div>

    <!-- 添加/编辑抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      placement="right"
      :width="720"
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
          <div v-if="formData.logo" class="upload-preview-with-actions">
            <img :src="formData.logo" alt="Logo" />
            <div class="preview-overlay">
              <a-upload
                :show-upload-list="false"
                accept="image/*"
                @change="handleMainLogoChange"
              >
                <a-button type="primary" size="small">重新上传</a-button>
              </a-upload>
              <a-button type="primary" danger size="small" @click="formData.logo = ''">重置</a-button>
            </div>
          </div>
          <a-upload
            v-else
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
                <a-select-option value="全部">全部</a-select-option>
                <a-select-option value="不重置">不重置</a-select-option>
                <a-select-option value="重置">重置</a-select-option>
                <a-select-option value="重置但次数累计">重置但次数累计</a-select-option>
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
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="bg-upload-item">
              <div class="bg-label">当前等级</div>
              <div v-if="formData.bgCurrent" class="upload-preview-with-actions">
                <img :src="formData.bgCurrent" alt="当前等级" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    accept="image/*"
                    @change="handleBgCurrentChange"
                  >
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="formData.bgCurrent = ''">重置</a-button>
                </div>
              </div>
              <a-upload
                v-else
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
          </a-col>
          <a-col :span="8">
            <div class="bg-upload-item">
              <div class="bg-label">小于当前等级</div>
              <div v-if="formData.bgLower" class="upload-preview-with-actions">
                <img :src="formData.bgLower" alt="小于当前等级" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    accept="image/*"
                    @change="handleBgLowerChange"
                  >
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="formData.bgLower = ''">重置</a-button>
                </div>
              </div>
              <a-upload
                v-else
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
          </a-col>
          <a-col :span="8">
            <div class="bg-upload-item">
              <div class="bg-label">大于当前等级</div>
              <div v-if="formData.bgHigher" class="upload-preview-with-actions">
                <img :src="formData.bgHigher" alt="大于当前等级" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    accept="image/*"
                    @change="handleBgHigherChange"
                  >
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="formData.bgHigher = ''">重置</a-button>
                </div>
              </div>
              <a-upload
                v-else
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
          </a-col>
        </a-row>

        <!-- VIP等级名称 -->
        <div class="section-title">VIP等级名称</div>
        <div class="name-input-row">
          <a-select v-model:value="newLangCode" style="width: 140px" placeholder="选择语言" @change="handleLangSelectChange">
            <a-select-option v-for="lang in availableLangs" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </a-select-option>
          </a-select>
          <a-input v-model:value="newLangText" placeholder="请输入等级名称" style="flex: 1" />
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

    <!-- 说明抽屉 -->
    <a-drawer
      v-model:open="infoDrawerVisible"
      :title="`编辑VIP等级-${currentRecord?.level || ''} - 说明`"
      placement="right"
      :width="900"
      :closable="true"
      :rootClassName="'rounded-drawer'"
      @close="infoDrawerVisible = false"
    >
      <template #extra>
        <a-button type="primary" @click="handleSaveInfo">保存&创建</a-button>
      </template>

      <div class="info-drawer-content">
        <!-- VIP说明开关 -->
        <div class="info-switch-row">
          <span class="info-switch-label">VIP说明</span>
          <a-switch v-model:checked="infoFormData.enabled" />
        </div>

        <!-- 两栏布局 -->
        <div class="info-two-column">
          <!-- 左侧：语言列表 -->
          <div class="info-left-panel">
            <!-- 添加语言按钮 -->
            <a-button type="primary" block class="add-lang-btn" @click="handleAddInfoLang">
              添加语言
            </a-button>

            <!-- 语言列表 -->
            <div class="info-lang-list">
              <div
                v-for="(item, index) in infoFormData.languages"
                :key="index"
                class="info-lang-item"
                :class="{ active: selectedInfoLangIndex === index }"
              >
                <span class="lang-name" @click="selectedInfoLangIndex = index">{{ item.langName || item.lang }}</span>
                <delete-outlined class="delete-icon" @click.stop="confirmDeleteInfoLang(index)" />
              </div>
            </div>

            <!-- 暂无语言提示 -->
            <div v-if="infoFormData.languages.length === 0" class="no-lang-tip">暂无语言</div>
          </div>

          <!-- 右侧：富文本编辑器 -->
          <div class="info-right-panel">
            <template v-if="currentInfoLang">
              <!-- TinyMCE 编辑器 -->
              <div class="editor-wrapper">
                <RichTextEditor
                  :key="currentInfoLang.lang"
                  v-model="currentInfoLang.content"
                  :placeholder="`请输入内容（${currentInfoLang.lang}）`"
                />
              </div>
            </template>
            <div v-else class="editor-empty">
              <span>请添加或选择语言</span>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 说明-添加语言弹窗 -->
    <a-modal
      v-model:open="infoLangModalVisible"
      :width="480"
      @ok="handleConfirmInfoLang"
      @cancel="infoLangModalVisible = false"
      okText="确 定"
      cancelText="取 消"
      :rootClassName="'warning-modal'"
    >
      <template #title>
        <div class="modal-title-with-icon">
          <span class="warning-icon">!</span>
          <span>增加语言</span>
        </div>
      </template>
      <div class="add-lang-content">
        <!-- 提示信息 -->
        <a-alert type="warning" :show-icon="false" class="warning-tip-box">
          <template #message>
            <div class="tip-text">一般标识用带有-的。比如：zh-cn</div>
            <div class="tip-text">如果忘记标识可以参考：<a class="link" @click="openLangRefFromInfo">国际语言标识表</a></div>
          </template>
        </a-alert>

        <!-- 语言选择 -->
        <a-select
          v-model:value="selectedInfoLang"
          style="width: 100%;"
          placeholder="选择语言"
          show-search
          allow-clear
          size="large"
          :filter-option="filterLangOption"
        >
          <a-select-option v-for="lang in infoAvailableLangs" :key="lang.code" :value="lang.code">
            {{ lang.name }} ({{ lang.code }})
          </a-select-option>
        </a-select>
      </div>
    </a-modal>

    <!-- 语言代码表弹窗 -->
    <a-modal
      v-model:open="langRefModalVisible"
      title="语言代码表"
      :footer="null"
      :width="600"
    >
      <div class="lang-ref-content">
        <a-input-search
          v-model:value="langSearchText"
          placeholder="搜索语言代码或名称"
          style="margin-bottom: 12px"
          allow-clear
        />
        <a-table
          :columns="langRefColumns"
          :data-source="filteredLangRefData"
          :pagination="false"
          size="small"
          :scroll="{ y: 'calc(100vh - 300px)' }"
          :row-class-name="() => 'lang-row-clickable'"
          :custom-row="(record) => ({
            onClick: () => handleSelectLangFromRef(record)
          })"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted, computed } from 'vue'
import {
  PlusOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

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
  const paginationHeight = 80
  const extra = 48
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
const tableSize = ref('middle')

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
    logo: '',
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
    logo: '',
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
    logo: '',
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
    logo: '',
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
const newLangCode = ref(undefined)
const newLangText = ref('')

// 可用语言列表（动态）
const availableLangs = ref([
  { code: 'en', name: '英文' },
  { code: 'es', name: '西班牙语' },
  { code: 'he', name: '希伯来语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'it', name: '意大利语' },
  { code: 'de', name: '德语' },
  { code: 'fr', name: '法语' },
  { code: 'zh-cn', name: '中文简体' },
  { code: 'zh-tw', name: '中文繁体' }
])

// 说明抽屉
const infoDrawerVisible = ref(false)
const currentRecord = ref(null)
const infoLangModalVisible = ref(false)
const selectedInfoLang = ref(undefined)
const selectedInfoLangIndex = ref(0)

// 说明表单数据
const infoFormData = reactive({
  enabled: false,
  languages: []
})

// 当前选中的语言项（安全访问）
const currentInfoLang = computed(() => {
  if (infoFormData.languages.length > 0 &&
      selectedInfoLangIndex.value >= 0 &&
      selectedInfoLangIndex.value < infoFormData.languages.length) {
    return infoFormData.languages[selectedInfoLangIndex.value]
  }
  return null
})

// 说明可用语言列表
const infoAvailableLangs = computed(() => {
  // 过滤掉已添加的语言
  const addedCodes = infoFormData.languages.map(l => l.lang)
  return langRefData.filter(lang => !addedCodes.includes(lang.code))
})

// 语言搜索过滤
const filterLangOption = (input, option) => {
  const searchText = input.toLowerCase()
  return option.value.toLowerCase().includes(searchText) ||
         option.children[0].toLowerCase().includes(searchText)
}

// 语言参考弹窗
const langRefModalVisible = ref(false)
const langSearchText = ref('')
const langRefColumns = [
  { title: '语言代码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '语言名称', dataIndex: 'name', key: 'name' }
]
const langRefData = [
  { code: 'af', name: '南非语' },
  { code: 'af-ZA', name: '南非语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'ar-AE', name: '阿拉伯语(阿联酋)' },
  { code: 'ar-BH', name: '阿拉伯语(巴林)' },
  { code: 'ar-DZ', name: '阿拉伯语(阿尔及利亚)' },
  { code: 'ar-EG', name: '阿拉伯语(埃及)' },
  { code: 'ar-IQ', name: '阿拉伯语(伊拉克)' },
  { code: 'ar-JO', name: '阿拉伯语(约旦)' },
  { code: 'ar-KW', name: '阿拉伯语(科威特)' },
  { code: 'ar-LB', name: '阿拉伯语(黎巴嫩)' },
  { code: 'ar-LY', name: '阿拉伯语(利比亚)' },
  { code: 'ar-MA', name: '阿拉伯语(摩洛哥)' },
  { code: 'ar-OM', name: '阿拉伯语(阿曼)' },
  { code: 'ar-QA', name: '阿拉伯语(卡塔尔)' },
  { code: 'ar-SA', name: '阿拉伯语(沙特阿拉伯)' },
  { code: 'ar-SY', name: '阿拉伯语(叙利亚)' },
  { code: 'ar-TN', name: '阿拉伯语(突尼斯)' },
  { code: 'ar-YE', name: '阿拉伯语(也门)' },
  { code: 'az', name: '阿塞拜疆语' },
  { code: 'az-AZ', name: '阿塞拜疆语(拉丁文)' },
  { code: 'be', name: '比利时语' },
  { code: 'be-BY', name: '比利时语' },
  { code: 'bg', name: '保加利亚语' },
  { code: 'bg-BG', name: '保加利亚语' },
  { code: 'bs-BA', name: '波斯尼亚语(拉丁文)' },
  { code: 'ca', name: '加泰隆语' },
  { code: 'ca-ES', name: '加泰隆语' },
  { code: 'cs', name: '捷克语' },
  { code: 'cs-CZ', name: '捷克语' },
  { code: 'cy', name: '威尔士语' },
  { code: 'cy-GB', name: '威尔士语' },
  { code: 'da', name: '丹麦语' },
  { code: 'da-DK', name: '丹麦语' },
  { code: 'de', name: '德语' },
  { code: 'de-AT', name: '德语(奥地利)' },
  { code: 'de-CH', name: '德语(瑞士)' },
  { code: 'de-DE', name: '德语(德国)' },
  { code: 'de-LI', name: '德语(列支敦士登)' },
  { code: 'de-LU', name: '德语(卢森堡)' },
  { code: 'dv', name: '第维埃语' },
  { code: 'dv-MV', name: '第维埃语' },
  { code: 'el', name: '希腊语' },
  { code: 'el-GR', name: '希腊语' },
  { code: 'en', name: '英语' },
  { code: 'en-AU', name: '英语(澳大利亚)' },
  { code: 'en-BZ', name: '英语(伯利兹)' },
  { code: 'en-CA', name: '英语(加拿大)' },
  { code: 'en-CB', name: '英语(加勒比海)' },
  { code: 'en-GB', name: '英语(英国)' },
  { code: 'en-IE', name: '英语(爱尔兰)' },
  { code: 'en-JM', name: '英语(牙买加)' },
  { code: 'en-NZ', name: '英语(新西兰)' },
  { code: 'en-PH', name: '英语(菲律宾)' },
  { code: 'en-TT', name: '英语(特立尼达)' },
  { code: 'en-US', name: '英语(美国)' },
  { code: 'en-ZA', name: '英语(南非)' },
  { code: 'en-ZW', name: '英语(津巴布韦)' },
  { code: 'eo', name: '世界语' },
  { code: 'es', name: '西班牙语' },
  { code: 'es-AR', name: '西班牙语(阿根廷)' },
  { code: 'es-BO', name: '西班牙语(玻利维亚)' },
  { code: 'es-CL', name: '西班牙语(智利)' },
  { code: 'es-CO', name: '西班牙语(哥伦比亚)' },
  { code: 'es-CR', name: '西班牙语(哥斯达黎加)' },
  { code: 'es-DO', name: '西班牙语(多米尼加共和国)' },
  { code: 'es-EC', name: '西班牙语(厄瓜多尔)' },
  { code: 'es-ES', name: '西班牙语(西班牙)' },
  { code: 'es-GT', name: '西班牙语(危地马拉)' },
  { code: 'es-HN', name: '西班牙语(洪都拉斯)' },
  { code: 'es-MX', name: '西班牙语(墨西哥)' },
  { code: 'es-NI', name: '西班牙语(尼加拉瓜)' },
  { code: 'es-PA', name: '西班牙语(巴拿马)' },
  { code: 'es-PE', name: '西班牙语(秘鲁)' },
  { code: 'es-PR', name: '西班牙语(波多黎各)' },
  { code: 'es-PY', name: '西班牙语(巴拉圭)' },
  { code: 'es-SV', name: '西班牙语(萨尔瓦多)' },
  { code: 'es-UY', name: '西班牙语(乌拉圭)' },
  { code: 'es-VE', name: '西班牙语(委内瑞拉)' },
  { code: 'et', name: '爱沙尼亚语' },
  { code: 'et-EE', name: '爱沙尼亚语' },
  { code: 'eu', name: '巴士克语' },
  { code: 'eu-ES', name: '巴士克语' },
  { code: 'fa', name: '法斯语' },
  { code: 'fa-IR', name: '法斯语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'fi-FI', name: '芬兰语' },
  { code: 'fo', name: '法罗语' },
  { code: 'fo-FO', name: '法罗语' },
  { code: 'fr', name: '法语' },
  { code: 'fr-BE', name: '法语(比利时)' },
  { code: 'fr-CA', name: '法语(加拿大)' },
  { code: 'fr-CH', name: '法语(瑞士)' },
  { code: 'fr-FR', name: '法语(法国)' },
  { code: 'fr-LU', name: '法语(卢森堡)' },
  { code: 'fr-MC', name: '法语(摩纳哥)' },
  { code: 'gl', name: '加里西亚语' },
  { code: 'gl-ES', name: '加里西亚语' },
  { code: 'gu', name: '古吉拉特语' },
  { code: 'gu-IN', name: '古吉拉特语' },
  { code: 'he', name: '希伯来语' },
  { code: 'he-IL', name: '希伯来语' },
  { code: 'hi', name: '印地语' },
  { code: 'hi-IN', name: '印地语' },
  { code: 'hr', name: '克罗地亚语' },
  { code: 'hr-BA', name: '克罗地亚语(波斯尼亚和黑塞哥维那)' },
  { code: 'hr-HR', name: '克罗地亚语' },
  { code: 'hu', name: '匈牙利语' },
  { code: 'hu-HU', name: '匈牙利语' },
  { code: 'hy', name: '亚美尼亚语' },
  { code: 'hy-AM', name: '亚美尼亚语' },
  { code: 'id', name: '印度尼西亚语' },
  { code: 'id-ID', name: '印度尼西亚语' },
  { code: 'is', name: '冰岛语' },
  { code: 'is-IS', name: '冰岛语' },
  { code: 'it', name: '意大利语' },
  { code: 'it-CH', name: '意大利语(瑞士)' },
  { code: 'it-IT', name: '意大利语(意大利)' },
  { code: 'ja', name: '日语' },
  { code: 'ja-JP', name: '日语' },
  { code: 'ka', name: '格鲁吉亚语' },
  { code: 'ka-GE', name: '格鲁吉亚语' },
  { code: 'kk', name: '哈萨克语' },
  { code: 'kk-KZ', name: '哈萨克语' },
  { code: 'kn', name: '卡纳拉语' },
  { code: 'kn-IN', name: '卡纳拉语' },
  { code: 'ko', name: '朝鲜语' },
  { code: 'ko-KR', name: '朝鲜语' },
  { code: 'kok', name: '孔卡尼语' },
  { code: 'kok-IN', name: '孔卡尼语' },
  { code: 'ky', name: '吉尔吉斯语' },
  { code: 'ky-KG', name: '吉尔吉斯语(西里尔文)' },
  { code: 'lt', name: '立陶宛语' },
  { code: 'lt-LT', name: '立陶宛语' },
  { code: 'lv', name: '拉脱维亚语' },
  { code: 'lv-LV', name: '拉脱维亚语' },
  { code: 'mi', name: '毛利语' },
  { code: 'mi-NZ', name: '毛利语' },
  { code: 'mk', name: '马其顿语' },
  { code: 'mk-MK', name: '马其顿语(FYROM)' },
  { code: 'mn', name: '蒙古语' },
  { code: 'mn-MN', name: '蒙古语(西里尔文)' },
  { code: 'mr', name: '马拉地语' },
  { code: 'mr-IN', name: '马拉地语' },
  { code: 'ms', name: '马来语' },
  { code: 'ms-BN', name: '马来语(文莱达鲁萨兰)' },
  { code: 'ms-MY', name: '马来语(马来西亚)' },
  { code: 'mt', name: '马耳他语' },
  { code: 'mt-MT', name: '马耳他语' },
  { code: 'nb', name: '挪威语(伯克梅尔)' },
  { code: 'nb-NO', name: '挪威语(伯克梅尔)(挪威)' },
  { code: 'nl', name: '荷兰语' },
  { code: 'nl-BE', name: '荷兰语(比利时)' },
  { code: 'nl-NL', name: '荷兰语(荷兰)' },
  { code: 'nn-NO', name: '挪威语(尼诺斯克)(挪威)' },
  { code: 'ns', name: '北梭托语' },
  { code: 'ns-ZA', name: '北梭托语' },
  { code: 'pa', name: '旁遮普语' },
  { code: 'pa-IN', name: '旁遮普语' },
  { code: 'pl', name: '波兰语' },
  { code: 'pl-PL', name: '波兰语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'pt-BR', name: '葡萄牙语(巴西)' },
  { code: 'pt-PT', name: '葡萄牙语(葡萄牙)' },
  { code: 'qu', name: '克丘亚语' },
  { code: 'qu-BO', name: '克丘亚语(玻利维亚)' },
  { code: 'qu-EC', name: '克丘亚语(厄瓜多尔)' },
  { code: 'qu-PE', name: '克丘亚语(秘鲁)' },
  { code: 'ro', name: '罗马尼亚语' },
  { code: 'ro-RO', name: '罗马尼亚语' },
  { code: 'ru', name: '俄语' },
  { code: 'ru-RU', name: '俄语' },
  { code: 'sa', name: '梵文' },
  { code: 'sa-IN', name: '梵文' },
  { code: 'se', name: '北萨摩斯语' },
  { code: 'se-FI', name: '北萨摩斯语(芬兰)' },
  { code: 'se-NO', name: '北萨摩斯语(挪威)' },
  { code: 'se-SE', name: '北萨摩斯语(瑞典)' },
  { code: 'sk', name: '斯洛伐克语' },
  { code: 'sk-SK', name: '斯洛伐克语' },
  { code: 'sl', name: '斯洛文尼亚语' },
  { code: 'sl-SI', name: '斯洛文尼亚语' },
  { code: 'sq', name: '阿尔巴尼亚语' },
  { code: 'sq-AL', name: '阿尔巴尼亚语' },
  { code: 'sr-BA', name: '塞尔维亚语(波斯尼亚和黑塞哥维那)' },
  { code: 'sr-SP', name: '塞尔维亚语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'sv-FI', name: '瑞典语(芬兰)' },
  { code: 'sv-SE', name: '瑞典语' },
  { code: 'sw', name: '斯瓦希里语' },
  { code: 'sw-KE', name: '斯瓦希里语' },
  { code: 'syr', name: '叙利亚语' },
  { code: 'syr-SY', name: '叙利亚语' },
  { code: 'ta', name: '泰米尔语' },
  { code: 'ta-IN', name: '泰米尔语' },
  { code: 'te', name: '泰卢固语' },
  { code: 'te-IN', name: '泰卢固语' },
  { code: 'th', name: '泰语' },
  { code: 'th-TH', name: '泰语' },
  { code: 'tl', name: '塔加路语' },
  { code: 'tl-PH', name: '塔加路语(菲律宾)' },
  { code: 'tn', name: '茨瓦纳语' },
  { code: 'tn-ZA', name: '茨瓦纳语' },
  { code: 'tr', name: '土耳其语' },
  { code: 'tr-TR', name: '土耳其语' },
  { code: 'ts', name: '宗加语' },
  { code: 'tt', name: '鞑靼语' },
  { code: 'tt-RU', name: '鞑靼语' },
  { code: 'uk', name: '乌克兰语' },
  { code: 'uk-UA', name: '乌克兰语' },
  { code: 'ur', name: '乌都语' },
  { code: 'ur-PK', name: '乌都语' },
  { code: 'uz', name: '乌兹别克语' },
  { code: 'uz-UZ', name: '乌兹别克语(拉丁文)' },
  { code: 'vi', name: '越南语' },
  { code: 'vi-VN', name: '越南语' },
  { code: 'xh', name: '班图语' },
  { code: 'xh-ZA', name: '班图语' },
  { code: 'zh', name: '中文' },
  { code: 'zh-CN', name: '中文(简体)' },
  { code: 'zh-HK', name: '中文(香港)' },
  { code: 'zh-MO', name: '中文(澳门)' },
  { code: 'zh-SG', name: '中文(新加坡)' },
  { code: 'zh-TW', name: '中文(繁体)' },
  { code: 'zu', name: '祖鲁语' },
  { code: 'zu-ZA', name: '祖鲁语' }
]

// 过滤后的语言数据
const filteredLangRefData = computed(() => {
  if (!langSearchText.value) {
    return langRefData
  }
  const keyword = langSearchText.value.toLowerCase()
  return langRefData.filter(item =>
    item.code.toLowerCase().includes(keyword) ||
    item.name.toLowerCase().includes(keyword)
  )
})

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
  // 重置说明表单
  infoFormData.enabled = false
  infoFormData.languages = []
  infoDrawerVisible.value = true
}

// 打开添加语言弹窗
const handleAddInfoLang = () => {
  selectedInfoLang.value = ''
  infoLangModalVisible.value = true
}

// 从说明弹窗打开语言参考表
const openLangRefFromInfo = () => {
  langRefModalVisible.value = true
}

// 确认添加语言
const handleConfirmInfoLang = () => {
  if (!selectedInfoLang.value) {
    message.warning('请选择语言')
    return
  }

  // 检查是否已存在
  const exists = infoFormData.languages.some(l => l.lang === selectedInfoLang.value)
  if (exists) {
    message.warning('该语言已添加')
    return
  }

  // 查找语言名称
  const lang = langRefData.find(l => l.code === selectedInfoLang.value)
  infoFormData.languages.push({
    lang: selectedInfoLang.value,
    langName: lang ? lang.name : selectedInfoLang.value,
    content: ''
  })
  // 选中新添加的语言
  selectedInfoLangIndex.value = infoFormData.languages.length - 1

  infoLangModalVisible.value = false
  selectedInfoLang.value = undefined
}

// 删除说明语言（带确认）
const confirmDeleteInfoLang = (index) => {
  const langItem = infoFormData.languages[index]
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除语言 "${langItem.langName || langItem.lang}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    class: 'warning-modal',
    onOk() {
      infoFormData.languages.splice(index, 1)
      // 调整选中索引
      if (infoFormData.languages.length === 0) {
        selectedInfoLangIndex.value = 0
      } else if (selectedInfoLangIndex.value >= infoFormData.languages.length) {
        selectedInfoLangIndex.value = infoFormData.languages.length - 1
      }
      message.success('删除成功')
    }
  })
}

// 删除说明语言
const handleDeleteInfoLang = (index) => {
  infoFormData.languages.splice(index, 1)
  // 调整选中索引
  if (infoFormData.languages.length === 0) {
    selectedInfoLangIndex.value = 0
  } else if (selectedInfoLangIndex.value >= infoFormData.languages.length) {
    selectedInfoLangIndex.value = infoFormData.languages.length - 1
  }
}

// 保存说明
const handleSaveInfo = () => {
  message.success('保存成功')
  infoDrawerVisible.value = false
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除等级 "${record.name}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    class: 'warning-modal',
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
  newLangCode.value = undefined
  newLangText.value = ''
}

// 抽屉关闭
const handleDrawerClose = () => {
  drawerVisible.value = false
}

// 验证必填字段
const validateForm = () => {
  const requiredFields = [
    { key: 'level', label: '等级' },
    { key: 'mode', label: '模式' },
    { key: 'amount', label: '金额(USD)' },
    { key: 'commissionSingle', label: '任务佣金' },
    { key: 'commissionMulti', label: '连单任务佣金' },
    { key: 'taskCount', label: '任务数量' },
    { key: 'times', label: '次数' },
    { key: 'dailyLimit', label: '单日限制' },
    { key: 'minAmount', label: '最低数量' },
    { key: 'maxAmount', label: '最高数量' },
    { key: 'fee', label: '手续费' }
  ]

  for (const field of requiredFields) {
    if (!formData[field.key] && formData[field.key] !== 0) {
      message.warning(`请填写必要的选项：${field.label}`)
      return false
    }
  }
  return true
}

// 抽屉提交
const handleDrawerSubmit = () => {
  if (!validateForm()) {
    return
  }
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

// 下拉框选择语言时自动添加文本框
const handleLangSelectChange = (value) => {
  // 检查是否已添加该语言的文本
  const textExists = formData.names.some(item => item.lang === value)
  if (!textExists) {
    // 获取语言名称
    const lang = availableLangs.value.find(l => l.code === value)
    formData.names.push({
      lang: value,
      text: ''
    })
  }
}

// 参考
const handleRefLang = () => {
  langRefModalVisible.value = true
}

// 从参考表选择语言
const handleSelectLangFromRef = (record) => {
  // 检查是否已存在该语言
  const exists = availableLangs.value.some(lang => lang.code === record.code)
  if (!exists) {
    // 添加到下拉框选项
    availableLangs.value.push({ code: record.code, name: record.name })
  }

  // 检查是否已添加该语言的文本
  const textExists = formData.names.some(item => item.lang === record.code)
  if (!textExists) {
    // 添加到文本列表
    formData.names.push({
      lang: record.code,
      text: ''
    })
  }

  // 设置当前选中的语言
  newLangCode.value = record.code

  message.success(`已添加语言: ${record.name} (${record.code})`)
}

// 删除语言
const handleDeleteLang = (index) => {
  formData.names.splice(index, 1)
}
</script>

<style scoped lang="less">
.page-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  padding-bottom: 80px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  .page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

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
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    padding: 0 16px;
    min-height: 0;

    :deep(.ant-table-wrapper) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-spin-nested-loading {
        flex: 1;
        overflow: hidden;
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
            overflow: hidden !important;
          }

          .ant-table-body {
            flex: 1;
            overflow-y: auto !important;
            overflow-x: auto !important;
          }
        }
      }
    }
  }

  .level-logo {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
  }

  .logo-placeholder {
    width: 40px;
    height: 40px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    background: #fafafa;
    font-size: 12px;
    margin: 0 auto;
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

// 语言代码表弹窗标题样式
:deep(.ant-modal) {
  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
  }

  // 语言代码表表头加大
  .lang-ref-content {
    .ant-table-thead > tr > th {
      font-size: 15px;
      font-weight: 600;
    }

    // 可点击行样式
    .lang-row-clickable {
      cursor: pointer;

      &:hover {
        background-color: #e6f7ff !important;
      }
    }
  }
}
</style>

<style lang="less">
// 表头颜色 - 全局样式
.page-container {
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
      font-size: 18px;
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
    font-size: 17px;
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

  .upload-preview-with-actions {
    width: 104px;
    height: 104px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    border: 1px solid #d9d9d9;

    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;

      .ant-btn {
        width: 80px;
        font-size: 12px;
      }
    }

    &:hover .preview-overlay {
      opacity: 1;
    }
  }

  .upload-preview-wrapper {
    display: inline-block;

    .preview-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  }

  .upload-preview {
    width: 104px;
    height: 104px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    border: 1px solid #d9d9d9;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
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

// 说明抽屉内容样式
.info-drawer-content {
  .info-switch-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .info-switch-label {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .info-two-column {
    display: flex;
    gap: 16px;
    height: calc(100vh - 180px);
  }

  .info-left-panel {
    width: 180px;
    flex-shrink: 0;

    .add-lang-btn {
      height: 40px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .info-lang-list {
      .info-lang-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .lang-name {
          flex: 1;
          padding: 8px 12px;
          color: #333;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
          border: 1px solid #d9d9d9;
          background: #fff;

          &:hover {
            border-color: #40a9ff;
          }
        }

        .delete-icon {
          color: #ff4d4f;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 4px;

          &:hover {
            color: #ff7875;
            transform: scale(1.1);
          }
        }

        &.active {
          .lang-name {
            border-color: #1890ff;
            background: #1890ff;
            color: #fff;
          }
        }
      }
    }

    .no-lang-tip {
      font-size: 14px;
      color: #999;
      text-align: center;
      padding: 20px 0;
    }
  }

  .info-right-panel {
    flex: 1;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .editor-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .editor-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #bfbfbf;
      font-size: 14px;
    }
  }
}

// 增加语言弹窗-下拉框样式
.add-lang-content {
  .ant-select-lg {
    width: 100% !important;

    .ant-select-selector {
      height: 44px !important;
      border-radius: 8px !important;
      border-color: #d9d9d9 !important;

      .ant-select-selection-search-input {
        height: 42px !important;
      }

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        line-height: 42px !important;
        font-size: 14px !important;
      }

      .ant-select-selection-placeholder {
        color: #bfbfbf !important;
      }

      .ant-select-selection-item {
        color: #333 !important;
      }
    }
  }
}
</style>
