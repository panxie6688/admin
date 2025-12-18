<template>
  <div class="page-container">
    <div class="page-header">
      <h2>发送日志</h2>
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
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '接收者', dataIndex: 'receiver', key: 'receiver' },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '发送时间', dataIndex: 'createTime', key: 'createTime' }
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
