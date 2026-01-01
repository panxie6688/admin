<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">商品列表</h2>
        <a-button type="primary" class="add-btn" @click="handleAdd">
          <plus-outlined /> 添加数据
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
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CloseOutlined,
  DeleteOutlined
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

// 分类列表
const categoryList = ref([
  { id: 1, name: 'Default-2' },
  { id: 2, name: '电子产品' },
  { id: 3, name: '服装配饰' }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 4014
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
