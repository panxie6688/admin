<template>
  <div class="page-container" :class="`size-${tableSize}`">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <span class="page-title">会员</span>
        <a-button type="primary" @click="openDrawer">
          <plus-outlined /> 添加会员
        </a-button>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchText"
          placeholder="单号、会员信息"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="showMoreSearch = !showMoreSearch">
          更多搜索
        </a-button>
        <a-tooltip v-if="!topMenuMode" :title="isFullscreen ? '退出全屏' : '全屏'">
          <a-button type="text" class="icon-btn" @click="toggleFullscreen">
            <compress-outlined v-if="isFullscreen" />
            <expand-outlined v-else />
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新">
          <a-button type="text" class="icon-btn" @click="handleRefresh">
            <reload-outlined />
          </a-button>
        </a-tooltip>
        <a-dropdown>
          <a-tooltip title="密度">
            <a-button type="text" class="icon-btn">
              <column-height-outlined />
            </a-button>
          </a-tooltip>
          <template #overlay>
            <a-menu @click="handleDensityChange">
              <a-menu-item key="default" :class="{ 'active-density': tableSize === 'default' }">
                宽松
              </a-menu-item>
              <a-menu-item key="middle" :class="{ 'active-density': tableSize === 'middle' }">
                中等
              </a-menu-item>
              <a-menu-item key="small" :class="{ 'active-density': tableSize === 'small' }">
                紧凑
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :loading="loading"
        :size="tableSize"
        bordered
        :scroll="{ x: 3500, y: 'calc(100vh - 280px)' }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 备注带编辑图标 -->
          <template v-if="column.dataIndex === 'remark'">
            <a class="link-text" @click="handleEditRemark(record)">{{ record.remark || '-' }}</a>
            <edit-outlined class="edit-icon" @click="handleEditRemark(record)" />
          </template>
          <!-- 认证状态 -->
          <template v-if="column.dataIndex === 'verified'">
            <a-tag :color="record.verified ? 'success' : 'error'" size="small">
              {{ record.verified ? '已认证' : '未认证' }}
            </a-tag>
          </template>
          <!-- 信用积分带链接 -->
          <template v-if="column.dataIndex === 'creditScore'">
            <a class="link-text" @click="handleEditCreditScore(record)">
              {{ record.creditScore }}
              <span class="arrow-icon-blue"> ></span>
            </a>
          </template>
          <!-- 邀请码带链接 -->
          <template v-if="column.dataIndex === 'inviteCode2'">
            <a class="link-text" @click="handleEditInviteCode(record)">
              {{ record.inviteCode2 }}
              <span class="arrow-icon-blue"> ></span>
            </a>
          </template>
          <!-- VIP等级可点击编辑 -->
          <template v-if="column.dataIndex === 'vipLevel'">
            <a class="link-text" @click="handleEditVipLevel(record)">
              {{ record.vipLevel }}
              <span class="arrow-icon-blue"> ></span>
            </a>
          </template>
          <!-- IP地址可点击查询 -->
          <template v-if="column.dataIndex === 'lastLoginIp'">
            <a class="link-text" @click="handleQueryIp(record.lastLoginIp)" target="_blank">{{ record.lastLoginIp }}</a>
          </template>
          <!-- 状态开关带文字 -->
          <template v-if="column.dataIndex === 'accountStatus'">
            <a-switch v-model:checked="record.accountStatus" size="small" checked-children="启动" un-checked-children="禁止" />
          </template>
          <template v-if="column.dataIndex === 'tradeStatus'">
            <a-switch v-model:checked="record.tradeStatus" size="small" checked-children="启动" un-checked-children="禁止" />
          </template>
          <template v-if="column.dataIndex === 'withdrawStatus'">
            <a-switch v-model:checked="record.withdrawStatus" size="small" checked-children="启动" un-checked-children="禁止" />
          </template>
          <template v-if="column.dataIndex === 'commentStatus'">
            <a-switch v-model:checked="record.commentStatus" size="small" checked-children="启动" un-checked-children="禁止" />
          </template>
          <!-- 操作 -->
          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="primary" class="btn-orange" @click="handleLevel(record)">上下分</a-button>
              <a-button type="primary" @click="handleLogin(record)">连单</a-button>
              <a-button
                type="primary"
                danger
                :disabled="!isTaskCompleted(record.taskProgress)"
                @click="handleResetOrder(record)"
              >重置单数</a-button>
              <a-button
                type="primary"
                danger
                :disabled="!isGroupCompleted(record.groupProgress)"
                @click="handleResetGroup(record)"
              >重置组数</a-button>
              <a-button type="primary" @click="handleFinance(record)">财务</a-button>
              <a-dropdown :trigger="['hover']" placement="bottomRight" arrow>
                <a-button type="primary">更多 <down-outlined /></a-button>
                <template #overlay>
                  <div class="more-menu-wrapper">
                    <a-menu class="more-menu">
                      <a-menu-item key="edit" @click="handleEdit(record)">
                        <span style="color: #1890ff;"><form-outlined style="margin-right: 10px;" /> 编辑</span>
                      </a-menu-item>
                      <a-menu-item key="lottery" @click="handleLottery(record)">
                        <span style="color: #1890ff;"><trophy-outlined style="margin-right: 10px;" /> 中奖调节</span>
                      </a-menu-item>
                      <a-menu-item key="giftBalance" @click="handleGiftBalance(record)">
                        <span style="color: #1890ff;"><gift-outlined style="margin-right: 10px;" /> 赠送余额</span>
                      </a-menu-item>
                      <a-menu-item key="deductBalance" @click="handleDeductBalance(record)">
                        <span style="color: #ff4d4f;"><minus-circle-outlined style="margin-right: 10px;" /> 扣减余额</span>
                      </a-menu-item>
                      <a-menu-item key="modifyBalance" @click="handleModifyBalance(record)">
                        <span style="color: #1890ff;"><dollar-outlined style="margin-right: 10px;" /> 修改余额</span>
                      </a-menu-item>
                      <a-menu-item key="modifyUsername" @click="handleModifyUsername(record)">
                        <span style="color: #1890ff;"><user-outlined style="margin-right: 10px;" /> 修改用户名</span>
                      </a-menu-item>
                      <a-menu-item key="modifyOrderCount" @click="handleModifyOrderCount(record)">
                        <span style="color: #1890ff;"><field-number-outlined style="margin-right: 10px;" /> 修改单数</span>
                      </a-menu-item>
                      <a-menu-item key="modifyGroupCount" @click="handleModifyGroupCount(record)">
                        <span style="color: #1890ff;"><group-outlined style="margin-right: 10px;" /> 修改组数</span>
                      </a-menu-item>
                      <a-menu-item key="walletAddress" @click="handleWalletAddress(record)">
                        <span style="color: #1890ff;"><wallet-outlined style="margin-right: 10px;" /> 钱包地址管理</span>
                      </a-menu-item>
                      <a-menu-item key="modifyWithdrawInfo" @click="handleModifyWithdrawInfo(record)">
                        <span style="color: #1890ff;"><credit-card-outlined style="margin-right: 10px;" /> 修改提取信息</span>
                      </a-menu-item>
                      <a-menu-item key="modifyPassword" @click="handleModifyPassword(record)">
                        <span style="color: #1890ff;"><lock-outlined style="margin-right: 10px;" /> 修改密码</span>
                      </a-menu-item>
                      <a-menu-item key="modifyTradePassword" @click="handleModifyTradePassword(record)">
                        <span style="color: #1890ff;"><safety-outlined style="margin-right: 10px;" /> 修改交易密码</span>
                      </a-menu-item>
                      <a-menu-item key="modifyParent" @click="handleModifyParent(record)">
                        <span style="color: #1890ff;"><node-index-outlined style="margin-right: 10px;" /> 修改上级</span>
                      </a-menu-item>
                      <a-menu-item key="modifyInviteCode" @click="handleModifyInviteCode(record)">
                        <span style="color: #1890ff;"><share-alt-outlined style="margin-right: 10px;" /> 修改邀请码</span>
                      </a-menu-item>
                      <a-menu-item key="modifyVipLevel" @click="handleModifyVipLevel(record)">
                        <span style="color: #1890ff;"><crown-outlined style="margin-right: 10px;" /> 修改VIP等级</span>
                      </a-menu-item>
                      <a-menu-item key="modifyLoginAuth" @click="handleModifyLoginAuth(record)">
                        <span style="color: #1890ff;"><security-scan-outlined style="margin-right: 10px;" /> 修改登录安全认证</span>
                      </a-menu-item>
                      <a-menu-item key="modifyRealNameInfo" @click="handleModifyRealNameInfo(record)">
                        <span style="color: #1890ff;"><idcard-outlined style="margin-right: 10px;" /> 修改实名信息</span>
                      </a-menu-item>
                      <a-menu-item key="modifyRealNameStatus" @click="handleModifyRealNameStatus(record)">
                        <span style="color: #1890ff;"><solution-outlined style="margin-right: 10px;" /> 修改实名状态</span>
                      </a-menu-item>
                      <a-menu-item key="modifyCreditScore" @click="handleModifyCreditScore(record)">
                        <span style="color: #1890ff;"><star-outlined style="margin-right: 10px;" /> 修改信誉分</span>
                      </a-menu-item>
                      <a-menu-item key="modifyRemark" @click="handleModifyRemark(record)">
                        <span style="color: #1890ff;"><message-outlined style="margin-right: 10px;" /> 修改备注</span>
                      </a-menu-item>
                      <a-menu-item key="disableAccount" @click="handleDisableAccount(record)">
                        <span style="color: #ff4d4f;"><stop-outlined style="margin-right: 10px;" /> 账户禁用</span>
                      </a-menu-item>
                      <a-menu-item key="disableTrade" @click="handleDisableTrade(record)">
                        <span style="color: #ff4d4f;"><stop-outlined style="margin-right: 10px;" /> 禁止交易</span>
                      </a-menu-item>
                      <a-menu-item key="disableWithdraw" @click="handleDisableWithdraw(record)">
                        <span style="color: #ff4d4f;"><stop-outlined style="margin-right: 10px;" /> 禁止提现</span>
                      </a-menu-item>
                      <a-menu-item key="disableComment" @click="handleDisableComment(record)">
                        <span style="color: #ff4d4f;"><stop-outlined style="margin-right: 10px;" /> 禁止评论</span>
                      </a-menu-item>
                      <a-menu-item key="orderList" @click="handleOrderList(record)">
                        <span style="color: #1890ff;"><unordered-list-outlined style="margin-right: 10px;" /> 订单列表</span>
                      </a-menu-item>
                      <a-menu-item key="giftRecord" @click="handleGiftRecord(record)">
                        <span style="color: #1890ff;"><history-outlined style="margin-right: 10px;" /> 赠送记录</span>
                      </a-menu-item>
                      <a-menu-item key="subUsers" @click="handleSubUsers(record)">
                        <span style="color: #1890ff;"><team-outlined style="margin-right: 10px;" /> 下级用户</span>
                      </a-menu-item>
                      <a-menu-item key="parentUser" @click="handleParentUser(record)">
                        <span style="color: #1890ff;"><user-switch-outlined style="margin-right: 10px;" /> 上级用户</span>
                      </a-menu-item>
                      <a-menu-item key="authInfo" @click="handleAuthInfo(record)">
                        <span style="color: #1890ff;"><safety-certificate-outlined style="margin-right: 10px;" /> 认证信息</span>
                      </a-menu-item>
                      <a-menu-item key="onlineInfo" @click="handleOnlineInfo(record)">
                        <span style="color: #1890ff;"><global-outlined style="margin-right: 10px;" /> 在线信息</span>
                      </a-menu-item>
                      <a-menu-item key="securityLog" @click="handleSecurityLog(record)">
                        <span style="color: #1890ff;"><file-protect-outlined style="margin-right: 10px;" /> 安全日志</span>
                      </a-menu-item>
                      <a-menu-item key="loginLog" @click="handleLoginLog(record)">
                        <span style="color: #1890ff;"><login-outlined style="margin-right: 10px;" /> 登录日志</span>
                      </a-menu-item>
                      <a-menu-item key="vipChangeLog" @click="handleVipChangeLog(record)">
                        <span style="color: #1890ff;"><rise-outlined style="margin-right: 10px;" /> VIP变更日志</span>
                      </a-menu-item>
                      <a-menu-item key="totalProfit" @click="handleTotalProfit(record)">
                        <span style="color: #1890ff;"><line-chart-outlined style="margin-right: 10px;" /> 累计利润</span>
                      </a-menu-item>
                      <a-menu-item key="goodsCountLog" @click="handleGoodsCountLog(record)">
                        <span style="color: #1890ff;"><shopping-outlined style="margin-right: 10px;" /> 商品次数日志</span>
                      </a-menu-item>
                      <a-menu-item key="cryptoOrder" @click="handleCryptoOrder(record)">
                        <span style="color: #1890ff;"><transaction-outlined style="margin-right: 10px;" /> 充币订单</span>
                      </a-menu-item>
                    </a-menu>
                  </div>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 底部分页 -->
    <div class="page-footer">
      <span class="total-text">统计: {{ pagination.total }}/条</span>
      <a-pagination
        v-model:current="pagination.current"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        show-quick-jumper
        :show-size-changer="false"
        @change="onPageChange"
      />
    </div>

    <!-- 筛选抽屉 -->
    <a-drawer
      v-model:open="showMoreSearch"
      title="筛选"
      placement="right"
      :width="380"
      class="filter-drawer"
      :closable="false"
      :rootClassName="'rounded-drawer'"
    >
      <template #extra>
        <a-space>
          <a-button type="link" danger @click="resetFilter">重置</a-button>
          <a-button type="primary" @click="submitFilter">提交</a-button>
        </a-space>
      </template>
      <a-form layout="vertical" class="filter-form">
        <a-form-item label="会员UID">
          <a-input v-model:value="filterForm.uid" placeholder="输入" />
        </a-form-item>
        <a-form-item label="国家">
          <PhoneCodeSelect
            v-model:value="filterForm.country"
            placeholder="请选择"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filterForm.status" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="frozen">冻结</a-select-option>
            <a-select-option value="normal">正常</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="生日" class="date-picker-item">
          <a-date-picker v-model:value="filterForm.birthday" placeholder="请选择日期" style="width: 100%" size="large" />
        </a-form-item>
        <a-form-item label="开始时间" class="date-picker-item">
          <a-date-picker v-model:value="filterForm.startTime" placeholder="请选择日期" style="width: 100%" size="large" />
        </a-form-item>
        <a-form-item label="结束时间" class="date-picker-item">
          <a-date-picker v-model:value="filterForm.endTime" placeholder="请选择日期" style="width: 100%" size="large" />
        </a-form-item>
        <a-form-item label="搜索(手机号、邮箱等等)">
          <a-input v-model:value="filterForm.searchKeyword" placeholder="搜索内容">
            <template #suffix>
              <search-outlined style="color: #999" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="排序字段">
          <a-select v-model:value="filterForm.sortField" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="registerTime">注册时间</a-select-option>
            <a-select-option value="memberId">会员ID</a-select-option>
            <a-select-option value="memberUid">会员UID</a-select-option>
            <a-select-option value="birthday">生日日期</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序类型">
          <a-select v-model:value="filterForm.sortType" placeholder="全部" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="desc">降序排序</a-select-option>
            <a-select-option value="asc">升序排序</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>

    <!-- VIP等级编辑弹窗 -->
    <a-modal
      v-model:open="vipLevelModal.visible"
      title="设置会员VIP等级"
      :width="400"
      @ok="handleVipLevelOk"
      @cancel="vipLevelModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>设置会员VIP等级</span>
        </div>
      </template>
      <div class="vip-modal-content">
        <div class="current-level">
          <span>当前等级: {{ vipLevelModal.currentLevel }}</span>
          <img :src="vipLevelModal.levelIcon" class="level-icon" v-if="vipLevelModal.levelIcon" />
        </div>
        <a-form layout="vertical">
          <a-form-item label="等级">
            <a-select v-model:value="vipLevelModal.newLevel" placeholder="请选择等级" allow-clear>
              <a-select-option v-for="item in vipLevelOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="备注(可为空)">
            <a-textarea v-model:value="vipLevelModal.remark" placeholder="输入" :rows="4" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 备注编辑弹窗 -->
    <a-modal
      v-model:open="remarkModal.visible"
      :width="400"
      @ok="handleRemarkOk"
      @cancel="remarkModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>设置备注(可为空)</span>
        </div>
      </template>
      <div class="remark-modal-content">
        <a-textarea v-model:value="remarkModal.content" placeholder="请输入" :rows="5" />
      </div>
    </a-modal>

    <!-- 信用积分编辑弹窗 -->
    <a-modal
      v-model:open="creditScoreModal.visible"
      :width="400"
      @ok="handleCreditScoreOk"
      @cancel="creditScoreModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>修改信用积分(0-100)</span>
        </div>
      </template>
      <div class="credit-score-modal-content">
        <div class="current-score">当前信用积分: {{ creditScoreModal.currentScore }}</div>
        <a-slider v-model:value="creditScoreModal.newScore" :min="0" :max="100" />
        <a-input-number v-model:value="creditScoreModal.newScore" :min="0" :max="100" style="width: 100%; margin-top: 12px;" />
      </div>
    </a-modal>

    <!-- 邀请码编辑弹窗 -->
    <a-modal
      v-model:open="inviteCodeModal.visible"
      :width="400"
      @ok="handleInviteCodeOk"
      @cancel="inviteCodeModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>修改邀请码</span>
        </div>
      </template>
      <div class="invite-code-modal-content">
        <div class="current-code">当前邀请码: {{ inviteCodeModal.currentCode }}</div>
        <p class="tip-text">修改后已保存的海报分享图无效，需要重新保存</p>
        <a-input v-model:value="inviteCodeModal.newCode" placeholder="请输入新邀请码" />
      </div>
    </a-modal>

    <!-- 上下分弹窗 -->
    <a-modal
      v-model:open="balanceModal.visible"
      :width="480"
      @ok="handleBalanceOk"
      @cancel="balanceModal.visible = false"
      class="balance-modal"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>余额管理</span>
        </div>
      </template>
      <div class="balance-modal-content">
        <!-- 会员信息卡片 -->
        <div class="member-info-card">
          <div class="info-row">
            <span class="info-label">会员UID</span>
            <span class="info-value">{{ balanceModal.record?.uid }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ balanceModal.record?.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">当前余额</span>
            <span class="info-value highlight">{{ balanceModal.currentBalance.toFixed(2) }}</span>
          </div>
        </div>

        <a-form layout="vertical">
          <a-form-item label="操作类型" required>
            <a-radio-group v-model:value="balanceModal.type" button-style="solid" class="type-radio-group">
              <a-radio-button value="add" class="add-btn">
                <plus-outlined /> 上分（增加）
              </a-radio-button>
              <a-radio-button value="subtract" class="subtract-btn">
                <minus-outlined /> 下分（扣减）
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="金额" required>
            <a-input-number
              v-model:value="balanceModal.amount"
              placeholder="请输入金额"
              :min="0"
              :precision="2"
              style="width: 100%"
              size="large"
            >
              <template #addonBefore>$</template>
            </a-input-number>
          </a-form-item>
          <a-form-item label="变动后余额">
            <div class="result-balance" :class="{ 'is-negative': computedNewBalance < 0 }">
              {{ computedNewBalance.toFixed(2) }}
            </div>
          </a-form-item>
          <a-form-item label="备注说明">
            <a-textarea
              v-model:value="balanceModal.remark"
              placeholder="请输入备注说明（选填）"
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 连单管理页面 -->
    <transition name="slide-up">
      <div class="order-page" v-if="orderModal.visible">
        <div class="order-page-header">
          <span class="page-title">用户连单管理</span>
          <a-button type="text" class="close-btn" @click="orderModal.visible = false">
            <close-outlined />
          </a-button>
        </div>

        <div class="order-page-content">
          <!-- 用户信息卡片 -->
          <div class="user-info-card">
            <div class="info-item">
              <span class="label">用户名</span>
              <span class="value">{{ orderModal.record?.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号</span>
              <span class="value">{{ orderModal.record?.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱</span>
              <span class="value">{{ orderModal.record?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">余额</span>
              <span class="value highlight">{{ orderModal.record?.balance?.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单数</span>
              <span class="value">{{ orderModal.record?.taskProgress }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录时间</span>
              <span class="value">{{ orderModal.record?.lastLoginTime }}</span>
            </div>
          </div>

          <!-- 操作按钮栏 -->
          <div class="action-bar">
            <a-space>
              <a-button type="primary" @click="handleAddOrder">
                <plus-outlined /> 添加连单
              </a-button>
              <a-button
                type="primary"
                danger
                :disabled="!isTaskCompleted(orderModal.record?.taskProgress)"
                @click="handleResetOrderCount"
              >
                <reload-outlined /> 重置单数
              </a-button>
              <a-button type="primary" @click="handleRefreshOrders">
                <reload-outlined /> 刷新数据
              </a-button>
            </a-space>
            <div class="search-area">
              <a-input-search
                v-model:value="orderModal.searchText"
                placeholder="单号、会员信息"
                style="width: 200px"
                @search="onOrderSearch"
              />
              <a-tooltip v-if="!topMenuMode" :title="orderModal.isFullscreen ? '退出全屏' : '全屏'">
                <a-button type="text" class="icon-btn" @click="toggleOrderFullscreen">
                  <compress-outlined v-if="orderModal.isFullscreen" />
                  <expand-outlined v-else />
                </a-button>
              </a-tooltip>
              <a-tooltip title="刷新">
                <a-button type="text" class="icon-btn" @click="handleRefreshOrders">
                  <reload-outlined />
                </a-button>
              </a-tooltip>
              <a-dropdown>
                <a-button type="text" class="icon-btn">
                  <column-height-outlined />
                </a-button>
                <template #overlay>
                  <a-menu @click="handleOrderDensityChange">
                    <a-menu-item key="default">宽松</a-menu-item>
                    <a-menu-item key="middle">中等</a-menu-item>
                    <a-menu-item key="small">紧凑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>

          <!-- 连单列表表格 -->
          <div class="order-table-wrapper">
            <a-table
              :columns="orderColumns"
              :data-source="orderModal.orderList"
              :loading="orderModal.loading"
              :size="orderModal.tableSize"
              bordered
              :pagination="false"
              :scroll="{ x: 1200, y: orderTableHeight }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'products'">
                  <div class="products-cell">
                    <div v-for="(product, idx) in record.products" :key="idx" class="product-item">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-info">
                        价格：<span class="price">{{ product.price }}</span>
                        佣金比例：<span class="rate">{{ product.commissionRate }}%</span>
                        佣金倍数：<span class="multiple">{{ product.commissionMultiple }}倍</span>
                      </span>
                      <a-tag :color="product.status === 'completed' ? 'success' : 'error'" size="small">
                        {{ product.status === 'completed' ? '已完成' : '未完成' }}
                      </a-tag>
                    </div>
                  </div>
                </template>
                <template v-if="column.dataIndex === 'status'">
                  <a-tag :color="record.status === 'completed' ? 'success' : 'error'">
                    {{ record.status === 'completed' ? '已完成' : '未完成' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <div class="action-btns">
                    <!-- 全部已完成：所有按钮禁用 -->
                    <template v-if="record.status === 'completed'">
                      <span class="disabled-btn"><edit-outlined /> 编辑</span>
                      <span class="disabled-btn"><delete-outlined /> 删除</span>
                      <span class="disabled-btn"><plus-outlined /> 添加</span>
                    </template>
                    <!-- 部分完成（有已完成也有未完成）：只能添加 -->
                    <template v-else-if="record.products.some(p => p.status === 'completed')">
                      <span class="disabled-btn"><edit-outlined /> 编辑</span>
                      <span class="disabled-btn"><delete-outlined /> 删除</span>
                      <a class="action-link add-link" @click="handleAddProductToOrder(record)">
                        <plus-outlined /> 添加
                      </a>
                    </template>
                    <!-- 全部未完成：可以编辑、删除、添加 -->
                    <template v-else>
                      <a class="action-link edit-link" @click="handleEditOrder(record)">
                        <edit-outlined /> 编辑
                      </a>
                      <a class="action-link delete-link" @click="handleDeleteOrder(record)">
                        <delete-outlined /> 删除
                      </a>
                      <a class="action-link add-link" @click="handleAddProductToOrder(record)">
                        <plus-outlined /> 添加
                      </a>
                    </template>
                  </div>
                </template>
              </template>
            </a-table>
            <!-- 底部分页 -->
            <div class="order-footer">
              <span class="total-text">统计: {{ orderModal.pagination.total }}/条</span>
              <a-pagination
                v-model:current="orderModal.pagination.current"
                :total="orderModal.pagination.total"
                :page-size="orderModal.pagination.pageSize"
                size="small"
                show-quick-jumper
                :show-size-changer="false"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 编辑会员抽屉 -->
    <a-drawer
      v-model:open="editMemberDrawer.visible"
      title="编辑会员"
      placement="right"
      :width="620"
      :closable="true"
      class="edit-member-drawer-wrapper"
      :rootClassName="'rounded-drawer'"
      :bodyStyle="{ overflow: 'hidden', padding: '24px' }"
      @close="editMemberDrawer.visible = false"
    >
      <template #extra>
        <a-button type="primary" @click="handleSaveEditMember">保存</a-button>
      </template>
      <div class="create-member-drawer">
        <!-- 会员信息卡片 -->
        <div class="member-info-card-top">
          <div class="info-row">
            <span class="info-label">UID</span>
            <span class="info-value">{{ editMemberDrawer.form.uid }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ editMemberDrawer.form.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ editMemberDrawer.form.username }}</span>
          </div>
        </div>

        <a-form
          :model="editMemberDrawer.form"
          layout="vertical"
        >
          <!-- 必要选项 -->
          <div class="form-section">
            <div class="section-title">必要选项(邮箱、手机号二选一)</div>
            <a-form-item label="邮箱">
              <a-input v-model:value="editMemberDrawer.form.email" placeholder="输入" />
            </a-form-item>
            <a-form-item label="手机号">
              <a-row :gutter="12">
                <a-col :span="8">
                  <PhoneCodeSelect
                    v-model:value="editMemberDrawer.form.phoneCode"
                    placeholder="手机区号"
                  />
                </a-col>
                <a-col :span="16">
                  <a-input v-model:value="editMemberDrawer.form.phoneNumber" placeholder="请输入手机号" />
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="登录密码(为空不修改)">
              <a-input-password v-model:value="editMemberDrawer.form.password" placeholder="输入" />
            </a-form-item>
          </div>

          <!-- 必填信息 -->
          <div class="form-section">
            <div class="section-title">必填信息</div>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="用户名">
                  <a-input v-model:value="editMemberDrawer.form.username" placeholder="输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12"></a-col>
            </a-row>
          </div>

          <!-- 其它(选填) -->
          <div class="form-section">
            <div class="section-title">其它(选填)</div>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="自定义UID(纯数字)">
                  <a-input v-model:value="editMemberDrawer.form.customUid" placeholder="输入" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="信用积分">
                  <a-input-number v-model:value="editMemberDrawer.form.creditScore" style="width: 100%" :min="0" :max="200" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="状态">
                  <a-select v-model:value="editMemberDrawer.form.status">
                    <a-select-option value="normal">正常</a-select-option>
                    <a-select-option value="frozen">冻结</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="自定义邀请码">
                  <a-input v-model:value="editMemberDrawer.form.inviteCode" placeholder="输入" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="支付密码(为空不修改)" style="width: 50%;">
              <a-input-password v-model:value="editMemberDrawer.form.payPassword" placeholder="输入" />
            </a-form-item>
            <a-form-item label="备注">
              <a-textarea v-model:value="editMemberDrawer.form.remark" placeholder="输入" :rows="4" />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="提现开关" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="editMemberDrawer.form.withdrawSwitch" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="交易开关" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="editMemberDrawer.form.tradeSwitch" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="假人" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="editMemberDrawer.form.isRobot" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-form>
      </div>
    </a-drawer>

    <!-- 财务日志抽屉 -->
    <a-drawer
      v-model:open="financeModal.visible"
      title="财务日志"
      placement="right"
      :width="850"
      :closable="true"
      :rootClassName="'rounded-drawer finance-drawer'"
      @close="financeModal.visible = false"
    >
      <div class="finance-drawer-content">
        <!-- 财务日志表格 -->
        <div class="finance-table-wrapper">
          <a-table
            :columns="financeColumns"
            :data-source="financeModal.list"
            :loading="financeModal.loading"
            :size="'small'"
            bordered
            :pagination="false"
            :scroll="{ y: 'calc(100vh - 200px)' }"
            class="finance-table-borderless"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'direction'">
                <span :class="record.direction === 'add' ? 'direction-add' : 'direction-subtract'">
                  {{ record.direction === 'add' ? '增加' : '扣减' }}
                </span>
              </template>
              <template v-if="column.dataIndex === 'type'">
                <a-tag :bordered="true" color="default">{{ record.type }}</a-tag>
              </template>
            </template>
          </a-table>
          <!-- 底部分页 -->
          <div class="finance-footer">
            <span class="total-text">统计: {{ financeModal.pagination.total }}/条</span>
            <a-pagination
              v-model:current="financeModal.pagination.current"
              :total="financeModal.pagination.total"
              :page-size="financeModal.pagination.pageSize"
              size="small"
              show-quick-jumper
              :show-size-changer="false"
            />
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 创建连单抽屉 -->
    <a-drawer
      v-model:open="createOrderDrawer.visible"
      placement="right"
      :width="820"
      :closable="false"
      :headerStyle="{ display: 'none' }"
      class="create-order-drawer-wrapper"
      :rootClassName="'rounded-drawer'"
      @close="createOrderDrawer.visible = false"
    >
      <div class="create-order-drawer">
        <!-- 自定义头部 -->
        <div class="drawer-header">
          <a-button type="text" class="close-btn" @click="createOrderDrawer.visible = false">
            <close-outlined />
          </a-button>
          <span class="drawer-title">创建连单</span>
          <a-button type="primary" @click="handleSaveAndCreateOrder">保存&创建</a-button>
        </div>

        <!-- 顶部信息栏 -->
        <div class="order-info-bar">
          <div class="info-item">
            <span class="label">用户余额</span>
            <a-input :value="orderModal.record?.balance?.toFixed(2) || '0.00'" disabled />
          </div>
          <div class="info-item">
            <span class="label">当前任务数</span>
            <a-input :value="orderModal.record?.taskProgress || '0/40'" disabled />
          </div>
          <div class="info-item">
            <span class="label">第N单</span>
            <a-input v-model:value="createOrderDrawer.orderNo" placeholder="输入" />
          </div>
          <div class="info-item">
            <span class="label">每单佣金倍数</span>
            <a-input-number v-model:value="createOrderDrawer.commissionRate" :min="0" :step="0.1" :controls="false" />
          </div>
        </div>

        <!-- 已选商品列表 -->
        <div class="selected-goods-section">
          <div class="section-header">
            <span class="section-title">已选商品列表</span>
            <span class="total-amount">累计金额：({{ selectedTotalAmount.toFixed(1) }})</span>
          </div>
          <div class="selected-goods-list">
            <a-empty v-if="createOrderDrawer.selectedGoods.length === 0" description="暂无数据" :image-style="{ height: '60px' }" />
            <div v-else class="goods-cards">
              <div v-for="(item, index) in createOrderDrawer.selectedGoods" :key="item.id" class="goods-card">
                <div class="card-header">
                  <span class="card-id">ID: <a-tag color="blue">{{ item.id }}</a-tag></span>
                  <span class="card-price">商品价格: <a-tag color="magenta" @dblclick="openEditPriceModal(item, index)"><edit-outlined /> {{ item.price }}</a-tag></span>
                  <a-button type="primary" danger size="small" @click="handleRemoveSelectedGoods(index)">
                    <close-circle-outlined /> 删除
                  </a-button>
                </div>
                <div class="card-name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="goods-list-section">
          <div class="section-header">
            <span class="section-title">商品列表</span>
            <div class="price-filter">
              <a-input
                v-model:value="createOrderDrawer.minPrice"
                placeholder="请输入最低价格"
                style="width: 150px;"
                type="number"
              />
              <span class="separator">-</span>
              <a-input
                v-model:value="createOrderDrawer.maxPrice"
                placeholder="请输入最高价格"
                style="width: 150px;"
                type="number"
              />
              <a-button type="primary" @click="handleSearchGoods">
                <search-outlined /> 查询
              </a-button>
            </div>
          </div>
          <div class="goods-table-wrapper">
            <a-table
              :columns="goodsColumns"
              :data-source="createOrderDrawer.goodsList"
              :loading="createOrderDrawer.loading"
              :pagination="false"
              size="middle"
              bordered
              :scroll="{ y: 'calc(100vh - 480px)' }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'price'">
                  <span class="price-text">{{ record.price }}</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-button
                    v-if="isGoodsSelected(record.id)"
                    type="link"
                    danger
                    size="small"
                    @click="handleRemoveGoodsById(record.id)"
                  >
                    <close-circle-outlined /> 移除
                  </a-button>
                  <a-button
                    v-else
                    type="link"
                    size="small"
                    class="select-btn"
                    @click="handleSelectGoods(record)"
                  >
                    <check-circle-outlined /> 选择
                  </a-button>
                </template>
              </template>
            </a-table>
            <div class="goods-pagination">
              <span class="total-text">统计: {{ createOrderDrawer.pagination.total }}/条</span>
              <a-pagination
                v-model:current="createOrderDrawer.pagination.current"
                :total="createOrderDrawer.pagination.total"
                :page-size="createOrderDrawer.pagination.pageSize"
                size="small"
                show-quick-jumper
                :show-size-changer="false"
                @change="onGoodsPageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 修改价格弹窗 -->
    <a-modal
      v-model:open="editPriceModal.visible"
      :width="420"
      @ok="handleEditPriceOk"
      @cancel="editPriceModal.visible = false"
      okText="确 定"
      cancelText="取 消"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 22px;" />
          <span>修改价格</span>
        </div>
      </template>
      <div class="edit-price-modal-content">
        <div class="price-info-table">
          <div class="table-row header">
            <div class="table-cell">ID</div>
            <div class="table-cell">原价格</div>
          </div>
          <div class="table-row">
            <div class="table-cell">{{ editPriceModal.record?.id }}</div>
            <div class="table-cell">{{ editPriceModal.record?.price }}</div>
          </div>
        </div>
        <div class="new-price-row">
          <span class="label">新价格</span>
          <div class="price-input-wrapper">
            <a-button class="price-btn" @click="editPriceModal.newPrice = Math.max(0, editPriceModal.newPrice - 1)">
              <minus-outlined />
            </a-button>
            <a-input-number
              v-model:value="editPriceModal.newPrice"
              :min="0"
              :precision="2"
              :controls="false"
              class="price-input"
            />
            <a-button class="price-btn" @click="editPriceModal.newPrice = editPriceModal.newPrice + 1">
              <plus-outlined />
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 中奖调节弹窗 -->
    <a-modal
      v-model:open="lotteryModal.visible"
      title="商品调节"
      :width="400"
      @ok="handleLotteryOk"
      okText="确 认"
      :cancelButtonProps="{ style: { display: 'none' } }"
      :bodyStyle="{ padding: '16px 20px' }"
    >
      <template #footer>
        <a-button type="primary" block @click="handleLotteryOk">确 认</a-button>
        <a-button @click="lotteryModal.visible = false" style="margin-top: 8px;">关闭</a-button>
      </template>
      <div class="lottery-modal-content">
        <a-row :gutter="12">
          <a-col :span="12">
            <div class="lottery-form-item">
              <div class="lottery-label"><span class="required">*</span> 开关</div>
              <div class="lottery-switch-box">
                <span>开关</span>
                <a-switch v-model:checked="lotteryModal.enabled" />
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="lottery-form-item">
              <div class="lottery-label"><span class="required">*</span> 模式</div>
              <a-select v-model:value="lotteryModal.mode" style="width: 100%;">
                <a-select-option v-for="item in lotteryModeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-modal>

    <!-- 修改余额弹窗 -->
    <a-modal
      v-model:open="modifyBalanceModal.visible"
      :width="400"
      class="modify-balance-modal"
      :bodyStyle="{ padding: '20px' }"
      @ok="handleModifyBalanceOk"
      @cancel="modifyBalanceModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>余额管理</span>
        </div>
      </template>
      <div class="modify-balance-content">
        <a-alert
          message="请注意"
          description="修改余额和余额加减有所不同，修改余额数量为最终余额，非加减。"
          type="warning"
          show-icon
          closable
        />
        <div class="balance-row">
          <span class="balance-label">余额</span>
          <span class="balance-value">{{ modifyBalanceModal.currentBalance }}</span>
        </div>
        <div class="form-item">
          <div class="form-label">修改后数量</div>
          <a-input-number
            v-model:value="modifyBalanceModal.newBalance"
            placeholder="输入"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </div>
        <div class="form-item" style="margin-bottom: 0;">
          <div class="form-label">备注说明(选填)</div>
          <a-textarea
            v-model:value="modifyBalanceModal.remark"
            placeholder="输入"
            :rows="3"
          />
        </div>
      </div>
    </a-modal>

    <!-- 修改用户名弹窗 -->
    <a-modal
      v-model:open="modifyUsernameModal.visible"
      :width="380"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyUsernameOk"
      @cancel="modifyUsernameModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改用户名</span>
        </div>
      </template>
      <div class="quick-edit-content">
        <div class="current-value">当前: <span class="value">{{ modifyUsernameModal.currentValue }}</span></div>
        <a-input
          v-model:value="modifyUsernameModal.newValue"
          placeholder="输入新用户名"
          allow-clear
        />
      </div>
    </a-modal>

    <!-- 修改任务单数弹窗 -->
    <a-modal
      v-model:open="modifyOrderCountModal.visible"
      title="修改任务单数"
      :width="450"
      class="modify-order-count-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyOrderCountOk"
      @cancel="modifyOrderCountModal.visible = false"
      okText="确认修改"
    >
      <div class="modify-order-count-content">
        <!-- 会员信息表格 -->
        <div class="member-info-section">
          <div class="section-label">会员信息</div>
          <div class="info-table">
            <div class="info-row">
              <div class="info-cell label">uid</div>
              <div class="info-cell value">用户名</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">{{ modifyOrderCountModal.record?.uid }}</div>
              <div class="info-cell value">{{ modifyOrderCountModal.record?.username }}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">邮箱</div>
              <div class="info-cell value">手机号</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">{{ modifyOrderCountModal.record?.email || '-' }}</div>
              <div class="info-cell value">{{ modifyOrderCountModal.record?.phone }}</div>
            </div>
          </div>
        </div>

        <!-- 设置已用单数 -->
        <div class="form-item">
          <div class="form-label">设置新的(已用)单数</div>
          <a-input-number
            v-model:value="modifyOrderCountModal.usedCount"
            placeholder="输入"
            :min="0"
            :max="modifyOrderCountModal.totalCount"
            :controls="false"
            style="width: 100%"
          />
        </div>

        <!-- 设置全部单数 -->
        <div class="form-item">
          <div class="form-label">设置新的(全部)单数</div>
          <a-input-number
            v-model:value="modifyOrderCountModal.totalCount"
            placeholder="输入"
            :min="0"
            :controls="false"
            style="width: 100%"
            disabled
          />
        </div>

        <!-- 用户端展示效果 -->
        <div class="preview-row">
          <span class="preview-label">用户端展示效果：</span>
          <span class="preview-value">{{ modifyOrderCountModal.usedCount }} / {{ modifyOrderCountModal.totalCount }}</span>
        </div>
      </div>
    </a-modal>

    <!-- 修改组数弹窗 -->
    <a-modal
      v-model:open="modifyGroupCountModal.visible"
      :width="400"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyGroupCountOk"
      @cancel="modifyGroupCountModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改组数</span>
        </div>
      </template>
      <div class="modify-group-count-content">
        <div class="current-info">当前组数: {{ modifyGroupCountModal.currentUsed }}/{{ modifyGroupCountModal.currentTotal }}</div>
        <div class="form-label">设置新的(已用)组数</div>
        <a-input-number
          v-model:value="modifyGroupCountModal.newUsed"
          placeholder="输入"
          :min="0"
          :max="modifyGroupCountModal.currentTotal"
          :controls="false"
          style="width: 100%"
        />
      </div>
    </a-modal>

    <!-- 钱包地址管理弹窗 -->
    <a-modal
      v-model:open="walletAddressModal.visible"
      title="钱包地址管理"
      :width="620"
      class="wallet-address-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      :footer="null"
    >
      <div class="wallet-address-content">
        <div class="section-label">地址列表</div>
        <div class="address-list">
          <div class="address-item" v-for="item in walletAddressModal.addresses" :key="item.type">
            <div class="coin-info">
              <img :src="item.icon" :alt="item.type" class="coin-icon" />
              <div class="coin-text">
                <div class="coin-name">{{ item.type }}</div>
                <div class="coin-network">{{ item.network }}</div>
              </div>
            </div>
            <div class="address-value">{{ item.address || '-' }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <a-button type="primary" @click="walletAddressModal.visible = false">关 闭</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 修改提取资料弹窗 -->
    <a-modal
      v-model:open="modifyWithdrawInfoModal.visible"
      title="修改提取资料"
      :width="500"
      class="modify-withdraw-info-modal"
      :bodyStyle="{ padding: '24px' }"
      :footer="null"
    >
      <div class="modify-withdraw-info-content">
        <a-form layout="vertical">
          <a-form-item label="类型" required>
            <a-radio-group v-model:value="modifyWithdrawInfoModal.type">
              <a-radio value="crypto">加密货币</a-radio>
              <a-radio value="bank">银行卡</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="姓名" required>
            <a-input
              v-model:value="modifyWithdrawInfoModal.name"
              placeholder="输入"
            />
          </a-form-item>

          <a-form-item label="地址" required>
            <a-input
              v-model:value="modifyWithdrawInfoModal.address"
              placeholder="输入"
            />
          </a-form-item>

          <a-form-item label="开户行(银行卡用到)">
            <a-input
              v-model:value="modifyWithdrawInfoModal.bankName"
              placeholder="输入"
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 24 }" style="margin-bottom: 0; margin-top: 8px;">
            <a-button type="primary" block size="large" @click="handleModifyWithdrawInfoOk">
              确 认
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 修改登录密码弹窗 -->
    <a-modal
      v-model:open="modifyPasswordModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyPasswordOk"
      @cancel="modifyPasswordModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改登录密码</span>
        </div>
      </template>
      <div class="modify-password-content">
        <div class="form-label">新密码</div>
        <a-input-password
          v-model:value="modifyPasswordModal.newPassword"
          placeholder="请输入"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 修改交易密码弹窗 -->
    <a-modal
      v-model:open="modifyTradePasswordModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyTradePasswordOk"
      @cancel="modifyTradePasswordModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改交易密码</span>
        </div>
      </template>
      <div class="modify-password-content">
        <div class="form-label">新密码</div>
        <a-input-password
          v-model:value="modifyTradePasswordModal.newPassword"
          placeholder="请输入"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 修改上级弹窗 -->
    <a-modal
      v-model:open="modifyParentModal.visible"
      :width="480"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyParentOk"
      @cancel="modifyParentModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改上级</span>
        </div>
      </template>
      <div class="modify-parent-content">
        <div class="section-label">当前上级信息</div>
        <div class="info-table">
          <div class="info-row">
            <div class="info-cell label">uid</div>
            <div class="info-cell value">用户名</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">{{ modifyParentModal.parentInfo.uid || '-' }}</div>
            <div class="info-cell value">{{ modifyParentModal.parentInfo.username || '-' }}</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">邮箱</div>
            <div class="info-cell value">手机号</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">{{ modifyParentModal.parentInfo.email || '-' }}</div>
            <div class="info-cell value">{{ modifyParentModal.parentInfo.phone || '-' }}</div>
          </div>
        </div>
        <div class="form-label" style="margin-top: 20px;">新的上级UID</div>
        <div class="search-row">
          <a-input
            v-model:value="modifyParentModal.newParentUid"
            placeholder="请输入会员ID"
            style="flex: 1;"
          />
          <a-button type="primary" @click="handleSearchParent">搜 索</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 修改邀请码弹窗 -->
    <a-modal
      v-model:open="modifyInviteCodeModal.visible"
      :width="450"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyInviteCodeOk"
      @cancel="modifyInviteCodeModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改邀请码</span>
        </div>
      </template>
      <div class="modify-invite-code-content">
        <div class="current-info">当前邀请码: {{ modifyInviteCodeModal.currentCode }}</div>
        <div class="hint-text">修改后已保存的海报分享图无效，需要重新保存</div>
        <a-input
          v-model:value="modifyInviteCodeModal.newCode"
          placeholder="输入新邀请码"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 设置会员VIP等级弹窗 -->
    <a-modal
      v-model:open="modifyVipLevelModal.visible"
      :width="450"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyVipLevelOk"
      @cancel="modifyVipLevelModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>设置会员VIP等级</span>
        </div>
      </template>
      <div class="modify-vip-level-content">
        <div class="current-info">当前等级: {{ modifyVipLevelModal.currentLevel }}</div>
        <div class="form-label">等级</div>
        <a-select
          v-model:value="modifyVipLevelModal.newLevel"
          style="width: 100%"
          size="large"
        >
          <a-select-option value="VIP 1">VIP 1</a-select-option>
          <a-select-option value="VIP 2">VIP 2</a-select-option>
          <a-select-option value="VIP 3">VIP 3</a-select-option>
          <a-select-option value="VIP 4">VIP 4</a-select-option>
          <a-select-option value="VIP 5">VIP 5</a-select-option>
        </a-select>
        <div class="form-label" style="margin-top: 16px;">备注(可为空)</div>
        <a-textarea
          v-model:value="modifyVipLevelModal.remark"
          placeholder="输入"
          :rows="4"
        />
      </div>
    </a-modal>

    <!-- 修改登录验证弹窗 -->
    <a-modal
      v-model:open="modifyLoginVerifyModal.visible"
      :width="500"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyLoginVerifyOk"
      @cancel="modifyLoginVerifyModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改登录验证</span>
        </div>
      </template>
      <div class="modify-login-verify-content">
        <div class="section-label">会员信息</div>
        <div class="info-table">
          <div class="info-row">
            <div class="info-cell label">uid</div>
            <div class="info-cell value">用户名</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">{{ modifyLoginVerifyModal.record?.uid }}</div>
            <div class="info-cell value">{{ modifyLoginVerifyModal.record?.username }}</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">邮箱</div>
            <div class="info-cell value">手机号</div>
          </div>
          <div class="info-row">
            <div class="info-cell label">{{ modifyLoginVerifyModal.record?.email || '-' }}</div>
            <div class="info-cell value">{{ modifyLoginVerifyModal.record?.phone || '-' }}</div>
          </div>
          <div class="info-row single">
            <div class="info-cell label">当前状态</div>
          </div>
          <div class="info-row single">
            <div class="info-cell value">{{ modifyLoginVerifyModal.currentStatus }}</div>
          </div>
        </div>
        <div class="form-label" style="margin-top: 20px;">新验证</div>
        <a-radio-group v-model:value="modifyLoginVerifyModal.newVerify">
          <a-radio value="none">无</a-radio>
          <a-radio value="phone">手机</a-radio>
          <a-radio value="email" disabled>邮箱</a-radio>
        </a-radio-group>
      </div>
    </a-modal>

    <!-- 用户认证管理抽屉(实名信息) -->
    <a-drawer
      v-model:open="realNameInfoDrawer.visible"
      title="用户认证管理"
      placement="right"
      :width="500"
      :closable="true"
      class="real-name-drawer"
      :rootClassName="'rounded-drawer'"
      @close="realNameInfoDrawer.visible = false"
    >
      <template #extra>
        <a-button type="primary" @click="handleSaveRealNameInfo">保存&创建</a-button>
      </template>
      <div class="real-name-info-content">
        <div class="section-title">认证信息</div>
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-select v-model:value="realNameInfoDrawer.type" placeholder="请选择">
              <a-select-option value="身份证">身份证</a-select-option>
              <a-select-option value="驾驶证">驾驶证</a-select-option>
              <a-select-option value="行驶证">行驶证</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="证件姓名">
            <a-input v-model:value="realNameInfoDrawer.name" placeholder="输入" />
          </a-form-item>
          <a-form-item label="证件号">
            <a-input v-model:value="realNameInfoDrawer.idNumber" placeholder="输入" />
          </a-form-item>
          <a-form-item label="状态">
            <a-radio-group v-model:value="realNameInfoDrawer.status">
              <a-radio value="passed">通过</a-radio>
              <a-radio value="rejected">拒绝</a-radio>
              <a-radio value="pending">待审核</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
        <div class="section-title" style="margin-top: 24px;">证件图片</div>
        <div class="id-card-upload">
          <!-- 图片上传区域 -->
        </div>
      </div>
    </a-drawer>

    <!-- 修改认证状态弹窗 -->
    <a-modal
      v-model:open="modifyAuthStatusModal.visible"
      :width="520"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyAuthStatusOk"
      @cancel="modifyAuthStatusModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改认证状态</span>
        </div>
      </template>
      <div class="modify-auth-status-content">
        <div class="section-label">会员信息</div>
        <div class="info-table">
          <div class="info-row">
            <div class="info-cell">uid</div>
            <div class="info-cell">用户名</div>
          </div>
          <div class="info-row">
            <div class="info-cell">{{ modifyAuthStatusModal.record?.uid }}</div>
            <div class="info-cell">{{ modifyAuthStatusModal.record?.username }}</div>
          </div>
          <div class="info-row">
            <div class="info-cell">邮箱</div>
            <div class="info-cell">手机号</div>
          </div>
          <div class="info-row">
            <div class="info-cell">{{ modifyAuthStatusModal.record?.email || '-' }}</div>
            <div class="info-cell">{{ modifyAuthStatusModal.record?.phone || '-' }}</div>
          </div>
          <div class="info-row single">
            <div class="info-cell">当前认证状态</div>
          </div>
          <div class="info-row single">
            <div class="info-cell">{{ modifyAuthStatusModal.currentStatus }}</div>
          </div>
        </div>
        <div class="form-label" style="margin-top: 20px;">新状态</div>
        <a-radio-group v-model:value="modifyAuthStatusModal.newStatus">
          <a-radio value="passed">通过</a-radio>
          <a-radio value="rejected">拒绝</a-radio>
          <a-radio value="pending">待审核</a-radio>
        </a-radio-group>
        <div class="form-label" style="margin-top: 16px;">说明(选填)</div>
        <a-textarea
          v-model:value="modifyAuthStatusModal.remark"
          placeholder="输入原因描述"
          :rows="4"
        />
      </div>
    </a-modal>

    <!-- 修改信誉分弹窗 -->
    <a-modal
      v-model:open="modifyCreditScoreModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyCreditScoreOk"
      @cancel="modifyCreditScoreModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>修改信用积分(0-100)</span>
        </div>
      </template>
      <div class="modify-credit-score-content">
        <div class="current-info">当前信用积分: {{ modifyCreditScoreModal.currentScore }}</div>
        <a-slider
          v-model:value="modifyCreditScoreModal.newScore"
          :min="0"
          :max="100"
        />
        <a-input-number
          v-model:value="modifyCreditScoreModal.newScore"
          :min="0"
          :max="100"
          :controls="false"
          style="width: 100%; margin-top: 12px;"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 修改备注弹窗 -->
    <a-modal
      v-model:open="modifyRemarkModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleModifyRemarkOk"
      @cancel="modifyRemarkModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>设置备注(可为空)</span>
        </div>
      </template>
      <div class="modify-remark-content">
        <a-textarea
          v-model:value="modifyRemarkModal.remark"
          placeholder="请输入"
          :rows="5"
        />
      </div>
    </a-modal>

    <!-- 禁用账户确认弹窗 -->
    <a-modal
      v-model:open="disableAccountModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleDisableAccountOk"
      @cancel="disableAccountModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>账户启停</span>
        </div>
      </template>
      <div class="disable-account-content">
        <p>确认要禁止账户吗？把会员状态改为：冻结/禁止</p>
      </div>
    </a-modal>

    <!-- 禁用交易确认弹窗 -->
    <a-modal
      v-model:open="disableTradeModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleDisableTradeOk"
      @cancel="disableTradeModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>交易启停</span>
        </div>
      </template>
      <div class="disable-account-content">
        <p>确认要禁止该会员交易吗？</p>
      </div>
    </a-modal>

    <!-- 禁用提现确认弹窗 -->
    <a-modal
      v-model:open="disableWithdrawModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleDisableWithdrawOk"
      @cancel="disableWithdrawModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>提现启停</span>
        </div>
      </template>
      <div class="disable-account-content">
        <p>确认要禁止该会员提现吗？</p>
      </div>
    </a-modal>

    <!-- 禁用评论确认弹窗 -->
    <a-modal
      v-model:open="disableCommentModal.visible"
      :width="420"
      class="quick-edit-modal"
      :bodyStyle="{ padding: '20px 24px' }"
      @ok="handleDisableCommentOk"
      @cancel="disableCommentModal.visible = false"
    >
      <template #title>
        <div style="display: flex; align-items: center; gap: 8px;">
          <exclamation-circle-outlined style="color: #faad14; font-size: 20px;" />
          <span>评论启停</span>
        </div>
      </template>
      <div class="disable-account-content">
        <p>确认要禁止该会员评论吗？</p>
      </div>
    </a-modal>

    <!-- 订单列表页面 -->
    <transition name="slide-up">
      <div class="order-list-page" :class="`size-${orderListModal.tableSize}`" v-if="orderListModal.visible">
        <div class="order-list-page-content">
          <!-- 顶部操作栏 -->
          <div class="order-list-toolbar">
            <div class="toolbar-left">
              <div class="order-tabs">
                <span
                  :class="['tab-item', { active: orderListModal.activeTab === 'all' }]"
                  @click="orderListModal.activeTab = 'all'"
                >全部</span>
                <span
                  :class="['tab-item', { active: orderListModal.activeTab === 'completed' }]"
                  @click="orderListModal.activeTab = 'completed'"
                >已完成</span>
                <span
                  :class="['tab-item', { active: orderListModal.activeTab === 'pending' }]"
                  @click="orderListModal.activeTab = 'pending'"
                >未完成</span>
              </div>
            </div>
            <div class="toolbar-right">
              <a-input-search
                v-model:value="orderListModal.searchText"
                placeholder="单号、会员信息"
                style="width: 180px"
                @search="onOrderListSearch"
              />
              <a-button type="primary" @click="handleMoreOrderSearch">更多搜索</a-button>
              <a-button type="primary" danger @click="handleCloseOrderWindow">关闭窗口</a-button>
              <a-tooltip v-if="!topMenuMode" title="全屏">
                <span class="toolbar-icon" @click="toggleOrderListFullscreen">
                  <expand-outlined />
                </span>
              </a-tooltip>
              <a-tooltip title="刷新">
                <span class="toolbar-icon" @click="loadOrderListData">
                  <reload-outlined />
                </span>
              </a-tooltip>
              <a-dropdown>
                <a-tooltip title="密度">
                  <span class="toolbar-icon">
                    <column-height-outlined />
                  </span>
                </a-tooltip>
                <template #overlay>
                  <a-menu @click="handleOrderListDensityChange">
                    <a-menu-item key="default" :class="{ 'active-density': orderListModal.tableSize === 'default' }">宽松</a-menu-item>
                    <a-menu-item key="middle" :class="{ 'active-density': orderListModal.tableSize === 'middle' }">中等</a-menu-item>
                    <a-menu-item key="small" :class="{ 'active-density': orderListModal.tableSize === 'small' }">紧凑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>

          <!-- 订单表格 -->
          <div class="order-list-table-wrapper">
            <a-table
              :columns="orderListColumns"
              :data-source="orderListModal.list"
              :loading="orderListModal.loading"
              :pagination="false"
              :size="orderListModal.tableSize"
              bordered
              :scroll="{ x: 1600, y: orderListTableHeight }"
              :row-class-name="() => 'order-table-row'"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'member'">
                  <a-dropdown>
                    <a style="color: #1890ff; cursor: pointer;" @click.prevent>
                      {{ record.member }} <caret-down-outlined style="font-size: 10px; margin-left: 4px;" />
                    </a>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1">查看详情</a-menu-item>
                        <a-menu-item key="2">发送消息</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
                <template v-if="column.dataIndex === 'username'">
                  <span style="color: #1890ff; font-size: 16px;">{{ record.username }}</span>
                </template>
                <template v-if="column.dataIndex === 'orderCount'">
                  <span style="font-size: 16px;">{{ record.orderCount }}</span>
                </template>
                <template v-if="column.dataIndex === 'price'">
                  <span style="color: #1890ff; font-size: 16px;">{{ record.price }}</span>
                </template>
                <template v-if="column.dataIndex === 'profit'">
                  <span style="color: #52c41a; font-size: 16px;">{{ record.profit }}</span>
                </template>
                <template v-if="column.dataIndex === 'rate'">
                  <span style="color: #1890ff; font-size: 16px;">{{ record.rate }}</span>
                </template>
                <template v-if="column.dataIndex === 'multiple'">
                  <span style="font-size: 16px;">{{ record.multiple }}</span>
                </template>
                <template v-if="column.dataIndex === 'method'">
                  <a-tag
                    :style="record.method === '设定'
                      ? 'background: #fff0f6; border-color: #ffadd2; color: #eb2f96;'
                      : 'background: #e6f7ff; border-color: #91d5ff; color: #1890ff;'"
                  >{{ record.method }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'type'">
                  <a-tag
                    :style="record.type === '连单'
                      ? 'background: #f6ffed; border-color: #b7eb8f; color: #52c41a;'
                      : 'background: #e6f7ff; border-color: #91d5ff; color: #1890ff;'"
                  >{{ record.type }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'status'">
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <a-tag
                      :style="record.status === '已完成'
                        ? 'background: #f6ffed; border-color: #b7eb8f; color: #52c41a;'
                        : 'background: #fff1f0; border-color: #ffa39e; color: #ff4d4f;'"
                    >{{ record.status }}</a-tag>
                    <div v-if="record.status === '未完成' && record.needConfirm > 0" style="font-size: 14px; color: #000; line-height: 1.4; text-align: center; font-weight: 500;">
                      确认还需:<br/>{{ record.needConfirm }}
                    </div>
                  </div>
                </template>
                <template v-if="column.key === 'action'">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleOrderFinance(record)">财务</a>
                    <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleOrderDetail(record)">详情</a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 底部分页 -->
          <div class="order-list-footer">
            <span class="total-text">统计: {{ orderListModal.pagination.total }}/条</span>
            <a-pagination
              v-model:current="orderListModal.pagination.current"
              :total="orderListModal.pagination.total"
              :page-size="orderListModal.pagination.pageSize"
              size="small"
              show-quick-jumper
              :show-size-changer="false"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- 赠送记录页面 -->
    <transition name="slide-up">
      <div class="gift-record-page" :class="`size-${giftRecordModal.tableSize}`" v-if="giftRecordModal.visible">
        <div class="gift-record-page-content">
          <!-- 顶部操作栏 -->
          <div class="gift-record-toolbar">
            <div class="toolbar-left">
              <h3 class="page-title">后台充值记录</h3>
              <a-button type="primary" @click="handleAddGiftRecord">
                <template #icon><plus-outlined /></template>
                添加数据
              </a-button>
            </div>
            <div class="toolbar-right">
              <a-input-search
                v-model:value="giftRecordModal.searchText"
                placeholder="单号、会员信息"
                style="width: 180px"
                @search="onGiftRecordSearch"
              />
              <a-button type="primary" @click="handleMoreGiftRecordSearch">更多搜索</a-button>
              <a-button type="primary" danger @click="handleCloseGiftRecordWindow">关闭窗口</a-button>
              <a-tooltip v-if="!topMenuMode" title="全屏">
                <span class="toolbar-icon" @click="toggleGiftRecordFullscreen">
                  <expand-outlined />
                </span>
              </a-tooltip>
              <a-tooltip title="刷新">
                <span class="toolbar-icon" @click="loadGiftRecordData">
                  <reload-outlined />
                </span>
              </a-tooltip>
              <a-dropdown>
                <a-tooltip title="密度">
                  <span class="toolbar-icon">
                    <column-height-outlined />
                  </span>
                </a-tooltip>
                <template #overlay>
                  <a-menu @click="handleGiftRecordDensityChange">
                    <a-menu-item key="default" :class="{ 'active-density': giftRecordModal.tableSize === 'default' }">宽松</a-menu-item>
                    <a-menu-item key="middle" :class="{ 'active-density': giftRecordModal.tableSize === 'middle' }">中等</a-menu-item>
                    <a-menu-item key="small" :class="{ 'active-density': giftRecordModal.tableSize === 'small' }">紧凑</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>

          <!-- 赠送记录表格 -->
          <div class="gift-record-table-wrapper">
            <a-table
              :columns="giftRecordColumns"
              :data-source="giftRecordModal.list"
              :loading="giftRecordModal.loading"
              :pagination="false"
              :size="giftRecordModal.tableSize"
              bordered
              :scroll="{ x: 1100, y: giftRecordTableHeight }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'orderNo'">
                  <span style="color: #1890ff;">{{ record.orderNo }}</span>
                </template>
                <template v-if="column.dataIndex === 'member'">
                  <a-dropdown>
                    <a style="color: #1890ff; cursor: pointer;" @click.prevent>
                      {{ record.member }} <caret-down-outlined style="font-size: 10px; margin-left: 4px;" />
                    </a>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="1">查看详情</a-menu-item>
                        <a-menu-item key="2">发送消息</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
                <template v-if="column.dataIndex === 'amount'">
                  <span :style="{ color: record.type === '增加' ? '#52c41a' : '#ff4d4f', fontSize: '16px' }">{{ record.amount }}</span>
                </template>
                <template v-if="column.dataIndex === 'type'">
                  <a-tag
                    :color="record.type === '增加' ? 'success' : 'error'"
                  >{{ record.type }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleGiftRecordFinance(record)">财务</a>
                    <a style="color: #1890ff; font-size: 13px; cursor: pointer;" @click="handleGiftRecordContinue(record)">继续</a>
                  </div>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 底部分页和统计 -->
          <div class="gift-record-footer">
            <div class="footer-left">
              <span class="total-text">统计: {{ giftRecordModal.pagination.total }}/条</span>
              <a-pagination
                v-model:current="giftRecordModal.pagination.current"
                :total="giftRecordModal.pagination.total"
                :page-size="giftRecordModal.pagination.pageSize"
                size="small"
                show-quick-jumper
                :show-size-changer="false"
              />
            </div>
            <div class="footer-right">
              <span class="stats-item">本页统计  累计: <span class="stats-value blue">{{ giftRecordModal.stats.total }}</span>  有效: <span class="stats-value green">{{ giftRecordModal.stats.valid }}</span>  无效: <span class="stats-value red">{{ giftRecordModal.stats.invalid }}</span></span>
              <span class="stats-item">全部统计  累计: <span class="stats-value blue">{{ giftRecordModal.stats.total }}</span>  有效: <span class="stats-value green">{{ giftRecordModal.stats.valid }}</span>  无效: <span class="stats-value red">{{ giftRecordModal.stats.invalid }}</span></span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 下级用户层级页面 -->
    <transition name="slide-up">
      <div class="sub-users-page" v-if="subUsersModal.visible">
        <div class="sub-users-page-content">
          <!-- 顶部标题栏 -->
          <div class="sub-users-header">
            <h3 class="page-title">{{ subUsersModal.record?.username || 'xc03' }} - 层级</h3>
            <div class="header-actions">
              <a-tooltip title="刷新">
                <span class="toolbar-icon" @click="handleRefreshSubUsers">
                  <reload-outlined />
                </span>
              </a-tooltip>
              <a-tooltip title="关闭">
                <span class="toolbar-icon" @click="handleCloseSubUsersModal">
                  <close-outlined />
                </span>
              </a-tooltip>
              <a-tooltip v-if="!topMenuMode" title="全屏">
                <span class="toolbar-icon" @click="toggleSubUsersFullscreen">
                  <expand-outlined />
                </span>
              </a-tooltip>
            </div>
          </div>

          <!-- 工具栏 -->
          <div class="sub-users-toolbar">
            <div class="toolbar-item">
              <span class="toolbar-label">竖向布局</span>
              <a-switch v-model:checked="subUsersModal.isVertical" />
            </div>
            <div class="toolbar-item">
              <span class="toolbar-label">是否往上查询</span>
              <a-switch v-model:checked="subUsersModal.isUpQuery" />
            </div>
            <div class="toolbar-item">
              <a-input v-model:value="subUsersModal.searchUid" placeholder="请输入会员UID" style="width: 180px;" />
            </div>
            <div class="toolbar-item">
              <a-button type="primary" @click="handleSearchSubUsers">查 询</a-button>
            </div>
          </div>

          <!-- 层级树内容区域 -->
          <div class="sub-users-tree-wrapper">
            <div class="tree-container" :class="{ 'vertical': subUsersModal.isVertical }">
              <!-- 根节点 -->
              <div class="tree-root" v-if="subUsersModal.treeData">
                <div class="tree-node root-node">
                  <div class="node-content">
                    <div class="node-id">{{ subUsersModal.treeData.id }}</div>
                    <div class="node-count">({{ subUsersModal.treeData.count }}/人)</div>
                  </div>
                </div>

                <!-- 第一级子节点 -->
                <div class="tree-level level-1" v-if="subUsersModal.treeData.children && subUsersModal.treeData.children.length">
                  <div class="level-connector"></div>
                  <div class="level-nodes">
                    <div class="tree-branch" v-for="child in subUsersModal.treeData.children" :key="child.id">
                      <div class="branch-connector"></div>
                      <div class="tree-node">
                        <div class="node-content">
                          <div class="node-id">{{ child.id }}</div>
                          <div class="node-count">({{ child.count }}/人)</div>
                        </div>
                      </div>

                      <!-- 第二级子节点 -->
                      <div class="tree-level level-2" v-if="child.children && child.children.length">
                        <div class="level-connector"></div>
                        <div class="level-nodes">
                          <div class="tree-branch" v-for="grandChild in child.children" :key="grandChild.id">
                            <div class="branch-connector"></div>
                            <div class="tree-node leaf-node">
                              <div class="node-content">
                                <div class="node-id">{{ grandChild.id }}</div>
                                <div class="node-count">({{ grandChild.count }}/人)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 后台充值-创建抽屉 -->
    <a-drawer
      v-model:open="addGiftRecordDrawer.visible"
      placement="right"
      :width="420"
      :closable="false"
      :headerStyle="{ display: 'none' }"
      class="add-gift-record-drawer-wrapper"
      :rootClassName="'rounded-drawer'"
      @close="addGiftRecordDrawer.visible = false"
    >
      <div class="add-gift-record-drawer">
        <!-- 自定义头部 -->
        <div class="drawer-header">
          <a-button type="text" class="close-btn" @click="addGiftRecordDrawer.visible = false">
            <close-outlined />
          </a-button>
          <span class="drawer-title">后台充值-创建</span>
          <a-button type="primary" @click="handleSaveAndCreateGiftRecord">保存&创建</a-button>
        </div>

        <!-- 表单内容 -->
        <div class="drawer-form">
          <!-- 资产信息（继续操作时显示） -->
          <div class="asset-info" v-if="addGiftRecordDrawer.availableAmount !== null">
            <div class="asset-item">
              <span class="asset-label">可用数量</span>
              <span class="asset-value">{{ addGiftRecordDrawer.availableAmount }}</span>
            </div>
            <div class="asset-item">
              <span class="asset-label">冻结数量</span>
              <span class="asset-value">{{ addGiftRecordDrawer.frozenAmount }}</span>
            </div>
          </div>
          <div class="form-tip" v-else>输入会员UID和选择'到账币种'后显示资产</div>

          <div class="form-item">
            <div class="form-label">会员UID</div>
            <div class="form-input-group">
              <a-input v-model:value="addGiftRecordDrawer.memberUid" placeholder="请输入会员ID" />
              <a-button type="primary" @click="handleSearchGiftMemberUid">搜 索</a-button>
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">方式</div>
            <a-radio-group v-model:value="addGiftRecordDrawer.type">
              <a-radio value="sub">扣减</a-radio>
              <a-radio value="add">增加</a-radio>
            </a-radio-group>
          </div>

          <div class="form-item">
            <div class="form-label">数量</div>
            <a-input v-model:value="addGiftRecordDrawer.amount" placeholder="输入" />
          </div>

          <div class="form-item">
            <div class="form-label">说明(选填)</div>
            <a-textarea
              v-model:value="addGiftRecordDrawer.remark"
              placeholder="输入"
              :rows="4"
              :auto-size="{ minRows: 4, maxRows: 4 }"
            />
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 后台充值-筛选抽屉 -->
    <a-drawer
      v-model:open="giftRecordSearchDrawer.visible"
      title="筛选"
      placement="right"
      :width="380"
      :closable="true"
      class="gift-record-search-drawer"
      rootClassName="rounded-drawer"
      @close="giftRecordSearchDrawer.visible = false"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a style="color: #ff4d4f; cursor: pointer;" @click="handleResetGiftRecordSearch">重置</a>
          <a-button type="primary" @click="handleSubmitGiftRecordSearch">提交</a-button>
        </div>
      </template>
      <div class="gift-record-search-form">
        <div class="form-item">
          <div class="form-label">状态</div>
          <a-select
            v-model:value="giftRecordSearchDrawer.status"
            placeholder="全部"
            :options="giftRecordStatusOptions"
            style="width: 100%;"
            allowClear
          />
        </div>
        <div class="form-item">
          <div class="form-label">会员ID</div>
          <a-input v-model:value="giftRecordSearchDrawer.memberId" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">开始时间</div>
          <a-date-picker
            v-model:value="giftRecordSearchDrawer.startTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">结束时间</div>
          <a-date-picker
            v-model:value="giftRecordSearchDrawer.endTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">搜索(全称)</div>
          <a-input-search
            v-model:value="giftRecordSearchDrawer.keyword"
            placeholder="搜索内容"
            @search="handleSearchGiftRecordKeyword"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="giftRecordSearchDrawer.sortField"
            :options="giftRecordSortFieldOptions"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序类型</div>
          <a-select
            v-model:value="giftRecordSearchDrawer.sortType"
            :options="giftRecordSortTypeOptions"
            style="width: 100%;"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 赠送记录财务日志抽屉 -->
    <a-drawer
      v-model:open="giftRecordFinanceDrawer.visible"
      title="财务日志"
      placement="right"
      :width="800"
      :closable="true"
      class="gift-record-finance-drawer"
      rootClassName="rounded-drawer"
      @close="giftRecordFinanceDrawer.visible = false"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <div class="gift-record-finance-content">
        <a-table
          :columns="giftRecordFinanceColumns"
          :data-source="giftRecordFinanceDrawer.list"
          :loading="giftRecordFinanceDrawer.loading"
          :pagination="false"
          size="small"
          bordered
          :scroll="{ y: 'calc(100vh - 180px)' }"
        />
        <div class="finance-footer">
          <span class="total-text">统计: {{ giftRecordFinanceDrawer.pagination.total }}/条</span>
          <a-pagination
            v-model:current="giftRecordFinanceDrawer.pagination.current"
            :total="giftRecordFinanceDrawer.pagination.total"
            :page-size="giftRecordFinanceDrawer.pagination.pageSize"
            size="small"
            show-quick-jumper
            :show-size-changer="false"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 订单搜索抽屉 -->
    <a-drawer
      v-model:open="orderSearchDrawer.visible"
      title="筛选"
      placement="right"
      :width="400"
      :closable="true"
      class="order-search-drawer"
      rootClassName="rounded-drawer"
      @close="handleCloseOrderSearchDrawer"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <template #extra>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a style="color: #ff4d4f; cursor: pointer;" @click="handleResetOrderSearch">重置</a>
          <a-button type="primary" @click="handleSubmitOrderSearch">提交</a-button>
        </div>
      </template>
      <div class="order-search-form">
        <div class="form-item">
          <div class="form-label">商品ID</div>
          <a-input v-model:value="orderSearchDrawer.productId" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">会员UID</div>
          <div style="display: flex; gap: 8px;">
            <a-input v-model:value="orderSearchDrawer.memberUid" placeholder="输入" style="flex: 1;" />
            <a-button type="primary" @click="handleSearchMemberUid">搜 索</a-button>
          </div>
        </div>
        <div class="form-item">
          <div class="form-label">最低价格</div>
          <a-input v-model:value="orderSearchDrawer.minPrice" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">最高价格</div>
          <a-input v-model:value="orderSearchDrawer.maxPrice" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">订单号</div>
          <a-input v-model:value="orderSearchDrawer.orderNo" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">搜索</div>
          <a-input v-model:value="orderSearchDrawer.keyword" placeholder="输入" />
        </div>
        <div class="form-item">
          <div class="form-label">开始时间</div>
          <a-date-picker
            v-model:value="orderSearchDrawer.startTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">结束时间</div>
          <a-date-picker
            v-model:value="orderSearchDrawer.endTime"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序字段</div>
          <a-select
            v-model:value="orderSearchDrawer.sortField"
            placeholder="创建时间"
            style="width: 100%;"
            :options="sortFieldOptions"
          />
        </div>
        <div class="form-item">
          <div class="form-label">排序类型</div>
          <a-select
            v-model:value="orderSearchDrawer.sortType"
            placeholder="降序排序"
            style="width: 100%;"
            :options="sortTypeOptions"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 订单财务日志抽屉 -->
    <a-drawer
      v-model:open="orderFinanceModal.visible"
      title="财务日志"
      placement="right"
      :width="860"
      :closable="true"
      rootClassName="rounded-drawer"
    >
      <template #closeIcon>
        <CloseOutlined style="font-size: 16px;" />
      </template>
      <div class="order-finance-content">
        <a-table
          :columns="orderFinanceColumns"
          :data-source="orderFinanceModal.list"
          :loading="orderFinanceModal.loading"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'direction'">
              <span :style="record.direction === '增加' ? 'color: #52c41a;' : 'color: #ff4d4f;'">{{ record.direction }}</span>
            </template>
            <template v-if="column.dataIndex === 'type'">
              <a-tag>{{ record.type }}</a-tag>
            </template>
          </template>
        </a-table>
        <div class="order-finance-footer">
          <span class="total-text">统计: {{ orderFinanceModal.pagination.total }}/条</span>
          <a-pagination
            v-model:current="orderFinanceModal.pagination.current"
            :total="orderFinanceModal.pagination.total"
            :page-size="orderFinanceModal.pagination.pageSize"
            size="small"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 商品详情抽屉 -->
    <a-drawer
      v-model:open="productDetailDrawer.visible"
      placement="right"
      :width="500"
      :closable="false"
      :headerStyle="{ display: 'none' }"
      class="product-detail-drawer"
      :rootClassName="'rounded-drawer'"
    >
      <div class="product-detail-content">
        <div class="drawer-header">
          <close-outlined class="close-btn" @click="productDetailDrawer.visible = false" />
          <span class="drawer-title">商品详情</span>
          <span></span>
        </div>
        <div class="product-info">
          <div class="product-image">
            <img :src="productDetailDrawer.image" alt="商品图片" />
          </div>
          <div class="product-meta">
            <div class="product-title">{{ productDetailDrawer.title }}</div>
            <div class="meta-row">
              <span class="meta-label">价格：</span>
              <span class="meta-value price">{{ productDetailDrawer.price }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">利润：</span>
              <span class="meta-value profit">{{ productDetailDrawer.profit }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">利率：</span>
              <span class="meta-value rate">{{ productDetailDrawer.rate }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 创建会员抽屉 -->
    <a-drawer
      v-model:open="createMemberModal.visible"
      title="创建会员"
      placement="right"
      :width="620"
      :closable="true"
      class="create-member-drawer-wrapper"
      :rootClassName="'rounded-drawer'"
      @close="createMemberModal.visible = false"
    >
      <template #extra>
        <a-button type="primary" @click="handleCreateMember">保存&创建</a-button>
      </template>
      <div class="create-member-drawer">
        <a-form
          :model="createMemberForm"
          :rules="createMemberRules"
          ref="createMemberFormRef"
          layout="vertical"
        >
          <!-- 必要选项 -->
          <div class="form-section">
            <div class="section-title">必要选项(邮箱、手机号二选一)</div>
            <a-form-item label="邮箱">
              <a-input v-model:value="createMemberForm.email" placeholder="输入" />
            </a-form-item>
            <a-form-item label="手机号">
              <a-row :gutter="12">
                <a-col :span="8">
                  <PhoneCodeSelect
                    v-model:value="createMemberForm.phoneCode"
                    placeholder="手机区号"
                  />
                </a-col>
                <a-col :span="16">
                  <a-input v-model:value="createMemberForm.phone" placeholder="请输入手机号" />
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="登录密码" name="password" required>
              <a-input-password v-model:value="createMemberForm.password" placeholder="输入" />
            </a-form-item>
          </div>

          <!-- 必填信息 -->
          <div class="form-section">
            <div class="section-title">必填信息</div>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="用户名">
                  <a-input v-model:value="createMemberForm.username" placeholder="输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="上级推荐码">
                  <a-input v-model:value="createMemberForm.parentInviteCode" placeholder="输入" />
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <!-- 其它(选填) -->
          <div class="form-section">
            <div class="section-title">其它(选填)</div>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="自定义UID(纯数字)">
                  <a-input v-model:value="createMemberForm.customUid" placeholder="输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="信用积分">
                  <a-input-number v-model:value="createMemberForm.creditScore" style="width: 100%" :min="0" :max="200" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="状态">
                  <a-select v-model:value="createMemberForm.status">
                    <a-select-option value="normal">正常</a-select-option>
                    <a-select-option value="frozen">冻结</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="自定义邀请码">
                  <a-input v-model:value="createMemberForm.customInviteCode" placeholder="输入" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="支付密码" style="width: 50%;">
              <a-input-password v-model:value="createMemberForm.payPassword" placeholder="输入" />
            </a-form-item>
            <a-form-item label="备注">
              <a-textarea v-model:value="createMemberForm.remark" placeholder="输入" :rows="4" />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="提现开关" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="createMemberForm.withdrawSwitch" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="交易开关" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="createMemberForm.tradeSwitch" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="假人" class="switch-item">
                  <div class="switch-wrapper">
                    <span class="switch-text">开关</span>
                    <a-switch v-model:checked="createMemberForm.isFake" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  MinusOutlined,
  MinusCircleOutlined,
  ExpandOutlined,
  CompressOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  EditOutlined,
  FormOutlined,
  DownOutlined,
  CaretDownOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  GiftOutlined,
  DollarOutlined,
  UserOutlined,
  UserSwitchOutlined,
  LockOutlined,
  SafetyOutlined,
  WalletOutlined,
  IdcardOutlined,
  TeamOutlined,
  ShareAltOutlined,
  CrownOutlined,
  FileTextOutlined,
  StopOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  NodeIndexOutlined,
  AuditOutlined,
  FieldTimeOutlined,
  LineChartOutlined,
  ShoppingOutlined,
  TransactionOutlined,
  TrophyOutlined,
  FieldNumberOutlined,
  GroupOutlined,
  CreditCardOutlined,
  SecurityScanOutlined,
  SolutionOutlined,
  StarOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  FileProtectOutlined,
  LoginOutlined,
  RiseOutlined
} from '@ant-design/icons-vue'
import PhoneCodeSelect from '@/components/PhoneCodeSelect.vue'

const loading = ref(false)
const showMoreSearch = ref(false)
const searchText = ref('')
const isFullscreen = ref(false)
const tableSize = ref('small')

const setCollapsed = inject('setCollapsed', null)
const topMenuMode = inject('topMenuMode', ref(false))

// 筛选表单
const filterForm = reactive({
  uid: '',
  country: undefined,
  status: undefined,
  birthday: null,
  startTime: null,
  endTime: null,
  searchKeyword: '',
  sortField: undefined,
  sortType: undefined
})

// 重置筛选
const resetFilter = () => {
  filterForm.uid = ''
  filterForm.country = undefined
  filterForm.status = undefined
  filterForm.birthday = null
  filterForm.startTime = null
  filterForm.endTime = null
  filterForm.searchKeyword = ''
  filterForm.sortField = undefined
  filterForm.sortType = undefined
}

// 提交筛选
const submitFilter = () => {
  message.success('筛选条件已应用')
  showMoreSearch.value = false
}

// VIP等级选项（后期从等级设置菜单获取）
const vipLevelOptions = ref([
  { value: 'VIP 1', label: 'VIP 1' },
  { value: 'VIP 2', label: 'VIP 2' },
  { value: 'VIP 3', label: 'VIP 3' },
  { value: 'VIP 4', label: 'VIP 4' },
  { value: 'VIP 5', label: 'VIP 5' }
])

// VIP等级编辑弹窗
const vipLevelModal = reactive({
  visible: false,
  currentLevel: '',
  newLevel: undefined,
  remark: '',
  record: null,
  levelIcon: ''
})

// 打开VIP等级编辑弹窗
const handleEditVipLevel = (record) => {
  vipLevelModal.visible = true
  // 提取VIP等级数字，显示为 VIP 1 格式
  const levelMatch = record.vipLevel.match(/\((\d+)\)/)
  const levelNum = levelMatch ? levelMatch[1] : '1'
  vipLevelModal.currentLevel = `VIP ${levelNum}`
  vipLevelModal.newLevel = undefined
  vipLevelModal.remark = ''
  vipLevelModal.record = record
  // 根据等级设置图标（后期从等级设置获取）
  vipLevelModal.levelIcon = ''
}

// 确认修改VIP等级
const handleVipLevelOk = () => {
  if (!vipLevelModal.newLevel) {
    message.warning('请选择等级')
    return
  }
  // 更新等级
  if (vipLevelModal.record) {
    vipLevelModal.record.vipLevel = vipLevelModal.newLevel
  }
  message.success('VIP等级修改成功')
  vipLevelModal.visible = false
}

// 备注编辑弹窗
const remarkModal = reactive({
  visible: false,
  content: '',
  record: null
})

// 打开备注编辑弹窗
const handleEditRemark = (record) => {
  remarkModal.visible = true
  remarkModal.content = record.remark || ''
  remarkModal.record = record
}

// 确认修改备注
const handleRemarkOk = () => {
  if (remarkModal.record) {
    remarkModal.record.remark = remarkModal.content
  }
  message.success('备注修改成功')
  remarkModal.visible = false
}

// 信用积分编辑弹窗
const creditScoreModal = reactive({
  visible: false,
  currentScore: 0,
  newScore: 0,
  record: null
})

// 打开信用积分编辑弹窗
const handleEditCreditScore = (record) => {
  creditScoreModal.visible = true
  creditScoreModal.currentScore = record.creditScore
  creditScoreModal.newScore = record.creditScore
  creditScoreModal.record = record
}

// 确认修改信用积分
const handleCreditScoreOk = () => {
  if (creditScoreModal.record) {
    creditScoreModal.record.creditScore = creditScoreModal.newScore
  }
  message.success('信用积分修改成功')
  creditScoreModal.visible = false
}

// 邀请码编辑弹窗
const inviteCodeModal = reactive({
  visible: false,
  currentCode: '',
  newCode: '',
  record: null
})

// 余额管理弹窗
const balanceModal = reactive({
  visible: false,
  currentBalance: 0,
  type: 'add', // 'add' 增加, 'subtract' 扣减
  amount: null,
  remark: '',
  record: null
})

// 计算变动后余额
const computedNewBalance = computed(() => {
  const current = balanceModal.currentBalance || 0
  const amount = balanceModal.amount || 0
  if (balanceModal.type === 'add') {
    return current + amount
  } else {
    return current - amount
  }
})

// 连单管理弹窗
const orderModal = reactive({
  visible: false,
  record: null,
  searchText: '',
  loading: false,
  tableSize: 'small',
  isFullscreen: false,
  orderList: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  }
})

// 连单列表假数据
const mockOrderList = [
  {
    id: 3242,
    orderNo: 8,
    products: [
      { name: 'HD 4K Action Camera Waterproof Sports DV', price: 199.99, commissionRate: 3.6, commissionMultiple: 2, status: 'pending' },
      { name: 'Electric Scooter Foldable Adult Kick Scooter', price: 459.0, commissionRate: 3.6, commissionMultiple: 2, status: 'pending' }
    ],
    createType: '管理员',
    creator: '小陆',
    createTime: '2025-12-16 02:15:30',
    status: 'pending'
  },
  {
    id: 3240,
    orderNo: 10,
    products: [
      { name: 'Wholesale Eyeglasses Frames ...', price: 3000, commissionRate: 3.6, commissionMultiple: 10, status: 'completed' },
      { name: '2022 Brand new Galaxy S22 Ul...', price: 15101.32, commissionRate: 3.6, commissionMultiple: 10, status: 'pending' }
    ],
    createType: '管理员',
    creator: '小陆',
    createTime: '2025-12-16 01:39:40',
    status: 'pending'
  },
  {
    id: 3238,
    orderNo: 18,
    products: [
      { name: 'NWM130 Light Blue Color Slim F', price: 695.52, commissionRate: 3.6, commissionMultiple: 1, status: 'completed' },
      { name: 'White Aluminum Alloy Plastic sle', price: 689.58, commissionRate: 3.6, commissionMultiple: 1, status: 'completed' }
    ],
    createType: '管理员',
    creator: '小陆',
    createTime: '2025-12-16 01:02:55',
    status: 'completed'
  },
  {
    id: 3235,
    orderNo: 5,
    products: [
      { name: 'Professional Gaming Keyboard RGB Backlit', price: 89.99, commissionRate: 3.6, commissionMultiple: 2, status: 'completed' }
    ],
    createType: '管理员',
    creator: '小陆',
    createTime: '2025-12-15 18:30:22',
    status: 'completed'
  },
  {
    id: 3230,
    orderNo: 12,
    products: [
      { name: 'Smart Watch Fitness Tracker Heart Rate', price: 128.88, commissionRate: 3.6, commissionMultiple: 5, status: 'completed' },
      { name: 'Wireless Bluetooth Earbuds TWS Stereo', price: 45.5, commissionRate: 3.6, commissionMultiple: 5, status: 'completed' },
      { name: 'Portable Power Bank 20000mAh Fast Charging', price: 56.7, commissionRate: 3.6, commissionMultiple: 5, status: 'pending' }
    ],
    createType: '管理员',
    creator: '小陆',
    createTime: '2025-12-15 14:20:10',
    status: 'pending'
  }
]

// 创建连单抽屉
const createOrderDrawer = reactive({
  visible: false,
  orderNo: '', // 第N单
  commissionRate: 1, // 每单佣金倍数
  selectedGoods: [], // 已选商品列表
  goodsList: [], // 商品列表
  minPrice: null, // 最低价格
  maxPrice: null, // 最高价格
  loading: false,
  editingOrderId: null, // 正在编辑的连单ID（添加商品时使用）
  isEditMode: false, // 是否为编辑模式
  pagination: {
    current: 1,
    pageSize: 30,
    total: 4014
  }
})

// 编辑会员抽屉
const editMemberDrawer = reactive({
  visible: false,
  form: {
    uid: '',
    phone: '',
    email: '',
    phoneCode: '1-United States',
    phoneNumber: '',
    password: '',
    username: '',
    customUid: '',
    creditScore: '100',
    status: 'normal',
    inviteCode: '',
    payPassword: '',
    remark: '',
    withdrawSwitch: true,
    tradeSwitch: true,
    isRobot: true
  }
})

// 财务日志弹窗
const financeModal = reactive({
  visible: false,
  record: null,
  loading: false,
  list: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  }
})

// 财务日志假数据
const mockFinanceList = [
  { id: 1, direction: 'add', type: '利润', beforeAmount: 1148.73, amount: 5.27, afterAmount: 1154, time: '08/16 14:36' },
  { id: 2, direction: 'add', type: '利润', beforeAmount: 1145.4, amount: 3.33, afterAmount: 1148.73, time: '08/16 14:36' },
  { id: 3, direction: 'add', type: '利润', beforeAmount: 1141.13, amount: 4.27, afterAmount: 1145.4, time: '08/16 14:36' },
  { id: 4, direction: 'add', type: '利润', beforeAmount: 1135.67, amount: 5.46, afterAmount: 1141.13, time: '08/16 14:36' },
  { id: 5, direction: 'add', type: '利润', beforeAmount: 1131.71, amount: 3.96, afterAmount: 1135.67, time: '08/16 14:36' },
  { id: 6, direction: 'add', type: '利润', beforeAmount: 1127.1, amount: 4.61, afterAmount: 1131.71, time: '08/16 14:36' },
  { id: 7, direction: 'add', type: '利润', beforeAmount: 1123.14, amount: 3.96, afterAmount: 1127.1, time: '08/16 14:35' },
  { id: 8, direction: 'add', type: '利润', beforeAmount: 1118.82, amount: 4.32, afterAmount: 1123.14, time: '08/16 14:35' },
  { id: 9, direction: 'add', type: '利润', beforeAmount: 1115.09, amount: 3.73, afterAmount: 1118.82, time: '08/16 14:35' },
  { id: 10, direction: 'add', type: '利润', beforeAmount: 1111.86, amount: 3.23, afterAmount: 1115.09, time: '08/16 14:35' },
  { id: 11, direction: 'add', type: '利润', beforeAmount: 1106.85, amount: 5.01, afterAmount: 1111.86, time: '08/16 14:35' },
  { id: 12, direction: 'add', type: '利润', beforeAmount: 1103.88, amount: 2.97, afterAmount: 1106.85, time: '08/16 14:35' },
  { id: 13, direction: 'add', type: '利润', beforeAmount: 1100.14, amount: 3.74, afterAmount: 1103.88, time: '08/16 14:35' },
  { id: 14, direction: 'add', type: '利润', beforeAmount: 1095.64, amount: 4.5, afterAmount: 1100.14, time: '08/16 14:34' },
  { id: 15, direction: 'add', type: '利润', beforeAmount: 1092.77, amount: 2.87, afterAmount: 1095.64, time: '08/16 14:34' },
  { id: 16, direction: 'add', type: '利润', beforeAmount: 1089.52, amount: 3.25, afterAmount: 1092.77, time: '08/16 14:33' },
  { id: 17, direction: 'add', type: '利润', beforeAmount: 1085, amount: 4.52, afterAmount: 1089.52, time: '08/16 14:27' },
  { id: 18, direction: 'add', type: '手工加额', beforeAmount: 25, amount: 1060, afterAmount: 1085, time: '08/16 14:04' },
  { id: 19, direction: 'add', type: '注册赠送', beforeAmount: 0, amount: 25, afterAmount: 25, time: '08/16 14:03' },
  { id: 20, direction: 'subtract', type: '购买商品', beforeAmount: 1200, amount: 51.27, afterAmount: 1148.73, time: '08/16 14:30' },
  { id: 21, direction: 'add', type: '返佣', beforeAmount: 1050, amount: 35, afterAmount: 1085, time: '08/16 14:02' },
  { id: 22, direction: 'subtract', type: '购买商品', beforeAmount: 1150, amount: 100, afterAmount: 1050, time: '08/16 14:01' }
]

// 财务日志表格列配置
const financeColumns = [
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 100, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120, align: 'center' },
  { title: '前数量', dataIndex: 'beforeAmount', key: 'beforeAmount', width: 150, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 120, align: 'center' },
  { title: '后数量', dataIndex: 'afterAmount', key: 'afterAmount', width: 150, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 150, align: 'center' }
]

// 财务日志表格高度
const financeTableHeight = computed(() => {
  return 'calc(100vh - 180px)'
})

// 加载财务日志
const loadFinanceList = () => {
  financeModal.loading = true
  setTimeout(() => {
    financeModal.list = [...mockFinanceList]
    financeModal.pagination.total = mockFinanceList.length
    financeModal.loading = false
  }, 300)
}

// 商品列表mock数据
const mockGoodsList = [
  { id: 36227, name: 'NWM130 Light Blue Color Slim Fit Men Suits 3 Pieces Suits Classic Design Bridegroom Suits', price: 695.52 },
  { id: 36226, name: 'White Aluminum Alloy Plastic sleeping bag baby stroller baby 3 in 1', price: 689.58 },
  { id: 36225, name: 'touch to open smart home kitchen cabinets with soft hinge', price: 357.5 },
  { id: 36224, name: 'Hot Selling Large Food Industrial Supplier Multifunction 3 in 1 Heavy Duty Electric Meat Cake Milk 50l Planetary Mixer For Dough', price: 122085.4 },
  { id: 36223, name: 'aluminum lightweight portable one hand folding convenience newborn and toddler single baby carriage toddler seat baby stroller', price: 128.7 },
  { id: 36222, name: 'Auto Parts OEM 33030-0K350 for Hilux Manual Transmission Gearbox Assembly', price: 936 },
  { id: 36221, name: 'Luxury Women\'s Formal Shoes Party Genuine Leather Snake Skin High Heels Handmade Pumps Women Shoes', price: 207 },
  { id: 36220, name: 'Professional Gaming Keyboard RGB Backlit Mechanical Keyboard', price: 89.99 },
  { id: 36219, name: 'Wireless Bluetooth Earbuds TWS Stereo Sound Earphones', price: 45.5 },
  { id: 36218, name: 'Smart Watch Fitness Tracker Heart Rate Monitor Sport Band', price: 128.88 },
  { id: 36217, name: 'Portable Power Bank 20000mAh Fast Charging External Battery', price: 56.7 },
  { id: 36216, name: 'HD 4K Action Camera Waterproof Sports DV Camcorder', price: 199.99 },
  { id: 36215, name: 'Electric Scooter Foldable Adult Kick Scooter 350W Motor', price: 459.0 },
  { id: 36214, name: 'Robot Vacuum Cleaner Smart Navigation Auto Charging', price: 289.5 },
  { id: 36213, name: 'Air Fryer Digital Touch Screen 5.5L Large Capacity', price: 79.99 },
  { id: 36212, name: 'Espresso Coffee Machine Automatic Milk Frother 15 Bar', price: 168.0 },
  { id: 36211, name: 'Electric Standing Desk Height Adjustable Home Office', price: 399.0 },
  { id: 36210, name: 'Memory Foam Mattress Queen Size Medium Firm Support', price: 599.99 },
  { id: 36209, name: 'LED Ring Light Kit Photography Studio Lighting Stand', price: 35.5 },
  { id: 36208, name: 'Wireless Gaming Mouse RGB Lighting 16000 DPI Optical', price: 42.0 },
  { id: 36207, name: 'Noise Cancelling Headphones Over Ear Bluetooth 5.0', price: 156.8 },
  { id: 36206, name: 'Mechanical Keyboard Custom Hot Swappable RGB Backlit', price: 129.0 },
  { id: 36205, name: 'Webcam 4K Ultra HD Autofocus USB Computer Camera', price: 78.5 },
  { id: 36204, name: 'USB C Hub Multiport Adapter 7 in 1 HDMI Thunderbolt', price: 49.99 },
  { id: 36203, name: 'Laptop Stand Aluminum Adjustable Ergonomic Riser', price: 32.0 },
  { id: 36202, name: 'External SSD 1TB Portable Solid State Drive USB 3.1', price: 89.99 },
  { id: 36201, name: 'Wireless Charger Pad 15W Fast Charging Compatible', price: 25.0 },
  { id: 36200, name: 'Smart Light Bulb WiFi LED Color Changing Dimmable', price: 18.5 },
  { id: 36199, name: 'Security Camera System 4K PoE IP Outdoor Waterproof', price: 349.0 },
  { id: 36198, name: 'Electric Kettle Temperature Control Stainless Steel', price: 45.0 }
]

// 计算已选商品累计金额
const selectedTotalAmount = computed(() => {
  return createOrderDrawer.selectedGoods.reduce((sum, item) => sum + item.price, 0)
})

// 加载商品列表
const loadGoodsList = () => {
  createOrderDrawer.loading = true
  setTimeout(() => {
    createOrderDrawer.goodsList = mockGoodsList
    createOrderDrawer.loading = false
  }, 300)
}

// 搜索商品（按价格筛选）
const handleSearchGoods = () => {
  createOrderDrawer.loading = true
  setTimeout(() => {
    let filtered = [...mockGoodsList]
    if (createOrderDrawer.minPrice !== null && createOrderDrawer.minPrice !== '') {
      filtered = filtered.filter(item => item.price >= createOrderDrawer.minPrice)
    }
    if (createOrderDrawer.maxPrice !== null && createOrderDrawer.maxPrice !== '') {
      filtered = filtered.filter(item => item.price <= createOrderDrawer.maxPrice)
    }
    createOrderDrawer.goodsList = filtered
    createOrderDrawer.pagination.total = filtered.length
    createOrderDrawer.loading = false
  }, 300)
}

// 选择商品
const handleSelectGoods = (goods) => {
  // 检查是否已选择
  const exists = createOrderDrawer.selectedGoods.find(item => item.id === goods.id)
  if (exists) {
    message.warning('该商品已选择')
    return
  }
  createOrderDrawer.selectedGoods.push({ ...goods })
  message.success('已添加到已选列表')
}

// 移除已选商品
const handleRemoveSelectedGoods = (index) => {
  createOrderDrawer.selectedGoods.splice(index, 1)
}

// 检查商品是否已选择
const isGoodsSelected = (id) => {
  return createOrderDrawer.selectedGoods.some(item => item.id === id)
}

// 通过ID移除商品
const handleRemoveGoodsById = (id) => {
  const index = createOrderDrawer.selectedGoods.findIndex(item => item.id === id)
  if (index > -1) {
    createOrderDrawer.selectedGoods.splice(index, 1)
  }
}

// 修改价格弹窗
const editPriceModal = reactive({
  visible: false,
  record: null,
  index: -1,
  newPrice: 0
})

// 打开修改价格弹窗
const openEditPriceModal = (item, index) => {
  editPriceModal.record = item
  editPriceModal.index = index
  editPriceModal.newPrice = item.price
  editPriceModal.visible = true
}

// 确认修改价格
const handleEditPriceOk = () => {
  if (editPriceModal.index > -1 && editPriceModal.newPrice >= 0) {
    createOrderDrawer.selectedGoods[editPriceModal.index].price = editPriceModal.newPrice
    message.success('价格修改成功')
  }
  editPriceModal.visible = false
}

// 商品分页变化
const onGoodsPageChange = (page) => {
  createOrderDrawer.pagination.current = page
}

// 保存并创建连单
const handleSaveAndCreateOrder = () => {
  if (createOrderDrawer.selectedGoods.length === 0) {
    message.warning('请至少选择一个商品')
    return
  }
  if (!createOrderDrawer.orderNo) {
    message.warning('请输入第N单')
    return
  }

  // 构造商品数据
  const newProducts = createOrderDrawer.selectedGoods.map(goods => ({
    name: goods.name.length > 35 ? goods.name.substring(0, 35) + '...' : goods.name,
    price: goods.price,
    commissionRate: 3.6,
    commissionMultiple: createOrderDrawer.commissionRate,
    status: 'pending'
  }))

  // 判断是新建、编辑还是添加商品
  if (createOrderDrawer.editingOrderId) {
    const existingOrder = mockOrderList.find(o => o.id === createOrderDrawer.editingOrderId)
    if (existingOrder) {
      if (createOrderDrawer.isEditMode) {
        // 编辑模式：替换整个商品列表
        existingOrder.products = newProducts
        existingOrder.orderNo = parseInt(createOrderDrawer.orderNo)
        existingOrder.status = 'pending'
        message.success('连单编辑成功')
      } else {
        // 添加商品模式：追加商品
        existingOrder.products.push(...newProducts)
        existingOrder.status = 'pending'
        message.success('商品添加成功')
      }
    }
  } else {
    // 新建连单
    const newOrder = {
      id: Math.floor(Math.random() * 10000) + 4000,
      orderNo: parseInt(createOrderDrawer.orderNo),
      products: newProducts,
      createType: '管理员',
      creator: '小陆',
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-'),
      status: 'pending'
    }
    // 添加到列表最前面
    mockOrderList.unshift(newOrder)
    message.success('连单创建成功')
  }

  createOrderDrawer.visible = false
  createOrderDrawer.editingOrderId = null
  createOrderDrawer.isEditMode = false

  // 刷新连单列表
  loadOrderList()
}

// 连单表格列配置 - ID、第N单固定左侧，状态、操作固定右侧
const orderColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: '第N单', dataIndex: 'orderNo', key: 'orderNo', width: 80, align: 'center', fixed: 'left' },
  { title: '产品信息', dataIndex: 'products', key: 'products', align: 'left', width: 450 },
  { title: '创建方式', dataIndex: 'createType', key: 'createType', width: 100, align: 'center' },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center', fixed: 'right' },
  { title: '操作', key: 'action', width: 180, align: 'center', fixed: 'right' }
]

// 商品列表表格列配置
const goodsColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'center', ellipsis: true },
  { title: '价格', dataIndex: 'price', key: 'price', width: 120, align: 'center' },
  { title: '操作', key: 'action', width: 100, align: 'center' }
]

// 连单表格高度计算 (页面高度 - 头部 - 用户信息卡片 - 操作栏 - 分页 - 内边距)
const orderTableHeight = computed(() => {
  // 头部: 57px, 用户信息卡片: 85px, 操作栏: 48px, 分页: 52px, 内边距: 32px
  return 'calc(100vh - 274px)'
})

// 创建会员弹窗
const createMemberModal = reactive({
  visible: false
})

// 创建会员表单ref
const createMemberFormRef = ref(null)

// 创建会员表单数据
const createMemberForm = reactive({
  email: '',
  phoneCode: undefined,
  phone: '',
  password: '',
  username: '',
  parentInviteCode: '',
  customUid: '',
  creditScore: 100,
  status: 'normal',
  customInviteCode: '',
  payPassword: '',
  remark: '',
  withdrawSwitch: true,
  tradeSwitch: true,
  isFake: true
})

// 创建会员表单验证规则
const createMemberRules = {
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' }
  ]
}

// 判断任务进度是否完成（如 "40/40" 表示完成，"35/40" 表示未完成）
const isTaskCompleted = (taskProgress) => {
  if (!taskProgress) return false
  const [current, total] = taskProgress.split('/').map(Number)
  return current >= total
}

// 判断组数进度是否完成（如 "3/3" 表示完成，"1/3" 表示未完成）
const isGroupCompleted = (groupProgress) => {
  if (!groupProgress) return false
  const [current, total] = groupProgress.split('/').map(Number)
  return current >= total
}

// 打开邀请码编辑弹窗
const handleEditInviteCode = (record) => {
  inviteCodeModal.visible = true
  inviteCodeModal.currentCode = record.inviteCode2
  inviteCodeModal.newCode = record.inviteCode2
  inviteCodeModal.record = record
}

// 确认修改邀请码
const handleInviteCodeOk = () => {
  if (!inviteCodeModal.newCode) {
    message.warning('请输入邀请码')
    return
  }
  if (inviteCodeModal.record) {
    inviteCodeModal.record.inviteCode2 = inviteCodeModal.newCode
  }
  message.success('邀请码修改成功')
  inviteCodeModal.visible = false
}

// 查询IP地址
const handleQueryIp = (ip) => {
  window.open(`https://www.ip138.com/iplookup.php?ip=${ip}`, '_blank')
}

// 多级表头列配置
const columns = [
  // UID - 单独列
  { title: 'UID', dataIndex: 'uid', key: 'uid', width: 90, align: 'center' },
  // 当前用户信息 - 分组（蓝色）
  {
    title: '当前用户信息',
    className: 'column-group-blue',
    children: [
      { title: '邮箱', dataIndex: 'email', key: 'email', width: 160, align: 'center', className: 'column-blue', ellipsis: true },
      { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130, align: 'center', className: 'column-blue' },
      { title: '用户名', dataIndex: 'username', key: 'username', width: 100, align: 'center', className: 'column-blue' }
    ]
  },
  // VIP信息 - 分组
  {
    title: 'VIP信息',
    children: [
      { title: '等级', dataIndex: 'vipLevel', key: 'vipLevel', width: 180, align: 'center' },
      { title: '需充值', dataIndex: 'vipRecharge', key: 'vipRecharge', width: 70, align: 'center' }
    ]
  },
  // 备注 - 单独列
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 80, align: 'center' },
  // 上级用户信息 - 分组（红色）
  {
    title: '上级用户信息',
    className: 'column-group-red',
    children: [
      { title: 'UID', dataIndex: 'parentUid', key: 'parentUid', width: 90, align: 'center', className: 'column-red' },
      { title: '邮箱', dataIndex: 'parentEmail', key: 'parentEmail', width: 160, align: 'center', className: 'column-red' },
      { title: '手机号', dataIndex: 'parentPhone', key: 'parentPhone', width: 130, align: 'center', className: 'column-red' },
      { title: '用户名', dataIndex: 'parentUsername', key: 'parentUsername', width: 100, align: 'center', className: 'column-red' }
    ]
  },
  // 下级数量 - 分组
  {
    title: '下级数量',
    children: [
      { title: '直属', dataIndex: 'directCount', key: 'directCount', width: 60, align: 'center' },
      { title: '全部', dataIndex: 'totalCount', key: 'totalCount', width: 60, align: 'center' }
    ]
  },
  // 认证 - 单独列
  { title: '认证', dataIndex: 'verified', key: 'verified', width: 70, align: 'center' },
  // 信用积分 - 单独列
  { title: '信用积分', dataIndex: 'creditScore', key: 'creditScore', width: 100, align: 'center' },
  // 余额 - 单独列
  { title: '余额', dataIndex: 'balance', key: 'balance', width: 90, align: 'center' },
  // 冻结余额 - 单独列
  { title: '冻结余额', dataIndex: 'freezeBalance', key: 'freezeBalance', width: 80, align: 'center' },
  // 总余额 - 单独列
  { title: '总余额', dataIndex: 'totalBalance', key: 'totalBalance', width: 80, align: 'center' },
  // 今天提现次数 - 单独列
  { title: '今天提现次数', dataIndex: 'todayWithdraw', key: 'todayWithdraw', width: 100, align: 'center' },
  // 重置次数 - 分组
  {
    title: '重置次数',
    children: [
      { title: '今天', dataIndex: 'resetToday', key: 'resetToday', width: 50, align: 'center' },
      { title: '历史', dataIndex: 'resetHistory', key: 'resetHistory', width: 50, align: 'center' }
    ]
  },
  // 任务进度 - 单独列
  { title: '任务进度', dataIndex: 'taskProgress', key: 'taskProgress', width: 70, align: 'center' },
  // 组数进度 - 单独列
  { title: '组数进度', dataIndex: 'groupProgress', key: 'groupProgress', width: 70, align: 'center' },
  // 利润 - 单独列
  { title: '利润', dataIndex: 'profit', key: 'profit', width: 60, align: 'center' },
  // 邀请码 - 单独列
  { title: '邀请码', dataIndex: 'inviteCode2', key: 'inviteCode2', width: 100, align: 'center' },
  // 提取信息 - 单独列
  { title: '提取信息', dataIndex: 'withdrawInfo', key: 'withdrawInfo', width: 280, align: 'center' },
  // 最近一次登录 - 分组（绿色）
  {
    title: '最近一次登录',
    className: 'column-group-green',
    children: [
      { title: 'IP', dataIndex: 'lastLoginIp', key: 'lastLoginIp', width: 120, align: 'center', className: 'column-green' },
      { title: '设备', dataIndex: 'lastLoginDevice', key: 'lastLoginDevice', width: 180, align: 'center', className: 'column-green' },
      { title: '时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime', width: 150, align: 'center', className: 'column-green' }
    ]
  },
  // 注册时间 - 单独列
  { title: '注册时间', dataIndex: 'registerTime', key: 'registerTime', width: 150, align: 'center' },
  // 状态 - 分组
  {
    title: '状态',
    children: [
      { title: '账户', dataIndex: 'accountStatus', key: 'accountStatus', width: 80, align: 'center' },
      { title: '交易', dataIndex: 'tradeStatus', key: 'tradeStatus', width: 80, align: 'center' },
      { title: '提现', dataIndex: 'withdrawStatus', key: 'withdrawStatus', width: 80, align: 'center' },
      { title: '评论', dataIndex: 'commentStatus', key: 'commentStatus', width: 80, align: 'center' }
    ]
  },
  // 操作 - 固定右侧
  { title: '操作', key: 'action', width: 520, align: 'center', fixed: 'right' }
]

const tableData = ref([
  {
    uid: '34975253',
    email: '-',
    phone: '1-559567-9150',
    username: 'Updoom',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '43204160',
    parentEmail: '-',
    parentPhone: '1-15644914484',
    parentUsername: 'canglong002',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 100,
    balance: 25,
    freezeBalance: 0,
    totalBalance: 25,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 1,
    taskProgress: '0/40',
    groupProgress: '0/3',
    profit: 0,
    inviteCode2: '7O52',
    withdrawInfo: '0x630223FB08323a7B31B0050aD1cF29C65 5abAE95',
    lastLoginIp: '175.100.59.1',
    lastLoginDevice: 'Chrome v 142.0.0.0(Windows v 10.0)',
    lastLoginTime: '2025-11-24 10:07:01',
    registerTime: '2025-11-24 10:06:47',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '30777522',
    email: '-',
    phone: '1-1649',
    username: 'Ashley9621',
    vipLevel: 'Mid-level employees(2)',
    vipRecharge: 500,
    remark: '',
    parentUid: '94375597',
    parentEmail: '-',
    parentPhone: '1-4707174248',
    parentUsername: 'Shaneikque1',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 100,
    balance: 0,
    freezeBalance: 0,
    totalBalance: 0,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 1,
    taskProgress: '45/45',
    groupProgress: '0/4',
    profit: 0,
    inviteCode2: '1001',
    withdrawInfo: '',
    lastLoginIp: '104.28.39.14',
    lastLoginDevice: 'Safari v 26.0.1(IOS v 18.7)',
    lastLoginTime: '2025-10-26 10:58:48',
    registerTime: '2025-10-24 12:38:50',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '94375597',
    email: '-',
    phone: '1-4707174248',
    username: 'Shaneikque1',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '29664062',
    parentEmail: '-',
    parentPhone: '1-29581812895',
    parentUsername: '雷龙',
    directCount: 1,
    totalCount: 1,
    verified: false,
    creditScore: 100,
    balance: -56.1,
    freezeBalance: 74.89,
    totalBalance: 18.79,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 2,
    taskProgress: '18/40',
    groupProgress: '1/3',
    profit: 0,
    inviteCode2: 'V32O',
    withdrawInfo: '0x9B24Aa02a43282F1E7B38a3597dCfe2F2 798147B',
    lastLoginIp: '104.28.39.14',
    lastLoginDevice: 'Safari v 26.1(IOS v 18.7)',
    lastLoginTime: '2025-12-02 14:14:08',
    registerTime: '2025-10-24 12:33:34',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '9397087',
    email: '-',
    phone: '1-425369856985',
    username: 'trainee99',
    vipLevel: 'Mid-level employees(2)',
    vipRecharge: 500,
    remark: '',
    parentUid: '77001414',
    parentEmail: '-',
    parentPhone: '1-2392470090',
    parentUsername: 'Camille',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 100,
    balance: 1580.69,
    freezeBalance: 0,
    totalBalance: 1580.69,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 1,
    taskProgress: '45/45',
    groupProgress: '0/4',
    profit: 0,
    inviteCode2: 'O81L',
    withdrawInfo: '',
    lastLoginIp: '104.28.92.20',
    lastLoginDevice: 'Safari v 18.6(IOS v 18.6.2)',
    lastLoginTime: '2025-09-20 19:14:42',
    registerTime: '2025-09-20 19:04:04',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '77001414',
    email: '-',
    phone: '1-2392470090',
    username: 'Camille',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '8053679',
    parentEmail: '-',
    parentPhone: '1-7147865308',
    parentUsername: 'Jazi',
    directCount: 1,
    totalCount: 1,
    verified: false,
    creditScore: 100,
    balance: 87.09,
    freezeBalance: 0,
    totalBalance: 87.09,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 1,
    taskProgress: '40/40',
    groupProgress: '0/3',
    profit: 0,
    inviteCode2: '99Y9',
    withdrawInfo: '',
    lastLoginIp: '104.28.94.19',
    lastLoginDevice: 'Safari v 18.6(IOS v 18.6.2)',
    lastLoginTime: '2025-09-20 20:15:17',
    registerTime: '2025-09-20 18:52:07',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '12345678',
    email: 'test1@example.com',
    phone: '1-8881234567',
    username: 'TestUser01',
    vipLevel: 'Senior-level employee(3)',
    vipRecharge: 1000,
    remark: 'VIP客户',
    parentUid: '43204160',
    parentEmail: '-',
    parentPhone: '1-15644914484',
    parentUsername: 'canglong002',
    directCount: 5,
    totalCount: 12,
    verified: true,
    creditScore: 150,
    balance: 5280.50,
    freezeBalance: 200,
    totalBalance: 5480.50,
    todayWithdraw: 2,
    resetToday: 1,
    resetHistory: 5,
    taskProgress: '35/50',
    groupProgress: '2/5',
    profit: 320.5,
    inviteCode2: 'AB12',
    withdrawInfo: '0x1234567890abcdef1234567890abcdef12345678',
    lastLoginIp: '192.168.1.100',
    lastLoginDevice: 'Chrome v 120.0.0.0(Windows v 11.0)',
    lastLoginTime: '2025-12-10 09:30:00',
    registerTime: '2025-06-15 14:20:30',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '23456789',
    email: 'test2@example.com',
    phone: '1-9992345678',
    username: 'TestUser02',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '12345678',
    parentEmail: 'test1@example.com',
    parentPhone: '1-8881234567',
    parentUsername: 'TestUser01',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 80,
    balance: 150.25,
    freezeBalance: 0,
    totalBalance: 150.25,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 0,
    taskProgress: '10/40',
    groupProgress: '0/3',
    profit: 15.5,
    inviteCode2: 'CD34',
    withdrawInfo: '',
    lastLoginIp: '10.0.0.50',
    lastLoginDevice: 'Firefox v 115.0(MacOS v 14.0)',
    lastLoginTime: '2025-12-09 18:45:00',
    registerTime: '2025-11-01 10:00:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: false,
    commentStatus: true
  },
  {
    uid: '34567890',
    email: 'test3@example.com',
    phone: '1-7773456789',
    username: 'TestUser03',
    vipLevel: 'Mid-level employees(2)',
    vipRecharge: 500,
    remark: '新用户',
    parentUid: '12345678',
    parentEmail: 'test1@example.com',
    parentPhone: '1-8881234567',
    parentUsername: 'TestUser01',
    directCount: 2,
    totalCount: 3,
    verified: true,
    creditScore: 120,
    balance: 890.00,
    freezeBalance: 50,
    totalBalance: 940.00,
    todayWithdraw: 1,
    resetToday: 0,
    resetHistory: 2,
    taskProgress: '40/45',
    groupProgress: '1/4',
    profit: 88.0,
    inviteCode2: 'EF56',
    withdrawInfo: '0xabcdef1234567890abcdef1234567890abcdef12',
    lastLoginIp: '172.16.0.100',
    lastLoginDevice: 'Safari v 17.0(IOS v 17.1)',
    lastLoginTime: '2025-12-10 08:00:00',
    registerTime: '2025-08-20 16:30:00',
    accountStatus: true,
    tradeStatus: false,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '45678901',
    email: '-',
    phone: '1-6664567890',
    username: 'TestUser04',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '34567890',
    parentEmail: 'test3@example.com',
    parentPhone: '1-7773456789',
    parentUsername: 'TestUser03',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 100,
    balance: 0,
    freezeBalance: 0,
    totalBalance: 0,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 0,
    taskProgress: '0/40',
    groupProgress: '0/3',
    profit: 0,
    inviteCode2: 'GH78',
    withdrawInfo: '',
    lastLoginIp: '203.0.113.50',
    lastLoginDevice: 'Chrome v 119.0.0.0(Android v 14)',
    lastLoginTime: '2025-12-08 12:00:00',
    registerTime: '2025-12-01 09:00:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: false
  },
  {
    uid: '56789012',
    email: 'test5@example.com',
    phone: '1-5555678901',
    username: 'TestUser05',
    vipLevel: 'Senior-level employee(3)',
    vipRecharge: 1000,
    remark: '活跃用户',
    parentUid: '43204160',
    parentEmail: '-',
    parentPhone: '1-15644914484',
    parentUsername: 'canglong002',
    directCount: 8,
    totalCount: 25,
    verified: true,
    creditScore: 200,
    balance: 12500.80,
    freezeBalance: 500,
    totalBalance: 13000.80,
    todayWithdraw: 3,
    resetToday: 2,
    resetHistory: 10,
    taskProgress: '50/50',
    groupProgress: '5/5',
    profit: 1250.8,
    inviteCode2: 'IJ90',
    withdrawInfo: '0x9876543210fedcba9876543210fedcba98765432',
    lastLoginIp: '198.51.100.25',
    lastLoginDevice: 'Edge v 120.0.0.0(Windows v 11.0)',
    lastLoginTime: '2025-12-10 10:15:00',
    registerTime: '2025-03-10 08:00:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '67890123',
    email: '-',
    phone: '1-4446789012',
    username: 'TestUser06',
    vipLevel: 'Mid-level employees(2)',
    vipRecharge: 500,
    remark: '',
    parentUid: '56789012',
    parentEmail: 'test5@example.com',
    parentPhone: '1-5555678901',
    parentUsername: 'TestUser05',
    directCount: 1,
    totalCount: 1,
    verified: true,
    creditScore: 110,
    balance: 450.30,
    freezeBalance: 0,
    totalBalance: 450.30,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 1,
    taskProgress: '30/45',
    groupProgress: '2/4',
    profit: 45.0,
    inviteCode2: 'KL12',
    withdrawInfo: '',
    lastLoginIp: '100.64.0.10',
    lastLoginDevice: 'Chrome v 121.0.0.0(Linux)',
    lastLoginTime: '2025-12-09 22:30:00',
    registerTime: '2025-07-25 11:00:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '78901234',
    email: 'test7@example.com',
    phone: '1-3337890123',
    username: 'TestUser07',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '待审核',
    parentUid: '56789012',
    parentEmail: 'test5@example.com',
    parentPhone: '1-5555678901',
    parentUsername: 'TestUser05',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 90,
    balance: 75.00,
    freezeBalance: 25,
    totalBalance: 100.00,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 0,
    taskProgress: '5/40',
    groupProgress: '0/3',
    profit: 5.0,
    inviteCode2: 'MN34',
    withdrawInfo: '0xfedcba9876543210fedcba9876543210fedcba98',
    lastLoginIp: '192.0.2.100',
    lastLoginDevice: 'Safari v 16.0(MacOS v 13.0)',
    lastLoginTime: '2025-12-07 14:00:00',
    registerTime: '2025-11-15 13:30:00',
    accountStatus: false,
    tradeStatus: false,
    withdrawStatus: false,
    commentStatus: false
  },
  {
    uid: '89012345',
    email: 'test8@example.com',
    phone: '1-2228901234',
    username: 'TestUser08',
    vipLevel: 'Senior-level employee(3)',
    vipRecharge: 1000,
    remark: '',
    parentUid: '43204160',
    parentEmail: '-',
    parentPhone: '1-15644914484',
    parentUsername: 'canglong002',
    directCount: 3,
    totalCount: 7,
    verified: true,
    creditScore: 180,
    balance: 8900.00,
    freezeBalance: 100,
    totalBalance: 9000.00,
    todayWithdraw: 1,
    resetToday: 1,
    resetHistory: 6,
    taskProgress: '48/50',
    groupProgress: '4/5',
    profit: 890.0,
    inviteCode2: 'OP56',
    withdrawInfo: '0x0123456789abcdef0123456789abcdef01234567',
    lastLoginIp: '203.0.113.200',
    lastLoginDevice: 'Chrome v 120.0.0.0(Windows v 10.0)',
    lastLoginTime: '2025-12-10 07:45:00',
    registerTime: '2025-04-05 09:15:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '90123456',
    email: '-',
    phone: '1-1119012345',
    username: 'TestUser09',
    vipLevel: 'Mid-level employees(2)',
    vipRecharge: 500,
    remark: '优质客户',
    parentUid: '89012345',
    parentEmail: 'test8@example.com',
    parentPhone: '1-2228901234',
    parentUsername: 'TestUser08',
    directCount: 2,
    totalCount: 4,
    verified: true,
    creditScore: 130,
    balance: 2100.50,
    freezeBalance: 0,
    totalBalance: 2100.50,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 3,
    taskProgress: '44/45',
    groupProgress: '3/4',
    profit: 210.0,
    inviteCode2: 'QR78',
    withdrawInfo: '',
    lastLoginIp: '198.51.100.150',
    lastLoginDevice: 'Firefox v 120.0(Windows v 11.0)',
    lastLoginTime: '2025-12-10 06:30:00',
    registerTime: '2025-05-20 15:45:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  },
  {
    uid: '01234567',
    email: 'test10@example.com',
    phone: '1-0000123456',
    username: 'TestUser10',
    vipLevel: 'Junior-level employee(1)',
    vipRecharge: 100,
    remark: '',
    parentUid: '90123456',
    parentEmail: '-',
    parentPhone: '1-1119012345',
    parentUsername: 'TestUser09',
    directCount: 0,
    totalCount: 0,
    verified: false,
    creditScore: 100,
    balance: 50.00,
    freezeBalance: 0,
    totalBalance: 50.00,
    todayWithdraw: 0,
    resetToday: 0,
    resetHistory: 0,
    taskProgress: '2/40',
    groupProgress: '0/3',
    profit: 2.5,
    inviteCode2: 'ST90',
    withdrawInfo: '',
    lastLoginIp: '100.64.0.200',
    lastLoginDevice: 'Chrome v 119.0.0.0(Android v 13)',
    lastLoginTime: '2025-12-06 20:00:00',
    registerTime: '2025-12-05 18:00:00',
    accountStatus: true,
    tradeStatus: true,
    withdrawStatus: true,
    commentStatus: true
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 4561
})

const onSearch = (value) => {
  console.log('搜索', value)
}

const onPageChange = (page) => {
  pagination.current = page
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (setCollapsed) {
    setCollapsed(isFullscreen.value)
  }
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleDensityChange = ({ key }) => {
  tableSize.value = key
}

const openDrawer = () => {
  // 重置表单
  createMemberForm.email = ''
  createMemberForm.phoneCode = undefined
  createMemberForm.phone = ''
  createMemberForm.password = ''
  createMemberForm.username = ''
  createMemberForm.parentInviteCode = ''
  createMemberForm.customUid = ''
  createMemberForm.creditScore = 100
  createMemberForm.status = 'normal'
  createMemberForm.customInviteCode = ''
  createMemberForm.payPassword = ''
  createMemberForm.remark = ''
  createMemberForm.withdrawSwitch = true
  createMemberForm.tradeSwitch = true
  createMemberForm.isFake = true
  // 打开弹窗
  createMemberModal.visible = true
}

// 创建会员
const handleCreateMember = async () => {
  // 验证邮箱或手机号至少填一个
  if (!createMemberForm.email && !createMemberForm.phone) {
    message.warning('请填写邮箱或手机号')
    return
  }
  // 验证密码
  if (!createMemberForm.password) {
    message.warning('请输入登录密码')
    return
  }
  // TODO: 调用API创建会员
  message.success('会员创建成功')
  createMemberModal.visible = false
}

const handleLevel = (record) => {
  balanceModal.visible = true
  balanceModal.currentBalance = record.balance
  balanceModal.type = 'add'
  balanceModal.amount = null
  balanceModal.remark = '赠送余额'
  balanceModal.record = record
}

// 确认余额变更
const handleBalanceOk = () => {
  if (!balanceModal.amount || balanceModal.amount <= 0) {
    message.warning('请输入有效的数量')
    return
  }
  // 计算新余额
  let newBalance = balanceModal.currentBalance
  if (balanceModal.type === 'add') {
    newBalance += balanceModal.amount
  } else {
    newBalance -= balanceModal.amount
  }
  // 更新余额
  if (balanceModal.record) {
    balanceModal.record.balance = newBalance
    balanceModal.record.totalBalance = newBalance + balanceModal.record.freezeBalance
  }
  message.success(balanceModal.type === 'add' ? '余额增加成功' : '余额扣减成功')
  balanceModal.visible = false
}

const handleLogin = (record) => {
  orderModal.visible = true
  orderModal.record = record
  orderModal.searchText = ''
  orderModal.pagination.current = 1
  // 加载连单列表
  loadOrderList()
}

// 加载连单列表
const loadOrderList = () => {
  orderModal.loading = true
  setTimeout(() => {
    orderModal.orderList = [...mockOrderList]
    orderModal.pagination.total = mockOrderList.length
    orderModal.loading = false
  }, 300)
}

// 添加连单
const handleAddOrder = () => {
  // 重置表单
  createOrderDrawer.orderNo = ''
  createOrderDrawer.commissionRate = 1
  createOrderDrawer.selectedGoods = []
  createOrderDrawer.minPrice = null
  createOrderDrawer.maxPrice = null
  createOrderDrawer.pagination.current = 1
  createOrderDrawer.editingOrderId = null // 新建连单，清除编辑ID
  createOrderDrawer.isEditMode = false // 非编辑模式
  // 打开抽屉
  createOrderDrawer.visible = true
  // 加载商品列表
  loadGoodsList()
}

// 重置单数
const handleResetOrderCount = () => {
  message.info(`重置单数: ${orderModal.record?.uid}`)
}

// 刷新连单数据
const handleRefreshOrders = () => {
  loadOrderList()
  message.success('数据已刷新')
}

// 连单全屏切换
const toggleOrderFullscreen = () => {
  orderModal.isFullscreen = !orderModal.isFullscreen
  if (setCollapsed) {
    setCollapsed(orderModal.isFullscreen)
  }
}

// 搜索连单
const onOrderSearch = (value) => {
  console.log('搜索连单:', value)
}

// 连单表格密度切换
const handleOrderDensityChange = ({ key }) => {
  orderModal.tableSize = key
}

// 编辑连单
const handleEditOrder = (record) => {
  // 打开创建连单抽屉，并加载已有商品
  createOrderDrawer.orderNo = record.orderNo.toString()
  createOrderDrawer.commissionRate = record.products[0]?.commissionMultiple || 1
  // 将已有商品加载到已选列表（用于编辑）
  createOrderDrawer.selectedGoods = record.products.map((p, idx) => ({
    id: `edit_${record.id}_${idx}`,
    name: p.name,
    price: p.price
  }))
  createOrderDrawer.minPrice = null
  createOrderDrawer.maxPrice = null
  createOrderDrawer.pagination.current = 1
  createOrderDrawer.editingOrderId = record.id
  createOrderDrawer.isEditMode = true // 标记为编辑模式
  // 打开抽屉
  createOrderDrawer.visible = true
  // 加载商品列表
  loadGoodsList()
}

// 删除连单
const handleDeleteOrder = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除连单 ID: ${record.id}（第${record.orderNo}单）吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      // 从列表中删除
      const index = mockOrderList.findIndex(o => o.id === record.id)
      if (index > -1) {
        mockOrderList.splice(index, 1)
        message.success('连单删除成功')
        // 刷新列表
        loadOrderList()
      }
    }
  })
}

// 向连单添加商品（打开创建连单抽屉继续添加）
const handleAddProductToOrder = (record) => {
  // 重置表单
  createOrderDrawer.orderNo = record.orderNo.toString()
  createOrderDrawer.commissionRate = record.products[0]?.commissionMultiple || 1
  createOrderDrawer.selectedGoods = []
  createOrderDrawer.minPrice = null
  createOrderDrawer.maxPrice = null
  createOrderDrawer.pagination.current = 1
  createOrderDrawer.editingOrderId = record.id // 记录正在编辑的连单ID
  createOrderDrawer.isEditMode = false // 非编辑模式（添加商品模式）
  // 打开抽屉
  createOrderDrawer.visible = true
  // 加载商品列表
  loadGoodsList()
}

const handleResetOrder = (record) => {
  message.info(`重置单数: ${record.uid}`)
}

const handleResetGroup = (record) => {
  message.info(`重置组数: ${record.uid}`)
}

const handleFinance = (record) => {
  financeModal.visible = true
  financeModal.record = record
  financeModal.pagination.current = 1
  loadFinanceList()
}

const handleDetail = (record) => {
  message.info(`查看详情: ${record.uid}`)
}

const handleFreeze = (record) => {
  message.info(`冻结账户: ${record.uid}`)
}

const handleEdit = (record) => {
  // 填充表单数据
  editMemberDrawer.form.uid = record.uid
  editMemberDrawer.form.phone = record.phone
  editMemberDrawer.form.email = record.email === '-' ? '' : (record.email || '')
  // 从 phone 解析区号，格式如 "1-559567-9150"
  const phoneParts = record.phone?.split('-') || []
  if (phoneParts.length >= 2) {
    editMemberDrawer.form.phoneCode = phoneParts[0] + '-United States'
    editMemberDrawer.form.phoneNumber = phoneParts.slice(1).join('-')
  } else {
    editMemberDrawer.form.phoneCode = '1-United States'
    editMemberDrawer.form.phoneNumber = record.phone || ''
  }
  editMemberDrawer.form.password = ''
  editMemberDrawer.form.username = record.username
  editMemberDrawer.form.customUid = record.uid
  editMemberDrawer.form.creditScore = record.creditScore || 100
  editMemberDrawer.form.status = record.accountStatus ? 'normal' : 'frozen'
  editMemberDrawer.form.inviteCode = record.inviteCode2 || ''
  editMemberDrawer.form.payPassword = ''
  editMemberDrawer.form.remark = record.remark || ''
  editMemberDrawer.form.withdrawSwitch = record.withdrawStatus !== false
  editMemberDrawer.form.tradeSwitch = record.tradeStatus !== false
  editMemberDrawer.form.isRobot = record.isRobot || false
  // 打开抽屉
  editMemberDrawer.visible = true
}

// 保存编辑会员
const handleSaveEditMember = () => {
  message.success('保存成功')
  editMemberDrawer.visible = false
}

const handleDelete = (record) => {
  message.info(`删除: ${record.uid}`)
}

// 更多菜单处理函数
// 中奖调节弹窗
const lotteryModal = reactive({
  visible: false,
  record: null,
  enabled: false,
  mode: 'close'
})

// 中奖调节模式选项
const lotteryModeOptions = [
  { value: 'close', label: '关闭' },
  { value: 'below_balance', label: '低于余额全部' },
  { value: 'balance_percent', label: '按余额百分比调节' },
  { value: 'probability', label: '按概率' },
  { value: 'near_balance', label: '按接近余额N条' }
]

const handleLottery = (record) => {
  lotteryModal.record = record
  lotteryModal.enabled = false
  lotteryModal.mode = 'close'
  lotteryModal.visible = true
}

// 确认中奖调节
const handleLotteryOk = () => {
  message.success('中奖调节设置成功')
  lotteryModal.visible = false
}

const handleGiftBalance = (record) => {
  balanceModal.visible = true
  balanceModal.currentBalance = record.balance
  balanceModal.type = 'add'
  balanceModal.amount = null
  balanceModal.remark = ''
  balanceModal.record = record
}

const handleDeductBalance = (record) => {
  balanceModal.visible = true
  balanceModal.currentBalance = record.balance
  balanceModal.type = 'subtract'
  balanceModal.amount = null
  balanceModal.remark = ''
  balanceModal.record = record
}

// 修改余额弹窗
const modifyBalanceModal = reactive({
  visible: false,
  record: null,
  currentBalance: 0,
  newBalance: null,
  remark: ''
})

const handleModifyBalance = (record) => {
  modifyBalanceModal.visible = true
  modifyBalanceModal.record = record
  modifyBalanceModal.currentBalance = record.balance || 0
  modifyBalanceModal.newBalance = null
  modifyBalanceModal.remark = ''
}

// 确认修改余额
const handleModifyBalanceOk = () => {
  if (modifyBalanceModal.newBalance === null) {
    message.warning('请输入修改后数量')
    return
  }
  // 更新表格数据
  const record = modifyBalanceModal.record
  if (record) {
    record.balance = modifyBalanceModal.newBalance
  }
  message.success('余额修改成功')
  modifyBalanceModal.visible = false
}

// 修改用户名弹窗
const modifyUsernameModal = reactive({
  visible: false,
  record: null,
  currentValue: '',
  newValue: ''
})

// 修改任务单数弹窗
const modifyOrderCountModal = reactive({
  visible: false,
  record: null,
  usedCount: 0,
  totalCount: 40
})

// 修改组数弹窗
const modifyGroupCountModal = reactive({
  visible: false,
  record: null,
  currentUsed: 0,
  currentTotal: 4,
  newUsed: 0
})

// 钱包地址管理弹窗
const walletAddressModal = reactive({
  visible: false,
  record: null,
  addresses: [
    {
      type: 'TRX',
      network: 'TRON',
      icon: 'https://static.tronscan.org/production/logo/trx.png',
      address: ''
    },
    {
      type: 'ETH',
      network: 'Ethereum',
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      address: ''
    }
  ]
})

// 修改提取资料弹窗
const modifyWithdrawInfoModal = reactive({
  visible: false,
  record: null,
  type: 'crypto',
  name: '',
  address: '',
  bankName: ''
})

// 修改登录密码弹窗
const modifyPasswordModal = reactive({
  visible: false,
  record: null,
  newPassword: ''
})

// 修改交易密码弹窗
const modifyTradePasswordModal = reactive({
  visible: false,
  record: null,
  newPassword: ''
})

// 修改上级弹窗
const modifyParentModal = reactive({
  visible: false,
  record: null,
  parentInfo: {
    uid: '',
    username: '',
    email: '',
    phone: ''
  },
  newParentUid: ''
})

// 修改邀请码弹窗
const modifyInviteCodeModal = reactive({
  visible: false,
  record: null,
  currentCode: '',
  newCode: ''
})

// 设置会员VIP等级弹窗
const modifyVipLevelModal = reactive({
  visible: false,
  record: null,
  currentLevel: '',
  newLevel: '',
  remark: ''
})

// 修改登录验证弹窗
const modifyLoginVerifyModal = reactive({
  visible: false,
  record: null,
  currentStatus: '无',
  newVerify: 'none'
})

// 实名信息管理抽屉
const realNameInfoDrawer = reactive({
  visible: false,
  record: null,
  type: '身份证',
  name: '',
  idNumber: '',
  status: 'passed'
})

// 修改认证状态弹窗
const modifyAuthStatusModal = reactive({
  visible: false,
  record: null,
  currentStatus: '待审核',
  newStatus: 'pending',
  remark: ''
})

// 修改信誉分弹窗
const modifyCreditScoreModal = reactive({
  visible: false,
  record: null,
  currentScore: 100,
  newScore: 100
})

// 修改备注弹窗
const modifyRemarkModal = reactive({
  visible: false,
  record: null,
  remark: ''
})

// 禁用账户弹窗
const disableAccountModal = reactive({
  visible: false,
  record: null
})

// 禁用交易弹窗
const disableTradeModal = reactive({
  visible: false,
  record: null
})

// 禁用提现弹窗
const disableWithdrawModal = reactive({
  visible: false,
  record: null
})

// 禁用评论弹窗
const disableCommentModal = reactive({
  visible: false,
  record: null
})

// 订单列表页面
const orderListModal = reactive({
  visible: false,
  record: null,
  activeTab: 'all',
  searchText: '',
  loading: false,
  tableSize: 'small',
  isFullscreen: false,
  showDensityMenu: false,
  list: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  }
})

// 赠送记录页面
const giftRecordModal = reactive({
  visible: false,
  record: null,
  searchText: '',
  loading: false,
  tableSize: 'small',
  isFullscreen: false,
  list: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  },
  stats: {
    total: 2278.41,
    valid: 587,
    invalid: 2865.41
  }
})

// 后台充值-创建抽屉
const addGiftRecordDrawer = reactive({
  visible: false,
  memberUid: '',
  type: 'add', // add: 增加, sub: 扣减
  amount: '',
  remark: '',
  availableAmount: null, // 可用数量
  frozenAmount: null // 冻结数量
})

// 后台充值-筛选抽屉
const giftRecordSearchDrawer = reactive({
  visible: false,
  status: undefined,
  memberId: '',
  startTime: null,
  endTime: null,
  keyword: '',
  sortField: 'time',
  sortType: 'desc'
})

// 状态选项
const giftRecordStatusOptions = [
  { label: '全部', value: '' },
  { label: '扣减', value: 'sub' },
  { label: '增加', value: 'add' }
]

// 排序字段选项(赠送记录)
const giftRecordSortFieldOptions = [
  { label: '全部', value: '' },
  { label: '数量', value: 'amount' },
  { label: '时间', value: 'time' }
]

// 排序类型选项(赠送记录)
const giftRecordSortTypeOptions = [
  { label: '全部', value: '' },
  { label: '降序排序', value: 'desc' },
  { label: '升序排序', value: 'asc' }
]

// 赠送记录财务日志抽屉
const giftRecordFinanceDrawer = reactive({
  visible: false,
  record: null,
  loading: false,
  list: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  }
})

// 赠送记录财务日志列配置
const giftRecordFinanceColumns = [
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 80, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100, align: 'center' },
  { title: '前数量', dataIndex: 'beforeAmount', key: 'beforeAmount', width: 100, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 100, align: 'center' },
  { title: '后数量', dataIndex: 'afterAmount', key: 'afterAmount', width: 100, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 160, align: 'center' }
]

// 下级用户层级页面
const subUsersModal = reactive({
  visible: false,
  record: null,
  isVertical: true, // 竖向布局
  isUpQuery: false, // 是否往上查询
  searchUid: '',
  treeData: null,
  isFullscreen: false
})

// 模拟层级树数据
const mockSubUsersTreeData = {
  id: '1-16267817514',
  count: 6,
  children: [
    { id: '1-3213438096', count: 1, children: [{ id: '1-16264937284', count: 0, children: [] }] },
    { id: '1-3525331038', count: 1, children: [{ id: '1-6241834296', count: 0, children: [] }] },
    { id: '1-4146392243', count: 1, children: [{ id: '1-6268941365', count: 0, children: [] }] },
    { id: '1-7077126783', count: 1, children: [{ id: '1-6268163492', count: 0, children: [] }] },
    { id: '1-5045101674', count: 1, children: [{ id: '1-6218346279', count: 0, children: [] }] },
    { id: '1-9736669632', count: 1, children: [{ id: '1-6243284167', count: 0, children: [] }] }
  ]
}

// 订单搜索抽屉
const orderSearchDrawer = reactive({
  visible: false,
  productId: '',
  memberUid: '',
  minPrice: '',
  maxPrice: '',
  orderNo: '',
  keyword: '',
  startTime: null,
  endTime: null,
  sortField: undefined,
  sortType: undefined
})

// 排序字段选项
const sortFieldOptions = [
  { label: '全部', value: '' },
  { label: '创建时间', value: 'createTime' },
  { label: '按ID', value: 'id' },
  { label: 'VIP等级', value: 'vipLevel' },
  { label: '返佣率', value: 'rate' },
  { label: '收益', value: 'profit' },
  { label: '价格', value: 'price' }
]

// 排序类型选项
const sortTypeOptions = [
  { label: '全部', value: '' },
  { label: '降序排序', value: 'desc' },
  { label: '升序排序', value: 'asc' }
]

// 赠送记录表格高度
const giftRecordTableHeight = computed(() => {
  return 'calc(100vh - 220px)'
})

// 赠送记录列配置
const giftRecordColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 240, align: 'center', fixed: 'left' },
  { title: '会员', dataIndex: 'member', key: 'member', width: 160, align: 'center' },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 100, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 100, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 180, align: 'center' },
  { title: '理由', dataIndex: 'reason', key: 'reason', width: 120, align: 'center' },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' }
]

// 赠送记录模拟数据
const mockGiftRecordData = [
  { id: 1, orderNo: '20251216176587067923600017', member: '1-223344556677', username: '0003', amount: 80, type: '增加', time: '2025-12-16 01:37:59', reason: '赠送余额' },
  { id: 2, orderNo: '20251216176587057077926035', member: '1-223344556677', username: '0003', amount: 1495, type: '增加', time: '2025-12-16 01:36:11', reason: '赠送余额' },
  { id: 3, orderNo: '20251216176587008868953633', member: '1-223344556677', username: '0003', amount: 587, type: '扣减', time: '2025-12-16 01:28:09', reason: '赠送余额' },
  { id: 4, orderNo: '20251216176586971705199998', member: '1-223344556677', username: '0003', amount: 230.41, type: '增加', time: '2025-12-16 01:26:12', reason: '赠送余额' },
  { id: 5, orderNo: '20251216176586816259100054', member: '1-223344556677', username: '0003', amount: 1060, type: '增加', time: '2025-12-16 00:56:03', reason: '赠送余额' }
]

// 订单列表表格高度
const orderListTableHeight = computed(() => {
  return 'calc(100vh - 220px)'
})

// 订单列表列配置
const orderListColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 220, align: 'center' },
  { title: '会员', dataIndex: 'member', key: 'member', width: 160, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 100, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '单数', dataIndex: 'orderCount', key: 'orderCount', width: 80, align: 'center' },
  { title: '商品名称', dataIndex: 'productName', key: 'productName', width: 200, align: 'left' },
  { title: '价格', dataIndex: 'price', key: 'price', width: 110, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: '利润', dataIndex: 'profit', key: 'profit', width: 100, align: 'center', customHeaderCell: () => ({ style: { color: '#52c41a' } }) },
  { title: '利率', dataIndex: 'rate', key: 'rate', width: 80, align: 'center', customHeaderCell: () => ({ style: { color: '#1890ff' } }) },
  { title: 'VIP等级', dataIndex: 'vipLevel', key: 'vipLevel', width: 140, align: 'center' },
  { title: '方式', dataIndex: 'method', key: 'method', width: 90, align: 'center' },
  { title: '设定倍数', dataIndex: 'multiple', key: 'multiple', width: 100, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 170, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center', fixed: 'right' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center', fixed: 'right' },
  { title: '操作', key: 'action', width: 100, align: 'center', fixed: 'right' }
]

// 订单列表假数据
const mockOrderListData = [
  { id: 250639, orderNo: '20251216176587079690301', member: '1-223344556677', username: '0003', orderCount: 10, productName: 'Wholesale Eyeglasses Frames of all Original Brands', price: 18101.32, profit: 6516.4, rate: '3.6%', vipLevel: 'Mid-level employees(2)', method: '设定', multiple: 10, time: '2025-12-16 01:40:00', type: '连单', status: '未完成', needConfirm: 14991.59 },
  { id: 250638, orderNo: '20251216176587079830363', member: '1-223344556677', username: '0003', orderCount: 9, productName: 'RENNES Eyewear Factory Custom Glasses Fashion Sunglasses Optical Frame Spectacle Reading Glasses Mold Personalized Design', price: 1650, profit: 9.9, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:58', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250637, orderNo: '20251216176587079717441', member: '1-223344556677', username: '0003', orderCount: 8, productName: '24H Self-service pharmacy vending machine for drug and medicines', price: 2018.5, profit: 12.11, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:57', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250636, orderNo: '20251216176587079598819', member: '1-223344556677', username: '0003', orderCount: 7, productName: 'High Quality Elegant Model of Medical Equipment Dental chair Treatment tools', price: 2035, profit: 12.21, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:56', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250635, orderNo: '20251216176587079425756', member: '1-223344556677', username: '0003', orderCount: 6, productName: 'Latest home furniture living room sofas leather luxury smart sofa l shape sofa set', price: 1848, profit: 11.08, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:54', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250634, orderNo: '20251216176587079245719', member: '1-223344556677', username: '0003', orderCount: 5, productName: 'Automatic Espresso Machine Coffee Machine Coffee Maker for Office Home Business', price: 1419, profit: 8.51, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:52', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250633, orderNo: '20251216176587079055744', member: '1-223344556677', username: '0003', orderCount: 4, productName: 'new design women winter coats and colorful jackets', price: 1755, profit: 10.53, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:51', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250632, orderNo: '20251216176587078786091', member: '1-223344556677', username: '0003', orderCount: 3, productName: 'Electric oven 110V 4 Burner Cooker Range Top Stove', price: 2223.7, profit: 13.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:48', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250631, orderNo: '20251216176587078596386', member: '1-223344556677', username: '0003', orderCount: 2, productName: 'Sony KD-75X80J 75inch 4K HDR Android AI SMART LCD TV for home comfortably Dolby Panorama sound', price: 2078.7, profit: 12.47, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:46', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250630, orderNo: '20251216176587078423512', member: '1-223344556677', username: '0003', orderCount: 1, productName: 'Professional Studio Microphone Recording Condenser Microphone for Broadcasting', price: 1580, profit: 9.48, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:44', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250629, orderNo: '20251216176587078234567', member: '1-223344556677', username: '0003', orderCount: 15, productName: 'Gaming Laptop 17.3 inch RTX 4080 Intel Core i9 32GB RAM 1TB SSD', price: 3500, profit: 21.0, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:42', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250628, orderNo: '20251216176587078123456', member: '1-223344556677', username: '0003', orderCount: 14, productName: 'Wireless Bluetooth Headphones Active Noise Cancelling Over Ear Headset', price: 890, profit: 5.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:40', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250627, orderNo: '20251216176587078012345', member: '1-223344556677', username: '0003', orderCount: 13, productName: 'Smart Watch Series 9 GPS Cellular 45mm Titanium Case Sport Band', price: 1299, profit: 7.79, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:38', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250626, orderNo: '20251216176587077901234', member: '1-223344556677', username: '0003', orderCount: 12, productName: 'Drone with 4K Camera Professional Aerial Photography Quadcopter', price: 2450, profit: 14.7, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:36', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250625, orderNo: '20251216176587077790123', member: '1-223344556677', username: '0003', orderCount: 11, productName: 'Electric Standing Desk Height Adjustable Home Office Workstation', price: 1680, profit: 10.08, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:34', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250624, orderNo: '20251216176587077679012', member: '1-223344556677', username: '0003', orderCount: 20, productName: 'Robot Vacuum Cleaner with Mop Self-Emptying Station LiDAR Navigation', price: 1890, profit: 11.34, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:32', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250623, orderNo: '20251216176587077567901', member: '1-223344556677', username: '0003', orderCount: 19, productName: 'Air Purifier HEPA Filter Large Room Coverage Smart WiFi Control', price: 780, profit: 4.68, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:30', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250622, orderNo: '20251216176587077456790', member: '1-223344556677', username: '0003', orderCount: 18, productName: 'Massage Chair Full Body Zero Gravity Shiatsu Recliner with Heat', price: 4500, profit: 27.0, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '设定', multiple: 5, time: '2025-12-16 01:39:28', type: '连单', status: '未完成', needConfirm: 8500.50 },
  { id: 250621, orderNo: '20251216176587077345679', member: '1-223344556677', username: '0003', orderCount: 17, productName: 'Portable Power Station 2000W Solar Generator for Camping Emergency', price: 2200, profit: 13.2, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:26', type: '单一', status: '已完成', needConfirm: 0 },
  { id: 250620, orderNo: '20251216176587077234568', member: '1-223344556677', username: '0003', orderCount: 16, productName: 'Electric Bike 750W Motor Fat Tire Mountain Bicycle 48V Battery', price: 1950, profit: 11.7, rate: '0.6%', vipLevel: 'Mid-level employees(2)', method: '随机', multiple: 1, time: '2025-12-16 01:39:24', type: '单一', status: '已完成', needConfirm: 0 }
]

// 订单财务日志弹窗
const orderFinanceModal = reactive({
  visible: false,
  record: null,
  loading: false,
  list: [],
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  }
})

// 订单财务日志列配置
const orderFinanceColumns = [
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 100, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120, align: 'center' },
  { title: '前数量', dataIndex: 'beforeAmount', key: 'beforeAmount', width: 140, align: 'center' },
  { title: '数量', dataIndex: 'amount', key: 'amount', width: 120, align: 'center' },
  { title: '后数量', dataIndex: 'afterAmount', key: 'afterAmount', width: 140, align: 'center' },
  { title: '时间', dataIndex: 'time', key: 'time', width: 140, align: 'center' }
]

// 订单财务日志假数据
const mockOrderFinanceData = [
  { id: 1, direction: '增加', type: '利润', beforeAmount: 3055.92, amount: 8.51, afterAmount: 3064.43, time: '12/16 01:39' }
]

// 商品详情抽屉
const productDetailDrawer = reactive({
  visible: false,
  record: null,
  image: 'https://via.placeholder.com/120x120',
  price: 671,
  profit: 4.03,
  rate: '0.6%',
  title: 'Free Shipping 2024 China Hot Mom Manufacturer Eco-friendly Folding Baby Stroller Aluminum Alloy Carriage 3 in 1 Baby Pram'
})

// 打开订单列表
const handleOrderList = (record) => {
  orderListModal.visible = true
  orderListModal.record = record
  orderListModal.activeTab = 'all'
  orderListModal.searchText = ''
  orderListModal.pagination.current = 1
  loadOrderListData()
}

// 加载订单列表数据
const loadOrderListData = () => {
  orderListModal.loading = true
  setTimeout(() => {
    orderListModal.list = [...mockOrderListData]
    orderListModal.pagination.total = 100
    orderListModal.loading = false
  }, 300)
}

// 搜索订单列表
const onOrderListSearch = (value) => {
  console.log('搜索订单:', value)
  loadOrderListData()
}

// 更多搜索
const handleMoreOrderSearch = () => {
  orderSearchDrawer.visible = true
}

// 关闭搜索抽屉
const handleCloseOrderSearchDrawer = () => {
  orderSearchDrawer.visible = false
}

// 重置搜索条件
const handleResetOrderSearch = () => {
  orderSearchDrawer.productId = ''
  orderSearchDrawer.memberUid = ''
  orderSearchDrawer.minPrice = ''
  orderSearchDrawer.maxPrice = ''
  orderSearchDrawer.orderNo = ''
  orderSearchDrawer.keyword = ''
  orderSearchDrawer.startTime = null
  orderSearchDrawer.endTime = null
  orderSearchDrawer.sortField = undefined
  orderSearchDrawer.sortType = undefined
}

// 提交搜索
const handleSubmitOrderSearch = () => {
  orderSearchDrawer.visible = false
  loadOrderListData()
}

// 搜索会员UID
const handleSearchMemberUid = () => {
  message.info('搜索会员: ' + orderSearchDrawer.memberUid)
}

// 关闭筛选
const handleCloseOrderFilter = () => {
  orderListModal.searchText = ''
  orderListModal.activeTab = 'all'
  loadOrderListData()
}

// 关闭窗口
const handleCloseOrderWindow = () => {
  orderListModal.visible = false
}

// 订单列表全屏切换
const toggleOrderListFullscreen = () => {
  orderListModal.isFullscreen = !orderListModal.isFullscreen
  if (setCollapsed) {
    setCollapsed(orderListModal.isFullscreen)
  }
}

// 订单列表表格密度切换
const handleOrderListDensityChange = ({ key }) => {
  orderListModal.tableSize = key
}

// 查看订单商品
const handleViewOrderProduct = (record) => {
  handleOrderDetail(record)
}

// 订单财务
const handleOrderFinance = (record) => {
  orderFinanceModal.visible = true
  orderFinanceModal.record = record
  orderFinanceModal.loading = true
  setTimeout(() => {
    orderFinanceModal.list = [...mockOrderFinanceData]
    orderFinanceModal.pagination.total = mockOrderFinanceData.length
    orderFinanceModal.loading = false
  }, 300)
}

// 订单详情
const handleOrderDetail = (record) => {
  productDetailDrawer.visible = true
  productDetailDrawer.record = record
  productDetailDrawer.image = 'https://ae01.alicdn.com/kf/S3c3a56c0d0b64a52960f7c3f1c4d9c6dS.jpg_220x220.jpg'
  productDetailDrawer.price = record.price || 671
  productDetailDrawer.profit = record.profit || 4.03
  productDetailDrawer.rate = record.rate || '0.6%'
  productDetailDrawer.title = record.productName || 'Free Shipping 2024 China Hot Mom Manufacturer Eco-friendly Folding Baby Stroller Aluminum Alloy Carriage 3 in 1 Baby Pram'
}

// 订单跳单
const handleOrderSkip = (record) => {
  Modal.confirm({
    title: '确认跳单',
    content: `确定要跳过订单 ${record.orderNo} 吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      message.success('跳单成功')
    }
  })
}

// 保存商品详情
const handleSaveProductDetail = () => {
  message.success('保存成功')
  productDetailDrawer.visible = false
}

const handleModifyUsername = (record) => {
  modifyUsernameModal.visible = true
  modifyUsernameModal.record = record
  modifyUsernameModal.currentValue = record.username || ''
  modifyUsernameModal.newValue = record.username || ''
}

// 确认修改用户名
const handleModifyUsernameOk = () => {
  if (!modifyUsernameModal.newValue) {
    message.warning('请输入用户名')
    return
  }
  // 更新表格数据
  const record = modifyUsernameModal.record
  if (record) {
    record.username = modifyUsernameModal.newValue
  }
  message.success('用户名修改成功')
  modifyUsernameModal.visible = false
}

const handleModifyOrderCount = (record) => {
  // 从 taskProgress 解析已用单数和全部单数，格式如 "0/40"
  const [used, total] = (record.taskProgress || '0/40').split('/').map(Number)
  modifyOrderCountModal.visible = true
  modifyOrderCountModal.record = record
  modifyOrderCountModal.usedCount = used
  modifyOrderCountModal.totalCount = total
}

// 确认修改任务单数
const handleModifyOrderCountOk = () => {
  const record = modifyOrderCountModal.record
  if (record) {
    // 更新任务进度
    record.taskProgress = `${modifyOrderCountModal.usedCount}/${modifyOrderCountModal.totalCount}`
  }
  message.success('任务单数修改成功')
  modifyOrderCountModal.visible = false
}

const handleModifyGroupCount = (record) => {
  // 从 groupProgress 解析已用组数和全部组数，格式如 "0/4"
  const [used, total] = (record.groupProgress || '0/4').split('/').map(Number)
  modifyGroupCountModal.visible = true
  modifyGroupCountModal.record = record
  modifyGroupCountModal.currentUsed = used
  modifyGroupCountModal.currentTotal = total
  modifyGroupCountModal.newUsed = used
}

// 确认修改组数
const handleModifyGroupCountOk = () => {
  const record = modifyGroupCountModal.record
  if (record) {
    // 更新组数进度
    record.groupProgress = `${modifyGroupCountModal.newUsed}/${modifyGroupCountModal.currentTotal}`
  }
  message.success('组数修改成功')
  modifyGroupCountModal.visible = false
}

const handleWalletAddress = (record) => {
  walletAddressModal.visible = true
  walletAddressModal.record = record
  // 从会员数据中获取钱包地址（假设 record 中有 trxAddress 和 ethAddress）
  walletAddressModal.addresses[0].address = record.trxAddress || 'TPVyGvK6N2THcPtP84xnDhzgLoG629uXVq'
  walletAddressModal.addresses[1].address = record.ethAddress || '0x1b73F67151CABCbdacAD20c5313ed7De9Dd02ADA'
}

const handleModifyWithdrawInfo = (record) => {
  modifyWithdrawInfoModal.visible = true
  modifyWithdrawInfoModal.record = record
  // 从会员数据中获取提取信息
  modifyWithdrawInfoModal.type = record.withdrawType || 'crypto'
  modifyWithdrawInfoModal.name = record.withdrawName || ''
  modifyWithdrawInfoModal.address = record.withdrawAddress || ''
  modifyWithdrawInfoModal.bankName = record.bankName || ''
}

// 确认修改提取资料
const handleModifyWithdrawInfoOk = () => {
  const record = modifyWithdrawInfoModal.record
  if (record) {
    record.withdrawType = modifyWithdrawInfoModal.type
    record.withdrawName = modifyWithdrawInfoModal.name
    record.withdrawAddress = modifyWithdrawInfoModal.address
    record.bankName = modifyWithdrawInfoModal.bankName
  }
  message.success('提取资料修改成功')
  modifyWithdrawInfoModal.visible = false
}

const handleModifyPassword = (record) => {
  modifyPasswordModal.visible = true
  modifyPasswordModal.record = record
  modifyPasswordModal.newPassword = ''
}

// 确认修改密码
const handleModifyPasswordOk = () => {
  if (!modifyPasswordModal.newPassword) {
    message.warning('请输入新密码')
    return
  }
  if (modifyPasswordModal.newPassword.length < 6) {
    message.warning('密码长度不能少于6位')
    return
  }
  message.success('密码修改成功')
  modifyPasswordModal.visible = false
}

const handleModifyTradePassword = (record) => {
  modifyTradePasswordModal.visible = true
  modifyTradePasswordModal.record = record
  modifyTradePasswordModal.newPassword = ''
}

// 确认修改交易密码
const handleModifyTradePasswordOk = () => {
  if (!modifyTradePasswordModal.newPassword) {
    message.warning('请输入新密码')
    return
  }
  if (modifyTradePasswordModal.newPassword.length < 6) {
    message.warning('密码长度不能少于6位')
    return
  }
  message.success('交易密码修改成功')
  modifyTradePasswordModal.visible = false
}

const handleModifyParent = (record) => {
  modifyParentModal.visible = true
  modifyParentModal.record = record
  modifyParentModal.newParentUid = ''
  // 模拟当前上级信息
  modifyParentModal.parentInfo = {
    uid: '43204160',
    username: 'canglong002',
    email: '',
    phone: '1-15644914484'
  }
}

// 搜索上级
const handleSearchParent = () => {
  if (!modifyParentModal.newParentUid) {
    message.warning('请输入会员ID')
    return
  }
  message.info(`搜索会员: ${modifyParentModal.newParentUid}`)
}

// 确认修改上级
const handleModifyParentOk = () => {
  if (!modifyParentModal.newParentUid) {
    message.warning('请输入新的上级UID')
    return
  }
  message.success('上级修改成功')
  modifyParentModal.visible = false
}

const handleModifyInviteCode = (record) => {
  modifyInviteCodeModal.visible = true
  modifyInviteCodeModal.record = record
  modifyInviteCodeModal.currentCode = record.inviteCode || 'V32O'
  modifyInviteCodeModal.newCode = record.inviteCode || 'V32O'
}

// 确认修改邀请码
const handleModifyInviteCodeOk = () => {
  if (!modifyInviteCodeModal.newCode) {
    message.warning('请输入邀请码')
    return
  }
  const record = modifyInviteCodeModal.record
  if (record) {
    record.inviteCode = modifyInviteCodeModal.newCode
  }
  message.success('邀请码修改成功')
  modifyInviteCodeModal.visible = false
}

const handleModifyVipLevel = (record) => {
  modifyVipLevelModal.visible = true
  modifyVipLevelModal.record = record
  modifyVipLevelModal.currentLevel = record.vipLevel || 'VIP 2'
  modifyVipLevelModal.newLevel = record.vipLevel || 'VIP 2'
  modifyVipLevelModal.remark = ''
}

// 确认修改VIP等级
const handleModifyVipLevelOk = () => {
  const record = modifyVipLevelModal.record
  if (record) {
    record.vipLevel = modifyVipLevelModal.newLevel
  }
  message.success('VIP等级修改成功')
  modifyVipLevelModal.visible = false
}

const handleModifyLoginAuth = (record) => {
  modifyLoginVerifyModal.visible = true
  modifyLoginVerifyModal.record = record
  modifyLoginVerifyModal.currentStatus = record.loginVerify || '无'
  modifyLoginVerifyModal.newVerify = 'none'
}

// 确认修改登录验证
const handleModifyLoginVerifyOk = () => {
  const record = modifyLoginVerifyModal.record
  if (record) {
    const verifyMap = { none: '无', phone: '手机', email: '邮箱' }
    record.loginVerify = verifyMap[modifyLoginVerifyModal.newVerify]
  }
  message.success('登录验证修改成功')
  modifyLoginVerifyModal.visible = false
}

const handleModifyRealNameInfo = (record) => {
  realNameInfoDrawer.visible = true
  realNameInfoDrawer.record = record
  realNameInfoDrawer.type = record.idType || '身份证'
  realNameInfoDrawer.name = record.realName || ''
  realNameInfoDrawer.idNumber = record.idNumber || ''
  realNameInfoDrawer.status = record.authStatus || 'passed'
}

// 保存实名信息
const handleSaveRealNameInfo = () => {
  const record = realNameInfoDrawer.record
  if (record) {
    record.idType = realNameInfoDrawer.type
    record.realName = realNameInfoDrawer.name
    record.idNumber = realNameInfoDrawer.idNumber
    record.authStatus = realNameInfoDrawer.status
  }
  message.success('实名信息保存成功')
  realNameInfoDrawer.visible = false
}

const handleModifyRealNameStatus = (record) => {
  modifyAuthStatusModal.visible = true
  modifyAuthStatusModal.record = record
  modifyAuthStatusModal.currentStatus = record.authStatusText || '待审核'
  modifyAuthStatusModal.newStatus = 'pending'
  modifyAuthStatusModal.remark = ''
}

// 确认修改认证状态
const handleModifyAuthStatusOk = () => {
  const record = modifyAuthStatusModal.record
  if (record) {
    const statusMap = { passed: '通过', rejected: '拒绝', pending: '待审核' }
    record.authStatusText = statusMap[modifyAuthStatusModal.newStatus]
  }
  message.success('认证状态修改成功')
  modifyAuthStatusModal.visible = false
}

const handleModifyCreditScore = (record) => {
  modifyCreditScoreModal.visible = true
  modifyCreditScoreModal.record = record
  modifyCreditScoreModal.currentScore = record.creditScore || 100
  modifyCreditScoreModal.newScore = record.creditScore || 100
}

// 确认修改信誉分
const handleModifyCreditScoreOk = () => {
  const record = modifyCreditScoreModal.record
  if (record) {
    record.creditScore = modifyCreditScoreModal.newScore
  }
  message.success('信誉分修改成功')
  modifyCreditScoreModal.visible = false
}

const handleModifyRemark = (record) => {
  modifyRemarkModal.visible = true
  modifyRemarkModal.record = record
  modifyRemarkModal.remark = record.remark || ''
}

// 确认修改备注
const handleModifyRemarkOk = () => {
  const record = modifyRemarkModal.record
  if (record) {
    record.remark = modifyRemarkModal.remark
  }
  message.success('备注修改成功')
  modifyRemarkModal.visible = false
}

const handleDisableAccount = (record) => {
  disableAccountModal.visible = true
  disableAccountModal.record = record
}

// 确认禁用账户
const handleDisableAccountOk = () => {
  const record = disableAccountModal.record
  if (record) {
    record.status = 'disabled'
  }
  message.success('账户已禁用')
  disableAccountModal.visible = false
}

const handleDisableTrade = (record) => {
  disableTradeModal.visible = true
  disableTradeModal.record = record
}

// 确认禁用交易
const handleDisableTradeOk = () => {
  const record = disableTradeModal.record
  if (record) {
    record.tradeEnabled = false
  }
  message.success('交易已禁用')
  disableTradeModal.visible = false
}

const handleDisableWithdraw = (record) => {
  disableWithdrawModal.visible = true
  disableWithdrawModal.record = record
}

// 确认禁用提现
const handleDisableWithdrawOk = () => {
  const record = disableWithdrawModal.record
  if (record) {
    record.withdrawEnabled = false
  }
  message.success('提现已禁用')
  disableWithdrawModal.visible = false
}

const handleDisableComment = (record) => {
  disableCommentModal.visible = true
  disableCommentModal.record = record
}

// 确认禁用评论
const handleDisableCommentOk = () => {
  const record = disableCommentModal.record
  if (record) {
    record.commentEnabled = false
  }
  message.success('评论已禁用')
  disableCommentModal.visible = false
}

const handleGiftRecord = (record) => {
  giftRecordModal.record = record
  giftRecordModal.visible = true
  loadGiftRecordData()
}

// 加载赠送记录数据
const loadGiftRecordData = () => {
  giftRecordModal.loading = true
  setTimeout(() => {
    giftRecordModal.list = [...mockGiftRecordData]
    giftRecordModal.pagination.total = mockGiftRecordData.length
    giftRecordModal.loading = false
  }, 300)
}

// 关闭赠送记录窗口
const handleCloseGiftRecordWindow = () => {
  giftRecordModal.visible = false
  if (giftRecordModal.isFullscreen) {
    giftRecordModal.isFullscreen = false
    if (setCollapsed) {
      setCollapsed(false)
    }
  }
}

// 赠送记录搜索
const onGiftRecordSearch = () => {
  loadGiftRecordData()
}

// 赠送记录全屏切换
const toggleGiftRecordFullscreen = () => {
  giftRecordModal.isFullscreen = !giftRecordModal.isFullscreen
  if (setCollapsed) {
    setCollapsed(giftRecordModal.isFullscreen)
  }
}

// 赠送记录密度切换
const handleGiftRecordDensityChange = ({ key }) => {
  giftRecordModal.tableSize = key
}

// 添加赠送数据
const handleAddGiftRecord = () => {
  // 重置表单
  addGiftRecordDrawer.memberUid = ''
  addGiftRecordDrawer.type = 'add'
  addGiftRecordDrawer.amount = ''
  addGiftRecordDrawer.remark = ''
  addGiftRecordDrawer.availableAmount = null
  addGiftRecordDrawer.frozenAmount = null
  addGiftRecordDrawer.visible = true
}

// 搜索会员UID
const handleSearchGiftMemberUid = () => {
  if (!addGiftRecordDrawer.memberUid) {
    message.warning('请输入会员UID')
    return
  }
  message.success(`搜索会员: ${addGiftRecordDrawer.memberUid}`)
}

// 保存并创建赠送记录
const handleSaveAndCreateGiftRecord = () => {
  if (!addGiftRecordDrawer.memberUid) {
    message.warning('请输入会员UID')
    return
  }
  if (!addGiftRecordDrawer.amount) {
    message.warning('请输入数量')
    return
  }
  message.success('保存成功')
  addGiftRecordDrawer.visible = false
  loadGiftRecordData()
}

// 更多搜索(赠送记录)
const handleMoreGiftRecordSearch = () => {
  giftRecordSearchDrawer.visible = true
}

// 重置赠送记录筛选
const handleResetGiftRecordSearch = () => {
  giftRecordSearchDrawer.status = undefined
  giftRecordSearchDrawer.memberId = ''
  giftRecordSearchDrawer.startTime = null
  giftRecordSearchDrawer.endTime = null
  giftRecordSearchDrawer.keyword = ''
  giftRecordSearchDrawer.sortField = 'time'
  giftRecordSearchDrawer.sortType = 'desc'
}

// 提交赠送记录筛选
const handleSubmitGiftRecordSearch = () => {
  message.success('筛选条件已应用')
  giftRecordSearchDrawer.visible = false
  loadGiftRecordData()
}

// 搜索关键词(赠送记录)
const handleSearchGiftRecordKeyword = () => {
  if (giftRecordSearchDrawer.keyword) {
    message.info(`搜索: ${giftRecordSearchDrawer.keyword}`)
  }
}

// 赠送记录财务
const handleGiftRecordFinance = (record) => {
  giftRecordFinanceDrawer.record = record
  giftRecordFinanceDrawer.list = []
  giftRecordFinanceDrawer.pagination.total = 0
  giftRecordFinanceDrawer.visible = true
}

// 赠送记录继续
const handleGiftRecordContinue = (record) => {
  // 从记录中提取会员ID
  const memberId = record.member ? record.member.split('-')[1] : ''
  addGiftRecordDrawer.memberUid = memberId
  addGiftRecordDrawer.type = record.type === '增加' ? 'add' : 'sub'
  addGiftRecordDrawer.amount = ''
  addGiftRecordDrawer.remark = ''
  // 模拟数据 - 实际应从接口获取
  addGiftRecordDrawer.availableAmount = -14991.59
  addGiftRecordDrawer.frozenAmount = 20537.82
  addGiftRecordDrawer.visible = true
}

const handleSubUsers = (record) => {
  subUsersModal.record = record
  subUsersModal.searchUid = record.uid || ''
  subUsersModal.treeData = mockSubUsersTreeData
  subUsersModal.visible = true
}

// 关闭下级用户页面
const handleCloseSubUsersModal = () => {
  subUsersModal.visible = false
}

// 刷新下级用户数据
const handleRefreshSubUsers = () => {
  message.success('刷新成功')
}

// 查询下级用户
const handleSearchSubUsers = () => {
  if (!subUsersModal.searchUid) {
    message.warning('请输入会员UID')
    return
  }
  message.success(`查询: ${subUsersModal.searchUid}`)
}

// 下级用户全屏切换
const toggleSubUsersFullscreen = () => {
  subUsersModal.isFullscreen = !subUsersModal.isFullscreen
  if (setCollapsed) {
    setCollapsed(subUsersModal.isFullscreen)
  }
}

const handleParentUser = (record) => {
  message.info(`上级用户: ${record.uid}`)
}

const handleAuthInfo = (record) => {
  message.info(`认证信息: ${record.uid}`)
}

const handleOnlineInfo = (record) => {
  message.info(`在线信息: ${record.uid}`)
}

const handleSecurityLog = (record) => {
  message.info(`安全日志: ${record.uid}`)
}

const handleLoginLog = (record) => {
  message.info(`登录日志: ${record.uid}`)
}

const handleVipChangeLog = (record) => {
  message.info(`VIP变更日志: ${record.uid}`)
}

const handleTotalProfit = (record) => {
  message.info(`累计利润: ${record.uid}`)
}

const handleGoodsCountLog = (record) => {
  message.info(`商品次数日志: ${record.uid}`)
}

const handleCryptoOrder = (record) => {
  message.info(`充币订单: ${record.uid}`)
}
</script>

<style scoped lang="less">
.page-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px 0;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 24px;
    flex-wrap: wrap;
    gap: 12px;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .icon-btn {
        color: #666;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;

    :deep(.ant-table-wrapper) {
      height: 100%;

      .ant-spin-nested-loading,
      .ant-spin-container {
        height: 100%;
      }

      .ant-table {
        height: 100%;

        .ant-table-container {
          height: 100%;
          display: flex;
          flex-direction: column;

          .ant-table-header {
            flex-shrink: 0;
            overflow: hidden !important;
          }

          .ant-table-body {
            flex: 1;
            overflow: auto !important;
          }
        }
      }
    }
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px 0;
    flex-shrink: 0;

    .total-text {
      color: #666;
      font-size: 14px;
    }
  }

  .edit-icon {
    margin-left: 4px;
    color: #1890ff;
    cursor: pointer;
  }

  .link-text {
    color: #1890ff;
    cursor: pointer;
  }

  .btn-orange {
    background: #ff9800 !important;
    border-color: #ff9800 !important;

    &:hover {
      background: #ffb74d !important;
      border-color: #ffb74d !important;
    }
  }

  .btn-warning {
    background: #faad14 !important;
    border-color: #faad14 !important;
  }

  // 多级表头样式
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      padding: 21px 10px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;

      // 蓝色 - 当前用户信息
      &.column-group-blue,
      &.column-blue {
        color: #1890ff;
      }

      // 红色 - 上级用户信息
      &.column-group-red,
      &.column-red {
        color: #ff4d4f;
      }

      // 绿色 - 最近一次登录
      &.column-group-green,
      &.column-green {
        color: #52c41a;
      }
    }

    .ant-table-tbody > tr > td {
      padding: 12px 6px;
      font-size: 14px;
      text-align: center;
    }
  }

  &.size-default :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px 8px;
    }
  }

  &.size-middle :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 10px 6px;
    }
  }

  &.size-small :deep(.ant-table) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px 4px;
    }
  }
}

:deep(.active-density) {
  color: #1890ff;
  background-color: #e6f7ff;
}

/* 筛选抽屉样式 */
.filter-form {
  :deep(.ant-form-item) {
    margin-bottom: 16px;

    .ant-form-item-label > label {
      font-size: 13px;
      color: #333;
    }

    .ant-input,
    .ant-select-selector,
    .ant-picker {
      border-radius: 6px;
    }
  }

  .date-picker-item {
    :deep(.ant-picker) {
      height: 44px;

      .ant-picker-input > input {
        font-size: 14px;
      }
    }
  }
}

:deep(.filter-drawer) {
  .ant-drawer-header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .ant-drawer-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .ant-drawer-body {
    padding: 16px;
    background: #fff;
  }
}

/* VIP等级弹窗样式 */
.vip-modal-content {
  .current-level {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;

    .level-icon {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
  }
}

/* 信用积分弹窗样式 */
.credit-score-modal-content {
  .current-score {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }
}

/* 邀请码弹窗样式 */
.invite-code-modal-content {
  .current-code {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .tip-text {
    color: #999;
    font-size: 13px;
    margin-bottom: 16px;
  }
}

/* 上下分弹窗圆角 */
.balance-modal {
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
  }
}

/* 修改余额弹窗样式 */
.modify-balance-modal {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }
}

/* 快速编辑弹窗通用样式 */
.quick-edit-modal {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }
}

.quick-edit-content {
  .current-value {
    font-size: 16px;
    color: #333;
    margin-bottom: 16px;

    .value {
      font-weight: 600;
      color: #1890ff;
    }
  }

  :deep(.ant-input) {
    height: 42px;
    border-radius: 8px;
    font-size: 14px;

    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
}

.modify-balance-content {
  :deep(.ant-alert) {
    border-radius: 8px;
    margin-bottom: 16px;

    .ant-alert-message {
      font-weight: 600;
      color: #d48806;
    }

    .ant-alert-description {
      color: #666;
      font-size: 13px;
    }
  }

  .balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 16px;

    .balance-label {
      font-size: 14px;
      color: #666;
    }

    .balance-value {
      font-size: 22px;
      font-weight: 600;
      color: #333;
    }
  }

  .form-item {
    margin-bottom: 14px;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    :deep(.ant-input-number) {
      width: 100%;
      height: 40px;
      border-radius: 8px;

      .ant-input-number-input {
        height: 38px;
      }
    }

    :deep(.ant-input),
    :deep(textarea.ant-input) {
      border-radius: 8px;
    }
  }
}

/* 上下分弹窗样式 */
.balance-modal-content {
  .member-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    color: #fff;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }

      .info-label {
        font-size: 13px;
        opacity: 0.85;
      }

      .info-value {
        font-size: 14px;
        font-weight: 500;

        &.highlight {
          font-size: 24px;
          font-weight: 700;
          color: #ffeb3b;
        }
      }
    }
  }

  .type-radio-group {
    width: 100%;
    display: flex;

    :deep(.ant-radio-button-wrapper) {
      flex: 1;
      text-align: center;
      height: 44px;
      line-height: 42px;
      font-size: 14px;
      font-weight: 500;

      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }
    }

    :deep(.ant-radio-button-wrapper-checked.add-btn) {
      background: #52c41a;
      border-color: #52c41a;

      &:hover {
        background: #73d13d;
        border-color: #73d13d;
      }
    }

    :deep(.ant-radio-button-wrapper-checked.subtract-btn) {
      background: #ff4d4f;
      border-color: #ff4d4f;

      &:hover {
        background: #ff7875;
        border-color: #ff7875;
      }
    }
  }

  .result-balance {
    font-size: 28px;
    font-weight: 700;
    color: #52c41a;
    text-align: center;
    padding: 12px;
    background: #f6ffed;
    border-radius: 8px;
    border: 1px solid #b7eb8f;

    &.is-negative {
      color: #ff4d4f;
      background: #fff2f0;
      border-color: #ffccc7;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;

    .ant-form-item-label > label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }

  :deep(.ant-input-number) {
    border-radius: 8px;

    .ant-input-number-group-addon {
      background: #fafafa;
      border-radius: 8px 0 0 8px;
      font-weight: 600;
      color: #333;
    }
  }

  :deep(.ant-input),
  :deep(textarea.ant-input) {
    border-radius: 8px;
  }
}

/* 箭头图标样式 */
.arrow-icon {
  color: #999;
  margin-left: 2px;
}

.arrow-icon-blue {
  color: #1890ff;
  margin-left: 2px;
}

/* 连单管理页面样式 */
.order-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-radius: 8px;

  .order-page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      font-size: 18px;
      color: #666;

      &:hover {
        color: #333;
      }
    }
  }

  .order-page-content {
    flex: 1;
    padding: 16px 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .user-info-card {
      display: flex;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      margin-bottom: 16px;
      flex-shrink: 0;
      overflow: hidden;

      .info-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e8e8e8;

        &:last-child {
          border-right: none;
        }

        .label {
          display: block;
          padding: 10px 16px;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          background: #fafafa;
          border-bottom: 1px solid #e8e8e8;
          text-align: center;
        }

        .value {
          display: block;
          padding: 12px 16px;
          font-size: 14px;
          color: #333;
          font-weight: 700;
          background: #fff;
          text-align: center;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;

          &.highlight {
            color: #1890ff;
            font-weight: 700;
          }
        }
      }
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-shrink: 0;

      .search-area {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-btn {
          color: #666;

          &:hover {
            color: #1890ff;
          }
        }
      }
    }

    .order-table-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      :deep(.ant-table-wrapper) {
        flex: 1;
        overflow: hidden;
      }

      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background: #fafafa;
          text-align: center;
        }

        .ant-table-tbody > tr > td {
          text-align: center;
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0 0 0;
        flex-shrink: 0;

        .total-text {
          color: #666;
          font-size: 13px;
        }
      }
    }
  }
}

/* 弹出动画 */
.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideUp 0.2s ease-in reverse;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 产品信息单元格样式 */
.products-cell {
  .product-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .product-name {
      color: #fa8c16;
      font-weight: 500;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-info {
      color: #666;
      font-size: 13px;

      .price {
        color: #1890ff;
        font-weight: 600;
        margin-right: 12px;
      }

      .rate {
        color: #333;
        margin-right: 12px;
      }

      .multiple {
        color: #333;
      }
    }

    :deep(.ant-tag) {
      margin: 0;
    }
  }
}

/* 连单操作按钮样式 */
.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  white-space: nowrap;
}

.action-link {
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.edit-link {
  color: #1890ff;
}

.delete-link {
  color: #ff4d4f;
}

.add-link {
  color: #1890ff;
}

.disabled-btn {
  color: #d9d9d9;
  cursor: not-allowed;
  font-size: 14px;
  white-space: nowrap;
}

/* 财务日志抽屉样式 */
:global(.finance-drawer) {
  .ant-drawer-body {
    padding: 0 !important;
  }
}

.finance-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .finance-table-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.ant-table-wrapper) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.finance-table-borderless) {
      .ant-table-container {
        border-radius: 0 !important;
      }

      .ant-table-thead > tr > th {
        background: #fafafa;
        text-align: center;
        font-weight: 600;
        padding: 14px 8px;

        &:first-child {
          padding-left: 12px;
        }

        &:last-child {
          padding-right: 12px;
        }
      }

      .ant-table-tbody > tr > td {
        text-align: center;
        padding: 14px 8px;

        &:first-child {
          padding-left: 12px;
        }

        &:last-child {
          padding-right: 12px;
        }
      }
    }

    .finance-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      flex-shrink: 0;
      border-top: 1px solid #f0f0f0;

      .total-text {
        color: #666;
        font-size: 13px;
      }
    }
  }
}

/* 财务日志方向样式 */
.direction-add {
  color: #52c41a;
  font-weight: 500;
}

.direction-subtract {
  color: #ff4d4f;
  font-weight: 500;
}

/* 更多菜单样式在全局样式中定义 */

/* 中奖调节弹窗样式 */
.lottery-modal-content {
  .lottery-form-item {
    margin-bottom: 8px;

    .lottery-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 6px;

      .required {
        color: #ff4d4f;
        margin-right: 4px;
      }
    }

    .lottery-switch-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      padding: 0 10px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: #fff;
      font-size: 14px;
    }

    :deep(.ant-select-selector) {
      height: 36px !important;
      border-radius: 6px !important;

      .ant-select-selection-item {
        line-height: 34px !important;
      }
    }
  }
}

/* 创建会员抽屉样式 */
.create-member-drawer {
  /* 会员信息卡片 */
  .member-info-card-top {
    display: flex;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 16px;
    color: #fff;

    .info-row {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid rgba(255, 255, 255, 0.2);

      &:last-child {
        border-right: none;
      }

      .info-label {
        font-size: 12px;
        opacity: 0.85;
        margin-bottom: 4px;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }

  .form-section {
    margin-bottom: 4px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #000;
      margin-bottom: 12px;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 12px;

    .ant-form-item-label {
      padding-bottom: 4px;

      > label {
        font-size: 14px;
        color: #333;
      }
    }

    .ant-input,
    .ant-select-selector,
    .ant-input-number {
      border-radius: 6px;
      height: 40px;
    }

    .ant-input-affix-wrapper {
      border-radius: 6px;
      padding: 0 11px;

      .ant-input {
        height: 38px;
      }
    }

    .ant-input-number-input {
      height: 38px;
    }

    .ant-select-selector {
      height: 40px !important;

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 38px !important;
      }
    }

    textarea.ant-input {
      height: auto;
    }
  }

  .switch-item {
    .switch-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafafa;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      padding: 8px 12px;
      height: 40px;

      .switch-text {
        color: #999;
        font-size: 14px;
      }
    }
  }
}

/* 创建连单抽屉样式 */
.create-order-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: -24px;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;

    .close-btn {
      font-size: 16px;
      color: #666;
      padding: 4px 8px;

      &:hover {
        color: #333;
      }
    }

    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .order-info-bar {
    display: flex;
    gap: 16px;
    padding: 12px 24px;
    background: #fff;

    .info-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .label {
        font-size: 13px;
        color: #666;
      }

      :deep(.ant-input) {
        height: 36px;
        border-radius: 6px;

        &[disabled] {
          background: #fafafa;
          color: #bfbfbf;
          border-color: #d9d9d9;
        }
      }

      :deep(.ant-input-number) {
        width: 100%;
        height: 36px;
        border-radius: 6px;

        .ant-input-number-input {
          height: 34px;
        }
      }
    }
  }

  .selected-goods-section {
    padding: 0 24px;
    margin-bottom: 12px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .section-title {
        font-size: 20px;
        font-weight: 700;
        color: #333;
      }

      .total-amount {
        font-size: 20px;
        color: #333;
        font-weight: 700;
      }
    }

    .selected-goods-list {
      :deep(.ant-empty) {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100px;

        .ant-empty-image {
          height: 50px;
          margin-bottom: 8px;
        }

        .ant-empty-description {
          color: #999;
          font-size: 13px;
        }
      }

      .goods-cards {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .goods-card {
          padding: 12px 16px;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 8px;

          .card-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 8px;

            .card-id {
              font-size: 14px;
              color: #333;

              :deep(.ant-tag) {
                margin: 0;
                margin-left: 6px;
                font-size: 14px;
                padding: 2px 10px;
                cursor: default;
              }
            }

            .card-price {
              font-size: 14px;
              color: #333;

              :deep(.ant-tag) {
                margin: 0;
                margin-left: 6px;
                font-size: 14px;
                padding: 2px 10px;
                cursor: pointer;
                color: #333;
                font-weight: 600;
              }
            }
          }

          .card-name {
            font-size: 14px;
            color: #fa8c16;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .goods-list-section {
    flex: 1;
    padding: 0 24px 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 8px;
    min-height: 0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-shrink: 0;

      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }

      .price-filter {
        display: flex;
        align-items: center;
        gap: 8px;

        .separator {
          color: #999;
          padding: 0 4px;
        }

        :deep(.ant-input) {
          height: 32px;
          border-radius: 4px;
        }

        :deep(.ant-btn) {
          height: 32px;
          border-radius: 4px;
        }
      }
    }

    .goods-table-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;

      :deep(.ant-table-wrapper) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .ant-spin-nested-loading {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .ant-spin-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        }

        .ant-table {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .ant-table-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .ant-table-header {
              flex-shrink: 0;
            }

            .ant-table-body {
              flex: 1;
              overflow: auto !important;
            }
          }
        }
      }

      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background: #fafafa;
          text-align: center;
          font-weight: 600;
          padding: 12px 8px;
        }

        .ant-table-tbody > tr > td {
          text-align: center;
          padding: 14px 8px;
          vertical-align: middle;

          &:nth-child(2) {
            white-space: normal;
            word-break: break-word;
            line-height: 1.5;
          }
        }

        .price-text {
          color: #1890ff;
          font-weight: 600;
          font-size: 15px;
        }

        .select-btn {
          color: #52c41a;

          &:hover {
            color: #73d13d;
          }
        }
      }

      .goods-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0 0 0;
        flex-shrink: 0;

        .total-text {
          color: #666;
          font-size: 13px;
        }
      }
    }
  }
}

/* 修改价格弹窗样式 */
.edit-price-modal-content {
  .price-info-table {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 20px;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;

    .table-row {
      display: flex;

      &.header {
        background: #fafafa;

        .table-cell {
          font-weight: 500;
          color: #666;
        }
      }

      .table-cell {
        flex: 1;
        padding: 10px 12px;
        border-right: 1px solid #f0f0f0;
        text-align: center;
        font-size: 14px;

        &:last-child {
          border-right: none;
        }
      }

      &:first-child {
        border-bottom: 1px solid #f0f0f0;
      }
    }
  }

  .new-price-row {
    text-align: center;

    .label {
      display: block;
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
    }

    .price-input-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;

      .price-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0;
        border-color: #d9d9d9;

        &:first-child {
          border-radius: 6px 0 0 6px;
        }

        &:last-child {
          border-radius: 0 6px 6px 0;
        }
      }

      .price-input {
        width: 200px;
        height: 40px;
        border-radius: 0;

        :deep(.ant-input-number-input) {
          height: 38px;
          text-align: center;
          font-size: 16px;
        }
      }
    }
  }
}

/* 订单列表弹窗样式 */
.order-list-modal-content {
  .order-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    :deep(.ant-radio-group) {
      .ant-radio-button-wrapper {
        height: 32px;
        line-height: 30px;
        padding: 0 16px;
        border-radius: 0;

        &:first-child {
          border-radius: 4px 0 0 4px;
        }

        &:last-child {
          border-radius: 0 4px 4px 0;
        }

        &.ant-radio-button-wrapper-checked {
          background: #1890ff;
          border-color: #1890ff;
          color: #fff;
        }
      }
    }

    .tab-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .order-list-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;

    .total-text {
      color: #666;
      font-size: 13px;
    }
  }
}

/* 订单财务日志弹窗样式 */
.order-finance-content {
  :deep(.ant-table) {
    .ant-table-thead > tr > th {
      background: #fafafa;
      text-align: center;
      font-weight: 600;
      padding: 14px 12px;
    }

    .ant-table-tbody > tr > td {
      padding: 14px 12px;
      text-align: center;
    }
  }

  .order-finance-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;

    .total-text {
      color: #666;
      font-size: 13px;
    }
  }
}

/* 商品详情抽屉样式 */
.product-detail-content {
  margin: -24px;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;

    .close-btn {
      font-size: 16px;
      color: #666;
      cursor: pointer;

      &:hover {
        color: #333;
      }
    }

    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .product-info {
    padding: 20px;
    display: flex;
    gap: 20px;

    .product-image {
      flex-shrink: 0;

      img {
        width: 140px;
        height: 140px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
      }
    }

    .product-meta {
      flex: 1;

      .product-title {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .meta-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .meta-label {
          font-size: 14px;
          color: #666;
          min-width: 50px;
        }

        .meta-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;

          &.price {
            color: #ff4d4f;
          }

          &.profit {
            color: #52c41a;
          }

          &.rate {
            color: #1890ff;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
/* 更多菜单样式 - 全局 */
.more-menu-wrapper {
  max-height: 500px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .more-menu.ant-menu {
    border-radius: 8px;
    padding: 4px 0;
    min-width: 200px;

    .ant-menu-item {
      height: 52px;
      line-height: 52px;
      margin: 0 !important;
      padding: 0 20px !important;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}

/* 修改任务单数弹窗样式 */
.modify-order-count-modal {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }
}

/* 修改组数弹窗样式 */
.modify-group-count-content {
  .current-info {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  :deep(.ant-input-number) {
    height: 48px;
    border-radius: 8px;
    font-size: 16px;

    .ant-input-number-input {
      height: 46px;
    }
  }
}

/* 钱包地址管理弹窗样式 */
.wallet-address-content {
  .section-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
  }

  .address-list {
    .address-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .coin-info {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 120px;

        .coin-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: contain;
        }

        .coin-text {
          .coin-name {
            font-size: 15px;
            font-weight: 600;
            color: #333;
          }

          .coin-network {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
          }
        }
      }

      .address-value {
        font-size: 15px;
        color: #333;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        flex: 1;
        text-align: right;
        word-break: break-all;
        padding-left: 20px;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
}

/* 修改提取资料弹窗样式 */
.modify-withdraw-info-content {
  :deep(.ant-form-item-label > label) {
    font-size: 14px;
    color: #333;
  }

  :deep(.ant-form-item-required::before) {
    color: #ff4d4f !important;
  }

  :deep(.ant-input) {
    height: 44px;
    border-radius: 8px;
    font-size: 14px;
  }

  :deep(.ant-radio-group) {
    .ant-radio-wrapper {
      margin-right: 24px;

      .ant-radio-inner {
        width: 18px;
        height: 18px;
      }
    }
  }

  :deep(.ant-btn-primary) {
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
  }
}

/* 修改登录密码弹窗样式 */
.modify-password-content {
  .form-label {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  :deep(.ant-input-password) {
    height: 48px;
    border-radius: 8px;

    .ant-input {
      font-size: 15px;
    }
  }
}

/* 修改上级弹窗样式 */
.modify-parent-content {
  .section-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .info-table {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;

    .info-row {
      display: flex;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }

      &:nth-child(odd) {
        .info-cell {
          background: #fafafa;
          color: #666;
        }
      }

      &:nth-child(even) {
        .info-cell {
          background: #fff;
          color: #333;
        }
      }

      .info-cell {
        flex: 1;
        padding: 10px 14px;
        font-size: 14px;

        &:first-child {
          border-right: 1px solid #f0f0f0;
        }
      }
    }
  }

  .form-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .search-row {
    display: flex;
    gap: 12px;

    :deep(.ant-input) {
      height: 44px;
      border-radius: 8px;
    }

    :deep(.ant-btn) {
      height: 44px;
      border-radius: 8px;
      padding: 0 24px;
    }
  }
}

/* 修改邀请码弹窗样式 */
.modify-invite-code-content {
  .current-info {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .hint-text {
    font-size: 14px;
    color: #999;
    margin-bottom: 16px;
  }

  :deep(.ant-input) {
    height: 48px;
    border-radius: 8px;
    font-size: 15px;
  }
}

/* 设置VIP等级弹窗样式 */
.modify-vip-level-content {
  .current-info {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  :deep(.ant-select) {
    .ant-select-selector {
      height: 48px !important;
      border-radius: 8px !important;

      .ant-select-selection-item {
        line-height: 46px !important;
        font-size: 15px;
      }
    }
  }

  :deep(.ant-input) {
    border-radius: 8px;
    font-size: 14px;
  }
}

/* 修改登录验证弹窗样式 */
.modify-login-verify-content {
  .section-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .info-table {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;

    .info-row {
      display: flex;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }

      &:nth-child(odd) {
        .info-cell {
          background: #fafafa;
          color: #666;
        }
      }

      &:nth-child(even) {
        .info-cell {
          background: #fff;
          color: #333;
        }
      }

      &.single {
        .info-cell {
          flex: none;
          width: 100%;
        }
      }

      .info-cell {
        flex: 1;
        padding: 10px 14px;
        font-size: 14px;

        &:first-child:not(:only-child) {
          border-right: 1px solid #f0f0f0;
        }
      }
    }
  }

  .form-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  :deep(.ant-radio-group) {
    .ant-radio-wrapper {
      margin-right: 24px;

      .ant-radio-inner {
        width: 18px;
        height: 18px;
      }
    }
  }
}

/* 实名信息管理抽屉样式 */
.real-name-drawer {
  .ant-drawer-content-wrapper {
    border-radius: 16px 0 0 16px;
    overflow: hidden;
  }

  .ant-drawer-content {
    border-radius: 16px 0 0 16px;
  }
}

.real-name-info-content {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  :deep(.ant-form-item-label > label) {
    font-size: 14px;
    color: #333;
  }

  :deep(.ant-select-selector) {
    height: 44px !important;
    border-radius: 8px !important;

    .ant-select-selection-item {
      line-height: 42px !important;
    }
  }

  :deep(.ant-input) {
    height: 44px;
    border-radius: 8px;
  }

  :deep(.ant-radio-group) {
    .ant-radio-wrapper {
      margin-right: 20px;
    }
  }
}

/* 修改认证状态弹窗样式 */
.modify-auth-status-content {
  .section-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .info-table {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;

    .info-row {
      display: flex;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }

      &:nth-child(odd) {
        .info-cell {
          background: #fafafa;
          color: #666;
        }
      }

      &:nth-child(even) {
        .info-cell {
          background: #fff;
          color: #333;
        }
      }

      &.single {
        .info-cell {
          flex: none;
          width: 100%;
        }
      }

      .info-cell {
        flex: 1;
        padding: 10px 14px;
        font-size: 14px;

        &:first-child:not(:only-child) {
          border-right: 1px solid #f0f0f0;
        }
      }
    }
  }

  .form-label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  :deep(.ant-radio-group) {
    .ant-radio-wrapper {
      margin-right: 24px;
    }
  }

  :deep(.ant-input) {
    border-radius: 8px;
  }
}

/* 修改信誉分弹窗样式 */
.modify-credit-score-content {
  .current-info {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  :deep(.ant-slider) {
    margin: 10px 6px;
  }

  :deep(.ant-input-number) {
    height: 48px;
    border-radius: 8px;

    .ant-input-number-input {
      height: 46px;
      font-size: 16px;
    }
  }
}

/* 修改备注弹窗样式 */
.modify-remark-content {
  :deep(.ant-input) {
    border-radius: 8px;
    font-size: 14px;
  }
}

/* 禁用账户确认弹窗样式 */
.disable-account-content {
  p {
    font-size: 15px;
    color: #333;
    margin: 0;
    line-height: 1.6;
  }
}

.modify-order-count-content {
  .member-info-section {
    margin-bottom: 20px;

    .section-label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      margin-bottom: 10px;
    }

    .info-table {
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;

      .info-row {
        display: flex;

        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        .info-cell {
          flex: 1;
          padding: 12px 16px;
          font-size: 14px;

          &.label {
            background: #fafafa;
            color: #666;
            border-right: 1px solid #f0f0f0;
          }

          &.value {
            color: #333;
          }
        }
      }
    }
  }

  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    :deep(.ant-input-number) {
      height: 44px;
      border-radius: 8px;

      .ant-input-number-input {
        height: 42px;
        font-size: 15px;
      }

      &.ant-input-number-disabled {
        background: #f5f5f5;

        .ant-input-number-input {
          color: #999;
        }
      }
    }
  }

  .preview-row {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    margin-top: 8px;

    .preview-label {
      font-size: 14px;
      color: #333;
    }

    .preview-value {
      font-size: 18px;
      font-weight: 600;
      color: #52c41a;
      margin-left: 8px;
    }
  }
}

/* 订单搜索抽屉样式 */
.order-search-drawer {
  .ant-drawer-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-drawer-body {
    padding: 16px 24px;
  }
}

.order-search-form {
  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .ant-input {
      height: 40px;
    }

    .ant-select {
      .ant-select-selector {
        height: 40px !important;

        .ant-select-selection-item {
          line-height: 38px !important;
        }

        .ant-select-selection-placeholder {
          line-height: 38px !important;
        }
      }
    }

    .ant-picker {
      height: 40px;
    }

    .ant-btn {
      height: 40px;
    }
  }
}

/* 订单列表页面样式 */
.order-list-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .order-list-page-content {
    flex: 1;
    padding: 12px 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .order-list-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-shrink: 0;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 12px;

      .toolbar-left {
        display: flex;
        align-items: center;

        .order-tabs {
          display: flex;
          align-items: center;
          gap: 24px;

          .tab-item {
            font-size: 14px;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            padding-bottom: 8px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;

            &:hover {
              color: #1890ff;
            }

            &.active {
              color: #1890ff;
              border-bottom-color: #1890ff;
            }
          }
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.ant-input-search) {
          .ant-input {
            height: 32px;
            font-size: 13px;
          }
          .ant-input-search-button {
            height: 32px;
          }
        }

        :deep(.ant-btn) {
          height: 32px;
          font-size: 13px;
          padding: 0 15px;
        }

        .toolbar-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      }
    }

    .density-options {
      .density-option {
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(24, 144, 255, 0.1);
        }

        &.active {
          color: #1890ff;
          background: rgba(24, 144, 255, 0.1);
        }
      }
    }

    .density-dropdown-wrapper {
      position: relative;
      display: inline-block;

      .density-menu {
        position: fixed;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        min-width: 80px;
        margin-top: 4px;

        .density-item {
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;

          &:hover {
            background: rgba(24, 144, 255, 0.1);
          }

          &.active {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      }
    }

    .order-list-table-wrapper {
      flex: 1;
      overflow: hidden;

      .ant-table-wrapper {
        height: 100%;

        .ant-spin-nested-loading {
          height: 100%;

          .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;

            .ant-table {
              flex: 1;
              overflow: hidden;
            }
          }
        }
      }

      .ant-table {
        font-size: 14px;

        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
          text-align: center;
          color: #000;
        }

        .ant-table-tbody > tr > td {
          font-size: 14px;
          vertical-align: middle;
        }
      }

      .member-text {
        color: #1890ff !important;
        cursor: pointer;

        &:hover {
          color: #40a9ff !important;
        }

        .dropdown-icon {
          font-size: 10px;
          margin-left: 4px;
        }
      }

      .username-text {
        color: #1890ff !important;
      }

      .price-text {
        color: #1890ff !important;
      }

      .profit-text {
        color: #52c41a !important;
      }

      .rate-text {
        color: #1890ff !important;
      }

      .method-tag-pink {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
        background: #fff0f6 !important;
        border-color: #ffadd2 !important;
        color: #eb2f96 !important;
      }

      .method-tag-blue {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
        background: #e6f7ff !important;
        border-color: #91d5ff !important;
        color: #1890ff !important;
      }

      .type-tag-green {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
        background: #f6ffed !important;
        border-color: #b7eb8f !important;
        color: #52c41a !important;
      }

      .type-tag-blue {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
        background: #e6f7ff !important;
        border-color: #91d5ff !important;
        color: #1890ff !important;
      }

      .status-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .status-complete {
        color: #52c41a !important;
        background: transparent !important;
        border: 1px solid #52c41a !important;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
      }

      .status-pending {
        color: #ff4d4f !important;
        background: transparent !important;
        border: 1px solid #ff4d4f !important;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
      }

      .need-confirm {
        font-size: 11px;
        color: #999;
        line-height: 1.3;
        text-align: center;
      }

      .action-btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .action-link {
        color: #1890ff !important;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          color: #40a9ff !important;
        }
      }
    }

    .order-list-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      flex-shrink: 0;

      .total-text {
        font-size: 13px;
        color: #666;
      }

      :deep(.ant-pagination) {
        font-size: 13px;
      }
    }
  }

  // 订单列表密度样式
  &.size-default .order-list-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 16px 8px;
    }
  }

  &.size-middle .order-list-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px 8px;
    }
  }

  &.size-small .order-list-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px 4px;
    }
  }
}

/* 赠送记录页面样式 */
.gift-record-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .gift-record-page-content {
    flex: 1;
    padding: 12px 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .gift-record-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-shrink: 0;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 12px;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .page-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #000;
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.ant-input-search) {
          .ant-input {
            height: 32px;
            font-size: 13px;
          }
          .ant-input-search-button {
            height: 32px;
          }
        }

        :deep(.ant-btn) {
          height: 32px;
          font-size: 13px;
          padding: 0 15px;
        }

        .toolbar-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      }
    }

    .gift-record-table-wrapper {
      flex: 1;
      overflow: hidden;

      .ant-table-wrapper {
        height: 100%;

        .ant-spin-nested-loading {
          height: 100%;

          .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;

            .ant-table {
              flex: 1;
              overflow: hidden;
            }
          }
        }
      }

      .ant-table {
        font-size: 14px;

        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
          text-align: center;
          color: #000;
        }

        .ant-table-tbody > tr > td {
          font-size: 14px;
          vertical-align: middle;
        }
      }
    }

    .gift-record-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      flex-shrink: 0;

      .footer-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .total-text {
          font-size: 13px;
          color: #666;
        }

        :deep(.ant-pagination) {
          font-size: 13px;
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: 24px;

        .stats-item {
          font-size: 13px;
          color: #666;

          .stats-value {
            font-weight: 500;
            margin: 0 4px;

            &.blue {
              color: #1890ff;
            }

            &.green {
              color: #52c41a;
            }

            &.red {
              color: #ff4d4f;
            }
          }
        }
      }
    }
  }

  // 赠送记录密度样式
  &.size-default .gift-record-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 20px 8px;
    }
  }

  &.size-middle .gift-record-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 16px 8px;
    }
  }

  &.size-small .gift-record-table-wrapper .ant-table {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px 6px;
    }
  }
}

/* 密度选择弹出菜单 - 全局样式 */
.density-menu-popup {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 80px;
  padding: 4px 0;

  .density-item {
    padding: 8px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      background: rgba(24, 144, 255, 0.1);
    }

    &.active {
      color: #1890ff;
      background: rgba(24, 144, 255, 0.1);
    }
  }
}

/* 后台充值-创建抽屉样式 */
.add-gift-record-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: -8px;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 12px 0;
    border-bottom: 1px solid #f0f0f0;

    .close-btn {
      padding: 4px;
      margin-left: -8px;
      color: #666;

      &:hover {
        color: #1890ff;
      }
    }

    .drawer-title {
      flex: 1;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .drawer-form {
    flex: 1;
    padding: 16px 0;

    .asset-info {
      margin-bottom: 20px;

      .asset-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .asset-label {
          color: #999;
          font-size: 14px;
        }

        .asset-value {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .form-tip {
      color: #999;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .form-item {
      margin-bottom: 20px;

      .form-label {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
      }

      .form-input-group {
        display: flex;
        gap: 8px;

        .ant-input {
          flex: 1;
          height: 38px;
        }

        .ant-btn {
          height: 38px;
        }
      }

      .ant-radio-group {
        display: flex;
        gap: 24px;
      }

      > .ant-input {
        height: 38px;
      }

      .ant-input-textarea {
        textarea.ant-input {
          height: auto !important;
          padding: 10px 12px;
          resize: none;
          border-radius: 6px;
        }
      }
    }
  }
}

/* 后台充值-筛选抽屉样式 */
.gift-record-search-form {
  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .ant-input,
    .ant-select,
    .ant-picker {
      height: 38px;
    }

    .ant-select .ant-select-selector {
      height: 38px !important;

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 36px !important;
      }
    }
  }
}

/* 赠送记录财务日志抽屉样式 */
.gift-record-finance-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .ant-table-wrapper {
    flex: 1;
  }

  .finance-footer {
    display: flex;
    align-items: center;
    padding: 12px 0;
    gap: 16px;

    .total-text {
      color: #666;
      font-size: 13px;
    }
  }
}

/* 后台充值-创建抽屉wrapper样式 */
.rounded-drawer.add-gift-record-drawer-wrapper {
  .ant-drawer-body {
    padding-top: 12px;
  }
}

/* 下级用户层级页面样式 */
.sub-users-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .sub-users-page-content {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sub-users-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .page-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .toolbar-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        cursor: pointer;
        color: #666;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          color: #1890ff;
          background: rgba(0, 0, 0, 0.04);
        }
      }
    }
  }

  .sub-users-toolbar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;

    .toolbar-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .toolbar-label {
        color: #666;
        font-size: 14px;
        white-space: nowrap;
      }
    }
  }

  .sub-users-tree-wrapper {
    flex: 1;
    background: #f8f9fc;
    border-radius: 8px;
    padding: 40px 20px;
    overflow: auto;

    .tree-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: max-content;

      &.vertical {
        .tree-root {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tree-level {
          display: flex;
          flex-direction: column;
          align-items: center;

          &.level-1 {
            > .level-connector {
              width: 2px;
              height: 40px;
              background: #ccc;
            }

            > .level-nodes {
              display: flex;
              gap: 16px;
              position: relative;
              padding-top: 40px;

              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 68px;
                right: 68px;
                height: 2px;
                background: #ccc;
              }

              > .tree-branch {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;

                &::before {
                  content: '';
                  position: absolute;
                  top: -40px;
                  left: 50%;
                  width: 2px;
                  height: 40px;
                  background: #ccc;
                }
              }
            }
          }

          &.level-2 {
            > .level-connector {
              width: 2px;
              height: 40px;
              background: #ccc;
            }

            > .level-nodes {
              > .tree-branch {
                > .branch-connector {
                  display: none;
                }
              }
            }
          }
        }
      }
    }

    .tree-node {
      .node-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px 24px;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        min-width: 130px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          transform: translateY(-2px);
        }

        .node-id {
          font-size: 13px;
          color: #333;
          font-weight: 500;
          line-height: 1.5;
        }

        .node-count {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
