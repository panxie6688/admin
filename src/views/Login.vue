<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">登录</h2>
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
      >
        <a-form-item label="登录账户" name="username">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入"
            size="large"
          />
        </a-form-item>

        <a-form-item label="登录密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入"
            size="large"
          />
        </a-form-item>

        <a-form-item label="谷歌验证码" name="googleCode">
          <a-input
            v-model:value="formState.googleCode"
            placeholder="请输入"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
            size="large"
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
  googleCode: ''
})

const rules = {
  username: [{ required: true, message: '请输入您的账户!' }],
  password: [{ required: true, message: '请输入您的密码!' }]
}

const handleLogin = async () => {
  loading.value = true
  try {
    // 模拟登录，后续对接真实接口
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存登录状态
    localStorage.setItem('token', 'mock_token_123')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 1,
      name: '管理员',
      username: formState.username
    }))

    message.success('登录成功')
    router.push('/')
  } catch (error) {
    message.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  }
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, transparent 50%, rgba(102, 126, 234, 0.1) 50%);
    border-radius: 0 8px 0 0;
  }
}

.login-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 30px;
  text-align: left;
}

:deep(.ant-form-item-label > label) {
  color: #666;
  font-size: 14px;
}

:deep(.ant-input),
:deep(.ant-input-password) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  height: 44px;
  border-radius: 4px;
  font-size: 16px;
  margin-top: 10px;
}

:deep(.ant-form-item-explain-error) {
  color: #ff4d4f;
  font-size: 12px;
}
</style>
