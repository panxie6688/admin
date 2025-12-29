<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">轮播图</h2>
        <a-button type="primary" class="add-btn" @click="handleAdd">
          <plus-outlined /> 添加数据
        </a-button>
      </div>
      <div class="header-right">
        <a-input
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 180px"
          allow-clear
        >
          <template #suffix>
            <search-outlined style="color: #bfbfbf" />
          </template>
        </a-input>
        <a-button type="primary" @click="searchDrawerVisible = true">更多搜索</a-button>
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
          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '显示' ? 'processing' : 'error'" class="status-tag">
              {{ record.status }}
            </a-tag>
          </template>
          <!-- 图片列 -->
          <template v-else-if="column.key === 'image'">
            <a-image
              v-if="record.image"
              :src="record.image"
              :width="60"
              :height="36"
              style="object-fit: cover; border-radius: 4px;"
            />
            <span v-else>-</span>
          </template>
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space :size="12">
              <a class="action-link edit" @click="handleEdit(record)">编辑</a>
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

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawerVisible"
      title="筛选"
      placement="right"
      :width="360"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="handleResetSearch">重置</a-button>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </a-space>
      </template>

      <a-form layout="vertical" :model="advancedSearch">
        <a-form-item label="客户端">
          <a-select v-model:value="advancedSearch.client" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="app">APP</a-select-option>
            <a-select-option value="h5">H5</a-select-option>
            <a-select-option value="pc">PC</a-select-option>
            <a-select-option value="app_h5">APP+H5</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="显示类型">
          <a-select v-model:value="advancedSearch.displayType" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="客户列表">客户列表</a-select-option>
            <a-select-option value="首页模版V2">首页模版V2</a-select-option>
            <a-select-option value="首页">首页</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态">
          <a-select v-model:value="advancedSearch.status" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="hide">隐藏</a-select-option>
            <a-select-option value="show">显示</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序字段">
          <a-select v-model:value="advancedSearch.sortField" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="sort">设置排序</a-select-option>
            <a-select-option value="createTime">创建时间</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序类型">
          <a-select v-model:value="advancedSearch.sortType" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 添加/编辑抽屉 -->
    <a-drawer
      v-model:open="editDrawerVisible"
      title="轮播图管理"
      placement="right"
      :width="900"
      :rootClassName="'rounded-drawer'"
      @close="handleEditClose"
    >
      <template #extra>
        <a-button type="primary" @click="handleEditSubmit">保存&创建</a-button>
      </template>

      <div class="edit-drawer-content">
        <div class="edit-two-column">
          <!-- 左侧：基本信息 -->
          <div class="edit-left-panel">
            <div class="section-title">基本信息</div>

            <div class="form-item">
              <label>名称(仅后台展示)</label>
              <a-input v-model:value="editForm.name" placeholder="请输入名称" />
            </div>

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>显示类型</label>
                  <a-select v-model:value="editForm.displayType" style="width: 100%">
                    <a-select-option value="首页">首页</a-select-option>
                    <a-select-option value="客户列表">客户列表</a-select-option>
                    <a-select-option value="首页模版V2">首页模版V2</a-select-option>
                    <a-select-option value="首页前-轮播图">首页前-轮播图</a-select-option>
                  </a-select>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label>状态</label>
                  <a-select v-model:value="editForm.status" style="width: 100%">
                    <a-select-option value="显示">显示</a-select-option>
                    <a-select-option value="隐藏">隐藏</a-select-option>
                  </a-select>
                </div>
              </a-col>
            </a-row>

            <div class="form-item">
              <label>排序</label>
              <a-input v-model:value="editForm.sort" placeholder="0" style="width: 50%" />
            </div>

            <div class="form-item">
              <label>点击方式</label>
              <a-select v-model:value="editForm.clickType" style="width: 100%">
                <a-select-option value="无操作">无操作</a-select-option>
                <a-select-option value="内部跳转">内部跳转</a-select-option>
                <a-select-option value="外站链接">外站链接</a-select-option>
                <a-select-option value="文本提示">文本提示</a-select-option>
              </a-select>
            </div>

            <div class="form-item">
              <label>访问权限</label>
              <a-select v-model:value="editForm.needLogin" style="width: 100%">
                <a-select-option value="不需登录">不需登录</a-select-option>
                <a-select-option value="需登录">需登录</a-select-option>
              </a-select>
            </div>

            <div class="form-item">
              <label>路径、URL</label>
              <a-input v-model:value="editForm.url" placeholder="输入" />
            </div>
          </div>

          <!-- 右侧：图片上传 -->
          <div class="edit-right-panel">
            <!-- 添加语言 -->
            <div class="lang-add-row">
              <a-select v-model:value="newTitleLang" placeholder="选择语言" @change="handleLangSelect">
                <a-select-option v-for="lang in availableTitleLangs" :key="lang.code" :value="lang.code">
                  {{ lang.name }}
                </a-select-option>
              </a-select>
              <a-input v-model:value="newTitleText" placeholder="请输入语言标识" />
              <a-button type="primary" @click="handleAddLangOption">添 加</a-button>
              <a-button @click="titleRefModalVisible = true">参 考</a-button>
            </div>

            <!-- 已添加的图片列表 -->
            <div class="image-list">
              <div v-for="(item, index) in editForm.images" :key="index" class="image-item">
                <div class="image-header">
                  <span class="lang-label">语言：{{ item.lang }}</span>
                  <a-button type="primary" danger @click="handleDeleteImage(index)">删 除</a-button>
                </div>
                <div class="image-preview">
                  <div v-if="item.image" class="upload-preview-with-actions">
                    <img :src="item.image" alt="轮播图" />
                    <div class="preview-overlay">
                      <a-upload
                        :show-upload-list="false"
                        accept="image/*"
                        @change="(info) => handleUpdateImage(info, index)"
                      >
                        <a-button type="primary" size="small">重新上传</a-button>
                      </a-upload>
                      <a-button type="primary" danger size="small" @click="editForm.images[index].image = ''">重 置</a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 隐藏的上传input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 标题语言参考弹窗 -->
    <a-modal
      v-model:open="titleRefModalVisible"
      title="语言代码表"
      :footer="null"
      :width="600"
    >
      <div class="lang-ref-content">
        <a-input-search
          v-model:value="titleLangSearchText"
          placeholder="搜索语言代码或名称"
          style="margin-bottom: 12px"
          allow-clear
        />
        <a-table
          :columns="langRefColumns"
          :data-source="filteredTitleLangRefData"
          :pagination="false"
          size="small"
          :scroll="{ y: 'calc(100vh - 300px)' }"
          :row-class-name="() => 'lang-row-clickable'"
          :custom-row="(record) => ({
            onClick: () => handleSelectTitleLangFromRef(record)
          })"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onUnmounted } from 'vue'
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
const searchDrawerVisible = ref(false)
const advancedSearch = reactive({
  client: undefined,
  displayType: undefined,
  status: undefined,
  sortField: undefined,
  sortType: undefined
})

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
const tableSize = ref('default')

// 表格列配置
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    align: 'center'
  },
  {
    title: '客户端',
    dataIndex: 'client',
    key: 'client',
    width: 80,
    align: 'center'
  },
  {
    title: '显示类型',
    dataIndex: 'displayType',
    key: 'displayType',
    width: 100,
    align: 'center'
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center'
  },
  {
    title: '统一点击配置',
    dataIndex: 'clickConfig',
    key: 'clickConfig',
    width: 140,
    align: 'center'
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    align: 'center'
  }
]

// 模拟数据
const tableData = ref([
  { id: 1, name: 'client_7', client: '全部', displayType: '客户列表', sort: 0, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=1' },
  { id: 2, name: 'client_6', client: '全部', displayType: '客户列表', sort: 30, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=2' },
  { id: 3, name: 'client_5', client: '全部', displayType: '客户列表', sort: 35, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=3' },
  { id: 4, name: 'client_3', client: '全部', displayType: '客户列表', sort: 40, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=4' },
  { id: 5, name: 'client_2', client: '全部', displayType: '客户列表', sort: 45, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=5' },
  { id: 6, name: 'client_1', client: '全部', displayType: '客户列表', sort: 50, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=6' },
  { id: 7, name: 'banner_3', client: '全部', displayType: '首页模版V2', sort: 40, status: '隐藏', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=7' },
  { id: 8, name: 'banner_2', client: '全部', displayType: '首页模版V2', sort: 45, status: '隐藏', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=8' },
  { id: 9, name: 'banner_1', client: '全部', displayType: '首页模版V2', sort: 50, status: '隐藏', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=9' },
  { id: 10, name: 'banner_0', client: '全部', displayType: '首页模版V2', sort: 55, status: '隐藏', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=10' },
  { id: 11, name: 'name', client: '全部', displayType: '首页', sort: 40, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=11' },
  { id: 12, name: 'name', client: '全部', displayType: '首页', sort: 45, status: '显示', clickConfig: '无操作  不需登录', image: 'https://picsum.photos/200/120?random=12' },
  { id: 13, name: 'WFP', client: '全部', displayType: '首页', sort: 1, status: '显示', clickConfig: '外站链接  不需登录', image: 'https://picsum.photos/200/120?random=13' }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 13
})

// 编辑抽屉
const editDrawerVisible = ref(false)
const isEdit = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  status: '显示',
  sort: '0',
  displayType: '客户列表',
  clickType: '无操作',
  needLogin: '不需登录',
  url: '',
  images: []
})

// 标题语言相关
const newTitleLang = ref(undefined)
const newTitleText = ref('')
const titleRefModalVisible = ref(false)
const titleLangSearchText = ref('')
const customLangs = ref([]) // 自定义语言列表

// 语言数据
const langRefData = [
  { code: 'zh-cn', name: '中文(简体)' },
  { code: 'zh-tw', name: '中文(繁体)' },
  { code: 'en-us', name: '英语(美国)' },
  { code: 'en-gb', name: '英语(英国)' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '朝鲜语' },
  { code: 'es', name: '西班牙语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'it', name: '意大利语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'ru', name: '俄语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'th', name: '泰语' },
  { code: 'vi', name: '越南语' }
]

// 语言参考表列
const langRefColumns = [
  { title: '语言代码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '语言名称', dataIndex: 'name', key: 'name' }
]

// 可用标题语言（过滤已添加的，包含自定义语言）
const availableTitleLangs = computed(() => {
  const addedCodes = editForm.images.map(t => t.lang)
  const allLangs = [...langRefData, ...customLangs.value]
  return allLangs.filter(lang => !addedCodes.includes(lang.code))
})

// 过滤后的语言数据
const filteredTitleLangRefData = computed(() => {
  if (!titleLangSearchText.value) {
    return langRefData
  }
  const keyword = titleLangSearchText.value.toLowerCase()
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

// 密度切换
const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

// 重置搜索
const handleResetSearch = () => {
  advancedSearch.client = undefined
  advancedSearch.displayType = undefined
  advancedSearch.status = undefined
  advancedSearch.sortField = undefined
  advancedSearch.sortType = undefined
}

// 提交搜索
const handleSubmitSearch = () => {
  searchDrawerVisible.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('搜索完成')
  }, 500)
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  resetEditForm()
  editDrawerVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(editForm, {
    id: record.id,
    name: record.name,
    status: record.status,
    sort: String(record.sort),
    displayType: record.displayType || '客户列表',
    clickType: record.clickConfig?.split('  ')[0] || '无操作',
    needLogin: record.clickConfig?.split('  ')[1] || '不需登录',
    url: '',
    images: [
      { lang: 'en-us', image: record.image }
    ]
  })
  editDrawerVisible.value = true
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 "${record.name}" 吗？`,
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
  editForm.name = ''
  editForm.status = '显示'
  editForm.sort = '0'
  editForm.displayType = '客户列表'
  editForm.clickType = '无操作'
  editForm.needLogin = '不需登录'
  editForm.url = ''
  editForm.images = []
  newTitleLang.value = undefined
  newTitleText.value = ''
}

// 编辑抽屉关闭
const handleEditClose = () => {
  resetEditForm()
}

// 编辑提交
const handleEditSubmit = () => {
  if (!editForm.name) {
    message.warning('请输入名称')
    return
  }
  message.success(isEdit.value ? '编辑成功' : '添加成功')
  editDrawerVisible.value = false
}

// 文件上传input引用
const fileInputRef = ref(null)
// 当前选择的语言（用于上传）
const pendingLang = ref('')

// 下拉框选择语言后，直接弹出文件选择
const handleLangSelect = (value) => {
  if (!value) return
  const exists = editForm.images.some(t => t.lang === value)
  if (exists) {
    message.warning('该语言已添加')
    newTitleLang.value = undefined
    return
  }
  pendingLang.value = value
  // 触发文件选择
  fileInputRef.value?.click()
}

// 文件选择后处理
const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) {
    newTitleLang.value = undefined
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    editForm.images.push({
      lang: pendingLang.value,
      image: ev.target.result
    })
    message.success('添加成功')
    // 重置
    newTitleLang.value = undefined
    pendingLang.value = ''
  }
  reader.readAsDataURL(file)
  // 清空input，以便下次能再选同一文件
  e.target.value = ''
}

// 添加自定义语言到下拉选项
const handleAddLangOption = () => {
  if (!newTitleText.value) {
    message.warning('请输入语言标识')
    return
  }
  const exists = langRefData.some(l => l.code === newTitleText.value) ||
                 customLangs.value.some(l => l.code === newTitleText.value)
  if (exists) {
    message.warning('该语言标识已存在')
    return
  }
  customLangs.value.push({
    code: newTitleText.value,
    name: newTitleText.value
  })
  message.success('语言标识已添加到下拉选项')
  newTitleText.value = ''
}

// 删除图片
const handleDeleteImage = (index) => {
  editForm.images.splice(index, 1)
  message.success('删除成功')
}

// 更新图片
const handleUpdateImage = (info, index) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.images[index].image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 从参考表选择语言
const handleSelectTitleLangFromRef = (record) => {
  newTitleLang.value = record.code
  titleRefModalVisible.value = false
  // 选择后直接触发上传
  handleLangSelect(record.code)
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
  min-height: 0;
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

  .status-tag {
    min-width: 40px;
    text-align: center;
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
    font-weight: 500;
    color: #333;
    font-size: 14px;
    text-align: center;

    &::before {
      display: none !important;
    }
  }

  .ant-table-tbody > tr > td {
    font-size: 14px;
    color: #333;
    text-align: center;
  }

  .ant-table-tbody > tr:hover > td {
    background: #fafafa;
  }
}

:deep(.ant-pagination) {
  margin: 0;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  border-radius: 4px;
}

// 编辑抽屉内容样式
.edit-drawer-content {
  .edit-two-column {
    display: flex;
    gap: 24px;
  }

  .edit-left-panel {
    flex: 1;
    padding-right: 24px;
    border-right: 1px solid #f0f0f0;
  }

  .edit-right-panel {
    flex: 1;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
  }

  .form-item {
    margin-bottom: 12px;

    label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .ant-input,
    .ant-select {
      width: 100%;
    }

    :deep(.ant-input),
    :deep(.ant-select-selector) {
      height: 36px !important;
      border-radius: 6px;

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 34px !important;
      }
    }
  }

  .ant-row {
    margin-bottom: 8px;
  }

  .image-list {
    .image-item {
      margin-bottom: 20px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;

      .image-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .lang-label {
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }
      }

      .image-preview {
        .upload-preview-with-actions {
          width: 100%;
          max-height: 200px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 1px solid #e8e8e8;
          background: #f5f5f5;

          > img {
            width: 100%;
            max-height: 200px;
            display: block;
            object-fit: contain;
          }

          .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.3s;

            .ant-btn {
              min-width: 80px;
              font-size: 12px;
            }
          }

          &:hover .preview-overlay {
            opacity: 1;
          }
        }

        .upload-box {
          width: 100%;
          height: 120px;
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
          }

          .upload-text {
            font-size: 14px;
            color: #bfbfbf;
          }
        }
      }
    }
  }
}

// 语言参考表样式
.lang-ref-content {
  :deep(.ant-table-thead > tr > th) {
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
</style>
