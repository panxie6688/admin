<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 页面头部：Tab + 搜索 + 工具 -->
    <div class="page-header">
      <div class="header-left">
        <a-tabs v-model:activeKey="activeTab" class="header-tabs">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane key="root" tab="根评论" />
          <a-tab-pane key="reply" tab="评论回复" />
          <a-tab-pane key="top" tab="置顶" />
          <a-tab-pane key="show" tab="显示" />
          <a-tab-pane key="hide" tab="隐藏" />
        </a-tabs>
      </div>
      <div class="header-right">
        <a-input
          v-model:value="searchKeyword"
          placeholder="单号、会员信息"
          style="width: 200px"
          allow-clear
        >
          <template #suffix>
            <SearchOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
        <a-button type="primary" @click="searchDrawerVisible = true">更多搜索</a-button>
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? '退出全屏' : '全屏'">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="handleRefresh">
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
            <a-menu @click="handleDensityChange" :selectedKeys="[tableSize]">
              <a-menu-item key="default">宽松</a-menu-item>
              <a-menu-item key="middle">中等</a-menu-item>
              <a-menu-item key="small">紧凑</a-menu-item>
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
        :loading="loading"
        :pagination="false"
        :size="tableSize"
        :scroll="{ x: 1600, y: tableScrollY }"
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

          <!-- 回复会员-会员列 -->
          <template v-else-if="column.key === 'replyMember'">
            <div class="member-cell" v-if="record.replyMemberId">
              <a class="member-id">{{ record.replyMemberId }}</a>
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
            <span v-else>-</span>
          </template>

          <!-- 回复会员-用户名列 -->
          <template v-else-if="column.key === 'replyUsername'">
            <span class="username-text" v-if="record.replyUsername">{{ record.replyUsername }}</span>
            <span v-else>-</span>
          </template>

          <!-- 显示列 -->
          <template v-else-if="column.key === 'visible'">
            <a-switch v-model:checked="record.visible" size="small" />
          </template>

          <!-- 置顶列 -->
          <template v-else-if="column.key === 'isTop'">
            <a-switch v-model:checked="record.isTop" size="small" />
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

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link" @click="handleEdit(record)">编辑</a>
              <a class="action-link delete" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
      <!-- 固定分页 -->
      <TablePagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-quick-jumper="true"
      />
    </div>

    <!-- 更多搜索抽屉 -->
    <a-drawer
      v-model:open="searchDrawerVisible"
      title="筛选"
      placement="right"
      :width="450"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="handleResetSearch">重置</a-button>
          <a-button type="primary" @click="handleSubmitSearch">提交</a-button>
        </a-space>
      </template>

      <a-form layout="vertical" :model="advancedSearch">
        <a-form-item label="会员UID">
          <a-input
            v-model:value="advancedSearch.memberUid"
            placeholder="请输入会员ID"
          />
        </a-form-item>

        <a-form-item label="评论类型">
          <a-select
            v-model:value="advancedSearch.type"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="root">根评论</a-select-option>
            <a-select-option value="reply">评论回复</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="显示状态">
          <a-select
            v-model:value="advancedSearch.visible"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">显示</a-select-option>
            <a-select-option value="0">隐藏</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="置顶状态">
          <a-select
            v-model:value="advancedSearch.isTop"
            placeholder="请选择"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">置顶</a-select-option>
            <a-select-option value="0">不置顶</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="开始时间">
          <a-date-picker
            v-model:value="advancedSearch.startTime"
            placeholder="请选择日期"
            style="width: 100%"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>

        <a-form-item label="结束时间">
          <a-date-picker
            v-model:value="advancedSearch.endTime"
            placeholder="请选择日期"
            style="width: 100%"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>

        <a-form-item label="排序字段">
          <a-select
            v-model:value="advancedSearch.sortField"
            placeholder="全部"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="createTime">创建时间</a-select-option>
            <a-select-option value="likeCount">点赞次数</a-select-option>
            <a-select-option value="rating">评分</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序类型">
          <a-select
            v-model:value="advancedSearch.sortType"
            placeholder="全部"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
import {
  SearchOutlined,
  DownOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode')
const contentFullscreen = inject('contentFullscreen')
const toggleContentFullscreen = inject('toggleContentFullscreen')

// Tab 切换
const activeTab = ref('all')

// 搜索
const searchKeyword = ref('')
const searchDrawerVisible = ref(false)
const advancedSearch = reactive({
  memberUid: '',
  type: undefined,
  visible: undefined,
  isTop: undefined,
  startTime: null,
  endTime: null,
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

// 表格列配置 - 带合并表头
const columns = [
  {
    title: '会员',
    key: 'member',
    dataIndex: 'memberId',
    width: 120,
    align: 'center',
    customHeaderCell: () => ({ class: 'header-blue' })
  },
  {
    title: '用户名',
    key: 'username',
    dataIndex: 'username',
    width: 100,
    align: 'center',
    customHeaderCell: () => ({ class: 'header-blue' })
  },
  {
    title: '回复会员',
    children: [
      {
        title: '会员',
        key: 'replyMember',
        dataIndex: 'replyMemberId',
        width: 120,
        align: 'center'
      },
      {
        title: '用户名',
        key: 'replyUsername',
        dataIndex: 'replyUsername',
        width: 100,
        align: 'center'
      }
    ]
  },
  {
    title: '显示',
    key: 'visible',
    dataIndex: 'visible',
    width: 80,
    align: 'center'
  },
  {
    title: '置顶',
    key: 'isTop',
    dataIndex: 'isTop',
    width: 80,
    align: 'center'
  },
  {
    title: '点赞次数',
    dataIndex: 'likeCount',
    key: 'likeCount',
    width: 100,
    align: 'center'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 200,
    align: 'center',
    ellipsis: true
  },
  {
    title: '图片',
    key: 'image',
    width: 100,
    align: 'center'
  },
  {
    title: '评分',
    dataIndex: 'rating',
    key: 'rating',
    width: 80,
    align: 'center'
  },
  {
    title: '时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    align: 'center'
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
  total: 0
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
  advancedSearch.memberUid = ''
  advancedSearch.type = undefined
  advancedSearch.visible = undefined
  advancedSearch.isTop = undefined
  advancedSearch.startTime = null
  advancedSearch.endTime = null
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

// 编辑
const handleEdit = (record) => {
  message.info(`编辑: ${record.id}`)
}

// 删除
const handleDelete = (record) => {
  message.info(`删除: ${record.id}`)
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

      .header-tabs {
        margin-bottom: 0;

        :deep(.ant-tabs-nav) {
          margin-bottom: 0;

          &::before {
            border-bottom: none;
          }
        }

        :deep(.ant-tabs-tab) {
          padding: 16px 4px;
          margin: 0 16px 0 0;
          font-size: 14px;
          color: #666;

          &.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #1890ff;
            font-weight: 500;
          }
        }

        :deep(.ant-tabs-ink-bar) {
          background: #1890ff;
        }
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
    padding: 0 16px;
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

  .member-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .member-id {
      color: #1890ff;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
        text-decoration: underline;
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

    &.delete {
      color: #ff4d4f;

      &:hover {
        color: #ff7875;
      }
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
    font-weight: 500;
    color: #333;
    font-size: 14px;
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
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
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }

  // 固定列背景色
  .ant-table-cell-fix-right {
    background: #fafafa;
  }

  .ant-table-tbody > tr > .ant-table-cell-fix-right {
    background: #fff;
  }

  .ant-table-tbody > tr:hover > .ant-table-cell-fix-right {
    background: #f5f5f5;
  }

  // 去除表格边框
  &.ant-table-bordered {
    > .ant-table-container {
      border: none;

      > .ant-table-content > table,
      > .ant-table-header > table,
      > .ant-table-body > table {
        border-top: none;

        > thead > tr > th,
        > tbody > tr > td {
          border-right: none;
        }
      }
    }
  }
}

// 空数据样式
:deep(.ant-table-placeholder) {
  .ant-table-cell {
    border-bottom: none !important;
  }

  .ant-empty {
    margin: 60px 0;

    .ant-empty-image {
      height: 80px;

      svg {
        width: 80px;
        height: 80px;
      }
    }

    .ant-empty-description {
      color: #999;
      font-size: 14px;
    }
  }
}

:deep(.ant-pagination) {
  margin: 0;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
  height: 32px;
}

:deep(.ant-btn-primary) {
  border-radius: 4px;
}

// 密度样式
.page-container {
  &.size-default :deep(.ant-table) {
    .ant-table-thead > tr > th {
      padding: 16px 16px;
    }
    .ant-table-tbody > tr > td {
      padding: 16px 16px;
    }
  }

  &.size-middle :deep(.ant-table) {
    .ant-table-thead > tr > th {
      padding: 12px 12px;
    }
    .ant-table-tbody > tr > td {
      padding: 12px 12px;
    }
  }

  &.size-small :deep(.ant-table) {
    .ant-table-thead > tr > th {
      padding: 8px 8px;
    }
    .ant-table-tbody > tr > td {
      padding: 8px 8px;
    }
  }
}
</style>
