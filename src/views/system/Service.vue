<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">在线客服</span>
        <a-button type="primary" @click="handleAdd">
          <plus-outlined /> 添加数据
        </a-button>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 180px;"
          @search="handleSearch"
        />
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
        <a-dropdown :trigger="['click']">
          <a-tooltip title="密度">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleSizeChange">
              <a-menu-item key="default" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'default' }">默认</a-menu-item>
              <a-menu-item key="middle" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'middle' }">中等</a-menu-item>
              <a-menu-item key="small" :class="{ 'ant-dropdown-menu-item-selected': tableSize === 'small' }">紧凑</a-menu-item>
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
        :scroll="{ x: 1400 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <!-- LOGO -->
          <template v-if="column.key === 'logo'">
            <div class="logo-cell">
              <img :src="record.logo" alt="logo" class="logo-img" />
            </div>
          </template>
          <!-- 链接 -->
          <template v-if="column.key === 'link'">
            <a :href="record.link" target="_blank" class="link-text">{{ record.link }}</a>
          </template>
          <!-- 状态 -->
          <template v-if="column.key === 'status'">
            <a-switch v-model:checked="record.status" size="small" />
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <a class="action-link" @click="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="确定要删除该客服吗？"
              placement="topRight"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDeleteConfirm(record)"
            >
              <a class="action-link danger">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="page-footer">
        <span class="total-text">统计: {{ pagination.total }}/条</span>
        <a-pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :show-size-changer="false"
          size="small"
        />
      </div>
    </div>

    <!-- 添加/编辑抽屉 -->
    <a-drawer
      :open="drawerVisible"
      :title="isEdit ? '编辑在线客服' : '添加在线客服'"
      placement="right"
      width="680"
      :rootClassName="'rounded-drawer'"
      @close="handleDrawerCancel"
    >
      <template #closeIcon>
        <close-outlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <a-button type="primary" @click="handleDrawerOk">保存&创建</a-button>
      </template>

      <div class="drawer-form">
        <!-- LOGO 上传 -->
        <div class="logo-upload-area">
          <div v-if="formData.logo" class="logo-preview-box">
            <img :src="formData.logo" alt="logo" />
            <div class="logo-actions">
              <a-upload :show-upload-list="false" :before-upload="() => false" @change="handleLogoUpload">
                <a-button type="primary" size="small">更换</a-button>
              </a-upload>
              <a-button type="primary" danger size="small" @click="formData.logo = ''">删除</a-button>
            </div>
          </div>
          <a-upload v-else :show-upload-list="false" :before-upload="() => false" @change="handleLogoUpload">
            <div class="logo-upload-trigger">
              <plus-outlined class="trigger-icon" />
              <span class="trigger-text">LOGO</span>
            </div>
          </a-upload>
        </div>

        <!-- 表单行1: 名称、链接、状态 -->
        <div class="form-row three-cols">
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 名称</div>
            <a-input v-model:value="formData.name" placeholder="输入" />
          </div>
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 链接</div>
            <a-input v-model:value="formData.link" placeholder="输入" />
          </div>
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 状态</div>
            <div class="switch-box">
              <span>开关</span>
              <a-switch v-model:checked="formData.status" />
            </div>
          </div>
        </div>

        <!-- 表单行2: 排序、备注 -->
        <div class="form-row two-cols">
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 排序</div>
            <a-input v-model:value="formData.sort" placeholder="1" />
          </div>
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 备注</div>
            <a-input v-model:value="formData.remark" placeholder="输入" />
          </div>
        </div>

        <!-- 工作时间区间 -->
        <div class="section-header">工作时间区间</div>
        <div class="form-row two-cols">
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 开始时间</div>
            <a-input v-model:value="formData.startTime" placeholder="08:00" />
          </div>
          <div class="form-col">
            <div class="form-label"><span class="required">*</span> 结束时间</div>
            <a-input v-model:value="formData.endTime" placeholder="22:00" />
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 从 MainLayout 注入
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 搜索
const searchText = ref('')
const handleSearch = () => {
  message.info('搜索: ' + searchText.value)
}

// 表格密度
const tableSize = ref('default')
const handleSizeChange = ({ key }) => {
  tableSize.value = key
}

// 刷新
const handleRefresh = () => {
  message.success('刷新成功')
}

// 表格列配置
const columns = [
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 120, align: 'center' },
  { title: '名称', dataIndex: 'name', key: 'name', width: 140, align: 'center' },
  { title: 'LOGO', dataIndex: 'logo', key: 'logo', width: 100, align: 'center' },
  { title: '链接', dataIndex: 'link', key: 'link', width: 160, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80, align: 'center' },
  {
    title: '工作时间区间',
    children: [
      { title: '开始', dataIndex: 'startTime', key: 'startTime', width: 80, align: 'center' },
      { title: '结束', dataIndex: 'endTime', key: 'endTime', width: 80, align: 'center' }
    ]
  },
  { title: '时间', dataIndex: 'time', key: 'time', width: 110, align: 'center' },
  { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right' }
]

// 表格数据
const tableData = ref([
  { id: 1, remark: '在线客服', name: 'Online Service', logo: 'https://picsum.photos/50/50?random=1', link: 'https://#', status: false, sort: 1, startTime: '08:00', endTime: '22:00', time: '09/20 07:58' },
  { id: 2, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=2', link: 'https://wa.me/19843799644', status: false, sort: 3, startTime: '09:00', endTime: '21:00', time: '02/10 11:12' },
  { id: 3, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=3', link: 'https://wa.me/16177569088', status: false, sort: 1, startTime: '09:00', endTime: '21:00', time: '02/15 16:12' },
  { id: 4, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=4', link: 'https://wa.me/12136463329', status: false, sort: 6, startTime: '09:00', endTime: '21:00', time: '05/05 16:18' },
  { id: 5, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=5', link: 'https://wa.me/12087606010', status: true, sort: 2, startTime: '09:00', endTime: '21:00', time: '05/21 11:59' },
  { id: 6, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=6', link: 'https://wa.me/16192473660', status: false, sort: 10, startTime: '09:00', endTime: '21:00', time: '05/22 14:43' },
  { id: 7, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=7', link: 'https://wa.me/12064231484', status: false, sort: 4, startTime: '09:00', endTime: '21:00', time: '06/08 11:11' },
  { id: 8, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=8', link: 'https://wa.me/12136755444', status: false, sort: 9, startTime: '09:00', endTime: '21:00', time: '06/08 12:11' },
  { id: 9, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=9', link: 'https://wa.me/16192473660', status: true, sort: 21, startTime: '09:00', endTime: '21:00', time: '06/11 16:29' },
  { id: 10, remark: 'Kinex Media CS', name: 'Kinex Media CS (WhatsApp)', logo: 'https://picsum.photos/50/50?random=10', link: 'https://wa.me/14103654688', status: false, sort: 5, startTime: '09:00', endTime: '21:00', time: '06/13 10:11' }
])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 抽屉
const drawerVisible = ref(false)
const isEdit = ref(false)
const formData = reactive({
  id: null,
  remark: '',
  name: '',
  logo: '',
  link: '',
  sort: '1',
  startTime: '08:00',
  endTime: '22:00',
  status: true
})

// 添加
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  drawerVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  formData.id = record.id
  formData.remark = record.remark
  formData.name = record.name
  formData.logo = record.logo
  formData.link = record.link
  formData.sort = String(record.sort)
  formData.startTime = record.startTime || '08:00'
  formData.endTime = record.endTime || '22:00'
  formData.status = record.status
  drawerVisible.value = true
}

// 删除确认
const handleDeleteConfirm = (record) => {
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
    message.success('删除成功')
  }
}

// 抽屉确认
const handleDrawerOk = () => {
  if (!formData.name || !formData.link) {
    message.warning('请填写完整信息')
    return
  }

  if (isEdit.value) {
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        remark: formData.remark,
        name: formData.name,
        logo: formData.logo,
        link: formData.link,
        sort: parseInt(formData.sort) || 1,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status
      }
      message.success('编辑成功')
    }
  } else {
    tableData.value.push({
      id: Date.now(),
      remark: formData.remark,
      name: formData.name,
      logo: formData.logo || 'https://picsum.photos/50/50?random=' + Date.now(),
      link: formData.link,
      sort: parseInt(formData.sort) || 1,
      startTime: formData.startTime || '08:00',
      endTime: formData.endTime || '22:00',
      status: formData.status,
      time: dayjs().format('MM/DD HH:mm')
    })
    message.success('添加成功')
  }

  drawerVisible.value = false
  resetForm()
}

// 抽屉取消
const handleDrawerCancel = () => {
  drawerVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.remark = ''
  formData.name = ''
  formData.logo = ''
  formData.link = ''
  formData.sort = '1'
  formData.startTime = '08:00'
  formData.endTime = '22:00'
  formData.status = true
}

// LOGO上传
const handleLogoUpload = (info) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.logo = e.target.result
  }
  reader.readAsDataURL(file)
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 16px;

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

    .ant-spin-nested-loading,
    .ant-spin-container,
    .ant-table,
    .ant-table-container {
      height: 100%;
    }

    .ant-table-body {
      overflow-y: auto !important;
    }
  }
}

.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  position: sticky;
  bottom: 0;
  background: #fff;

  .total-text {
    font-size: 14px;
    color: #666;
  }
}

// LOGO单元格 - 加大
.logo-cell {
  display: flex;
  justify-content: center;
  align-items: center;

  .logo-img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }
}

// 链接样式
.link-text {
  color: #1890ff;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
}

// 操作链接
.action-link {
  color: #1890ff;
  cursor: pointer;
  margin-right: 12px;

  &:hover {
    text-decoration: underline;
  }

  &.danger {
    color: #ff4d4f;
  }

  &:last-child {
    margin-right: 0;
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

// 表头字体颜色黑色
:deep(.ant-table) {
  .ant-table-thead > tr > th {
    color: #333;
    font-weight: 500;
  }
}

// 抽屉表单
.drawer-form {
  // LOGO 上传区域
  .logo-upload-area {
    margin-bottom: 24px;

    .logo-upload-trigger {
      width: 100px;
      height: 100px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.3s;

      &:hover {
        border-color: #1890ff;
      }

      .trigger-icon {
        font-size: 24px;
        color: #999;
      }

      .trigger-text {
        margin-top: 8px;
        font-size: 14px;
        color: #999;
      }
    }

    .logo-preview-box {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      border: 1px solid #e8e8e8;

      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .logo-actions {
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
        gap: 4px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .logo-actions {
        opacity: 1;
      }
    }
  }

  // 表单行
  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    &.three-cols .form-col {
      flex: 1;
    }

    &.two-cols .form-col {
      // 与三列布局的前两列对齐
      flex: 0 0 calc((100% - 32px) / 3);
    }
  }

  .form-col {
    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;

      .required {
        color: #ff4d4f;
        margin-right: 4px;
      }
    }

    :deep(.ant-input) {
      height: 40px;
      border-radius: 4px;
    }
  }

  // 开关盒子
  .switch-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 11px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    font-size: 14px;
    color: #333;
  }

  // 区块标题
  .section-header {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
}
</style>
