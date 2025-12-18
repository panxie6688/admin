<template>
  <div class="page-container">
    <div class="page-header">
      <h2>后台充值记录</h2>
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
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '充值金额', dataIndex: 'amount', key: 'amount' },
  { title: '操作人', dataIndex: 'operator', key: 'operator' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
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
