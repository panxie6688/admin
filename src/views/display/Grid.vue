<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">宫格</h2>
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
            <a-tag :color="record.status === '显示' ? 'success' : 'error'">
              {{ record.status }}
            </a-tag>
          </template>
          <!-- 图标列 -->
          <template v-else-if="column.key === 'icon'">
            <a-image
              v-if="record.icon"
              :src="record.icon"
              :width="36"
              :height="36"
              style="object-fit: contain;"
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
      title="宫格管理"
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

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>名称(仅后台展示)</label>
                  <a-input v-model:value="editForm.name" placeholder="请输入名称" />
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

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>排序</label>
                  <a-input v-model:value="editForm.sort" placeholder="请输入排序" />
                </div>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>点击方式</label>
                  <a-select v-model:value="editForm.clickType" style="width: 100%">
                    <a-select-option value="无操作">无操作</a-select-option>
                    <a-select-option value="内部跳转">内部跳转</a-select-option>
                    <a-select-option value="外站链接">外站链接</a-select-option>
                    <a-select-option value="文本提示">文本提示</a-select-option>
                  </a-select>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label>访问权限</label>
                  <a-select v-model:value="editForm.needLogin" style="width: 100%">
                    <a-select-option value="不需登录">不需登录</a-select-option>
                    <a-select-option value="需登录">需登录</a-select-option>
                  </a-select>
                </div>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="24">
                <div class="form-item">
                  <label>路径、URL</label>
                  <a-input v-model:value="editForm.url" placeholder="请输入路径或URL" />
                </div>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>显示方式</label>
                  <a-select v-model:value="editForm.displayType" style="width: 100%">
                    <a-select-option value="图片">图片</a-select-option>
                    <a-select-option value="字体图标">字体图标</a-select-option>
                  </a-select>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label>显示值</label>
                  <a-input v-model:value="editForm.displayValue" placeholder="文件路径" />
                </div>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <div class="form-item">
                  <label>颜色(选填,为空不使用)</label>
                  <a-input v-model:value="editForm.color" placeholder="输入" />
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label>大小(选填,0自动)</label>
                  <a-input v-model:value="editForm.size" placeholder="0" />
                </div>
              </a-col>
            </a-row>

            <!-- 图片上传 -->
            <div class="logo-upload-section">
              <div v-if="editForm.icon" class="upload-preview-with-actions">
                <img :src="editForm.icon" alt="图标" />
                <div class="preview-overlay">
                  <a-upload
                    :show-upload-list="false"
                    accept="image/*"
                    @change="handleIconChange"
                  >
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="editForm.icon = ''">重 置</a-button>
                </div>
              </div>
              <a-upload
                v-else
                :show-upload-list="false"
                accept="image/*"
                @change="handleIconChange"
              >
                <div class="upload-box">
                  <plus-outlined class="upload-icon" />
                  <div class="upload-text">LOGO</div>
                </div>
              </a-upload>
            </div>
          </div>

          <!-- 右侧：标题 -->
          <div class="edit-right-panel">
            <div class="section-title">标题</div>

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

            <!-- 已添加的标题列表 -->
            <div class="title-list">
              <div v-for="(item, index) in editForm.titles" :key="index" class="title-item">
                <div class="title-header">
                  <span>语言: {{ item.lang }}</span>
                  <a-button type="primary" danger size="small" @click="handleDeleteTitle(index)">删 除</a-button>
                </div>
                <a-textarea v-model:value="item.text" :rows="2" />
              </div>
            </div>
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
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 100,
    align: 'center'
  },
  {
    title: '标题',
    dataIndex: 'titleCount',
    key: 'titleCount',
    width: 80,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center'
  }
]

// 模拟数据
const tableData = ref([
  { id: 1, name: '在线客服', client: '全部', sort: 54, status: '显示', clickConfig: '无操作  不需登录', icon: '/icons/chat.png', titleCount: 2 },
  { id: 2, name: '关于我们', client: '全部', sort: 51, status: '显示', clickConfig: '无操作  不需登录', icon: '/icons/info.png', titleCount: 2 },
  { id: 3, name: '常见问题', client: '全部', sort: 50, status: '显示', clickConfig: '内部跳转  不需登录', icon: '/icons/faq.png', titleCount: 2 },
  { id: 4, name: '证书', client: '全部', sort: 53, status: '显示', clickConfig: '内部跳转  不需登录', icon: '/icons/cert.png', titleCount: 2 },
  { id: 5, name: '入金', client: '全部', sort: 52, status: '显示', clickConfig: '内部跳转  不需登录', icon: '/icons/deposit.png', titleCount: 2 },
  { id: 6, name: '用户协议', client: '全部', sort: 51, status: '显示', clickConfig: '无操作  不需登录', icon: '/icons/agreement.png', titleCount: 2 },
  { id: 7, name: '隐私政策', client: '全部', sort: 20, status: '显示', clickConfig: '无操作  不需登录', icon: '/icons/privacy.png', titleCount: 2 },
  { id: 8, name: 'WFP', client: '全部', sort: 55, status: '显示', clickConfig: '外站链接  不需登录', icon: '/icons/wfp.png', titleCount: 2 },
  { id: 9, name: '分享', client: '全部', sort: 40, status: '隐藏', clickConfig: '内部跳转  需登录', icon: '/icons/share.png', titleCount: 2 }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 9
})

// 编辑抽屉
const editDrawerVisible = ref(false)
const isEdit = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  status: '显示',
  sort: '',
  clickType: '无操作',
  needLogin: '不需登录',
  url: '',
  displayType: '图片',
  displayValue: '',
  color: '',
  size: '0',
  icon: '',
  titles: []
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
  { code: 'vi', name: '越南语' },
  { code: 'id', name: '印度尼西亚语' },
  { code: 'ms', name: '马来语' },
  { code: 'tr', name: '土耳其语' },
  { code: 'pl', name: '波兰语' },
  { code: 'nl', name: '荷兰语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'da', name: '丹麦语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'no', name: '挪威语' },
  { code: 'el', name: '希腊语' },
  { code: 'he', name: '希伯来语' },
  { code: 'hi', name: '印地语' },
  { code: 'uk', name: '乌克兰语' },
  { code: 'cs', name: '捷克语' },
  { code: 'hu', name: '匈牙利语' }
]

// 语言参考表列
const langRefColumns = [
  { title: '语言代码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '语言名称', dataIndex: 'name', key: 'name' }
]

// 可用标题语言（过滤已添加的，包含自定义语言）
const availableTitleLangs = computed(() => {
  const addedCodes = editForm.titles.map(t => t.lang)
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
    clickType: record.clickConfig?.split('  ')[0] || '无操作',
    needLogin: record.clickConfig?.split('  ')[1] || '不需登录',
    url: '/service',
    displayType: '图片',
    displayValue: 'u/grid/20250209/019...',
    color: '',
    size: '0',
    icon: record.icon,
    titles: [
      { lang: 'zh-cn', text: record.name },
      { lang: 'en-us', text: 'Service' }
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
  editForm.sort = ''
  editForm.clickType = '无操作'
  editForm.needLogin = '不需登录'
  editForm.url = ''
  editForm.displayType = '图片'
  editForm.displayValue = ''
  editForm.color = ''
  editForm.size = '0'
  editForm.icon = ''
  editForm.titles = []
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

// 图标上传
const handleIconChange = (info) => {
  if (info.file.status === 'done' || info.file.originFileObj) {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.icon = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 下拉框选择语言后，直接添加标题条目
const handleLangSelect = (value) => {
  if (!value) return
  const exists = editForm.titles.some(t => t.lang === value)
  if (exists) {
    message.warning('该语言已添加')
    newTitleLang.value = undefined
    return
  }
  editForm.titles.push({
    lang: value,
    text: ''
  })
  newTitleLang.value = undefined
  message.success('添加成功')
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

// 删除标题语言
const handleDeleteTitle = (index) => {
  editForm.titles.splice(index, 1)
  message.success('删除成功')
}

// 从参考表选择语言
const handleSelectTitleLangFromRef = (record) => {
  titleRefModalVisible.value = false
  // 选择后直接添加
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

  .ant-row {
    margin-bottom: 8px;
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

  .logo-upload-section {
    margin-top: 20px;
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
    }

    .upload-text {
      font-size: 14px;
      color: #bfbfbf;
    }
  }

  .title-list {
    .title-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;

      .title-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        span {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
      }

      :deep(.ant-input) {
        border-radius: 6px;
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
