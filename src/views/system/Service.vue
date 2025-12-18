<template>
  <div class="page-container">
    <div class="page-header">
      <h2>在线客服</h2>
    </div>
    <a-form :model="formState" layout="vertical" style="max-width: 600px;">
      <a-form-item label="客服链接">
        <a-input v-model:value="formState.serviceUrl" placeholder="请输入客服链接" />
      </a-form-item>
      <a-form-item label="客服二维码">
        <a-upload>
          <a-button>上传二维码</a-button>
        </a-upload>
      </a-form-item>
      <a-form-item label="工作时间">
        <a-input v-model:value="formState.workTime" placeholder="例如：9:00-18:00" />
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
  serviceUrl: '',
  workTime: ''
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
