<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">{{ $t('admin.title') }}</span>
        <a-button type="primary" @click="openDrawer">
          <plus-outlined /> {{ $t('admin.addAdmin') }}
        </a-button>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          :placeholder="$t('filter.keyword')"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="showMoreSearch = !showMoreSearch">
          {{ $t('common.moreSearch') }}
        </a-button>
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? $t('common.exitFullscreen') : $t('common.fullscreen')">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip :title="$t('common.refresh')">
          <a-button class="icon-btn" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown>
          <a-tooltip :title="$t('density.density')">
            <a-button class="icon-btn">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleDensityChange">
              <a-menu-item key="default" :class="{ 'active-density': tableSize === 'default' }">
                {{ $t('density.default') }}
              </a-menu-item>
              <a-menu-item key="middle" :class="{ 'active-density': tableSize === 'middle' }">
                {{ $t('density.middle') }}
              </a-menu-item>
              <a-menu-item key="small" :class="{ 'active-density': tableSize === 'small' }">
                {{ $t('density.small') }}
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
        :scroll="{ x: 1000, y: 'calc(100vh - 220px)' }"
        table-layout="fixed"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'" class="status-tag">
              {{ record.status === 1 ? $t('admin.normal') : $t('admin.disabled') }}
            </a-tag>
          </template>
          <template v-if="column.key === 'currentLoginIp'">
            <template v-if="record.currentLoginIp && record.currentLoginIp !== '-'">
              <a-popover
                v-model:open="record.ipPopoverVisible"
                trigger="click"
                placement="top"
                :arrow="{ pointAtCenter: true }"
              >
                <template #content>
                  <div class="ip-popover-content">
                    <div class="ip-info-item">
                      <span class="label">{{ $t('log.ipAddress') }}：</span>
                      <span class="value">{{ ipModal.ip }}</span>
                    </div>
                    <div class="ip-info-item">
                      <span class="label">{{ $t('log.location') }}：</span>
                      <span class="value">{{ ipModal.location }}</span>
                    </div>
                    <div class="ip-info-item">
                      <span class="label">{{ $t('log.isp') }}：</span>
                      <span class="value">{{ ipModal.isp }}</span>
                    </div>
                  </div>
                </template>
                <a class="ip-link" @click="handleIpClick(record)">{{ record.currentLoginIp }}</a>
              </a-popover>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
          <template v-if="column.key === 'loginStatus'">
            <a-tag :color="record.loginStatus === '在线' ? 'processing' : 'error'" class="status-tag">
              <span :class="['status-dot', record.loginStatus === '在线' ? 'dot-online' : 'dot-offline']"></span>
              {{ record.loginStatus === '在线' ? $t('admin.online') : $t('admin.offline') }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'loginTime'">
            <span class="time-text">{{ record.loginTime }}</span>
          </template>
          <template v-if="column.dataIndex === 'createTime'">
            <span class="time-text">{{ record.createTime }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <a class="action-link" @click="handleEdit(record)">{{ $t('common.edit') }}</a>
              <a class="action-link" @click="openPermissionDrawer(record)">{{ $t('admin.permissionManage') }}</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 底部分页 -->
    <div class="page-footer">
      <span class="total-text">{{ $t('common.total') }}: {{ pagination.total }}/{{ $t('common.records') }}</span>
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-quick-jumper="true"
        size="small"
      />
    </div>

    <!-- 添加/编辑管理员抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="isEdit ? $t('admin.editAdmin') : $t('admin.createAdmin')"
      placement="right"
      :width="480"
      class="admin-drawer"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button @click="closeDrawer">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? $t('common.save') : $t('common.confirm') }}
          </a-button>
        </a-space>
      </template>
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        layout="vertical"
        class="admin-form"
      >
        <!-- 谷歌验证器秘钥 -->
        <div class="form-section">
          <a-button type="primary" ghost class="secret-btn" @click="generateSecret">
            <key-outlined /> {{ $t('admin.createGoogleSecret') }}
          </a-button>

          <!-- 二维码展示区域 -->
          <div v-if="formState.googleAuth" class="qrcode-section">
            <div class="qrcode-wrapper">
              <qrcode-vue
                :value="googleAuthUrl"
                :size="160"
                level="M"
              />
            </div>
            <div class="qrcode-info">
              <p class="qrcode-tip">{{ $t('admin.scanQrcode') }}</p>
              <div class="secret-display">
                <span class="secret-label">秘钥：</span>
                <span class="secret-value">{{ formState.googleAuth }}</span>
                <a-button type="link" size="small" @click="copySecret">
                  <copy-outlined /> 复制
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号 -->
        <a-form-item label="账号" name="username" required>
          <a-input
            v-model:value="formState.username"
            placeholder="请输入管理员账号"
            :prefix="h(UserOutlined)"
            size="large"
          />
        </a-form-item>

        <!-- 密码 -->
        <a-form-item label="密码" name="password" :required="!isEdit">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
            :prefix="h(LockOutlined)"
            size="large"
          />
        </a-form-item>

        <!-- 启动账户 -->
        <a-form-item label="启动账户" name="status">
          <div class="switch-row">
            <span class="switch-label">开关</span>
            <a-switch v-model:checked="formState.status" />
          </div>
        </a-form-item>

        <!-- 谷歌验证器 -->
        <a-form-item label="谷歌验证器(选填)" name="googleAuth">
          <a-input
            v-model:value="formState.googleAuth"
            placeholder="请输入谷歌验证器秘钥"
            :prefix="h(SafetyOutlined)"
            size="large"
          />
        </a-form-item>

        <!-- 指定IP登录 -->
        <a-form-item label="指定IP登录(选填)" name="allowIp">
          <a-input
            v-model:value="formState.allowIp"
            placeholder="多个IP用逗号分隔"
            :prefix="h(GlobalOutlined)"
            size="large"
          />
        </a-form-item>

        <!-- 备注 -->
        <a-form-item label="备注(选填)" name="remark">
          <a-textarea
            v-model:value="formState.remark"
            placeholder="请输入备注信息"
            :rows="4"
            show-count
            :maxlength="200"
          />
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- 权限管理抽屉 -->
    <a-drawer
      v-model:open="permissionDrawerVisible"
      :title="`${$t('admin.permissionManage')}-${currentAdmin?.username || ''}`"
      placement="right"
      :width="360"
      class="permission-drawer"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button @click="permissionDrawerVisible = false">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="permissionLoading" @click="savePermission">
            {{ $t('common.save') }}
          </a-button>
        </a-space>
      </template>
      <div class="permission-content">
        <!-- 全选 -->
        <div class="select-all-row">
          <a-checkbox
            v-model:checked="selectAll"
            :indeterminate="indeterminate"
            @change="onSelectAllChange"
          >
            全选
          </a-checkbox>
        </div>

        <!-- 权限树 -->
        <a-tree
          v-model:checkedKeys="checkedKeys"
          :tree-data="permissionTreeData"
          checkable
          default-expand-all
          :selectable="false"
          @check="onPermissionCheck"
        >
          <template #title="{ title, icon }">
            <span class="tree-node-title">
              <component :is="icon" v-if="icon" class="tree-icon" />
              {{ title }}
            </span>
          </template>
        </a-tree>
      </div>
    </a-drawer>

    <!-- 筛选抽屉 -->
    <a-drawer
      v-model:open="showMoreSearch"
      :title="$t('common.filter')"
      placement="right"
      :width="380"
      class="filter-drawer"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="resetFilter">{{ $t('common.reset') }}</a-button>
          <a-button type="primary" @click="submitFilter">{{ $t('common.submit') }}</a-button>
        </a-space>
      </template>
      <a-form layout="vertical" class="filter-form">
        <a-form-item :label="$t('admin.account')">
          <a-input v-model:value="filterForm.username" :placeholder="$t('common.pleaseInput')" />
        </a-form-item>
        <a-form-item :label="$t('admin.googleAuth')">
          <a-input v-model:value="filterForm.googleAuth" :placeholder="$t('common.pleaseInput')" />
        </a-form-item>
        <a-form-item :label="$t('common.status')">
          <a-select v-model:value="filterForm.status" :placeholder="$t('common.all')">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="frozen">{{ $t('admin.disabled') }}</a-select-option>
            <a-select-option value="active">{{ $t('common.enable') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('filter.startTime')" class="date-picker-item">
          <a-date-picker
            v-model:value="filterForm.startTime"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
            size="large"
          />
        </a-form-item>
        <a-form-item :label="$t('filter.endTime')" class="date-picker-item">
          <a-date-picker
            v-model:value="filterForm.endTime"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
            size="large"
          />
        </a-form-item>
        <a-form-item :label="$t('common.search')">
          <a-input v-model:value="filterForm.keyword" :placeholder="$t('filter.keyword')">
            <template #suffix>
              <search-outlined style="color: #bfbfbf" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :label="$t('filter.sortField')">
          <a-select v-model:value="filterForm.sortField" :placeholder="$t('common.createTime')">
            <a-select-option value="createTime">{{ $t('common.createTime') }}</a-select-option>
            <a-select-option value="loginTime">{{ $t('admin.loginTime') }}</a-select-option>
            <a-select-option value="username">{{ $t('admin.account') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('filter.sortType')">
          <a-select v-model:value="filterForm.sortType" :placeholder="$t('filter.descending')">
            <a-select-option value="">{{ $t('common.all') }}</a-select-option>
            <a-select-option value="desc">{{ $t('filter.descending') }}</a-select-option>
            <a-select-option value="asc">{{ $t('filter.ascending') }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, h, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import QrcodeVue from 'qrcode.vue'
import {
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  GlobalOutlined,
  KeyOutlined,
  CopyOutlined,
  HomeOutlined,
  TeamOutlined,
  CrownOutlined,
  TransactionOutlined,
  ShopOutlined,
  SettingOutlined,
  MessageOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CommentOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const showMoreSearch = ref(false)
const searchText = ref('')
const tableSize = ref('middle')
const drawerVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)
const { t } = useI18n()

// 筛选表单
const filterForm = reactive({
  username: '',
  googleAuth: '',
  status: '',
  startTime: null,
  endTime: null,
  keyword: '',
  sortField: 'createTime',
  sortType: 'desc'
})

// 重置筛选
const resetFilter = () => {
  filterForm.username = ''
  filterForm.googleAuth = ''
  filterForm.status = ''
  filterForm.startTime = null
  filterForm.endTime = null
  filterForm.keyword = ''
  filterForm.sortField = 'createTime'
  filterForm.sortType = 'desc'
}

// 提交筛选
const submitFilter = () => {
  console.log('筛选条件:', filterForm)
  message.success('筛选条件已应用')
  showMoreSearch.value = false
}

// 权限管理相关
const permissionDrawerVisible = ref(false)
const permissionLoading = ref(false)
const currentAdmin = ref(null)
const checkedKeys = ref([])
const selectAll = ref(false)
const indeterminate = ref(false)

const setCollapsed = inject('setCollapsed', null)
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

// 权限树数据
const permissionTreeData = [
  {
    title: '首页',
    key: 'home',
    icon: HomeOutlined
  },
  {
    title: '账户管理',
    key: 'account',
    icon: TeamOutlined,
    children: [
      { title: '管理员', key: 'account-admin' },
      { title: '会员列表', key: 'account-member' },
      { title: '在线管理', key: 'account-online' },
      { title: '身份认证', key: 'account-auth' },
      { title: '层级查询', key: 'account-level' }
    ]
  },
  {
    title: '等级设置',
    key: 'vip',
    icon: CrownOutlined
  },
  {
    title: '交易管理',
    key: 'trade',
    icon: TransactionOutlined,
    children: [
      { title: '订单列表', key: 'trade-order' },
      { title: '提现管理', key: 'trade-withdraw' },
      { title: '后台充值记录', key: 'trade-recharge' },
      { title: '充币订单', key: 'trade-crypto' },
      { title: '法币转账充值', key: 'trade-fiat' }
    ]
  },
  {
    title: '商品管理',
    key: 'shop',
    icon: ShopOutlined,
    children: [
      { title: '分类管理', key: 'shop-category' },
      { title: '商品列表', key: 'shop-goods' }
    ]
  },
  {
    title: '系统管理',
    key: 'system',
    icon: SettingOutlined,
    children: [
      { title: '系统设置', key: 'system-setting' },
      { title: '层级设置', key: 'system-level' },
      { title: '在线客服', key: 'system-service' },
      { title: '发送日志', key: 'system-log' }
    ]
  },
  {
    title: '消息',
    key: 'message',
    icon: MessageOutlined,
    children: [
      { title: '公告', key: 'message-notice' },
      { title: '站内信', key: 'message-inbox' },
      { title: '系统通知', key: 'message-system' }
    ]
  },
  {
    title: '前端展示',
    key: 'display',
    icon: AppstoreOutlined,
    children: [
      { title: '轮播图', key: 'display-banner' },
      { title: '宫格列表', key: 'display-grid' }
    ]
  },
  {
    title: '文章管理',
    key: 'article',
    icon: FileTextOutlined
  },
  {
    title: '评论',
    key: 'comment',
    icon: CommentOutlined
  }
]

// 获取所有叶子节点的 key
const getAllLeafKeys = (data) => {
  let keys = []
  data.forEach(item => {
    if (item.children && item.children.length > 0) {
      keys = keys.concat(getAllLeafKeys(item.children))
    } else {
      keys.push(item.key)
    }
  })
  return keys
}

const allKeys = getAllLeafKeys(permissionTreeData)

// 打开权限抽屉
const openPermissionDrawer = (record) => {
  currentAdmin.value = record
  // 模拟加载该管理员的权限（实际项目从后端获取）
  checkedKeys.value = record.permissions || [...allKeys] // 默认全选
  permissionDrawerVisible.value = true
}

// 监听 checkedKeys 变化，更新全选状态
watch(checkedKeys, (val) => {
  const checkedCount = val.length
  const totalCount = allKeys.length
  selectAll.value = checkedCount === totalCount
  indeterminate.value = checkedCount > 0 && checkedCount < totalCount
}, { immediate: true })

// 全选/取消全选
const onSelectAllChange = (e) => {
  if (e.target.checked) {
    checkedKeys.value = [...allKeys]
  } else {
    checkedKeys.value = []
  }
  indeterminate.value = false
}

// 权限树选中变化
const onPermissionCheck = (checked) => {
  checkedKeys.value = checked
}

// 保存权限
const savePermission = () => {
  permissionLoading.value = true
  setTimeout(() => {
    permissionLoading.value = false
    message.success('权限保存成功')
    permissionDrawerVisible.value = false
  }, 500)
}

// 表单数据
const formState = reactive({
  username: '',
  password: '',
  status: true,
  googleAuth: '',
  allowIp: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 打开抽屉 - 新增
const openDrawer = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  drawerVisible.value = true
}

// 打开抽屉 - 编辑
const handleEdit = (record) => {
  isEdit.value = true
  editingId.value = record.id
  formState.username = record.username
  formState.password = ''
  formState.status = record.status === 1
  formState.googleAuth = record.googleAuth || ''
  formState.allowIp = record.ip !== '-' ? record.ip : ''
  formState.remark = record.remark !== '-' ? record.remark : ''
  drawerVisible.value = true
}

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formState.username = ''
  formState.password = ''
  formState.status = true
  formState.googleAuth = ''
  formState.allowIp = ''
  formState.remark = ''
  formRef.value?.resetFields()
}

// 生成谷歌验证器秘钥
const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formState.googleAuth = secret
  message.success('秘钥已生成')
}

// 谷歌验证器 URL（用于生成二维码）
const googleAuthUrl = computed(() => {
  if (!formState.googleAuth) return ''
  const issuer = 'AdminSystem'
  const account = formState.username || 'admin'
  return `otpauth://totp/${issuer}:${account}?secret=${formState.googleAuth}&issuer=${issuer}`
})

// 复制秘钥
const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(formState.googleAuth)
    message.success('秘钥已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动复制')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validateFields()
    submitLoading.value = true

    // 模拟提交
    setTimeout(() => {
      submitLoading.value = false
      message.success(isEdit.value ? '修改成功' : '创建成功')
      closeDrawer()
    }, 500)
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const columns = computed(() => [
  { title: t('admin.account'), dataIndex: 'username', key: 'username', align: 'center' },
  { title: t('admin.status'), dataIndex: 'status', key: 'status', align: 'center' },
  { title: t('admin.designatedIp'), dataIndex: 'ip', key: 'ip', align: 'center' },
  { title: t('admin.currentLoginIp'), dataIndex: 'currentLoginIp', key: 'currentLoginIp', align: 'center' },
  { title: t('admin.loginStatus'), dataIndex: 'loginStatus', key: 'loginStatus', align: 'center' },
  { title: t('admin.loginTime'), dataIndex: 'loginTime', key: 'loginTime', align: 'center' },
  { title: t('admin.createTime'), dataIndex: 'createTime', key: 'createTime', align: 'center' },
  { title: t('admin.remark'), dataIndex: 'remark', key: 'remark', align: 'center' },
  { title: t('common.operation'), key: 'action', align: 'center' }
])

const tableData = ref([
  { id: 1, username: '山鬼', status: 1, ip: '-', currentLoginIp: '192.168.1.100', loginStatus: '在线', loginTime: '2025-07-21 08:45', createTime: '06/27 12:01', remark: '-' },
  { id: 2, username: '河神', status: 1, ip: '-', currentLoginIp: '67.170.145.182', loginStatus: '在线', loginTime: '2025-08-17 18:30', createTime: '06/23 09:21', remark: '-' },
  { id: 3, username: '阿赖', status: 1, ip: '-', currentLoginIp: '104.28.39.14', loginStatus: '在线', loginTime: '2025-07-23 18:48', createTime: '05/25 13:15', remark: '-' },
  { id: 4, username: '成龙', status: 1, ip: '-', currentLoginIp: '68.202.239.125', loginStatus: '在线', loginTime: '2025-07-20 17:28', createTime: '05/25 13:14', remark: '-' },
  { id: 5, username: '小胡', status: 1, ip: '-', currentLoginIp: '107.77.199.91', loginStatus: '在线', loginTime: '2025-08-01 10:19', createTime: '05/25 13:14', remark: '-' },
  { id: 6, username: '阿辉', status: 1, ip: '-', currentLoginIp: '99.92.94.175', loginStatus: '离线', loginTime: '2025-07-23 17:37', createTime: '05/25 13:14', remark: '-' },
  { id: 7, username: '阿柒', status: 1, ip: '-', currentLoginIp: '134.122.34.218', loginStatus: '在线', loginTime: '2025-06-16 11:37', createTime: '05/25 13:13', remark: '-' },
  { id: 8, username: '阿淼', status: 1, ip: '-', currentLoginIp: '166.194.204.13', loginStatus: '在线', loginTime: '2025-07-23 21:03', createTime: '05/25 13:13', remark: '-' },
  { id: 9, username: '阿福', status: 1, ip: '-', currentLoginIp: '104.2.53.119', loginStatus: '在线', loginTime: '2025-07-19 18:50', createTime: '05/25 13:13', remark: '-' },
  { id: 10, username: '弈龙', status: 1, ip: '-', currentLoginIp: '174.245.17.78', loginStatus: '在线', loginTime: '2025-07-31 11:38', createTime: '05/17 16:41', remark: '-' },
  { id: 11, username: '苍龙', status: 1, ip: '-', currentLoginIp: '98.24.22.138', loginStatus: '在线', loginTime: '2025-11-18 22:10', createTime: '05/17 16:41', remark: '-' },
  { id: 12, username: '青龙', status: 1, ip: '-', currentLoginIp: '75.141.152.135', loginStatus: '在线', loginTime: '2025-08-14 08:49', createTime: '05/17 16:40', remark: '-' },
  { id: 13, username: '高阳', status: 1, ip: '-', currentLoginIp: '128.14.78.178', loginStatus: '在线', loginTime: '2025-07-29 09:47', createTime: '04/28 17:46', remark: '-' },
  { id: 14, username: '雷龙', status: 1, ip: '-', currentLoginIp: '175.100.59.110', loginStatus: '在线', loginTime: '2025-12-08 08:51', createTime: '04/28 17:45', remark: '-' },
  { id: 15, username: '白泽', status: 1, ip: '-', currentLoginIp: '36.37.253.114', loginStatus: '在线', loginTime: '2025-11-08 09:36', createTime: '04/28 17:44', remark: '-' },
  { id: 16, username: '测试', status: 1, ip: '-', currentLoginIp: '-', loginStatus: '离线', loginTime: '2025-04-27 11:43', createTime: '04/27 11:43', remark: '-' },
  { id: 17, username: '小陆', status: 1, ip: '-', currentLoginIp: '146.70.24.106', loginStatus: '在线', loginTime: '2025-12-09 02:42', createTime: '04/20 16:51', remark: '-' },
  { id: 18, username: '黑龙', status: 1, ip: '-', currentLoginIp: '172.56.103.10', loginStatus: '在线', loginTime: '2025-05-23 13:03', createTime: '04/04 16:08', remark: '-' },
  { id: 19, username: '达鑫', status: 1, ip: '-', currentLoginIp: '174.200.121.156', loginStatus: '在线', loginTime: '2025-12-05 12:45', createTime: '04/04 16:06', remark: '-' },
  { id: 20, username: '杨一', status: 1, ip: '-', currentLoginIp: '108.249.177.162', loginStatus: '在线', loginTime: '2025-09-28 08:54', createTime: '03/30 18:24', remark: '-' },
  { id: 21, username: '金凤', status: 1, ip: '-', currentLoginIp: '45.67.89.123', loginStatus: '在线', loginTime: '2025-10-15 14:22', createTime: '03/25 10:15', remark: '-' },
  { id: 22, username: '银龙', status: 1, ip: '-', currentLoginIp: '78.90.12.34', loginStatus: '离线', loginTime: '2025-09-20 16:45', createTime: '03/20 09:30', remark: '-' },
  { id: 23, username: '玄武', status: 1, ip: '-', currentLoginIp: '123.45.67.89', loginStatus: '在线', loginTime: '2025-11-05 11:30', createTime: '03/15 14:20', remark: '-' },
  { id: 24, username: '朱雀', status: 1, ip: '-', currentLoginIp: '89.12.34.56', loginStatus: '在线', loginTime: '2025-10-28 09:15', createTime: '03/10 16:45', remark: '-' },
  { id: 25, username: '麒麟', status: 1, ip: '-', currentLoginIp: '56.78.90.12', loginStatus: '离线', loginTime: '2025-08-30 18:20', createTime: '03/05 11:30', remark: '-' },
  { id: 26, username: '凤凰', status: 1, ip: '-', currentLoginIp: '34.56.78.90', loginStatus: '在线', loginTime: '2025-12-01 10:45', createTime: '02/28 15:25', remark: '-' },
  { id: 27, username: '神龟', status: 1, ip: '-', currentLoginIp: '90.12.34.56', loginStatus: '在线', loginTime: '2025-11-22 13:55', createTime: '02/23 08:40', remark: '-' },
  { id: 28, username: '飞虎', status: 1, ip: '-', currentLoginIp: '67.89.01.23', loginStatus: '离线', loginTime: '2025-10-10 17:30', createTime: '02/18 12:15', remark: '-' },
  { id: 29, username: '战狼', status: 1, ip: '-', currentLoginIp: '12.34.56.78', loginStatus: '在线', loginTime: '2025-12-10 08:20', createTime: '02/13 09:50', remark: '-' },
  { id: 30, username: '雄鹰', status: 1, ip: '-', currentLoginIp: '23.45.67.89', loginStatus: '在线', loginTime: '2025-11-28 15:40', createTime: '02/08 14:35', remark: '-' },
  { id: 31, username: '猛虎', status: 1, ip: '-', currentLoginIp: '78.90.12.34', loginStatus: '在线', loginTime: '2025-10-05 12:25', createTime: '02/03 10:20', remark: '-' },
  { id: 32, username: '蛟龙', status: 1, ip: '-', currentLoginIp: '45.67.89.01', loginStatus: '离线', loginTime: '2025-09-15 19:10', createTime: '01/29 16:45', remark: '-' },
  { id: 33, username: '神鹰', status: 1, ip: '-', currentLoginIp: '89.01.23.45', loginStatus: '在线', loginTime: '2025-12-05 11:35', createTime: '01/24 11:30', remark: '-' },
  { id: 34, username: '烈焰', status: 1, ip: '-', currentLoginIp: '56.78.90.12', loginStatus: '在线', loginTime: '2025-11-18 14:50', createTime: '01/19 08:55', remark: '-' },
  { id: 35, username: '寒冰', status: 1, ip: '-', currentLoginIp: '34.56.78.90', loginStatus: '离线', loginTime: '2025-10-22 16:40', createTime: '01/14 13:40', remark: '-' },
  { id: 36, username: '雷霆', status: 1, ip: '-', currentLoginIp: '90.12.34.56', loginStatus: '在线', loginTime: '2025-12-08 09:25', createTime: '01/09 15:15', remark: '-' },
  { id: 37, username: '暴风', status: 1, ip: '-', currentLoginIp: '67.89.01.23', loginStatus: '在线', loginTime: '2025-11-25 17:55', createTime: '01/04 10:50', remark: '-' },
  { id: 38, username: '烈日', status: 1, ip: '-', currentLoginIp: '12.34.56.78', loginStatus: '离线', loginTime: '2025-09-30 13:15', createTime: '12/30 12:25', remark: '-' },
  { id: 39, username: '明月', status: 1, ip: '-', currentLoginIp: '23.45.67.89', loginStatus: '在线', loginTime: '2025-12-12 10:30', createTime: '12/25 09:10', remark: '-' },
  { id: 40, username: '星辰', status: 1, ip: '-', currentLoginIp: '78.90.12.34', loginStatus: '在线', loginTime: '2025-11-30 15:45', createTime: '12/20 14:55', remark: '-' }
])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 40
})

// IP归属地气泡卡片数据
const ipModal = reactive({
  ip: '',
  location: '',
  isp: ''
})

// 点击 IP 查询归属地
const handleIpClick = async (record) => {
  // 关闭其他行的popover
  tableData.value.forEach(item => {
    if (item.id !== record.id) {
      item.ipPopoverVisible = false
    }
  })

  // 设置加载状态
  ipModal.ip = record.currentLoginIp
  ipModal.location = '查询中...'
  ipModal.isp = '查询中...'
  record.ipPopoverVisible = true

  try {
    // 使用 ip-api.com 免费API实时查询IP归属地（简体中文）
    const response = await fetch(`http://ip-api.com/json/${record.currentLoginIp}?lang=zh-CN`)
    const data = await response.json()

    if (data.status === 'success') {
      // 拼接地区信息
      const location = [data.country, data.regionName, data.city]
        .filter(Boolean)
        .join(' ')
      ipModal.location = location || '未知地区'
      ipModal.isp = data.isp || data.org || '未知运营商'
    } else {
      ipModal.location = data.message || '无法查询'
      ipModal.isp = '不适用'
    }
  } catch (error) {
    console.error('IP查询失败:', error)
    ipModal.location = '查询失败'
    ipModal.isp = '网络错误'
  }
}

const onSearch = (value) => {
  console.log('搜索', value)
}

const onPageChange = (page) => {
  pagination.current = page
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleDensityChange = ({ key }) => {
  tableSize.value = key
}
</script>

<style scoped lang="less">
.page-container {
  padding: 16px 0 0 0;
  background: #fff;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 0 24px;

    :deep(.ant-table-wrapper) {
      height: 100%;

      .ant-spin-nested-loading,
      .ant-spin-container {
        height: 100%;
      }

      .ant-table {
        height: 100%;

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
  }

  .page-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 12px 24px;
    height: 48px;
    border-top: 1px solid #f0f0f0;
    background: #fff;

    .total-text {
      margin-right: 16px;
      color: #666;
      font-size: 14px;
    }
  }

  .status-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.dot-online {
        background-color: #1890ff;
        animation: pulse 1.5s infinite;
      }

      &.dot-offline {
        background-color: #ff4d4f;
      }
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(24, 144, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
    }
  }

  .action-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .action-link {
    color: #1890ff;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: #40a9ff;
    }
  }

  .time-text {
    display: inline-block;
    word-break: break-word;
    white-space: normal;
    line-height: 1.5;
  }

  .time-cell {
    word-break: break-all;
    white-space: normal;
    line-height: 1.5;
  }

  :deep(.time-cell) {
    word-break: break-all;
    white-space: normal;
    line-height: 1.5;
  }

  :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 16px 12px;
    }

    .ant-table-thead > tr > th {
      background: #fafafa;
    }

    .ant-table-tbody > tr > td.time-cell {
      word-break: break-all;
      white-space: normal !important;
      line-height: 1.5;
    }
  }

  &.size-default :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 20px 16px;
    }
  }

  &.size-middle :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 16px 12px;
    }
  }

  &.size-small :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 14px 12px;
    }
  }
}

:deep(.active-density) {
  color: #1890ff;
  background-color: #e6f7ff;
}

/* 抽屉表单样式 */
.admin-form {
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px dashed #e8e8e8;
  }

  .secret-btn {
    width: 100%;
    height: 44px;
    font-size: 14px;
    border-radius: 8px;
    border-style: dashed;
  }

  .qrcode-section {
    margin-top: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    text-align: center;

    .qrcode-wrapper {
      display: inline-block;
      padding: 12px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .qrcode-info {
      margin-top: 16px;

      .qrcode-tip {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: #666;
      }

      .secret-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        background: #fff;
        border-radius: 8px;
        border: 1px dashed #d9d9d9;

        .secret-label {
          color: #999;
          font-size: 13px;
        }

        .secret-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #1890ff;
          letter-spacing: 1px;
        }
      }
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 20px;

    .ant-form-item-label > label {
      font-weight: 500;
      color: #333;
    }

    .ant-input-lg,
    .ant-input-password-large .ant-input {
      border-radius: 8px;
    }

    .ant-input-affix-wrapper-lg {
      border-radius: 8px;
      padding: 8px 12px;
    }

    .ant-input-textarea {
      .ant-input {
        border-radius: 8px;
      }
    }
  }

  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e8e8e8;

    .switch-label {
      color: #666;
      font-size: 14px;
    }
  }
}

:deep(.admin-drawer) {
  .ant-drawer-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .ant-drawer-body {
    padding: 24px;
    background: #fff;
  }

  .ant-drawer-close {
    padding: 20px;
  }
}

/* 权限管理抽屉样式 */
.permission-content {

  .select-all-row {
    padding: 6px 0;
    margin-bottom: 4px;
    border-bottom: 1px solid #f0f0f0;

    :deep(.ant-checkbox-wrapper) {
      font-weight: 500;
      font-size: 13px;
    }
  }

  :deep(.ant-tree) {
    .ant-tree-treenode {
      padding: 2px 0;
      width: 100%;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .ant-tree-node-content-wrapper {
      flex: 1;

      &:hover {
        background-color: transparent;
      }
    }

    .ant-tree-checkbox {
      margin-right: 6px;
    }

    .tree-node-title {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #333;

      .tree-icon {
        font-size: 14px;
        color: #1890ff;
      }
    }

    // 父节点样式
    .ant-tree-treenode-switcher-open,
    .ant-tree-treenode-switcher-close {
      > .ant-tree-node-content-wrapper > .ant-tree-title .tree-node-title {
        font-weight: 500;
      }
    }

    // 子节点缩进
    .ant-tree-indent-unit {
      width: 20px;
    }

    .ant-tree-switcher {
      width: 20px;
    }
  }
}

:deep(.permission-drawer) {
  .ant-drawer-header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .ant-drawer-body {
    padding: 12px 16px;
    background: #fff;
  }
}

/* 筛选抽屉样式 */
.filter-form {
  :deep(.ant-form-item) {
    margin-bottom: 16px;

    .ant-form-item-label > label {
      font-size: 13px;
      color: #333;
    }

    .ant-input,
    .ant-select-selector,
    .ant-picker {
      border-radius: 6px;
    }
  }

  .date-picker-item {
    :deep(.ant-picker) {
      height: 44px;

      .ant-picker-input > input {
        font-size: 14px;
      }
    }
  }
}

:deep(.filter-drawer) {
  .ant-drawer-header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .ant-drawer-body {
    padding: 16px;
    background: #fff;
  }
}

// IP链接样式
.ip-link {
  color: #1890ff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

// IP归属地气泡卡片样式
.ip-popover-content {
  min-width: 200px;

  .ip-info-item {
    display: flex;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 70px;
      color: #666;
      flex-shrink: 0;
      font-size: 13px;
    }

    .value {
      color: #333;
      font-weight: 500;
      font-size: 13px;
    }
  }
}
</style>
