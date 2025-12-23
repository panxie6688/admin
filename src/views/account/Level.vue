<template>
  <div class="level-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">分享层级查询</h2>
      <div class="header-actions">
        <a-tooltip title="刷新">
          <a-button class="icon-btn" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="!topMenuMode" :title="contentFullscreen ? '退出全屏' : '全屏'">
          <a-button class="icon-btn" @click="toggleContentFullscreen">
            <template #icon>
              <FullscreenExitOutlined v-if="contentFullscreen" />
              <FullscreenOutlined v-else />
            </template>
          </a-button>
        </a-tooltip>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-item">
        <span class="toolbar-label">竖向布局</span>
        <a-switch v-model:checked="isVertical" />
      </div>
      <div class="toolbar-item">
        <span class="toolbar-label">是否往上查询</span>
        <a-switch v-model:checked="isUpQuery" />
      </div>
      <a-input
        v-model:value="memberInfo"
        placeholder="会员信息"
        style="width: 160px"
        allow-clear
      />
      <a-button type="primary" @click="handleQuery">查 询</a-button>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 未查询时显示提示 -->
      <div v-if="!treeData" class="empty-tip">
        <div class="tip-icon">
          <ExclamationOutlined />
        </div>
        <div class="tip-title">输入会员信息</div>
        <div class="tip-desc">根据会员信息展开关系树</div>
      </div>

      <!-- 查询后显示树形结构 -->
      <div v-else class="tree-wrapper" :class="{ vertical: isVertical }">
        <!-- 树形结构内容 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import {
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ExclamationOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode')
const contentFullscreen = inject('contentFullscreen')
const toggleContentFullscreen = inject('toggleContentFullscreen')

// 状态
const isVertical = ref(true)
const isUpQuery = ref(false)
const memberInfo = ref('')
const treeData = ref(null)

// 刷新
const handleRefresh = () => {
  message.success('刷新完成')
}

// 查询
const handleQuery = () => {
  if (!memberInfo.value) {
    message.warning('请输入会员信息')
    return
  }
  message.info(`查询会员: ${memberInfo.value}`)
  // TODO: 实际查询逻辑
}
</script>

<style scoped lang="less">
.level-container {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .toolbar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .toolbar-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .toolbar-label {
        font-size: 14px;
        color: #666;
      }
    }

    .ant-input {
      border-radius: 6px;
    }

    .ant-btn-primary {
      border-radius: 6px;
      padding: 0 20px;
    }
  }

  .content-wrapper {
    flex: 1;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
    margin: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    min-height: 400px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);

    .empty-tip {
      text-align: center;
      padding: 60px 40px;

      .tip-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);

        :deep(.anticon) {
          font-size: 36px;
          color: #fff;
        }
      }

      .tip-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }

      .tip-desc {
        font-size: 14px;
        color: #999;
        line-height: 1.8;
      }
    }

    .tree-wrapper {
      padding: 24px;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
