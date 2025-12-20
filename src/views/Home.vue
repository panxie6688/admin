<template>
  <div class="home">
    <!-- 数据总览 -->
    <div class="section-header">
      <div class="section-title">数据总览</div>
      <div class="section-actions">
        <a-tooltip title="刷新数据">
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
    <a-row :gutter="16">
      <a-col :span="8">
        <div class="stat-card stat-card-blue">
          <div class="stat-icon">
            <dollar-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">总资产</div>
            <div class="stat-value">52,962,814.48</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card stat-card-green">
          <div class="stat-icon">
            <fund-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">累计充值</div>
            <div class="stat-value">809,305,070.87</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card stat-card-red">
          <div class="stat-icon">
            <download-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">累计提现</div>
            <div class="stat-value">5,346,821.33</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="12">
        <div class="stat-card stat-card-pink">
          <div class="stat-icon">
            <rise-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">累计利润</div>
            <div class="stat-value">0</div>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="stat-card stat-card-orange">
          <div class="stat-icon">
            <rise-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">今天利润</div>
            <div class="stat-value">0</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 提现明细 -->
    <div class="section-title" style="margin-top: 24px;">提现明细</div>
    <a-row :gutter="16">
      <a-col :span="8">
        <div class="stat-card stat-card-blue">
          <div class="stat-icon pay-icon">pay</div>
          <div class="stat-info">
            <div class="stat-label">总金额</div>
            <div class="stat-value">5,346,821.33</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card stat-card-green">
          <div class="stat-icon">
            <bank-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">实际到账</div>
            <div class="stat-value">5,346,821.33</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card stat-card-red">
          <div class="stat-icon">
            <transaction-outlined />
          </div>
          <div class="stat-info">
            <div class="stat-label">手续费</div>
            <div class="stat-value">0</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 会员 -->
    <div class="section-title" style="margin-top: 32px;">会员</div>
    <div class="member-row">
      <div class="member-card">
        <div class="member-label">总数</div>
        <div class="member-value">4,561</div>
      </div>
      <div class="member-card">
        <div class="member-label">冻结账户</div>
        <div class="member-value">10</div>
      </div>
      <div class="member-card">
        <div class="member-label">正常账号</div>
        <div class="member-value">4,551</div>
      </div>
      <div class="member-card">
        <div class="member-label">已认证</div>
        <div class="member-value">0</div>
      </div>
      <div class="member-card">
        <div class="member-label">今天新增</div>
        <div class="member-value">0</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import {
  DollarOutlined,
  FundOutlined,
  DownloadOutlined,
  RiseOutlined,
  BankOutlined,
  TransactionOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons-vue'

// 注入布局状态
const topMenuMode = inject('topMenuMode', ref(false))
const contentFullscreen = inject('contentFullscreen', ref(false))
const toggleContentFullscreen = inject('toggleContentFullscreen', () => {})

const handleRefresh = () => {
  // 刷新数据逻辑
}
</script>

<style scoped lang="less">
.home {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-actions {
      display: flex;
      gap: 4px;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    padding-left: 10px;
    border-left: 3px solid #1890ff;
    margin-bottom: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    color: #fff;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-right: 16px;
      background: rgba(255, 255, 255, 0.2);

      &.pay-icon {
        font-size: 18px;
        font-weight: bold;
      }
    }

    .stat-info {
      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        margin-top: 4px;
      }
    }

    &.stat-card-blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    &.stat-card-green {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    &.stat-card-red {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }
    &.stat-card-pink {
      background: linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%);
      color: #333;
    }
    &.stat-card-orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }

  .member-row {
    display: flex;
    gap: 16px;

    .member-card {
      flex: 1;
      text-align: center;
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      .member-label {
        font-size: 14px;
        color: #666;
      }
      .member-value {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        margin-top: 8px;
      }
    }
  }
}
</style>
