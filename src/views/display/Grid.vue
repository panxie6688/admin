<template>
  <div class="page-container">
    <div class="page-header">
      <h2>宫格列表</h2>
      <a-button type="primary">
        <plus-outlined /> 添加宫格
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
  { title: '图标', dataIndex: 'icon', key: 'icon' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '跳转链接', dataIndex: 'link', key: 'link' },
  { title: '排序', dataIndex: 'sort', key: 'sort' },
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
