<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商品列表</h2>
      <a-button type="primary">
        <plus-outlined /> 添加商品
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
  { title: '商品图片', dataIndex: 'image', key: 'image' },
  { title: '商品名称', dataIndex: 'name', key: 'name' },
  { title: '分类', dataIndex: 'category', key: 'category' },
  { title: '价格', dataIndex: 'price', key: 'price' },
  { title: '佣金', dataIndex: 'commission', key: 'commission' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
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
