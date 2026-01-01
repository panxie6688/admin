<template>
  <div class="level-container">
    <!-- 页面标题 -->
    <div class="page-title">层级管理</div>

    <div class="level-content">
      <!-- 左侧：层级列表 -->
      <div class="level-left">
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">层级列表</span>
            <a-button type="primary" danger @click="handleRemove">移除</a-button>
          </div>
          <div class="panel-body">
            <a-table
              :columns="columns"
              :data-source="levelList"
              :pagination="false"
              size="small"
              row-key="id"
              :scroll="{ y: 400 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <span class="level-text">{{ record.level }}</span>
                </template>
                <template v-if="column.key === 'rebate'">
                  <span class="rebate-text">{{ (record.rebate * 100).toFixed(2) }}%</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a class="edit-link" @click="handleEdit(record)">编辑</a>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>

      <!-- 右侧：层级管理 -->
      <div class="level-right">
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">层级管理</span>
            <div class="panel-actions">
              <a-button v-if="isEditing" type="primary" @click="handleSave">保存</a-button>
              <a-button v-else type="primary" @click="handleCreate">立即创建</a-button>
              <a-button
                :disabled="!isEditing"
                :type="isEditing ? 'primary' : 'default'"
                :danger="isEditing"
                @click="handleBackToCreate"
              >返回创建</a-button>
            </div>
          </div>
          <div class="panel-body">
            <div class="form-item">
              <div class="form-label">层数(自动)</div>
              <a-input :value="autoLevel" placeholder="输入" disabled />
            </div>
            <div class="form-item">
              <div class="form-label">返比(小数点)</div>
              <a-input v-model:value="formData.rebate" placeholder="输入" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'

// 表格列配置
const columns = [
  { title: '层数', dataIndex: 'level', key: 'level', align: 'center' },
  { title: '返比', dataIndex: 'rebate', key: 'rebate', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
]

// 层级列表数据
const levelList = ref([
  { id: 1, level: 1, rebate: 0.2 },
  { id: 2, level: 2, rebate: 0 }
])

// 表单数据
const formData = reactive({
  id: null,
  rebate: ''
})

// 是否编辑模式
const isEditing = ref(false)

// 自动计算层数
const autoLevel = computed(() => {
  if (isEditing.value) {
    const item = levelList.value.find(item => item.id === formData.id)
    return item ? item.level : ''
  } else {
    // 创建模式：自动计算下一个层数
    const maxLevel = levelList.value.length > 0
      ? Math.max(...levelList.value.map(item => item.level))
      : 0
    return maxLevel + 1
  }
})

// 编辑
const handleEdit = (record) => {
  isEditing.value = true
  formData.id = record.id
  formData.rebate = record.rebate.toString()
}

// 返回创建模式
const handleBackToCreate = () => {
  if (!isEditing.value) return
  isEditing.value = false
  formData.id = null
  formData.rebate = ''
}

// 立即创建
const handleCreate = () => {
  if (!formData.rebate) {
    message.warning('请输入返比')
    return
  }

  const rebateValue = parseFloat(formData.rebate) || 0

  levelList.value.push({
    id: Date.now(),
    level: autoLevel.value,
    rebate: rebateValue
  })

  message.success('创建成功')
  formData.rebate = ''
}

// 保存编辑
const handleSave = () => {
  if (!formData.rebate) {
    message.warning('请输入返比')
    return
  }

  const index = levelList.value.findIndex(item => item.id === formData.id)
  if (index !== -1) {
    levelList.value[index].rebate = parseFloat(formData.rebate) || 0
  }

  message.success('保存成功')
  handleBackToCreate()
}

// 移除（删除最高层级）
const handleRemove = () => {
  if (levelList.value.length === 0) {
    message.warning('没有可移除的层级')
    return
  }

  Modal.confirm({
    title: '删除确认',
    content: '为了层级数能按顺序排列，每次删除会删除最高层数。是否继续删除？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 找到最高层级并删除
      const maxLevel = Math.max(...levelList.value.map(item => item.level))
      const maxIndex = levelList.value.findIndex(item => item.level === maxLevel)
      if (maxIndex !== -1) {
        levelList.value.splice(maxIndex, 1)
        message.success('移除成功')

        // 如果正在编辑的是被删除的层级，则返回创建模式
        if (isEditing.value) {
          const stillExists = levelList.value.find(item => item.id === formData.id)
          if (!stillExists) {
            handleBackToCreate()
          }
        }
      }
    }
  })
}
</script>

<style scoped lang="less">
.level-container {
  height: 100%;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.level-content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.level-left {
  flex: 1;
  min-width: 0;
}

.level-right {
  flex: 1;
  min-width: 0;
}

.panel {
  height: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
  }
}

.panel-body {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

// 表格样式
.level-text {
  color: #1890ff;
}

.rebate-text {
  color: #1890ff;
}

.edit-link {
  color: #1890ff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

// 表单样式
.form-item {
  margin-bottom: 20px;

  .form-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  :deep(.ant-input) {
    height: 40px;
    border-radius: 6px;
    background: #f5f5f5;
    border: 1px solid #f5f5f5;

    &:focus {
      background: #fff;
      border-color: #1890ff;
    }

    &:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }
  }
}

// 表格自定义样式
:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fff;
    font-weight: 500;
    color: #666;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }
}
</style>
