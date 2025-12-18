<template>
  <div class="page-container">
    <div class="page-header">
      <h2>层级设置</h2>
      <a-button type="primary">
        <plus-outlined /> 添加层级
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="[]" :loading="false">
      <template #emptyText>
        <a-empty description="暂无数据" />
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '层级名称', dataIndex: 'name', key: 'name' },
  { title: '层级', dataIndex: 'level', key: 'level' },
  { title: '佣金比例', dataIndex: 'commission', key: 'commission' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' }
]
</script>

<style scoped lang="less">
.page-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h2 { margin: 0; font-size: 18px; }
  }
}
</style>
