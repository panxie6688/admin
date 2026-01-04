<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">站内信</span>
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
        :scroll="{ x: 1600 }"
      >
        <!-- 会员列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'member'">
            <a-dropdown :trigger="['click']">
              <a class="member-link">
                {{ record.member }}
                <down-outlined style="font-size: 10px; margin-left: 4px;" />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="detail">会员详情</a-menu-item>
                  <a-menu-item key="orders">订单记录</a-menu-item>
                  <a-menu-item key="finance">财务日志</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>

          <!-- 用户名 -->
          <template v-else-if="column.key === 'username'">
            <span class="username-text">{{ record.username }}</span>
          </template>

          <!-- 发送方 -->
          <template v-else-if="column.key === 'sender'">
            <span>{{ record.sender }}</span>
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

          <!-- 回复状态 -->
          <template v-else-if="column.key === 'replyStatus'">
            <a-tag :color="record.replyStatus === '已回复' ? 'success' : 'error'">
              {{ record.replyStatus }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <div class="action-btns">
              <a @click="handleViewContent(record)">完整内容</a>
              <a @click="handleReply(record)">回复</a>
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

    <!-- 添加数据/回复 - 全屏覆盖页面 -->
    <transition name="slide-right">
      <div v-if="addPage.visible" class="fullscreen-page">
        <div class="fullscreen-card">
          <div class="fullscreen-header">
            <span class="fullscreen-title">{{ addPage.isReply ? '回复/发送到会员' : '回复/发送到会员' }}</span>
            <div class="header-actions">
              <a-button type="primary" @click="handleAddSubmit">确 认</a-button>
              <close-outlined class="close-icon" @click="addPage.visible = false" />
            </div>
          </div>
          <div class="form-section">
            <div class="form-header">
              <span class="form-title">表单</span>
            </div>
            <div class="form-body">
              <!-- 会员UID 和 回复消息ID -->
              <div class="form-row">
                <div class="form-item">
                  <div class="form-label">会员UID</div>
                  <div class="input-with-btn">
                    <a-input v-model:value="addPage.memberUid" placeholder="请输入会员ID" size="large" />
                    <a-button type="primary" size="large" @click="handleSearchMember">搜 索</a-button>
                  </div>
                </div>
                <div class="form-item">
                  <div class="form-label">回复消息ID(选填)</div>
                  <a-input v-model:value="addPage.replyMessageId" placeholder="输入" size="large" />
                </div>
              </div>

              <!-- 标题 -->
              <div class="form-item">
                <div class="form-label label-large">标题</div>
                <a-input v-model:value="addPage.title" placeholder="请输入标题" size="large" />
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
        <a-form-item label="回复状态">
          <a-select v-model:value="filterDrawer.replyStatus" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="已回复">已回复</a-select-option>
            <a-select-option value="未回复">未回复</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发送方">
          <a-select v-model:value="filterDrawer.sender" placeholder="请选择" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="会员提交">会员提交</a-select-option>
            <a-select-option value="系统发送">系统发送</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会员ID">
          <a-input v-model:value="filterDrawer.memberId" placeholder="请输入会员ID" />
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

    <!-- 完整内容弹窗 -->
    <a-modal
      v-model:open="contentModal.visible"
      title="查看内容"
      width="700px"
      :footer="null"
      centered
    >
      <div class="content-modal">
        <h3 class="content-title">{{ contentModal.record?.title }}</h3>
        <div class="content-body">
          {{ contentModal.record?.fullContent || contentModal.record?.content }}
        </div>
        <div class="content-footer">
          <a-button type="primary" @click="contentModal.visible = false">知道了</a-button>
        </div>
      </div>
    </a-modal>
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
  DownOutlined,
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
  total: 28
})

// 表格列定义
const columns = [
  {
    title: '会员',
    dataIndex: 'member',
    key: 'member',
    width: 150,
    fixed: 'left',
    customHeaderCell: () => ({ style: { color: '#1890ff' } })
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 100
  },
  {
    title: '发送方',
    dataIndex: 'sender',
    key: 'sender',
    width: 100
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 220
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 280,
    ellipsis: true
  },
  {
    title: '回复状态',
    dataIndex: 'replyStatus',
    key: 'replyStatus',
    width: 100,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 140,
    align: 'center'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 140,
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
const tableData = ref([
  {
    id: 1,
    member: '1-6133062544',
    username: '-',
    sender: '会员提交',
    title: '会员UID(35105535)留言',
    content: 'Bonjour mon nom es Linda Daoust.Ce travail ma ete offer par quelqun sure tik...',
    fullContent: 'Bonjour mon nom es Linda Daoust.Ce travail ma ete offer par quelqun sure tik tok.Et on ma ensuite suggerer de me rendre sure whatsapp.Et cest la que jetais suposer etre entrainer pour faire le travail avec kinex.La personne qui etais suposer mentrainer ma fait un resume&ma demander si jetais daccord pour comencer mon training le lendemain.Alor jai dit oui.Mais le jour de mon training,la personne netais pas presente,je lui ai laisser plusieurs message&elle ne ma jamais repondu.So,je voudrai me faire entrainer pour comencer a travailler.Mais je ne savais pa ou,ou coment vous contacter,alor cest aujourdhui que jai vue que je pouvais laisser un message.Jespere que vous pouvez maider?mon numero de telephone es 613 306 2544 mon nom es Linda Daoust et mon email es daoustl50@gmail.com.Sa fait un bon bout de temp que jai un compte mais il es inactif parceque je naie pas toutes les infos pour compendre coment ceci fonctione.Jespere que vous pouvez assigner quelqun pour mon training?Merci.Linda Daoust',
    replyStatus: '未回复',
    createTime: '10/08 20:13',
    updateTime: '10/08 20:13'
  },
  {
    id: 2,
    member: '1-9713456870',
    username: '-',
    sender: '会员提交',
    title: '会员UID(57849257)留言',
    content: 'Working through a training session and have an error message that will not let m...',
    replyStatus: '未回复',
    createTime: '07/21 12:03',
    updateTime: '07/21 12:03'
  },
  {
    id: 3,
    member: '1-2107758929',
    username: '-',
    sender: '会员提交',
    title: '会员UID(95179078)留言',
    content: 'I have not recvd my funs',
    replyStatus: '未回复',
    createTime: '06/26 18:04',
    updateTime: '06/26 18:04'
  },
  {
    id: 4,
    member: '1-5258000',
    username: '-',
    sender: '会员提交',
    title: '会员UID(17051130)留言',
    content: 'I need to clear the negative amount of the work account 5258000, please give me th...',
    replyStatus: '未回复',
    createTime: '06/24 17:38',
    updateTime: '06/24 17:38'
  },
  {
    id: 5,
    member: '1-9713125648',
    username: '-',
    sender: '会员提交',
    title: '会员UID(72402532)留言',
    content: 'I need to clear the negative amount for MRY123, I need a ERC deposit address',
    replyStatus: '未回复',
    createTime: '06/21 20:55',
    updateTime: '06/21 20:55'
  },
  {
    id: 6,
    member: '1-707-688-6841',
    username: '-',
    sender: '会员提交',
    title: '会员UID(17392159)留言',
    content: 'Here it is',
    replyStatus: '未回复',
    createTime: '06/09 19:03',
    updateTime: '06/09 19:03'
  },
  {
    id: 7,
    member: '1-4135242928',
    username: '-',
    sender: '会员提交',
    title: '会员UID(23044884)留言',
    content: 'Hi I did not get paid.',
    replyStatus: '未回复',
    createTime: '06/08 08:40',
    updateTime: '06/08 08:40'
  },
  {
    id: 8,
    member: '1-708 635-9288',
    username: '-',
    sender: '会员提交',
    title: '会员UID(56991183)留言',
    content: 'How do I match products to earn more to complete my tasks',
    replyStatus: '未回复',
    createTime: '05/15 17:10',
    updateTime: '05/15 17:10'
  },
  {
    id: 9,
    member: '1-6421532152',
    username: '-',
    sender: '会员提交',
    title: '会员UID(10605782)留言',
    content: 'Needs customer ERC address',
    replyStatus: '未回复',
    createTime: '04/04 14:16',
    updateTime: '04/04 14:16'
  },
  {
    id: 10,
    member: '1-6421532152',
    username: '-',
    sender: '会员提交',
    title: '会员UID(10605782)留言',
    content: 'I need to contact customer service',
    replyStatus: '未回复',
    createTime: '04/04 14:15',
    updateTime: '04/04 14:15'
  },
  {
    id: 11,
    member: '1-6421532152',
    username: '-',
    sender: '会员提交',
    title: '会员UID(10605782)留言',
    content: 'I need to contact customer service',
    replyStatus: '未回复',
    createTime: '04/04 14:15',
    updateTime: '04/04 14:15'
  }
])

// 添加/回复页面
const addPage = reactive({
  visible: false,
  isReply: false,
  memberUid: '',
  replyMessageId: '',
  title: '',
  content: ''
})

// 筛选抽屉
const filterDrawer = reactive({
  visible: false,
  replyStatus: '',
  sender: '',
  memberId: '',
  startTime: null,
  endTime: null
})

// 完整内容弹窗
const contentModal = reactive({
  visible: false,
  record: null
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
  addPage.isReply = false
  addPage.memberUid = ''
  addPage.replyMessageId = ''
  addPage.title = ''
  addPage.content = ''
}

// 搜索会员
const handleSearchMember = () => {
  if (!addPage.memberUid) {
    message.warning('请输入会员ID')
    return
  }
  message.info(`搜索会员: ${addPage.memberUid}`)
}

// 提交添加/回复
const handleAddSubmit = () => {
  if (!addPage.memberUid) {
    message.warning('请输入会员UID')
    return
  }
  if (!addPage.title) {
    message.warning('请输入标题')
    return
  }
  if (!addPage.content) {
    message.warning('请输入内容')
    return
  }
  message.success(addPage.isReply ? '回复成功' : '发送成功')
  addPage.visible = false
}

// 重置筛选
const handleFilterReset = () => {
  filterDrawer.replyStatus = ''
  filterDrawer.sender = ''
  filterDrawer.memberId = ''
  filterDrawer.startTime = null
  filterDrawer.endTime = null
}

// 提交筛选
const handleFilterSubmit = () => {
  message.info('筛选条件已应用')
  filterDrawer.visible = false
}

// 查看完整内容
const handleViewContent = (record) => {
  contentModal.record = record
  contentModal.visible = true
}

// 回复
const handleReply = (record) => {
  addPage.visible = true
  addPage.isReply = true
  addPage.memberUid = record.member
  addPage.replyMessageId = String(record.id)
  addPage.title = ''
  addPage.content = ''
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
  background: #f0f2f5;
  z-index: 100;
  padding: 0;
  overflow: hidden;

  .fullscreen-card {
    background: #fff;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .fullscreen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      flex-shrink: 0;

      .fullscreen-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .close-icon {
        font-size: 18px;
        color: #999;
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
      border-top: 1px solid #f0f0f0;

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid #f0f0f0;
        flex-shrink: 0;

        .form-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }
      }

      .form-body {
        flex: 1;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 10px;
          flex-shrink: 0;

          .form-item {
            flex: 1;
            margin-bottom: 0;
          }
        }

        .form-item {
          margin-bottom: 10px;
          flex-shrink: 0;

          .form-label {
            margin-bottom: 4px;
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

          &.editor-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            margin-bottom: 0;

            .editor-wrapper {
              flex: 1;
              min-height: 0;
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

// 会员链接
.member-link {
  color: #1890ff;
  cursor: pointer;

  &:hover {
    color: #40a9ff;
  }
}

// 用户名
.username-text {
  color: #333;
}

// 内容文本
.content-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

// 完整内容弹窗
.content-modal {
  .content-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .content-body {
    background: #fff;
    padding: 0;
    line-height: 1.8;
    color: #333;
    font-size: 14px;
    max-height: 400px;
    overflow-y: auto;
  }

  .content-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
}
</style>
