<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">系统通知</span>
        <a-button type="primary" @click="handleAdd">
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
        <a-button type="primary" @click="filterDrawer.visible = true">更多搜索</a-button>
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
        <a-dropdown>
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <column-height-outlined />
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleSizeChange">
              <a-menu-item key="default" :class="{ active: tableSize === 'default' }">默认</a-menu-item>
              <a-menu-item key="middle" :class="{ active: tableSize === 'middle' }">中等</a-menu-item>
              <a-menu-item key="small" :class="{ active: tableSize === 'small' }">紧凑</a-menu-item>
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
        :loading="loading"
        :size="tableSize"
        bordered
        row-key="id"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 简写 -->
          <template v-if="column.key === 'shortName'">
            <span>{{ record.shortName }}</span>
          </template>

          <!-- 标题 -->
          <template v-else-if="column.key === 'title'">
            <span>{{ record.title }}</span>
          </template>

          <!-- 内容 -->
          <template v-else-if="column.key === 'content'">
            <a-tooltip :title="record.content">
              <span class="content-text">{{ record.content }}</span>
            </a-tooltip>
          </template>

          <!-- 图片 -->
          <template v-else-if="column.key === 'image'">
            <a-image
              v-if="record.image"
              :src="record.image"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px;"
            />
            <span v-else class="no-image">-</span>
          </template>

          <!-- 排序 -->
          <template v-else-if="column.key === 'sort'">
            <span>{{ record.sort }}</span>
          </template>

          <!-- 状态 -->
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === '显示'"
              checked-children="显示"
              un-checked-children="隐藏"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>

          <!-- 时间 -->
          <template v-else-if="column.key === 'time'">
            <span>{{ record.time }}</span>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <div class="action-btns">
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm
                title="确定删除该通知吗？"
                @confirm="handleDelete(record)"
              >
                <a class="danger-link">删除</a>
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
            v-model:pageSize="pagination.pageSize"
            :total="pagination.total"
            :show-size-changer="true"
            :show-quick-jumper="true"
            :page-size-options="['10', '20', '40', '50', '100']"
            @change="handlePageChange"
            @showSizeChange="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 添加/编辑数据 - 全屏覆盖页面 -->
    <transition name="slide-right">
      <div v-if="addPage.visible" class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="fullscreen-header">
            <span class="fullscreen-title">{{ addPage.isEdit ? '编辑系统通知' : '创建系统通知' }}</span>
            <close-outlined class="close-icon" @click="addPage.visible = false" />
          </div>
          <div class="form-section">
            <div class="form-header">
              <span class="form-title">表单</span>
              <a-button type="primary" @click="handleAddSubmit">保存&发布</a-button>
            </div>
            <div class="form-body">
              <!-- 指定会员UID 和 是否显示 -->
              <div class="form-row">
                <div class="form-item">
                  <div class="form-label">指定会员UID(选填)</div>
                  <div class="input-with-btn">
                    <a-input v-model:value="addPage.memberUid" placeholder="请输入会员ID" size="large" />
                    <a-button type="primary" size="large" @click="handleSearchMember">搜 索</a-button>
                  </div>
                </div>
                <div class="form-item">
                  <div class="form-label">是否显示</div>
                  <div class="switch-row">
                    <span>开关</span>
                    <a-switch
                      v-model:checked="addPage.statusChecked"
                      checked-children="开"
                      un-checked-children="关"
                    />
                  </div>
                </div>
              </div>

              <!-- 排序 -->
              <div class="form-item">
                <div class="form-label">排序</div>
                <a-input-number v-model:value="addPage.sort" placeholder="请输入排序" size="large" style="width: 50%;" :min="0" />
              </div>

              <!-- 简写(选填) -->
              <div class="form-item">
                <div class="form-label">简写(选填)</div>
                <a-input v-model:value="addPage.shortName" placeholder="输入" size="large" />
              </div>

              <!-- 封面图片 -->
              <div class="form-item">
                <div class="upload-area">
                  <a-upload
                    :show-upload-list="false"
                    :before-upload="() => false"
                    @change="handleImageUpload"
                  >
                    <div v-if="!addPage.image" class="upload-btn">
                      <plus-outlined style="font-size: 24px;" />
                      <div style="margin-top: 8px;">封面图片(选填)</div>
                    </div>
                    <div v-else class="upload-preview">
                      <img :src="addPage.image" alt="预览" />
                      <div class="preview-mask">
                        <reload-outlined @click.stop="addPage.image = ''" />
                      </div>
                    </div>
                  </a-upload>
                </div>
              </div>

              <!-- 标题 -->
              <div class="form-item">
                <div class="form-label label-large">标题</div>
                <a-textarea v-model:value="addPage.title" placeholder="请输入标题" :rows="3" size="large" />
              </div>

              <!-- 内容 - 富文本编辑器 -->
              <div class="form-item editor-item">
                <div class="form-label label-large">内容</div>
                <div class="editor-wrapper">
                  <RichTextEditor
                    v-model="addPage.content"
                    placeholder="请输入内容"
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="filterDrawer.visible"
      title="更多搜索"
      placement="right"
      width="400"
      class="rounded-drawer"
      :body-style="{ paddingBottom: '80px' }"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="状态">
          <a-select v-model:value="filterDrawer.status" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="显示">显示</a-select-option>
            <a-select-option value="隐藏">隐藏</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开始时间">
          <a-date-picker
            v-model:value="filterDrawer.startTime"
            show-time
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="结束时间">
          <a-date-picker
            v-model:value="filterDrawer.endTime"
            show-time
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
      <div class="drawer-footer">
        <a-button @click="handleFilterReset">重置</a-button>
        <a-button type="primary" @click="handleFilterSubmit">搜索</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 注入顶部菜单模式状态和内容全屏
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 搜索关键词
const searchText = ref('')

// 加载状态
const loading = ref(false)

// 表格密度
const tableSize = ref('default')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 40,
  total: 0
})

// 表格列定义
const columns = [
  {
    title: '简写',
    dataIndex: 'shortName',
    key: 'shortName',
    width: 150,
    fixed: 'left'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 280,
    ellipsis: true
  },
  {
    title: '图片',
    dataIndex: 'image',
    key: 'image',
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
    width: 100,
    align: 'center'
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 160,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    align: 'center'
  }
]

// 模拟数据
const tableData = ref([])

// 添加/编辑页面
const addPage = reactive({
  visible: false,
  isEdit: false,
  id: null,
  memberUid: '',
  shortName: '',
  title: '',
  content: '',
  image: '',
  sort: 1,
  statusChecked: true
})

// 筛选抽屉
const filterDrawer = reactive({
  visible: false,
  status: '',
  startTime: null,
  endTime: null
})

// 刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('刷新成功')
  }, 500)
}

// 搜索
const handleSearch = (value) => {
  console.log('搜索:', value)
  message.info(`搜索: ${value}`)
}

// 密度切换
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 分页变化
const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
  handleRefresh()
}

// 添加数据
const handleAdd = () => {
  addPage.visible = true
  addPage.isEdit = false
  addPage.id = null
  addPage.memberUid = ''
  addPage.shortName = ''
  addPage.title = ''
  addPage.content = ''
  addPage.image = ''
  addPage.sort = 1
  addPage.statusChecked = true
}

// 编辑
const handleEdit = (record) => {
  addPage.visible = true
  addPage.isEdit = true
  addPage.id = record.id
  addPage.memberUid = record.memberUid || ''
  addPage.shortName = record.shortName
  addPage.title = record.title
  addPage.content = record.content
  addPage.image = record.image || ''
  addPage.sort = record.sort
  addPage.statusChecked = record.status === '显示'
}

// 搜索会员
const handleSearchMember = () => {
  if (!addPage.memberUid) {
    message.warning('请输入会员ID')
    return
  }
  message.info(`搜索会员: ${addPage.memberUid}`)
}

// 图片上传
const handleImageUpload = (info) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    addPage.image = e.target.result
  }
  reader.readAsDataURL(file)
}

// 提交添加/编辑
const handleAddSubmit = () => {
  if (!addPage.title) {
    message.warning('请输入标题')
    return
  }
  if (!addPage.content) {
    message.warning('请输入内容')
    return
  }

  const status = addPage.statusChecked ? '显示' : '隐藏'

  if (addPage.isEdit) {
    // 编辑
    const index = tableData.value.findIndex(item => item.id === addPage.id)
    if (index !== -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        memberUid: addPage.memberUid,
        shortName: addPage.shortName,
        title: addPage.title,
        content: addPage.content,
        image: addPage.image,
        sort: addPage.sort,
        status: status
      }
    }
    message.success('编辑成功')
  } else {
    // 添加
    const newId = tableData.value.length > 0 ? Math.max(...tableData.value.map(i => i.id)) + 1 : 1
    tableData.value.unshift({
      id: newId,
      memberUid: addPage.memberUid,
      shortName: addPage.shortName,
      title: addPage.title,
      content: addPage.content,
      image: addPage.image,
      sort: addPage.sort,
      status: status,
      time: new Date().toLocaleString()
    })
    pagination.total = tableData.value.length
    message.success('添加成功')
  }
  addPage.visible = false
}

// 状态切换
const handleStatusChange = (record, checked) => {
  record.status = checked ? '显示' : '隐藏'
  message.success(`状态已更新为: ${record.status}`)
}

// 删除
const handleDelete = (record) => {
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
    pagination.total = tableData.value.length
    message.success('删除成功')
  }
}

// 重置筛选
const handleFilterReset = () => {
  filterDrawer.status = ''
  filterDrawer.startTime = null
  filterDrawer.endTime = null
}

// 提交筛选
const handleFilterSubmit = () => {
  message.info('筛选条件已应用')
  filterDrawer.visible = false
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
    overflow-x: auto;
    overflow-y: auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    .ant-table-wrapper {
      flex: 1;
    }

    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
        white-space: nowrap;
      }

      .ant-table-tbody > tr > td {
        white-space: nowrap;
      }
    }

    .page-footer {
      position: sticky;
      bottom: 0;
      background: #fff;
      padding: 16px 0;
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

// 全屏覆盖页面
.fullscreen-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;

  .fullscreen-card {
    background: #fff;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 12px 16px;

    .fullscreen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
      flex-shrink: 0;

      .fullscreen-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-icon {
        font-size: 18px;
        color: #666;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #333;
        }
      }
    }

    .form-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0;

        .form-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }
      }

      .form-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        .form-row {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
          flex-shrink: 0;

          .form-item {
            flex: 1;
            margin-bottom: 0;
          }
        }

        .form-item {
          margin-bottom: 16px;
          flex-shrink: 0;

          .form-label {
            margin-bottom: 8px;
            font-size: 14px;
            color: #333;

            &.label-large {
              font-size: 16px;
              font-weight: 700;
              color: #000;
            }
          }

          .input-with-btn {
            display: flex;
            gap: 8px;

            .ant-input {
              flex: 1;
            }
          }

          .switch-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            height: 40px;
            background: #fff;

            span {
              color: #bfbfbf;
              font-size: 14px;
            }
          }

          .upload-area {
            .upload-btn {
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
              color: #999;
              background: #fafafa;

              &:hover {
                border-color: #1890ff;
                color: #1890ff;
              }
            }

            .upload-preview {
              width: 120px;
              height: 120px;
              border-radius: 8px;
              overflow: hidden;
              position: relative;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .preview-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
              }

              &:hover .preview-mask {
                opacity: 1;
              }
            }
          }

          &.editor-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 300px;
            margin-bottom: 0;

            .editor-wrapper {
              flex: 1;
              min-height: 250px;
              border: 1px solid #d9d9d9;
              border-radius: 6px;
              overflow: hidden;
            }
          }
        }
      }
    }
  }
}

// 从右到左滑入动画
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

// 内容文本
.content-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 无图片
.no-image {
  color: #999;
}

// 操作按钮
.action-btns {
  display: flex;
  gap: 16px;
  justify-content: center;

  a {
    color: #1890ff;
    cursor: pointer;

    &:hover {
      color: #40a9ff;
    }

    &.danger-link {
      color: #ff4d4f;

      &:hover {
        color: #ff7875;
      }
    }
  }
}

// 抽屉底部
.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
