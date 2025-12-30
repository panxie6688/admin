<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">法币转账充值</span>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="searchDrawer.visible = true">
          更多搜索
        </a-button>
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? '退出全屏' : '全屏'">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="loadData">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown>
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleDensityChange">
              <a-menu-item key="default" :class="{ 'active-density': tableSize === 'default' }">
                宽松
              </a-menu-item>
              <a-menu-item key="middle" :class="{ 'active-density': tableSize === 'middle' }">
                中等
              </a-menu-item>
              <a-menu-item key="small" :class="{ 'active-density': tableSize === 'small' }">
                紧凑
              </a-menu-item>
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
        :pagination="false"
        :loading="loading"
        :size="tableSize"
        bordered
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 会员 -->
          <template v-if="column.dataIndex === 'member'">
            <a-dropdown>
              <a class="member-link" @click.prevent>
                {{ record.member }} <caret-down-outlined style="font-size: 10px; margin-left: 4px;" />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1">查看详情</a-menu-item>
                  <a-menu-item key="2">发送消息</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <!-- 用户名 -->
          <template v-if="column.dataIndex === 'username'">
            <span class="username-text">{{ record.username }}</span>
          </template>
          <!-- 上传的凭证 -->
          <template v-if="column.dataIndex === 'voucher'">
            <a-image
              v-if="record.voucher"
              :src="record.voucher"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px; cursor: pointer;"
            />
            <span v-else class="no-data">-</span>
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <a-button type="link" size="small" class="btn-primary" @click="handleOperate(record)">操作</a-button>
            </div>
          </template>
        </template>
      </a-table>
      <!-- 底部分页 - 固定在底部 -->
      <div class="page-footer">
        <span class="total-text">统计: {{ pagination.total }}/条</span>
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          size="small"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawer.visible"
      title="筛选"
      placement="right"
      :width="400"
      :closable="true"
      rootClassName="rounded-drawer"
      @close="searchDrawer.visible = false"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a style="color: #ff4d4f; cursor: pointer;" @click="handleResetSearch">重置</a>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </div>
      </template>
      <div class="search-form">
        <div class="form-item">
          <div class="form-label">会员UID</div>
          <div style="display: flex; gap: 8px;">
            <a-input v-model:value="searchDrawer.memberUid" placeholder="输入" style="flex: 1;" />
            <a-button type="primary" @click="handleSearchMemberUid">搜 索</a-button>
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">最低数量</div>
          <a-input v-model:value="searchDrawer.minAmount" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">最高数量</div>
          <a-input v-model:value="searchDrawer.maxAmount" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">订单号</div>
          <a-input v-model:value="searchDrawer.orderNo" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">搜索</div>
          <a-input v-model:value="searchDrawer.keyword" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">开始时间</div>
          <a-date-picker
            v-model:value="searchDrawer.startTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">结束时间</div>
          <a-date-picker
            v-model:value="searchDrawer.endTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="searchDrawer.sortField"
            placeholder="创建时间"
            style="width: 100%;"
            :options="sortFieldOptions"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序类型</div>
          <a-select
            v-model:value="searchDrawer.sortType"
            placeholder="降序排序"
            style="width: 100%;"
            :options="sortTypeOptions"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 操作抽屉 -->
    <a-drawer
      v-model:open="operateDrawer.visible"
      title="操作"
      placement="right"
      :width="500"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <div class="operate-content" v-if="operateDrawer.record">
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">订单号：</span>
            <span class="info-value">{{ operateDrawer.record.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">会员：</span>
            <span class="info-value">{{ operateDrawer.record.member }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">数量：</span>
            <span class="info-value">{{ operateDrawer.record.amount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">凭证：</span>
            <div class="info-value">
              <a-image
                v-if="operateDrawer.record.voucher"
                :src="operateDrawer.record.voucher"
                :width="100"
                :height="100"
                style="object-fit: cover; border-radius: 4px;"
              />
              <span v-else>-</span>
            </div>
          </div>
        </div>
        <div class="action-section">
          <a-space>
            <a-button type="primary" @click="handleConfirmPass">通过</a-button>
            <a-button danger @click="handleConfirmReject">驳回</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  CaretDownOutlined
} from '@ant-design/icons-vue'

// 注入布局相关
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 状态
const loading = ref(false)
const searchText = ref('')
const tableSize = ref('small')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref([])

// 列配置
const columns = [
  { title: '会员', dataIndex: 'member', key: 'member', width: 140, align: 'center', fixed: 'left', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 120, align: 'center' },
  { title: '上传的凭证', dataIndex: 'voucher', key: 'voucher', width: 120, align: 'center' },
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 220, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 160, align: 'center' },
  { title: '理由', dataIndex: 'reason', key: 'reason', width: 120, align: 'center' },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center', fixed: 'right' }
]

// 搜索抽屉
const searchDrawer = reactive({
  visible: false,
  memberUid: '',
  minAmount: '',
  maxAmount: '',
  orderNo: '',
  keyword: '',
  startTime: null,
  endTime: null,
  sortField: undefined,
  sortType: undefined
})

// 操作抽屉
const operateDrawer = reactive({
  visible: false,
  record: null
})

// 排序选项
const sortFieldOptions = [
  { label: '全部', value: '' },
  { label: '创建时间', value: 'createTime' },
  { label: '数量', value: 'amount' }
]

const sortTypeOptions = [
  { label: '全部', value: '' },
  { label: '降序排序', value: 'desc' },
  { label: '升序排序', value: 'asc' }
]

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = []
    loading.value = false
  }, 300)
}

// 搜索
const onSearch = (value) => {
  console.log('搜索:', value)
  loadData()
}

// 搜索会员UID
const handleSearchMemberUid = () => {
  message.info('搜索会员: ' + searchDrawer.memberUid)
}

// 重置搜索
const handleResetSearch = () => {
  searchDrawer.memberUid = ''
  searchDrawer.minAmount = ''
  searchDrawer.maxAmount = ''
  searchDrawer.orderNo = ''
  searchDrawer.keyword = ''
  searchDrawer.startTime = null
  searchDrawer.endTime = null
  searchDrawer.sortField = undefined
  searchDrawer.sortType = undefined
}

// 提交搜索
const handleSubmitSearch = () => {
  searchDrawer.visible = false
  loadData()
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

// 操作
const handleOperate = (record) => {
  operateDrawer.visible = true
  operateDrawer.record = record
}

// 确认通过
const handleConfirmPass = () => {
  message.success('操作成功')
  operateDrawer.visible = false
  loadData()
}

// 确认驳回
const handleConfirmReject = () => {
  message.success('操作成功')
  operateDrawer.visible = false
  loadData()
}

// 初始加载
loadData()
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;

    .header-left {
      .page-title {
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
    overflow-x: auto;
    overflow-y: auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      display: flex;
      flex-direction: column;

      .ant-spin-nested-loading,
      .ant-spin-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .ant-table {
        flex: 1;
        display: flex;
        flex-direction: column;

        .ant-table-container {
          flex: 1;
          display: flex;
          flex-direction: column;

          .ant-table-content {
            flex: 1;
            overflow: auto !important;
          }
        }
      }
    }

    :deep(.ant-table) {
      font-size: 14px;

      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        text-align: center;
        color: #333;
      }

      .ant-table-tbody > tr > td {
        font-size: 13px;
        vertical-align: middle;
      }

      .ant-table-placeholder {
        .ant-table-cell {
          padding: 60px 0;
        }
      }
    }

    .member-link {
      color: #1890ff;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
      }
    }

    .username-text {
      color: #1890ff;
    }

    .no-data {
      color: #999;
    }

    .action-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .btn-primary {
        color: #1890ff;
        padding: 0 4px;
      }
    }

    // 分页固定在底部 - 使用 sticky
    .page-footer {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      padding: 12px 0;
      height: 48px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
      box-sizing: border-box;
      z-index: 10;
      flex-shrink: 0;

      .total-text {
        margin-right: 16px;
        color: #666;
        font-size: 14px;
        white-space: nowrap;
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

// 激活密度样式
:deep(.active-density) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
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

// 操作内容
.operate-content {
  .info-section {
    margin-bottom: 24px;

    .info-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 14px;

      .info-label {
        color: #666;
        width: 80px;
        flex-shrink: 0;
      }

      .info-value {
        color: #333;
        flex: 1;
        word-break: break-all;
      }
    }
  }

  .action-section {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
