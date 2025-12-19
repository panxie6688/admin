<template>
  <div class="auth-container">
    <!-- 页面头部：Tab + 按钮 + 搜索 + 工具 -->
    <div class="page-header">
      <div class="header-left">
        <a-tabs v-model:activeKey="activeTab" class="header-tabs">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane key="pending" tab="待审核" />
          <a-tab-pane key="approved" tab="通过" />
          <a-tab-pane key="rejected" tab="拒绝" />
        </a-tabs>
        <a-button type="primary" class="add-btn" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          添加会员认证资料
        </a-button>
      </div>
      <div class="header-right">
        <a-input
          v-model:value="searchForm.keyword"
          placeholder="单号、会员信息"
          style="width: 160px"
          allow-clear
        >
          <template #suffix>
            <SearchOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
        <a-button type="primary" @click="openSearchDrawer">更多搜索</a-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="false"
        :size="tableSize"
        :scroll="{ x: 1200, y: tableScrollY }"
        row-key="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 会员列 -->
          <template v-if="column.key === 'member'">
            <div class="member-cell">
              <a class="member-id">{{ record.memberId }}</a>
              <a-dropdown>
                <DownOutlined class="dropdown-icon" />
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1">查看详情</a-menu-item>
                    <a-menu-item key="2">编辑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>

          <!-- 用户名列 -->
          <template v-else-if="column.key === 'username'">
            <span class="username-text">{{ record.username }}</span>
          </template>

          <!-- 图片列 -->
          <template v-else-if="column.key === 'image'">
            <a-image
              v-if="record.image"
              :src="record.image"
              :width="60"
              :height="40"
              style="object-fit: cover; border-radius: 4px;"
            />
            <span v-else>-</span>
          </template>

          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-tag v-if="record.status === 'pending'" color="orange">待审核</a-tag>
            <a-tag v-else-if="record.status === 'approved'" color="green">通过</a-tag>
            <a-tag v-else-if="record.status === 'rejected'" color="red">拒绝</a-tag>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link" @click="handleView(record)">查看</a>
              <a class="action-link" @click="handleAudit(record)">审核</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 固定分页 -->
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-total="pagination.showTotal"
        :show-size-changer="pagination.showSizeChanger"
        :show-quick-jumper="pagination.showQuickJumper"
        size="small"
        @change="handlePageChange"
      />
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawerVisible"
      title="筛选"
      placement="right"
      :width="450"
      class="search-drawer"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="handleResetSearch">重置</a-button>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </a-space>
      </template>

      <a-form layout="vertical" :model="advancedSearch">
        <a-form-item label="认证类型">
          <a-select
            v-model:value="advancedSearch.type"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="id_card">身份证</a-select-option>
            <a-select-option value="passport">护照</a-select-option>
            <a-select-option value="driver">驾照</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="审核状态">
          <a-select
            v-model:value="advancedSearch.status"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">通过</a-select-option>
            <a-select-option value="rejected">拒绝</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="会员UID">
          <a-input
            v-model:value="advancedSearch.memberUid"
            placeholder="请输入会员ID"
          />
        </a-form-item>

        <a-form-item label="证件号">
          <a-input
            v-model:value="advancedSearch.idNumber"
            placeholder="请输入证件号"
          />
        </a-form-item>

        <a-form-item label="开始时间">
          <a-date-picker
            v-model:value="advancedSearch.startTime"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="结束时间">
          <a-date-picker
            v-model:value="advancedSearch.endTime"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 添加认证资料弹窗 -->
    <a-modal
      v-model:open="addModalVisible"
      title="添加会员认证资料"
      :width="500"
      @ok="handleAddSubmit"
      @cancel="addModalVisible = false"
    >
      <a-form layout="vertical" :model="addForm">
        <a-form-item label="会员UID" required>
          <a-input v-model:value="addForm.memberUid" placeholder="请输入会员UID" />
        </a-form-item>
        <a-form-item label="认证类型" required>
          <a-select v-model:value="addForm.type" placeholder="请选择认证类型">
            <a-select-option value="id_card">身份证</a-select-option>
            <a-select-option value="passport">护照</a-select-option>
            <a-select-option value="driver">驾照</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="真实姓名" required>
          <a-input v-model:value="addForm.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="证件号码" required>
          <a-input v-model:value="addForm.idNumber" placeholder="请输入证件号码" />
        </a-form-item>
        <a-form-item label="证件图片">
          <a-upload
            list-type="picture-card"
            :max-count="3"
          >
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import {
  SearchOutlined,
  DownOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode')
const contentFullscreen = inject('contentFullscreen')
const toggleContentFullscreen = inject('toggleContentFullscreen')

// Tab 切换
const activeTab = ref('pending')

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

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 更多搜索抽屉
const searchDrawerVisible = ref(false)
const advancedSearch = reactive({
  type: undefined,
  status: undefined,
  memberUid: '',
  idNumber: '',
  startTime: null,
  endTime: null
})

const openSearchDrawer = () => {
  searchDrawerVisible.value = true
}

const handleResetSearch = () => {
  advancedSearch.type = undefined
  advancedSearch.status = undefined
  advancedSearch.memberUid = ''
  advancedSearch.idNumber = ''
  advancedSearch.startTime = null
  advancedSearch.endTime = null
}

const handleSubmitSearch = () => {
  searchDrawerVisible.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('搜索完成')
  }, 500)
}

// 加载状态
const loading = ref(false)

// 表格密度
const tableSize = ref('large')

// 表格列配置
const columns = [
  {
    title: '会员',
    key: 'member',
    dataIndex: 'memberId',
    width: 150,
    align: 'center',
    customHeaderCell: () => ({ class: 'header-blue' })
  },
  {
    title: '用户名',
    key: 'username',
    dataIndex: 'username',
    width: 120,
    align: 'center',
    customHeaderCell: () => ({ class: 'header-blue' })
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    align: 'center'
  },
  {
    title: '名称',
    dataIndex: 'realName',
    key: 'realName',
    width: 120,
    align: 'center'
  },
  {
    title: '证件号',
    dataIndex: 'idNumber',
    key: 'idNumber',
    width: 180,
    align: 'center'
  },
  {
    title: '图片',
    key: 'image',
    width: 100,
    align: 'center'
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    fixed: 'right'
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center',
    fixed: 'right'
  }
]

// 模拟数据（空数据）
const tableData = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `统计: ${total}/条`,
  showSizeChanger: false,
  showQuickJumper: true
})

const handlePageChange = (page, pageSize) => {
  pagination.current = page
  pagination.pageSize = pageSize
}

// 添加认证资料
const addModalVisible = ref(false)
const addForm = reactive({
  memberUid: '',
  type: undefined,
  realName: '',
  idNumber: ''
})

const handleAdd = () => {
  addModalVisible.value = true
}

const handleAddSubmit = () => {
  message.success('添加成功')
  addModalVisible.value = false
}

// 查看
const handleView = (record) => {
  message.info(`查看: ${record.memberId}`)
}

// 审核
const handleAudit = (record) => {
  message.info(`审核: ${record.memberId}`)
}
</script>

<style scoped lang="less">
.auth-container {
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
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-tabs {
        margin-bottom: 0;

        :deep(.ant-tabs-nav) {
          margin-bottom: 0;

          &::before {
            border-bottom: none;
          }
        }

        :deep(.ant-tabs-tab) {
          padding: 16px 0;
        }
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
    padding: 0;
  }

  .pagination-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    border-radius: 0 0 4px 4px;
  }

  .member-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .member-id {
      color: #1890ff;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
      }
    }

    .dropdown-icon {
      margin-left: 6px;
      font-size: 10px;
      color: #999;
      cursor: pointer;
    }
  }

  .username-text {
    color: #1890ff;
  }

  .action-link {
    color: #1890ff;
    cursor: pointer;

    &:hover {
      color: #40a9ff;
    }
  }
}

:deep(.ant-table-wrapper) {
  height: 100%;
  display: flex;
  flex-direction: column;

  .ant-spin-nested-loading {
    flex: 1;
    overflow: hidden;

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

  // 横向滚动条移到底部
  .ant-table-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ant-table-body {
    overflow-x: auto !important;
    overflow-y: auto !important;
  }
}

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    color: #333;
    font-size: 14px;
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;

    &::before {
      display: none !important;
    }

    // 蓝色表头字体
    &.header-blue {
      color: #1890ff;
    }
  }

  .ant-table-tbody > tr > td {
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
  }

  .ant-table-tbody > tr:hover > td {
    background: #fafafa;
  }

  // 固定列背景色
  .ant-table-cell-fix-right {
    background: #fafafa;
  }

  .ant-table-tbody > tr > .ant-table-cell-fix-right {
    background: #fff;
  }

  .ant-table-tbody > tr:hover > .ant-table-cell-fix-right {
    background: #fafafa;
  }
}

:deep(.ant-pagination) {
  margin: 0;

  .ant-pagination-total-text {
    flex: none;
    margin-right: 16px;
    color: #666;
    font-size: 14px;
  }
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  border-radius: 4px;
}
</style>
