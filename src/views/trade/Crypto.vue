<template>
  <div class="page-container">
    <div class="page-header">
      <h2>充币订单</h2>
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
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '币种', dataIndex: 'coin', key: 'coin' },
  { title: '数量', dataIndex: 'amount', key: 'amount' },
  { title: 'TXID', dataIndex: 'txid', key: 'txid' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
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
