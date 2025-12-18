<template>
  <div class="page-container">
    <div class="page-header">
      <h2>提现管理</h2>
      <a-space>
        <a-input-search placeholder="单号、用户名" style="width: 200px" />
        <a-button type="primary">更多搜索</a-button>
      </a-space>
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
  { title: '提现金额', dataIndex: 'amount', key: 'amount' },
  { title: '手续费', dataIndex: 'fee', key: 'fee' },
  { title: '实际到账', dataIndex: 'realAmount', key: 'realAmount' },
  { title: '提现方式', dataIndex: 'type', key: 'type' },
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
