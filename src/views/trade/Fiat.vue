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
        :scroll="{ x: 1400, y: 'calc(100vh - 260px)' }"
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
          <!-- 数量 -->
          <template v-if="column.dataIndex === 'amount'">
            <span class="amount-text">{{ record.amount }}</span>
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
          <!-- 状态 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <template v-if="record.status === '待审核'">
                <a class="action-link success" @click="handlePass(record)">通过</a>
                <a class="action-link danger" @click="handleReject(record)">驳回</a>
              </template>
              <template v-else>
                <a class="action-link disabled">通过</a>
                <a class="action-link disabled">驳回</a>
              </template>
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
          <div class="form-label">状态</div>
          <a-select
            v-model:value="searchDrawer.status"
            placeholder="全部"
            style="width: 100%;"
            allow-clear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">审核通过</a-select-option>
            <a-select-option value="rejected">驳回</a-select-option>
          </a-select>
        </div>
        <div class="form-item">
          <div class="form-label">会员ID</div>
          <a-input v-model:value="searchDrawer.memberId" placeholder="输入" />
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
          <div class="form-label">搜索(全称)</div>
          <a-input-search
            v-model:value="searchDrawer.keyword"
            placeholder="搜索内容"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="searchDrawer.sortField"
            placeholder="时间"
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
import { ref, reactive, inject, createVNode } from 'vue'
import { message, Modal, Input } from 'ant-design-vue'
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  CaretDownOutlined,
  ExclamationCircleOutlined
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
  total: 18
})

// 表格数据
const tableData = ref([])

// 模拟数据
const mockData = [
  { id: 1, member: '1-4707174248', username: 'Shaneikque1', amount: 500.00, voucher: 'https://picsum.photos/200/200?random=1', orderNo: '20251230176400045613505263', time: '2025-12-30 17:44:22', reason: '-', remark: '银行转账', status: '审核通过' },
  { id: 2, member: '1-8609927282', username: '8609927282', amount: 1000.00, voucher: 'https://picsum.photos/200/200?random=2', orderNo: '20251230176385625388523422', time: '2025-12-30 14:46:32', reason: '-', remark: '支付宝', status: '审核通过' },
  { id: 3, member: '1-2162889383', username: 'Millie', amount: 300.00, voucher: 'https://picsum.photos/200/200?random=3', orderNo: '20251230175892084304018942', time: '2025-12-30 15:07:23', reason: '-', remark: '微信转账', status: '待审核' },
  { id: 4, member: '1-6052154537', username: '2girlsD43', amount: 2500.00, voucher: 'https://picsum.photos/200/200?random=4', orderNo: '20251229175814379016721138', time: '2025-12-29 15:16:30', reason: '-', remark: '银行转账', status: '待审核' },
  { id: 5, member: '1-6052154537', username: '2girlsD43', amount: 800.00, voucher: 'https://picsum.photos/200/200?random=5', orderNo: '20251229175803894095223311', time: '2025-12-29 10:09:01', reason: '-', remark: '现金存款', status: '审核通过' },
  { id: 6, member: '1-248755982', username: 'TomE', amount: 150.00, voucher: null, orderNo: '20251229175798361269348832', time: '2025-12-29 18:46:53', reason: '凭证模糊', remark: '-', status: '驳回' },
  { id: 7, member: '1-8179195152', username: 'Star12', amount: 3000.00, voucher: 'https://picsum.photos/200/200?random=7', orderNo: '20251228175686016635500091', time: '2025-12-28 18:42:46', reason: '-', remark: '银行转账', status: '待审核' },
  { id: 8, member: '1-8179195152', username: 'Star12', amount: 600.00, voucher: 'https://picsum.photos/200/200?random=8', orderNo: '20251228175685969782765533', time: '2025-12-28 18:34:58', reason: '-', remark: '支付宝', status: '审核通过' },
  { id: 9, member: '1-4014501096', username: 'CriszSanti', amount: 1200.00, voucher: 'https://picsum.photos/200/200?random=9', orderNo: '20251228175643166848456638', time: '2025-12-28 19:41:05', reason: '-', remark: '微信转账', status: '待审核' },
  { id: 10, member: '1-7132583745', username: 'Bolouis33', amount: 5000.00, voucher: 'https://picsum.photos/200/200?random=10', orderNo: '20251227175633529327311889', time: '2025-12-27 16:54:53', reason: '-', remark: '银行转账', status: '审核通过' },
  { id: 11, member: '1-6624188841', username: 'Calcal', amount: 450.00, voucher: null, orderNo: '20251227175632649478978', time: '2025-12-27 14:24:09', reason: '金额不符', remark: '-', status: '驳回' },
  { id: 12, member: '1-6052154537', username: '2girlsD43', amount: 200.00, voucher: 'https://picsum.photos/200/200?random=12', orderNo: '20251227175622606314312944', time: '2025-12-27 10:34:23', reason: '-', remark: '现金存款', status: '审核通过' },
  { id: 13, member: '1-7018407768', username: 'rlw120', amount: 1800.00, voucher: 'https://picsum.photos/200/200?random=13', orderNo: '20251226175616579322588914', time: '2025-12-26 17:49:53', reason: '-', remark: '银行转账', status: '待审核' },
  { id: 14, member: '1-2065659108', username: 'smehdi2025', amount: 750.00, voucher: 'https://picsum.photos/200/200?random=14', orderNo: '20251226175582253766550259', time: '2025-12-26 18:28:58', reason: '-', remark: '支付宝', status: '审核通过' },
  { id: 15, member: '1-7045770269', username: 'doomguy0269', amount: 100.00, voucher: null, orderNo: '20251226175580268482666661', time: '2025-12-26 12:58:08', reason: '信息不完整', remark: '-', status: '驳回' },
  { id: 16, member: '1-8173666490', username: 'Jluytinck1979', amount: 2200.00, voucher: 'https://picsum.photos/200/200?random=16', orderNo: '20251225175553542712877242', time: '2025-12-25 10:43:47', reason: '-', remark: '银行转账', status: '待审核' },
  { id: 17, member: '1-8173666490', username: 'Jluytinck1979', amount: 900.00, voucher: 'https://picsum.photos/200/200?random=17', orderNo: '20251225175531199581733348', time: '2025-12-25 20:39:56', reason: '-', remark: '微信转账', status: '审核通过' },
  { id: 18, member: '1-9374750912', username: 'Michael1212', amount: 400.00, voucher: 'https://picsum.photos/200/200?random=18', orderNo: '20251224175520123456789012', time: '2025-12-24 16:32:41', reason: '-', remark: '现金存款', status: '审核通过' }
]

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
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center', fixed: 'right' },
  { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right' }
]

// 搜索抽屉
const searchDrawer = reactive({
  visible: false,
  status: undefined,
  memberId: '',
  startTime: null,
  endTime: null,
  keyword: '',
  sortField: 'time',
  sortType: 'desc'
})

// 操作抽屉
const operateDrawer = reactive({
  visible: false,
  record: null
})

// 排序选项
const sortFieldOptions = [
  { label: '全部', value: '' },
  { label: '数量', value: 'amount' },
  { label: '时间', value: 'time' }
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
    tableData.value = [...mockData]
    loading.value = false
  }, 300)
}

// 初始加载
loadData()

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    '驳回': 'error',
    '审核通过': 'success',
    '待审核': 'processing'
  }
  return colorMap[status] || 'default'
}

// 通过操作
const handlePass = (record) => {
  let reasonValue = ''
  Modal.confirm({
    title: '通过充值',
    icon: createVNode(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
    width: 520,
    content: createVNode('div', { class: 'withdraw-confirm-content' }, [
      createVNode('div', { class: 'confirm-table' }, [
        createVNode('div', { class: 'confirm-row' }, [
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '充值金额(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.amount))
          ]),
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '备注'),
            createVNode('div', { class: 'cell-value' }, record.remark || '-')
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '订单号'),
            createVNode('div', { class: 'cell-value' }, record.orderNo)
          ])
        ])
      ]),
      createVNode('div', { class: 'reason-label' }, '理由(选填)'),
      createVNode(Input.TextArea, {
        placeholder: '请输入',
        rows: 3,
        onChange: (e) => { reasonValue = e.target.value }
      })
    ]),
    okText: '确 定',
    cancelText: '取 消',
    onOk() {
      record.status = '审核通过'
      record.reason = reasonValue || '-'
      message.success('已通过')
    }
  })
}

// 驳回操作
const handleReject = (record) => {
  let reasonValue = ''
  Modal.confirm({
    title: '驳回充值',
    icon: createVNode(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
    width: 520,
    content: createVNode('div', { class: 'withdraw-confirm-content' }, [
      createVNode('div', { class: 'confirm-table' }, [
        createVNode('div', { class: 'confirm-row' }, [
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '充值金额(美元)'),
            createVNode('div', { class: 'cell-value' }, String(record.amount))
          ]),
          createVNode('div', { class: 'confirm-cell' }, [
            createVNode('div', { class: 'cell-label' }, '备注'),
            createVNode('div', { class: 'cell-value' }, record.remark || '-')
          ])
        ]),
        createVNode('div', { class: 'confirm-row single' }, [
          createVNode('div', { class: 'confirm-cell full' }, [
            createVNode('div', { class: 'cell-label' }, '订单号'),
            createVNode('div', { class: 'cell-value' }, record.orderNo)
          ])
        ])
      ]),
      createVNode('div', { class: 'reason-label' }, '拒绝理由(选填)'),
      createVNode(Input.TextArea, {
        placeholder: '请输入',
        rows: 3,
        onChange: (e) => { reasonValue = e.target.value }
      })
    ]),
    okText: '确 定',
    cancelText: '取 消',
    okType: 'primary',
    onOk() {
      record.status = '驳回'
      record.reason = reasonValue || '-'
      message.success('已驳回')
    }
  })
}

// 搜索
const onSearch = (value) => {
  console.log('搜索:', value)
  loadData()
}

// 重置搜索
const handleResetSearch = () => {
  searchDrawer.status = undefined
  searchDrawer.memberId = ''
  searchDrawer.startTime = null
  searchDrawer.endTime = null
  searchDrawer.keyword = ''
  searchDrawer.sortField = 'time'
  searchDrawer.sortType = 'desc'
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
    overflow: hidden;
    padding: 0 24px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;

      .ant-spin-nested-loading {
        height: 100%;
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
          }

          .ant-table-body {
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

    .amount-text {
      color: #333;
      font-weight: 500;
    }

    .action-btns {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .action-link {
        color: #1890ff;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          color: #40a9ff;
        }

        &.success {
          color: #52c41a;

          &:hover {
            color: #73d13d;
          }
        }

        &.danger {
          color: #ff4d4f;

          &:hover {
            color: #ff7875;
          }
        }

        &.disabled {
          color: #d9d9d9;
          cursor: not-allowed;

          &:hover {
            color: #d9d9d9;
          }
        }
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
