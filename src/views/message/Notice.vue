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
        <a-tooltip title="全屏">
          <a-button class="icon-btn" @click="toggleFullscreen">
            <fullscreen-outlined v-if="!isFullscreen" />
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
            <div class="image-cell" @click="openEditPage(record)">
              <img :src="record.image" alt="公告图片" />
              <right-outlined class="arrow-icon" />
            </div>
          </template>

          <!-- 排序列 -->
          <template v-else-if="column.key === 'sort'">
            <div class="sort-cell" @click="openEditPage(record)">
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
              <a class="link-text" @click="openEditPage(record)">文本</a>
              <a class="link-edit" @click="openEditPage(record)">编辑</a>
              <a class="link-delete" @click="handleDelete(record)">删除</a>
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
      <a-form layout="vertical">
        <a-form-item label="状态">
          <a-select v-model:value="filterForm.status" placeholder="全部" allowClear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">显示</a-select-option>
            <a-select-option value="0">隐藏</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker v-model:value="filterForm.dateRange" style="width: 100%" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model:value="filterForm.keyword" placeholder="请输入关键词" />
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 编辑页面（全屏覆盖） -->
    <transition name="slide-up">
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

            <!-- 图片上传 -->
            <div class="image-upload-area">
              <div v-if="editForm.image" class="upload-preview-with-actions">
                <img :src="editForm.image" alt="预览" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    :before-upload="() => false"
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
                @change="handleImageUpload"
                class="image-uploader"
              >
                <div class="upload-btn">
                  <plus-outlined />
                  <span>上传图片</span>
                </div>
              </a-upload>
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
                    <span class="lang-name" @click="currentLangIndex = index">{{ item.lang }}</span>
                    <delete-outlined
                      class="delete-icon"
                      @click.stop="removeLang(index)"
                    />
                  </div>
                </div>
              </div>

              <!-- 右侧编辑区 -->
              <div class="editor-panel">
                <template v-if="editForm.languages.length > 0">
                  <div class="field-row">
                    <label>标题</label>
                    <a-input
                      v-model:value="editForm.languages[currentLangIndex].title"
                      placeholder="请输入标题"
                    />
                  </div>
                  <div class="field-row editor-row">
                    <label>内容</label>
                    <div class="editor-wrapper">
                      <RichTextEditor
                        v-model="editForm.languages[currentLangIndex].content"
                        :placeholder="`请输入内容（${editForm.languages[currentLangIndex]?.lang || ''}）`"
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
        >
          <a-select-option v-for="lang in availableLangs" :key="lang.code" :value="lang.code">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
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

// 表格密度
const tableSize = ref('default')
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 全屏
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
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
  keyword: ''
})
const resetFilter = () => {
  filterForm.status = ''
  filterForm.dateRange = null
  filterForm.keyword = ''
}
const applyFilter = () => {
  moreSearchVisible.value = false
  message.success('筛选已应用')
}

// 表格列
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    align: 'center'
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
    align: 'center',
    width: 100
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
    image: 'https://via.placeholder.com/60x40/1a237e/ffffff?text=KINEX',
    sort: 5,
    statusChecked: true,
    createTime: '09/30 02:16',
    updateTime: '03/26 17:15',
    languages: [{ lang: 'en-us', title: 'First Set Deposit', content: '' }]
  },
  {
    id: 2,
    title: 'Membership level',
    image: 'https://via.placeholder.com/60x40/1a237e/ffffff?text=KINEX',
    sort: 10,
    statusChecked: true,
    createTime: '09/30 02:05',
    updateTime: '03/26 17:16',
    languages: [{ lang: 'en-us', title: 'Membership level', content: '' }]
  },
  {
    id: 3,
    title: 'Salary Structure',
    image: 'https://via.placeholder.com/60x40/1a237e/ffffff?text=KINEX',
    sort: 20,
    statusChecked: true,
    createTime: '09/30 02:00',
    updateTime: '03/26 17:16',
    languages: [{ lang: 'en-us', title: 'Salary Structure', content: '' }]
  },
  {
    id: 4,
    title: 'Bouns For Registration',
    image: 'https://via.placeholder.com/60x40/1a237e/ffffff?text=KINEX',
    sort: 30,
    statusChecked: true,
    createTime: '09/03 19:58',
    updateTime: '03/26 17:16',
    languages: [{ lang: 'en-us', title: 'Bouns For Registration', content: '' }]
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
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除公告"${record.title}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      const index = tableData.value.findIndex(item => item.id === record.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
        pagination.total = tableData.value.length
        message.success('删除成功')
      }
    }
  })
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
  editForm.languages = record.languages?.length > 0
    ? JSON.parse(JSON.stringify(record.languages))
    : [{ lang: 'en-us', title: record.title, content: '' }]
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

const availableLangs = langRefData

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

// 语言搜索过滤
const filterLangOption = (input, option) => {
  const searchText = input.toLowerCase()
  return option.value.toLowerCase().includes(searchText)
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
  editForm.languages.push({
    lang: langCode,
    title: '',
    content: ''
  })
  currentLangIndex.value = editForm.languages.length - 1
  newLangCode.value = ''
  newLangText.value = ''
  addLangModalVisible.value = false
}

const removeLang = (index) => {
  if (editForm.languages.length <= 1) {
    message.error('至少保留一种语言')
    return
  }
  editForm.languages.splice(index, 1)
  if (currentLangIndex.value >= editForm.languages.length) {
    currentLangIndex.value = editForm.languages.length - 1
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

  // 图片单元格
  .image-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;

    img {
      width: 60px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .arrow-icon {
      color: #1890ff;
      font-size: 12px;
    }
  }

  // 排序单元格
  .sort-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;

    .sort-value {
      color: #1890ff;
    }

    .arrow-icon {
      color: #1890ff;
      font-size: 12px;
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

// 过渡动画
.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideUp 0.2s ease-in reverse;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  overflow: hidden;

  .edit-page-content {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

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
          border-right: 1px solid #f0f0f0;
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
              height: 40px;
              border-radius: 6px;
              font-size: 14px;
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

// 语言代码表弹窗样式
.lang-ref-content {
  :deep(.ant-table-thead > tr > th) {
    font-size: 15px;
    font-weight: 600;
  }

  :deep(.lang-row-clickable) {
    cursor: pointer;

    &:hover {
      background-color: #e6f7ff !important;
    }
  }
}
</style>
