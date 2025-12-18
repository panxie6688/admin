<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>
    <a-form :model="formState" layout="vertical" style="max-width: 600px;">
      <a-form-item label="网站名称">
        <a-input v-model:value="formState.siteName" placeholder="请输入网站名称" />
      </a-form-item>
      <a-form-item label="网站Logo">
        <a-upload>
          <a-button>上传Logo</a-button>
        </a-upload>
      </a-form-item>
      <a-form-item label="注册赠送金额">
        <a-input-number v-model:value="formState.registerBonus" :min="0" style="width: 100%;" />
      </a-form-item>
      <a-form-item label="最低提现金额">
        <a-input-number v-model:value="formState.minWithdraw" :min="0" style="width: 100%;" />
      </a-form-item>
      <a-form-item label="提现手续费(%)">
        <a-input-number v-model:value="formState.withdrawFee" :min="0" :max="100" style="width: 100%;" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary">保存设置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const formState = reactive({
  siteName: '',
  registerBonus: 0,
  minWithdraw: 0,
  withdrawFee: 0
})
</script>

<style scoped lang="less">
.page-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    h2 { margin: 0; font-size: 18px; }
  }
}
</style>
