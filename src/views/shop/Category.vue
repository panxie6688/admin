<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">商品分类</h2>
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
            <a-tag :color="record.status === '开启' ? 'processing' : 'error'">
              {{ record.status }}
            </a-tag>
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

    <!-- 添加/编辑抽屉 -->
    <a-drawer
      v-model:open="editDrawerVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      placement="right"
      :width="720"
      :closable="true"
      :rootClassName="'rounded-drawer'"
      @close="handleEditClose"
    >
      <template #closeIcon>
        <close-outlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <a-button type="primary" @click="handleEditSubmit">保存&创建</a-button>
      </template>

      <div class="add-form-row">
        <div class="form-col">
          <div class="form-label required">名称</div>
          <a-input v-model:value="editForm.name" placeholder="输入" />
        </div>
        <div class="form-col">
          <div class="form-label">指定VIP等级</div>
          <a-select v-model:value="editForm.vip" placeholder="全部" style="width: 100%;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="vip in vipLevelList" :key="vip.level" :value="vip.level">
              VIP{{ vip.level }}
            </a-select-option>
          </a-select>
        </div>
        <div class="form-col">
          <div class="form-label required">状态</div>
          <div class="status-switch">
            <span>开关</span>
            <a-switch v-model:checked="editForm.statusEnabled" />
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
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  CloseOutlined
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
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    align: 'center'
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    align: 'center'
  },
  {
    title: '指定VIP',
    dataIndex: 'vip',
    key: 'vip',
    width: 150,
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
    width: 180,
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
  { id: 2, name: 'Default-2', vip: '无', status: '开启', time: '09/04 01:51' }
])

// VIP等级列表（模拟从VIP设置获取）
const vipLevelList = ref([
  { level: 1, name: 'Junior-level employee' },
  { level: 2, name: 'Mid-level employees' },
  { level: 3, name: 'Senior-level employee' },
  { level: 4, name: 'Mentor-level employee' }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 1
})

// 编辑抽屉
const editDrawerVisible = ref(false)
const isEdit = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  vip: '',
  statusEnabled: true
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
    vip: record.vip === '无' ? '' : record.vip,
    statusEnabled: record.status === '开启'
  })
  editDrawerVisible.value = true
}

// 删除
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除分类 "${record.name}" 吗？`,
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
  editForm.vip = ''
  editForm.statusEnabled = true
}

// 编辑抽屉关闭
const handleEditClose = () => {
  resetEditForm()
}

// 编辑提交
const handleEditSubmit = () => {
  if (!editForm.name) {
    message.warning('请输入分类名称')
    return
  }
  message.success(isEdit.value ? '编辑成功' : '添加成功')
  editDrawerVisible.value = false
}
</script>

<style scoped lang="less">
.page-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

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
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;

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

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  border-radius: 4px;
}

// 添加分类表单行样式
.add-form-row {
  display: flex;
  gap: 16px;

  .form-col {
    flex: 1;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;

      &.required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 4px;
      }
    }

    :deep(.ant-input) {
      height: 40px;
    }

    :deep(.ant-select) {
      height: 40px;

      .ant-select-selector {
        height: 40px !important;

        .ant-select-selection-item,
        .ant-select-selection-placeholder {
          line-height: 38px !important;
        }
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
</style>
