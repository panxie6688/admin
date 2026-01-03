<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">商品列表</h2>
        <a-button type="primary" class="add-btn" @click="handleAdd">
          <plus-outlined /> 添加数据
        </a-button>
        <a-button type="primary" ghost @click="openCollectDrawer">
          <cloud-download-outlined /> 采集商品
        </a-button>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 180px"
          @search="onSearch"
        />
        <a-button type="primary" @click="searchDrawerVisible = true">
          更多搜索
        </a-button>
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
        :scroll="{ x: 1200, y: 'calc(100vh - 260px)' }"
        row-key="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 价格 -->
          <template v-if="column.dataIndex === 'price'">
            <span class="price-text">{{ record.price }}</span>
          </template>
          <!-- 封面 -->
          <template v-else-if="column.dataIndex === 'cover'">
            <a-image
              v-if="record.cover"
              :src="record.cover"
              :width="80"
              :height="80"
              style="object-fit: cover; border-radius: 4px;"
            />
            <span v-else class="no-image">-</span>
          </template>
          <!-- 状态 -->
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="record.status === '显示' ? 'success' : 'default'">
              {{ record.status }}
            </a-tag>
          </template>
          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <a-space :size="12">
              <a class="action-link edit" @click="handleEdit(record)">编辑</a>
              <a class="action-link delete" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
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
      v-model:open="searchDrawerVisible"
      title="筛选"
      placement="right"
      :width="400"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <close-outlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a style="color: #ff4d4f; cursor: pointer;" @click="handleResetSearch">重置</a>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </div>
      </template>
      <div class="search-form">
        <div class="form-item">
          <div class="form-label">分类</div>
          <a-select v-model:value="searchForm.category" placeholder="请选择" style="width: 100%;" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="cat in categoryList" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="form-item">
          <div class="form-label">状态</div>
          <a-select v-model:value="searchForm.status" placeholder="请选择" style="width: 100%;" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="显示">显示</a-select-option>
            <a-select-option value="隐藏">隐藏</a-select-option>
          </a-select>
        </div>
        <div class="form-item">
          <div class="form-label">最低价格</div>
          <a-input v-model:value="searchForm.minPrice" placeholder="输入" style="width: 100%;" />
        </div>
        <div class="form-item">
          <div class="form-label">最高价格</div>
          <a-input v-model:value="searchForm.maxPrice" placeholder="输入" style="width: 100%;" />
        </div>
        <div class="form-item">
          <div class="form-label">搜索</div>
          <a-input v-model:value="searchForm.keyword" placeholder="输入" style="width: 100%;" />
        </div>
        <div class="form-item">
          <div class="form-label">开始时间</div>
          <a-date-picker v-model:value="searchForm.startTime" placeholder="请选择日期" style="width: 100%;" />
        </div>
        <div class="form-item">
          <div class="form-label">结束时间</div>
          <a-date-picker v-model:value="searchForm.endTime" placeholder="请选择日期" style="width: 100%;" />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select v-model:value="searchForm.sortField" placeholder="创建时间" style="width: 100%;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="time">创建时间</a-select-option>
            <a-select-option value="id">按ID</a-select-option>
            <a-select-option value="vip">VIP等级</a-select-option>
            <a-select-option value="price">价格</a-select-option>
          </a-select>
        </div>
        <div class="form-item">
          <div class="form-label">排序类型</div>
          <a-select v-model:value="searchForm.sortType" placeholder="降序排序" style="width: 100%;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </div>
      </div>
    </a-drawer>

    <!-- 添加/编辑全屏页面 -->
    <Transition name="slide-up">
      <div v-if="editPageVisible" class="edit-page">
      <!-- 页面头部 -->
      <div class="edit-page-header">
        <div class="header-left">
          <h2 class="page-title">{{ isEdit ? `编辑商品-${editForm.id}` : '添加商品' }}</h2>
        </div>
        <div class="header-right">
          <a-button type="primary" @click="handleEditSubmit">保存&发布</a-button>
          <a-tooltip title="刷新">
            <a-button class="icon-btn" @click="handleRefresh">
              <template #icon><reload-outlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="关闭">
            <a-button class="icon-btn" @click="handleEditClose">
              <template #icon><close-outlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 编辑内容区域 -->
      <div class="edit-page-content">
        <!-- 表单区域 -->
        <div class="form-section">
          <div class="section-title">表单</div>
          <div class="section-content">
            <div class="form-row">
              <div class="form-col">
                <div class="form-label">分类</div>
                <a-select v-model:value="editForm.category" placeholder="请选择" style="width: 100%;">
                  <a-select-option v-for="cat in categoryList" :key="cat.id" :value="cat.name">
                    {{ cat.name }}
                  </a-select-option>
                </a-select>
              </div>
              <div class="form-col">
                <div class="form-label">显示</div>
                <div class="status-switch">
                  <span>开关</span>
                  <a-switch v-model:checked="editForm.statusEnabled" />
                </div>
              </div>
              <div class="form-col">
                <div class="form-label">价格</div>
                <a-input v-model:value="editForm.price" placeholder="请输入" />
              </div>
            </div>
            <!-- 封面图片 -->
            <div class="cover-upload">
              <div v-if="editForm.cover" class="upload-preview-with-actions">
                <img :src="editForm.cover" alt="封面" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    accept="image/*"
                    :before-upload="() => false"
                    @change="handleCoverChange"
                  >
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="editForm.cover = ''">重 置</a-button>
                </div>
              </div>
              <a-upload
                v-else
                :show-upload-list="false"
                accept="image/*"
                :before-upload="() => false"
                @change="handleCoverChange"
              >
                <div class="upload-box">
                  <plus-outlined class="upload-icon" />
                  <div class="upload-text">上传封面</div>
                </div>
              </a-upload>
            </div>
          </div>
        </div>

        <!-- 标题区域 -->
        <div class="form-section title-form-section">
          <div class="section-title">标题</div>
          <div class="section-content title-section">
            <div class="title-left">
              <a-button type="primary" block @click="handleAddLang">添加语言</a-button>
              <div class="lang-list">
                <div
                  v-for="(lang, index) in editForm.titles"
                  :key="lang.lang"
                  :class="['lang-item', { active: currentLangIndex === index }]"
                  @click="currentLangIndex = index"
                >
                  <span class="lang-name">{{ lang.lang }}</span>
                  <delete-outlined class="delete-icon" @click.stop="handleDeleteLang(index)" />
                </div>
              </div>
            </div>
            <div class="title-right">
              <RichTextEditor
                v-if="editForm.titles.length > 0"
                v-model="editForm.titles[currentLangIndex].content"
                :placeholder="`请输入内容（${editForm.titles[currentLangIndex]?.lang}）`"
                height="300px"
              />
              <div v-else class="no-lang-tip">请先添加语言</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 添加语言弹窗 -->
    <a-modal
      v-model:open="addLangModalVisible"
      title="添加语言"
      @ok="handleConfirmAddLang"
      @cancel="addLangModalVisible = false"
      okText="确 定"
      cancelText="取 消"
    >
      <div class="add-lang-content">
        <a-alert type="warning" :show-icon="false" class="warning-tip-box" style="margin-bottom: 16px;">
          <template #message>
            <div>一般标识用带有-的。比如：zh-cn</div>
          </template>
        </a-alert>
        <a-select
          v-model:value="selectedLang"
          style="width: 100%;"
          placeholder="选择语言"
          show-search
          allow-clear
          size="large"
        >
          <a-select-option v-for="lang in availableLangs" :key="lang.code" :value="lang.code">
            {{ lang.name }} ({{ lang.code }})
          </a-select-option>
        </a-select>
      </div>
    </a-modal>

    <!-- 采集商品抽屉 -->
    <a-drawer
      v-model:open="collectDrawerVisible"
      title="采集商品"
      placement="right"
      :width="collectStep === 1 ? 520 : 900"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <close-outlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <template v-if="collectStep === 2">
            <a-button @click="backToSearch">返回配置</a-button>
            <a-button type="primary" :disabled="selectedCollectItems.length === 0" @click="handleImportSelected">
              <shopping-cart-outlined /> 导入选中 ({{ selectedCollectItems.length }})
            </a-button>
          </template>
        </div>
      </template>

      <div class="collect-content">
        <!-- 步骤1: 搜索配置 -->
        <div v-if="collectStep === 1" class="collect-search-form">
          <a-alert type="info" :show-icon="true" style="margin-bottom: 20px;">
            <template #message>
              <div>设置采集参数，系统将根据价格区间随机生成商品。关键词为选填项。</div>
            </template>
          </a-alert>

          <a-form layout="vertical">
            <a-form-item label="采集平台">
              <a-select v-model:value="collectConfig.platform" placeholder="请选择平台" size="large">
                <a-select-option v-for="opt in platformOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="导入分类">
              <a-select v-model:value="collectConfig.category" placeholder="请选择分类" allow-clear size="large">
                <a-select-option v-for="cat in categoryList" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="搜索关键词（选填）">
              <a-input
                v-model:value="collectConfig.keyword"
                placeholder="可选，输入后会添加到商品名称前"
                size="large"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="价格区间 (USD)">
              <div style="display: flex; align-items: center; gap: 12px;">
                <a-input-number
                  v-model:value="collectConfig.minPrice"
                  placeholder="最低价"
                  style="flex: 1;"
                  size="large"
                  :min="0"
                  :precision="2"
                />
                <span style="color: #999;">—</span>
                <a-input-number
                  v-model:value="collectConfig.maxPrice"
                  placeholder="最高价"
                  style="flex: 1;"
                  size="large"
                  :min="0"
                  :precision="2"
                />
              </div>
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="排序方式">
                  <a-select v-model:value="collectConfig.sortBy" placeholder="请选择排序" size="large">
                    <a-select-option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="采集数量">
                  <a-input-number
                    v-model:value="collectConfig.pageSize"
                    placeholder="请输入数量"
                    style="width: 100%;"
                    size="large"
                    :min="1"
                    :max="100"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item style="margin-top: 8px;">
              <a-button type="primary" size="large" block :loading="collectLoading" @click="handleCollectSearch">
                <cloud-download-outlined /> 开始采集
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 步骤2: 采集结果 -->
        <div v-else class="collect-results">
          <div class="results-header">
            <div class="results-info">
              <a-checkbox :checked="collectSelectAll" @change="handleCollectSelectAll">
                全选
              </a-checkbox>
              <span class="results-count">共采集到 <b>{{ collectResults.length }}</b> 个商品</span>
              <span v-if="selectedCollectItems.length > 0" class="selected-count">
                已选 <b>{{ selectedCollectItems.length }}</b> 个
              </span>
            </div>
            <div class="results-filter">
              <a-tag color="blue">{{ platformOptions.find(p => p.value === collectConfig.platform)?.label }}</a-tag>
              <span v-if="collectConfig.minPrice !== null || collectConfig.maxPrice !== null">
                价格: ${{ collectConfig.minPrice || 0 }} - ${{ collectConfig.maxPrice || '不限' }}
              </span>
            </div>
          </div>

          <div class="results-grid">
            <div
              v-for="item in collectResults"
              :key="item.id"
              :class="['result-card', { selected: item.selected }]"
              @click="handleCollectItemSelect(item)"
            >
              <div class="card-checkbox">
                <a-checkbox :checked="item.selected" @click.stop />
              </div>
              <div class="card-image">
                <img :src="item.image" :alt="item.name" @error="handleImageError" />
              </div>
              <div class="card-info">
                <div class="card-name">{{ item.name }}</div>
                <div class="card-meta">
                  <span class="card-price">${{ item.price }}</span>
                  <span class="card-original-price">${{ item.originalPrice }}</span>
                </div>
                <div class="card-stats">
                  <span><star-filled style="color: #faad14;" /> {{ item.rating }}</span>
                  <span>销量: {{ item.sales }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="collectResults.length === 0" class="empty-results">
            <a-empty description="没有找到符合条件的商品" />
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CloseOutlined,
  DeleteOutlined,
  CloudDownloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  StarFilled
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 搜索
const searchText = ref('')
const onSearch = (value) => {
  console.log('搜索:', value)
  loadData()
}

// 加载状态
const loading = ref(false)

// 表格密度
const tableSize = ref('small')

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: '分类', dataIndex: 'category', key: 'category', width: 100, align: 'center' },
  { title: '名称', dataIndex: 'name', key: 'name', width: 200, align: 'center' },
  { title: '价格', dataIndex: 'price', key: 'price', width: 100, align: 'center' },
  { title: '封面', dataIndex: 'cover', key: 'cover', width: 120, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 120, align: 'center' },
  { title: '操作', key: 'action', width: 100, align: 'center' }
]

// 模拟数据
const tableData = ref([
  { id: 36227, category: 'Default-2', name: 'NWM130 Light Blue Color Slim Fit Men Suits 3 Pieces Suits Classic Design Bridegroom Suits', price: 695.52, cover: 'https://picsum.photos/200/200?random=1', status: '显示', time: '11/06 17:24' },
  { id: 36226, category: 'Default-2', name: 'White Aluminum Alloy Plastic sleeping bag baby stroller baby 3 in 1', price: 689.58, cover: 'https://picsum.photos/200/200?random=2', status: '显示', time: '11/06 17:24' },
  { id: 36225, category: 'Default-2', name: 'touch to open smart home kitchen cabinets with soft hinge', price: 357.5, cover: 'https://picsum.photos/200/200?random=3', status: '显示', time: '11/06 17:24' },
  { id: 36224, category: 'Default-2', name: 'Hot Selling Large Food Industrial Supplier Multifunction 3 in 1 Heavy Duty Electric Meat Cake Milk 50l Planetary Mixer For Dough', price: 122085.4, cover: 'https://picsum.photos/200/200?random=4', status: '显示', time: '11/06 17:23' },
  { id: 36223, category: 'Default-2', name: 'aluminum lightweight portable one hand folding convenience newborn and toddler single baby carriage toddler seat baby stroller', price: 128.7, cover: 'https://picsum.photos/200/200?random=5', status: '显示', time: '11/06 17:23' },
  { id: 36222, category: 'Default-2', name: 'Auto Parts OEM 33030-0K350 for Hilux Manual Transmission Gearbox Assembly', price: 936, cover: 'https://picsum.photos/200/200?random=6', status: '显示', time: '11/06 17:23' }
])

// 分类列表 - 从 localStorage 读取
const categoryList = ref([])

// 加载分类列表
const loadCategories = () => {
  const saved = localStorage.getItem('goodsCategories')
  if (saved) {
    categoryList.value = JSON.parse(saved)
  } else {
    // 默认分类
    categoryList.value = [
      { id: 1, name: '电子产品' },
      { id: 2, name: '服装配饰' },
      { id: 3, name: '家居用品' }
    ]
  }
}

// 监听分类更新事件
const handleCategoriesUpdate = (event) => {
  if (event.detail) {
    categoryList.value = event.detail
  }
}

onMounted(() => {
  loadCategories()
  window.addEventListener('categoriesUpdate', handleCategoriesUpdate)
})

onUnmounted(() => {
  window.removeEventListener('categoriesUpdate', handleCategoriesUpdate)
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 6
})

// 搜索抽屉
const searchDrawerVisible = ref(false)
const searchForm = reactive({
  category: undefined,
  status: undefined,
  minPrice: '',
  maxPrice: '',
  keyword: '',
  startTime: null,
  endTime: null,
  sortField: 'time',
  sortType: 'desc'
})

// 编辑页面
const editPageVisible = ref(false)
const isEdit = ref(false)
const currentLangIndex = ref(0)
const editForm = reactive({
  id: null,
  category: '',
  statusEnabled: true,
  price: '',
  cover: '',
  titles: [
    { lang: 'en-us', content: '' }
  ]
})

// 语言相关
const addLangModalVisible = ref(false)
const selectedLang = ref(undefined)
const availableLangs = ref([
  { code: 'zh-cn', name: '简体中文' },
  { code: 'zh-tw', name: '繁体中文' },
  { code: 'en-us', name: '英语(美国)' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'es', name: '西班牙语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'ru', name: '俄语' }
])

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 刷新
const handleRefresh = () => {
  loadData()
  message.success('刷新完成')
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

// 重置搜索
const handleResetSearch = () => {
  searchForm.category = undefined
  searchForm.status = undefined
  searchForm.minPrice = ''
  searchForm.maxPrice = ''
  searchForm.keyword = ''
  searchForm.startTime = null
  searchForm.endTime = null
  searchForm.sortField = 'time'
  searchForm.sortType = 'desc'
}

// 提交搜索
const handleSubmitSearch = () => {
  searchDrawerVisible.value = false
  loadData()
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  resetEditForm()
  editPageVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  editForm.id = record.id
  editForm.category = record.category
  editForm.statusEnabled = record.status === '显示'
  editForm.price = String(record.price)
  editForm.cover = record.cover
  editForm.titles = [
    { lang: 'en-us', content: record.name }
  ]
  currentLangIndex.value = 0
  editPageVisible.value = true
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除商品 ID:${record.id} 吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      message.success('删除成功')
    }
  })
}

// 重置编辑表单
const resetEditForm = () => {
  editForm.id = null
  editForm.category = ''
  editForm.statusEnabled = true
  editForm.price = ''
  editForm.cover = ''
  editForm.titles = [{ lang: 'en-us', content: '' }]
  currentLangIndex.value = 0
}

// 编辑页面关闭
const handleEditClose = () => {
  editPageVisible.value = false
  resetEditForm()
}

// 编辑提交
const handleEditSubmit = () => {
  if (!editForm.category) {
    message.warning('请选择分类')
    return
  }
  if (!editForm.price) {
    message.warning('请输入价格')
    return
  }
  message.success(isEdit.value ? '编辑成功' : '添加成功')
  editPageVisible.value = false
}

// 封面上传
const handleCoverChange = (info) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.cover = e.target.result
  }
  reader.readAsDataURL(file)
}

// 添加语言
const handleAddLang = () => {
  selectedLang.value = undefined
  addLangModalVisible.value = true
}

// 确认添加语言
const handleConfirmAddLang = () => {
  if (!selectedLang.value) {
    message.warning('请选择语言')
    return
  }
  const exists = editForm.titles.find(t => t.lang === selectedLang.value)
  if (exists) {
    message.warning('该语言已存在')
    return
  }
  editForm.titles.push({ lang: selectedLang.value, content: '' })
  currentLangIndex.value = editForm.titles.length - 1
  addLangModalVisible.value = false
}

// 删除语言
const handleDeleteLang = (index) => {
  if (editForm.titles.length <= 1) {
    message.warning('至少保留一种语言')
    return
  }
  editForm.titles.splice(index, 1)
  if (currentLangIndex.value >= editForm.titles.length) {
    currentLangIndex.value = editForm.titles.length - 1
  }
}

// ==================== 采集商品功能 ====================
const collectDrawerVisible = ref(false)
const collectLoading = ref(false)
const collectStep = ref(1) // 1: 搜索配置, 2: 结果预览

// 采集配置
const collectConfig = reactive({
  platform: 'amazon',
  keyword: '',
  minPrice: null,
  maxPrice: null,
  category: '',
  sortBy: 'random',
  pageSize: 20
})

// 采集结果
const collectResults = ref([])
const selectedCollectItems = ref([])

// 平台选项
const platformOptions = [
  { value: 'amazon', label: '亚马逊 (Amazon)' },
  { value: '1688', label: '1688' },
  { value: 'taobao', label: '淘宝' },
  { value: 'aliexpress', label: '速卖通 (AliExpress)' }
]

// 排序选项
const sortOptions = [
  { value: 'random', label: '随机排序' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'sales', label: '销量优先' },
  { value: 'rating', label: '评分优先' }
]

// 商品图片库（使用 fakestoreapi 真实电商图片）
const productImages = [
  'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
  'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
  'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
  'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
  'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
  'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg',
  'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
  'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
  'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
  'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
  'https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg',
  'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
  'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg',
  'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg',
  'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg',
  'https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg',
  'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg',
  'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg',
  'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg'
]

// 商品名称库（用于随机生成）
const productNames = [
  'Wireless Bluetooth Earbuds TWS Headphones',
  'Smart Watch Fitness Tracker Heart Rate Monitor',
  'Portable Power Bank 20000mAh Fast Charging',
  'LED Desk Lamp Touch Control Dimmable',
  'Mechanical Gaming Keyboard RGB Backlit',
  'Wireless Mouse Ergonomic Design Silent Click',
  'USB-C Hub Multiport Adapter 7 in 1',
  'Noise Cancelling Headphones Over Ear',
  'Mini Projector HD 1080P Home Theater',
  'Electric Toothbrush Sonic Rechargeable',
  'Air Purifier HEPA Filter Home Office',
  'Robot Vacuum Cleaner Smart Navigation',
  'Portable Blender USB Rechargeable',
  'Ring Light LED Selfie Photography',
  'Wireless Charger Pad Fast Charging',
  'Action Camera 4K Waterproof',
  'Bluetooth Speaker Portable Outdoor',
  'Digital Kitchen Scale Food Weight',
  'Electric Kettle Temperature Control',
  'Massage Gun Deep Tissue Muscle',
  'Security Camera WiFi Indoor Outdoor',
  'Tablet Stand Holder Adjustable',
  'Car Phone Mount Magnetic Dashboard',
  'USB Flash Drive 128GB Metal',
  'Gaming Headset Surround Sound',
  'Webcam HD 1080P Microphone',
  'External SSD 1TB Portable',
  'Smart Plug WiFi Remote Control',
  'LED Strip Lights RGB Color Changing',
  'Wireless Doorbell Camera Video'
]

// 打开采集抽屉
const openCollectDrawer = () => {
  collectStep.value = 1
  collectResults.value = []
  selectedCollectItems.value = []
  collectConfig.keyword = ''
  collectConfig.minPrice = null
  collectConfig.maxPrice = null
  collectConfig.category = ''
  collectConfig.sortBy = 'random'
  collectConfig.pageSize = 20
  collectDrawerVisible.value = true
}

// 执行采集搜索
const handleCollectSearch = () => {
  // 验证价格区间
  if (collectConfig.minPrice !== null && collectConfig.maxPrice !== null) {
    if (collectConfig.minPrice > collectConfig.maxPrice) {
      message.warning('最低价格不能大于最高价格')
      return
    }
  }

  // 验证采集数量
  if (!collectConfig.pageSize || collectConfig.pageSize < 1) {
    message.warning('请输入有效的采集数量')
    return
  }

  collectLoading.value = true

  // 模拟采集数据
  setTimeout(() => {
    const mockResults = []
    const basePrice = collectConfig.minPrice !== null ? collectConfig.minPrice : 10
    const maxPrice = collectConfig.maxPrice !== null ? collectConfig.maxPrice : 500
    const count = Math.min(collectConfig.pageSize, 100) // 最多100条

    for (let i = 1; i <= count; i++) {
      const price = (Math.random() * (maxPrice - basePrice) + basePrice).toFixed(2)
      // 随机选择商品名称
      const baseName = productNames[Math.floor(Math.random() * productNames.length)]
      // 如果有关键词，添加到名称中
      const name = collectConfig.keyword
        ? `${collectConfig.keyword} ${baseName}`
        : baseName

      mockResults.push({
        id: `collect-${Date.now()}-${i}`,
        name: name,
        price: parseFloat(price),
        originalPrice: (parseFloat(price) * (1.2 + Math.random() * 0.3)).toFixed(2),
        // 从图片库中随机选择
        image: productImages[Math.floor(Math.random() * productImages.length)],
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviews: Math.floor(Math.random() * 5000) + 100,
        sales: Math.floor(Math.random() * 10000) + 50,
        platform: collectConfig.platform,
        sourceUrl: `https://www.amazon.com/dp/B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        selected: false
      })
    }

    // 排序
    let sorted = [...mockResults]
    if (collectConfig.sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (collectConfig.sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (collectConfig.sortBy === 'sales') {
      sorted.sort((a, b) => b.sales - a.sales)
    } else if (collectConfig.sortBy === 'rating') {
      sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    }
    // random 不需要排序

    collectResults.value = sorted
    collectStep.value = 2
    collectLoading.value = false
    message.success(`成功采集 ${sorted.length} 个商品`)
  }, 1500)
}

// 返回搜索配置
const backToSearch = () => {
  collectStep.value = 1
}

// 全选/取消全选
const collectSelectAll = ref(false)
const handleCollectSelectAll = (e) => {
  const checked = e.target.checked
  collectResults.value.forEach(item => {
    item.selected = checked
  })
  updateSelectedItems()
}

// 单个选择
const handleCollectItemSelect = (item) => {
  item.selected = !item.selected
  updateSelectedItems()
}

// 更新已选列表
const updateSelectedItems = () => {
  selectedCollectItems.value = collectResults.value.filter(item => item.selected)
  collectSelectAll.value = collectResults.value.length > 0 &&
    collectResults.value.every(item => item.selected)
}

// 导入选中商品
const handleImportSelected = () => {
  if (selectedCollectItems.value.length === 0) {
    message.warning('请先选择要导入的商品')
    return
  }

  Modal.confirm({
    title: '确认导入',
    content: `确定要导入 ${selectedCollectItems.value.length} 个商品吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 模拟导入
      const newGoods = selectedCollectItems.value.map((item, index) => ({
        id: tableData.value.length + index + 1,
        category: collectConfig.category || 'Default-2',
        name: item.name,
        price: item.price,
        cover: item.image,
        status: '显示',
        time: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
              new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }))

      tableData.value = [...newGoods, ...tableData.value]
      pagination.total += newGoods.length

      message.success(`成功导入 ${selectedCollectItems.value.length} 个商品`)
      collectDrawerVisible.value = false
    }
  })
}

// 图片加载错误处理
const handleImageError = (e) => {
  // 使用备用图片
  e.target.src = 'https://via.placeholder.com/200x200/f5f5f5/999999?text=No+Image'
}

// 采集结果表格列
const collectColumns = [
  { title: '商品图片', dataIndex: 'image', key: 'image', width: 100, align: 'center' },
  { title: '商品名称', dataIndex: 'name', key: 'name', width: 300 },
  { title: '价格', dataIndex: 'price', key: 'price', width: 100, align: 'center' },
  { title: '评分', dataIndex: 'rating', key: 'rating', width: 80, align: 'center' },
  { title: '销量', dataIndex: 'sales', key: 'sales', width: 100, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' }
]
</script>

<style scoped lang="less">
.page-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px 0;
  padding-bottom: 0;
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
    padding: 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        margin: 0;
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

    .page-footer {
      position: sticky;
      bottom: 0;
      display: flex;
      align-items: center;
      padding: 12px 0;
      height: 48px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
      flex-shrink: 0;

      .total-text {
        margin-right: 16px;
        color: #666;
        font-size: 14px;
      }
    }
  }

  .price-text {
    color: #1890ff;
  }

  .no-image {
    color: #999;
  }

  .action-link {
    cursor: pointer;
    font-size: 13px;

    &.edit {
      color: #1890ff;
    }

    &.delete {
      color: #ff4d4f;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  // 密度样式
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

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 500;
    color: #333;
    font-size: 14px;
    text-align: center;
  }

  .ant-table-tbody > tr > td {
    font-size: 14px;
    color: #333;
    text-align: center;
  }
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

// 编辑全屏页面
.edit-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .edit-page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        margin: 0;
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

  .edit-page-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;

    .form-section {
      margin-bottom: 24px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;

      .section-title {
        padding: 12px 16px;
        background: #fafafa;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        border-bottom: 1px solid #f0f0f0;
      }

      .section-content {
        padding: 16px;
      }
    }

    // 标题区域 - 占满剩余空间
    .title-form-section {
      flex: 1;
      margin-bottom: 0;
      display: flex;
      flex-direction: column;
      min-height: 400px;

      .section-content.title-section {
        flex: 1;
        display: flex;
        flex-direction: row;
        padding: 16px;
      }
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .form-col {
        flex: 1;

        .form-label {
          font-size: 14px;
          color: #333;
          margin-bottom: 8px;
        }

        :deep(.ant-input),
        :deep(.ant-select) {
          height: 40px;
        }

        :deep(.ant-select-selector) {
          height: 40px !important;

          .ant-select-selection-item,
          .ant-select-selection-placeholder {
            line-height: 38px !important;
          }
        }

        .status-switch {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 11px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          background: #fff;

          span {
            color: #333;
            font-size: 14px;
          }
        }
      }
    }

    .cover-upload {
      .upload-preview-with-actions {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        border: 1px solid #e8e8e8;

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
        }

        &:hover .preview-overlay {
          opacity: 1;
        }
      }

      .upload-box {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.3s;

        &:hover {
          border-color: #1890ff;
        }

        .upload-icon {
          font-size: 24px;
          color: #999;
        }

        .upload-text {
          margin-top: 8px;
          font-size: 12px;
          color: #999;
        }
      }
    }

    .title-section {
      display: flex;
      gap: 16px;
      flex: 1;
      min-height: 0;

      .title-left {
        width: 140px;
        flex-shrink: 0;

        .lang-list {
          margin-top: 12px;

          .lang-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            margin-bottom: 8px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #1890ff;
            }

            &.active {
              background: #1890ff;
              border-color: #1890ff;

              .lang-name {
                color: #fff;
              }

              .delete-icon {
                color: #fff;
              }
            }

            .lang-name {
              font-size: 14px;
              color: #333;
            }

            .delete-icon {
              color: #ff4d4f;
              font-size: 14px;

              &:hover {
                opacity: 0.8;
              }
            }
          }
        }
      }

      .title-right {
        flex: 1;
        min-width: 0;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        :deep(.rich-text-editor) {
          flex: 1;
          height: 100% !important;
          min-height: 300px;
        }

        :deep(.tox-tinymce) {
          height: 100% !important;
        }

        .no-lang-tip {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          min-height: 300px;
        }
      }
    }
  }
}

// 添加语言弹窗
.add-lang-content {
  padding: 16px 0;
}

// 采集商品功能样式
.collect-content {
  .collect-search-form {
    :deep(.ant-form-item-label > label) {
      font-weight: 500;
      color: #333;
    }

    :deep(.ant-select-selector) {
      height: 44px !important;

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 42px !important;
      }
    }

    :deep(.ant-input-lg) {
      height: 44px;
    }

    :deep(.ant-input-number-lg) {
      height: 44px;

      .ant-input-number-input {
        height: 42px;
      }
    }

    :deep(.ant-form-item) {
      margin-bottom: 20px;
    }
  }

  .collect-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;

      .results-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .results-count {
          font-size: 14px;
          color: #666;

          b {
            color: #1890ff;
          }
        }

        .selected-count {
          font-size: 14px;
          color: #52c41a;

          b {
            font-weight: 600;
          }
        }
      }

      .results-filter {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #666;
      }
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-height: calc(100vh - 240px);
      overflow-y: auto;
      padding: 4px;

      .result-card {
        position: relative;
        border: 2px solid #f0f0f0;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        background: #fff;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }

        &.selected {
          border-color: #1890ff;
          background: #e6f7ff;

          .card-checkbox {
            :deep(.ant-checkbox-inner) {
              background-color: #1890ff;
              border-color: #1890ff;
            }
          }
        }

        .card-checkbox {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 2;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px;
        }

        .card-image {
          width: 100%;
          height: 140px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .card-info {
          padding: 10px;

          .card-name {
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            height: 34px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 6px;
          }

          .card-meta {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 4px;

            .card-price {
              font-size: 15px;
              font-weight: 600;
              color: #ff4d4f;
            }

            .card-original-price {
              font-size: 11px;
              color: #999;
              text-decoration: line-through;
            }
          }

          .card-stats {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #999;

            span {
              display: flex;
              align-items: center;
              gap: 3px;
            }
          }
        }
      }
    }

    .empty-results {
      padding: 60px 0;
      text-align: center;
    }
  }
}

// 页面过渡动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
