<template>
  <div class="page-container">
    <div class="page-header">
      <h2>评论管理</h2>
    </div>
    <a-table :columns="columns" :data-source="[]" :loading="false">
      <template #emptyText>
        <a-empty description="暂无数据" />
      </template>
    </a-table>
  </div>
</template>

<script setup>
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '用户', dataIndex: 'username', key: 'username' },
  { title: '评论内容', dataIndex: 'content', key: 'content' },
  { title: '关联内容', dataIndex: 'target', key: 'target' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '评论时间', dataIndex: 'createTime', key: 'createTime' },
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
