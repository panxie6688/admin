<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">公告</span>
        <a-button type="primary" @click="openAddPage">
          <plus-outlined /> 添加数据
        </a-button>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="moreSearchVisible = true">更多搜索</a-button>
        <a-tooltip v-if="!topMenuMode" title="全屏">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <fullscreen-outlined v-if="!contentFullscreen" />
            <fullscreen-exit-outlined v-else />
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="handleRefresh">
            <reload-outlined />
          </a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <column-height-outlined />
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleSizeChange">
              <a-menu-item key="default" :class="{ 'active-density': tableSize === 'default' }">宽松</a-menu-item>
              <a-menu-item key="middle" :class="{ 'active-density': tableSize === 'middle' }">中等</a-menu-item>
              <a-menu-item key="small" :class="{ 'active-density': tableSize === 'small' }">紧凑</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :size="tableSize"
        bordered
        :scroll="{ x: 900, y: 'calc(100vh - 280px)' }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- 图片列 -->
          <template v-if="column.key === 'image'">
            <a-image
              v-if="record.image"
              :src="record.image"
              :width="140"
              :height="70"
              style="object-fit: contain; border-radius: 4px;"
            />
            <span v-else>-</span>
          </template>

          <!-- 排序列 -->
          <template v-else-if="column.key === 'sort'">
            <div class="sort-cell" @click="openSortModal(record)">
              <span class="sort-value">{{ record.sort }}</span>
              <right-outlined class="arrow-icon" />
            </div>
          </template>

          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-switch
              v-model:checked="record.statusChecked"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <div class="action-links">
              <a class="link-text" @click="openContentPreview(record)">文本</a>
              <a class="link-edit" @click="openEditPage(record)">编辑</a>
              <a-popconfirm
                title="确定删除该公告吗？"
                placement="top"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a class="link-delete">删除</a>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="page-footer">
        <div class="footer-left">
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
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="moreSearchVisible"
      title="筛选"
      placement="right"
      :width="380"
      :closable="true"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a style="color: #ff4d4f; cursor: pointer;" @click="resetFilter">重置</a>
          <a-button type="primary" @click="applyFilter">提交</a-button>
        </a-space>
      </template>
      <div class="filter-form">
        <a-form layout="vertical">
          <a-form-item label="状态">
            <a-select v-model:value="filterForm.status" placeholder="全部" allowClear size="large">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">显示</a-select-option>
              <a-select-option value="0">隐藏</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="创建时间">
            <a-range-picker
              v-model:value="filterForm.dateRange"
              style="width: 100%"
              size="large"
              :presets="dateRangePresets"
              format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item label="更新时间">
            <a-range-picker
              v-model:value="filterForm.updateDateRange"
              style="width: 100%"
              size="large"
              :presets="dateRangePresets"
              format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item label="排序方式">
            <a-select v-model:value="filterForm.sortField" size="large">
              <a-select-option value="createTime">按创建时间</a-select-option>
              <a-select-option value="updateTime">按更新时间</a-select-option>
              <a-select-option value="sort">按排序值</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="排序顺序">
            <a-select v-model:value="filterForm.sortOrder" size="large">
              <a-select-option value="desc">降序（从大到小）</a-select-option>
              <a-select-option value="asc">升序（从小到大）</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="关键词">
            <a-input v-model:value="filterForm.keyword" placeholder="请输入关键词" size="large" allowClear />
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>

    <!-- 编辑页面（全屏覆盖） -->
    <transition name="slide-right">
      <div v-if="editPageVisible" class="edit-page">
        <div class="edit-page-content">
          <!-- 顶部标题栏 -->
          <div class="edit-header">
            <span class="edit-title">{{ editForm.id ? '编辑公告' : '创建公告' }}</span>
            <div class="header-right">
              <a-button type="primary" @click="handleSaveEdit">保存&发布</a-button>
              <close-outlined class="close-icon" @click="closeEditPage" />
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="form-section">
            <div class="section-title">表单</div>
            <div class="form-row">
              <div class="form-item">
                <label>显示</label>
                <div class="form-control">
                  <span class="control-label">开关</span>
                  <a-switch v-model:checked="editForm.status" />
                </div>
              </div>
              <div class="form-item">
                <label>排序(选填)</label>
                <a-input v-model:value="editForm.sort" placeholder="5" />
              </div>
              <div class="form-item">
                <label>打开第三方URL(选填)</label>
                <a-input v-model:value="editForm.url" placeholder="输入" />
              </div>
            </div>

            <!-- 公告封面上传 -->
            <div class="cover-upload-area">
              <div class="upload-container">
                <div v-if="editForm.image" class="cover-preview">
                  <img :src="editForm.image" alt="封面预览" />
                  <div class="preview-overlay">
                    <a-upload
                      :show-upload-list="false"
                      :before-upload="() => false"
                      accept="image/*"
                      @change="handleImageUpload"
                    >
                      <a-button type="primary" size="small">重新上传</a-button>
                    </a-upload>
                    <a-button type="primary" danger size="small" @click="editForm.image = ''">重 置</a-button>
                  </div>
                </div>
                <a-upload
                  v-else
                  :show-upload-list="false"
                  :before-upload="() => false"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="cover-uploader"
                >
                  <div class="upload-box">
                    <plus-outlined class="upload-icon" />
                    <span class="upload-text">公告封面(选填)</span>
                  </div>
                </a-upload>
              </div>
            </div>
          </div>

          <!-- 公告内容区域 -->
          <div class="content-section">
            <div class="section-title">公告内容</div>

            <div class="content-layout">
              <!-- 左侧语言列表 -->
              <div class="lang-panel">
                <a-button type="primary" block @click="addLangModalVisible = true">添加语言</a-button>
                <div class="lang-list">
                  <div
                    v-for="(item, index) in editForm.languages"
                    :key="item.lang"
                    class="lang-item"
                    :class="{ active: currentLangIndex === index }"
                  >
                    <span class="lang-name" @click="currentLangIndex = index">{{ item.langName || item.lang }}</span>
                    <a-popconfirm
                      title="确定删除该语言吗？"
                      placement="top"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="removeLang(index)"
                    >
                      <delete-outlined class="delete-icon" @click.stop />
                    </a-popconfirm>
                  </div>
                  <div v-if="editForm.languages.length === 0" class="lang-empty">
                    暂无语言
                  </div>
                </div>
              </div>

              <!-- 右侧编辑区 -->
              <div class="editor-panel">
                <template v-if="currentLang">
                  <div class="field-row">
                    <label>标题</label>
                    <a-textarea
                      v-model:value="currentLang.title"
                      :placeholder="`请输入标题（${currentLang.langName || currentLang.lang || ''}）`"
                      :rows="3"
                    />
                  </div>
                  <div class="field-row editor-row">
                    <label>内容</label>
                    <div class="editor-wrapper">
                      <RichTextEditor
                        :key="currentLangIndex"
                        v-model="currentLang.content"
                        :placeholder="`请输入内容（${currentLang.langName || currentLang.lang || ''}）`"
                        height="100%"
                      />
                    </div>
                  </div>
                </template>
                <div v-else class="editor-empty">
                  <span>请添加或选择语言</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 添加语言弹窗 -->
    <a-modal
      v-model:open="addLangModalVisible"
      :width="480"
      @ok="handleAddLang"
      @cancel="addLangModalVisible = false"
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
        <a-alert type="warning" :show-icon="false" class="warning-tip-box">
          <template #message>
            <div class="tip-text">一般标识用带有-的。比如：zh-cn</div>
            <div class="tip-text">如果忘记标识可以参考：<a class="link" @click="langRefModalVisible = true">国际语言标识表</a></div>
          </template>
        </a-alert>

        <a-select
          v-model:value="newLangCode"
          style="width: 100%; margin-bottom: 12px;"
          placeholder="选择语言"
          show-search
          allow-clear
          size="large"
          :filter-option="filterLangOption"
          :getPopupContainer="(triggerNode) => triggerNode.parentNode"
        >
          <a-select-option v-for="lang in availableLangs" :key="lang.code" :value="lang.code" :name="lang.name">
            {{ lang.name }} ({{ lang.code }})
          </a-select-option>
        </a-select>

        <a-input
          v-model:value="newLangText"
          placeholder="请输入"
          size="large"
        />
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

    <!-- 修改排序弹窗 -->
    <a-modal
      v-model:open="sortModalVisible"
      :width="400"
      @ok="handleSortConfirm"
      @cancel="sortModalVisible = false"
      okText="确 定"
      cancelText="取 消"
      :rootClassName="'warning-modal'"
    >
      <template #title>
        <div class="modal-title-with-icon">
          <span class="warning-icon">!</span>
          <span>修改排序</span>
        </div>
      </template>
      <div class="sort-modal-content">
        <div class="current-sort">当前排序: {{ sortForm.currentSort }}</div>
        <div class="sort-type-row">排序按：从大到小</div>
        <a-input
          v-model:value="sortForm.newSort"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 查看公告内容弹窗 -->
    <a-modal
      v-model:open="contentPreviewVisible"
      :width="500"
      :footer="null"
      :closable="true"
      centered
    >
      <template #title>
        <div style="font-size: 14px; color: #999;">查看公告内容</div>
        <div style="font-size: 16px; font-weight: 600; color: #333; margin-top: 4px;">{{ contentPreviewData.title }}</div>
      </template>
      <div class="content-preview-body">
        <div v-if="contentPreviewData.content" class="preview-content" v-html="contentPreviewData.content"></div>
        <div v-else class="preview-empty">暂无内容</div>
      </div>
      <div class="content-preview-footer">
        <a-button type="primary" @click="contentPreviewVisible = false">知道了</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  RightOutlined,
  CloseOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 注入顶部菜单模式状态和内容全屏
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 表格密度
const tableSize = ref('default')
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 搜索
const searchText = ref('')
const handleSearch = (value) => {
  console.log('搜索:', value)
}

// 刷新
const handleRefresh = () => {
  message.success('刷新成功')
}

// 更多搜索
const moreSearchVisible = ref(false)
const filterForm = reactive({
  status: '',
  dateRange: null,
  updateDateRange: null,
  keyword: '',
  sortField: 'createTime',
  sortOrder: 'desc'
})
const resetFilter = () => {
  filterForm.status = ''
  filterForm.dateRange = null
  filterForm.updateDateRange = null
  filterForm.keyword = ''
  filterForm.sortField = 'createTime'
  filterForm.sortOrder = 'desc'
}
const applyFilter = () => {
  moreSearchVisible.value = false
  message.success('筛选已应用')
}

// 日期快捷选项
const dateRangePresets = ref([
  { label: '今天', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: '近7天', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: '近30天', value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] }
])

// 表格列
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    align: 'center',
    width: 120
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
    align: 'center',
    width: 160
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    align: 'center',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
    width: 120
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    align: 'center',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 140,
    fixed: 'right'
  }
]

// 模拟数据
const tableData = ref([
  {
    id: 1,
    title: 'First Set Deposit',
    image: '/images/notice-cover.webp',
    sort: 5,
    statusChecked: true,
    createTime: '2024/05/10',
    updateTime: '03/26 17:15',
    languages: [{
      lang: 'en-us',
      langName: '英语(美国)',
      title: 'First Set Deposit',
      content: '<p><img src="/images/notice-content-1.webp" alt="公告图片" style="max-width: 100%;"/></p>'
    }]
  },
  {
    id: 2,
    title: 'Membership level',
    image: '/images/notice-cover.webp',
    sort: 10,
    statusChecked: true,
    createTime: '2024/05/08',
    updateTime: '03/26 17:16',
    languages: [{
      lang: 'en-us',
      langName: '英语(美国)',
      title: 'Membership level',
      content: '<p><img src="/images/notice-content-1.webp" alt="公告图片" style="max-width: 100%;"/></p>'
    }]
  },
  {
    id: 3,
    title: 'Salary Structure',
    image: '/images/notice-cover.webp',
    sort: 20,
    statusChecked: true,
    createTime: '2024/05/05',
    updateTime: '03/26 17:16',
    languages: [{
      lang: 'en-us',
      langName: '英语(美国)',
      title: 'Salary Structure',
      content: '<p><img src="/images/notice-content-1.webp" alt="公告图片" style="max-width: 100%;"/></p>'
    }]
  },
  {
    id: 4,
    title: 'Bouns For Registration',
    image: '/images/notice-cover.webp',
    sort: 30,
    statusChecked: true,
    createTime: '2024/04/20',
    updateTime: '03/26 17:16',
    languages: [{
      lang: 'en-us',
      langName: '英语(美国)',
      title: 'Bouns For Registration',
      content: '<p><img src="/images/notice-content-1.webp" alt="公告图片" style="max-width: 100%;"/></p>'
    }]
  }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4
})
const handlePageChange = (page) => {
  pagination.current = page
}

// 状态切换
const handleStatusChange = (record, checked) => {
  message.success(`${record.title} 状态已${checked ? '启用' : '禁用'}`)
}

// 删除
const handleDelete = (record) => {
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    pagination.total = tableData.value.length
    message.success('删除成功')
  }
}

// 修改排序弹窗
const sortModalVisible = ref(false)
const sortForm = reactive({
  recordId: null,
  currentSort: 0,
  newSort: ''
})

const openSortModal = (record) => {
  sortForm.recordId = record.id
  sortForm.currentSort = record.sort
  sortForm.newSort = String(record.sort)
  sortModalVisible.value = true
}

const handleSortConfirm = () => {
  const newSortValue = parseInt(sortForm.newSort) || 0
  const index = tableData.value.findIndex(item => item.id === sortForm.recordId)
  if (index > -1) {
    tableData.value[index].sort = newSortValue
    message.success('排序已更新')
  }
  sortModalVisible.value = false
}

// 查看公告内容弹窗
const contentPreviewVisible = ref(false)
const contentPreviewData = reactive({
  title: '',
  content: '',
  date: ''
})

const openContentPreview = (record) => {
  // 从 languages 中获取第一个语言的标题和内容
  const langData = record.languages?.[0] || {}
  contentPreviewData.title = langData.title || record.title
  contentPreviewData.content = langData.content || ''
  contentPreviewData.date = record.createTime
  contentPreviewVisible.value = true
}

// 编辑页面
const editPageVisible = ref(false)
const currentLangIndex = ref(0)
const editForm = reactive({
  id: null,
  title: '',
  image: '',
  sort: '',
  status: true,
  url: '',
  languages: []
})

// 当前选中的语言数据
const currentLang = computed(() => {
  if (editForm.languages.length > 0 && currentLangIndex.value < editForm.languages.length) {
    return editForm.languages[currentLangIndex.value]
  }
  return null
})

const openAddPage = () => {
  editForm.id = null
  editForm.title = ''
  editForm.image = ''
  editForm.sort = ''
  editForm.status = true
  editForm.url = ''
  editForm.languages = []
  currentLangIndex.value = 0
  editPageVisible.value = true
}

const openEditPage = (record) => {
  editForm.id = record.id
  editForm.title = record.title
  editForm.image = record.image
  editForm.sort = String(record.sort)
  editForm.status = record.statusChecked
  editForm.url = record.url || ''
  // 处理语言数据，确保有 langName
  if (record.languages?.length > 0) {
    editForm.languages = record.languages.map(item => {
      const langInfo = langRefData.find(l => l.code === item.lang)
      return {
        ...item,
        langName: item.langName || (langInfo ? langInfo.name : item.lang)
      }
    })
  } else {
    const defaultLangInfo = langRefData.find(l => l.code === 'en-us')
    editForm.languages = [{
      lang: 'en-us',
      langName: defaultLangInfo ? defaultLangInfo.name : 'en-us',
      title: record.title,
      content: ''
    }]
  }
  currentLangIndex.value = 0
  editPageVisible.value = true
}

const closeEditPage = () => {
  editPageVisible.value = false
}

const handleImageUpload = (info) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.image = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleSaveEdit = () => {
  if (!editForm.languages[0]?.title) {
    message.error('请输入标题')
    return
  }

  const title = editForm.languages[0]?.title || editForm.title

  if (editForm.id) {
    const index = tableData.value.findIndex(item => item.id === editForm.id)
    if (index > -1) {
      tableData.value[index].title = title
      tableData.value[index].image = editForm.image || tableData.value[index].image
      tableData.value[index].sort = parseInt(editForm.sort) || 0
      tableData.value[index].statusChecked = editForm.status
      tableData.value[index].url = editForm.url
      tableData.value[index].languages = JSON.parse(JSON.stringify(editForm.languages))
      tableData.value[index].updateTime = new Date().toLocaleString()
    }
    message.success('保存成功')
  } else {
    const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
    tableData.value.unshift({
      id: newId,
      title: title,
      image: editForm.image || 'https://via.placeholder.com/60x40/1a237e/ffffff?text=KINEX',
      sort: parseInt(editForm.sort) || 0,
      statusChecked: editForm.status,
      url: editForm.url,
      languages: JSON.parse(JSON.stringify(editForm.languages)),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    })
    pagination.total = tableData.value.length
    message.success('添加成功')
  }
  editPageVisible.value = false
}

// 语言管理
const addLangModalVisible = ref(false)
const newLangCode = ref('')
const newLangText = ref('')
const langRefModalVisible = ref(false)
const langSearchText = ref('')

// 语言参考表列
const langRefColumns = [
  { title: '语言代码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '语言名称', dataIndex: 'name', key: 'name' }
]

// 语言数据
const langRefData = [
  { code: 'af', name: '南非语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'bg', name: '保加利亚语' },
  { code: 'cs', name: '捷克语' },
  { code: 'da', name: '丹麦语' },
  { code: 'de', name: '德语' },
  { code: 'el', name: '希腊语' },
  { code: 'en', name: '英语' },
  { code: 'en-us', name: '英语(美国)' },
  { code: 'en-gb', name: '英语(英国)' },
  { code: 'es', name: '西班牙语' },
  { code: 'es-es', name: '西班牙语(西班牙)' },
  { code: 'et', name: '爱沙尼亚语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'fr', name: '法语' },
  { code: 'he', name: '希伯来语' },
  { code: 'hi', name: '印地语' },
  { code: 'hr', name: '克罗地亚语' },
  { code: 'hu', name: '匈牙利语' },
  { code: 'id', name: '印度尼西亚语' },
  { code: 'it', name: '意大利语' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '朝鲜语' },
  { code: 'lt', name: '立陶宛语' },
  { code: 'lv', name: '拉脱维亚语' },
  { code: 'ms', name: '马来语' },
  { code: 'nl', name: '荷兰语' },
  { code: 'no', name: '挪威语' },
  { code: 'pl', name: '波兰语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'pt-br', name: '葡萄牙语(巴西)' },
  { code: 'ro', name: '罗马尼亚语' },
  { code: 'ru', name: '俄语' },
  { code: 'sk', name: '斯洛伐克语' },
  { code: 'sl', name: '斯洛文尼亚语' },
  { code: 'sr', name: '塞尔维亚语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'th', name: '泰语' },
  { code: 'tr', name: '土耳其语' },
  { code: 'uk', name: '乌克兰语' },
  { code: 'vi', name: '越南语' },
  { code: 'zh-cn', name: '中文(简体)' },
  { code: 'zh-tw', name: '中文(繁体)' }
]

// 可用语言列表（过滤已添加的）
const availableLangs = computed(() => {
  const addedCodes = editForm.languages.map(l => l.lang)
  return langRefData.filter(lang => !addedCodes.includes(lang.code))
})

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

// 语言搜索过滤（支持按名称和代码搜索）
const filterLangOption = (input, option) => {
  const searchText = input.toLowerCase()
  const value = (option.value || '').toLowerCase()
  const name = (option.name || '').toLowerCase()
  return value.includes(searchText) || name.includes(searchText)
}

// 从参考表选择语言
const handleSelectLangFromRef = (record) => {
  newLangCode.value = record.code
  langRefModalVisible.value = false
  message.success(`已选择语言: ${record.name} (${record.code})`)
}

const handleAddLang = () => {
  const langCode = newLangCode.value || newLangText.value
  if (!langCode) {
    message.error('请选择或输入语言代码')
    return
  }
  if (editForm.languages.some(item => item.lang === langCode)) {
    message.error('该语言已存在')
    return
  }
  // 查找语言名称
  const langInfo = langRefData.find(item => item.code === langCode)
  const langName = langInfo ? langInfo.name : langCode
  editForm.languages.push({
    lang: langCode,
    langName: langName,
    title: '',
    content: ''
  })
  currentLangIndex.value = editForm.languages.length - 1
  newLangCode.value = ''
  newLangText.value = ''
  addLangModalVisible.value = false
}

const removeLang = (index) => {
  editForm.languages.splice(index, 1)
  if (currentLangIndex.value >= editForm.languages.length) {
    currentLangIndex.value = Math.max(0, editForm.languages.length - 1)
  }
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
  position: relative;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
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
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;

      .ant-table {
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    }

    .page-footer {
      flex-shrink: 0;
      background: #fff;
      padding: 12px 0;
      border-top: 1px solid #f0f0f0;

      .footer-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .total-text {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }

  // 排序单元格
  .sort-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;

    .sort-value {
      color: #1890ff;
      font-size: 14px;
    }

    .arrow-icon {
      color: #1890ff;
      font-size: 12px;
    }

    &:hover {
      .sort-value {
        text-decoration: underline;
      }
    }
  }

  // 操作链接
  .action-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    a {
      cursor: pointer;

      &.link-text {
        color: #1890ff;
      }

      &.link-edit {
        color: #1890ff;
      }

      &.link-delete {
        color: #ff4d4f;
      }
    }
  }

  // 表格密度样式
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

// 过渡动画 - 从右到左滑入
.slide-right-enter-active {
  animation: slideRight 0.3s ease-out;
}

.slide-right-leave-active {
  animation: slideRight 0.2s ease-in reverse;
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 编辑页面（全屏覆盖）
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
  overflow-y: auto;

  .edit-page-content {
    flex: 1;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    min-height: min-content;

    // 顶部标题栏
    .edit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
      flex-shrink: 0;

      .edit-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .close-icon {
          font-size: 18px;
          cursor: pointer;
          color: #666;

          &:hover {
            color: #333;
          }
        }
      }
    }

    // 表单区域
    .form-section {
      flex-shrink: 0;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;

      > .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 24px;
        margin-bottom: 16px;

        .form-item {
          flex: 1;

          label {
            display: block;
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
          }

          :deep(.ant-input) {
            height: 40px;
            border-radius: 6px;
          }

          .form-control {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            background: #fff;

            .control-label {
              color: #bfbfbf;
              font-size: 14px;
            }
          }
        }
      }

      .image-upload-area {
        .upload-preview-with-actions {
          width: 120px;
          height: 80px;
          border-radius: 6px;
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
            gap: 6px;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover .preview-overlay {
            opacity: 1;
          }
        }

        .image-uploader {
          .upload-btn {
            width: 120px;
            height: 80px;
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: border-color 0.3s;
            color: #999;

            &:hover {
              border-color: #1890ff;
              color: #1890ff;
            }

            span {
              margin-top: 4px;
              font-size: 12px;
            }
          }
        }
      }

      // 公告封面上传
      .cover-upload-area {
        .upload-container {
          .cover-preview {
            max-width: 200px;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
            border: 1px solid #e8e8e8;

            > img {
              display: block;
              max-width: 100%;
              height: auto;
              background: #fafafa;
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
              gap: 6px;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .preview-overlay {
              opacity: 1;
            }
          }

          .cover-uploader {
            .upload-box {
              width: 120px;
              height: 120px;
              border: 1px dashed #d9d9d9;
              border-radius: 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s;
              background: #fafafa;

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
              }

              .upload-text {
                font-size: 13px;
                color: #bfbfbf;
              }
            }
          }
        }
      }
    }

    // 公告内容区域
    .content-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      > .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
        flex-shrink: 0;
      }

      .content-layout {
        display: flex;
        gap: 0;
        flex: 1;
        min-height: 0;

        .lang-panel {
          width: 160px;
          flex-shrink: 0;
          padding-right: 16px;
          display: flex;
          flex-direction: column;

          :deep(.ant-btn) {
            height: 36px;
            font-size: 14px;
            border-radius: 6px;
            margin-bottom: 12px;
            flex-shrink: 0;
          }

          .lang-list {
            flex: 1;
            overflow-y: auto;

            .lang-item {
              display: flex;
              align-items: center;
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
                text-align: center;

                &:hover {
                  border-color: #40a9ff;
                }
              }

              .delete-icon {
                color: #ff4d4f;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
                padding: 4px;
                margin-left: 8px;

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

            .lang-empty {
              text-align: center;
              color: #bfbfbf;
              font-size: 14px;
              padding: 20px 0;
            }
          }
        }

        .editor-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding-left: 16px;

          .field-row {
            flex-shrink: 0;

            label {
              display: block;
              font-size: 14px;
              color: #333;
              margin-bottom: 8px;
            }

            :deep(.ant-input) {
              height: 48px;
              border-radius: 6px;
              font-size: 14px;
            }

            :deep(.ant-input-textarea) {
              .ant-input {
                height: auto;
                border-radius: 6px;
                font-size: 14px;
                resize: none;
              }
            }

            &.editor-row {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 0;
              margin-top: 16px;

              .editor-wrapper {
                flex: 1;
                min-height: 280px;
                border: 1px solid #d9d9d9;
                border-radius: 6px;
                overflow: hidden;
              }
            }
          }

          .editor-empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #bfbfbf;
            font-size: 14px;
            background: #fafafa;
            border-radius: 6px;
          }
        }
      }
    }
  }
}
</style>

<!-- 弹窗样式 - 非 scoped，因为弹窗通过 Teleport 渲染到 body -->
<style lang="less">
// 语言代码表弹窗样式
.lang-ref-content {
  .ant-table-thead > tr > th {
    font-size: 15px;
    font-weight: 600;
  }

  .lang-row-clickable {
    cursor: pointer;

    &:hover {
      background-color: #e6f7ff !important;
    }
  }
}

// 修改排序弹窗内容
.sort-modal-content {
  padding: 8px 0;

  .current-sort {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .sort-type-row {
    color: #999;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .ant-input {
    height: 44px;
    font-size: 16px;
    border-radius: 6px;
  }
}

// 查看公告内容弹窗
.content-preview-body {
  .preview-content {
    font-size: 14px;
    color: #333;
    line-height: 1.8;

    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }

  .preview-empty {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 14px;
  }
}

.content-preview-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

// 添加语言弹窗样式
.add-lang-content {
  .warning-tip-box {
    margin-bottom: 16px;
    border-radius: 6px;

    .tip-text {
      font-size: 13px;
      color: #666;
      line-height: 1.8;

      .link {
        color: #1890ff;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .ant-select-lg {
    .ant-select-selector {
      height: 44px !important;
      border-radius: 8px !important;

      .ant-select-selection-search-input {
        height: 42px !important;
      }

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        line-height: 42px !important;
        font-size: 14px !important;
      }
    }
  }

  .ant-input-lg {
    height: 44px;
    border-radius: 8px;
  }
}

// 警告弹窗样式
.warning-modal {
  .ant-modal-content {
    border-radius: 8px;
  }

  .modal-title-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;

    .warning-icon {
      width: 22px;
      height: 22px;
      background: #faad14;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }
}

// 筛选表单样式
.filter-form {
  .ant-form-item {
    margin-bottom: 20px;

    .ant-form-item-label > label {
      font-weight: 500;
      color: #333;
    }
  }

  .ant-select-lg .ant-select-selector {
    height: 44px !important;
    border-radius: 8px !important;

    .ant-select-selection-search-input {
      height: 42px !important;
    }

    .ant-select-selection-placeholder,
    .ant-select-selection-item {
      line-height: 42px !important;
    }
  }

  .ant-picker-large {
    height: 44px;
    border-radius: 8px;

    .ant-picker-input > input {
      font-size: 14px;
    }
  }

  .ant-input-lg {
    height: 44px;
    border-radius: 8px;
  }
}
</style>
