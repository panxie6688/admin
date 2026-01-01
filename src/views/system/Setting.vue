<template>
  <div class="setting-container">
    <!-- 左侧菜单 -->
    <div class="setting-menu">
      <div
        v-for="item in menuList"
        :key="item.key"
        :class="['menu-item', { active: activeMenu === item.key }]"
        @click="activeMenu = item.key"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="setting-content">
      <!-- 网站设置 -->
      <div v-if="activeMenu === 'website'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">网站设置</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <div class="form-grid">
          <!-- 左列 -->
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">充值V2快捷金额多个用,分隔</div>
              <a-input v-model:value="websiteForm.quickAmounts" placeholder="请输入" />
            </div>
          </div>
          <!-- 右列 -->
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">是否开启代理</div>
              <a-switch v-model:checked="websiteForm.agentEnabled" checked-children="开" un-checked-children="关" />
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站名称</div>
              <a-input v-model:value="websiteForm.siteName" placeholder="请输入" />
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站描述</div>
              <a-input v-model:value="websiteForm.description" placeholder="请输入" />
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站关键词</div>
              <a-input v-model:value="websiteForm.keywords" placeholder="请输入" />
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">版权声明</div>
              <a-input v-model:value="websiteForm.copyright" placeholder="请输入" />
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站LOGO</div>
              <div v-if="websiteForm.logo" class="upload-preview-with-actions">
                <img :src="websiteForm.logo" alt="LOGO" />
                <div class="preview-overlay">
                  <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'logo')">
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="websiteForm.logo = ''">重 置</a-button>
                </div>
              </div>
              <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'logo')">
                <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
              </a-upload>
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">浏览器图表(ico)格式</div>
              <div v-if="websiteForm.favicon" class="upload-preview-with-actions">
                <img :src="websiteForm.favicon" alt="Favicon" />
                <div class="preview-overlay">
                  <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'favicon')">
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="websiteForm.favicon = ''">重 置</a-button>
                </div>
              </div>
              <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'favicon')">
                <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
              </a-upload>
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站标题图片</div>
              <div v-if="websiteForm.titleImage" class="upload-preview-with-actions">
                <img :src="websiteForm.titleImage" alt="标题图片" />
                <div class="preview-overlay">
                  <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'titleImage')">
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="websiteForm.titleImage = ''">重 置</a-button>
                </div>
              </div>
              <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'titleImage')">
                <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
              </a-upload>
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">网站标题图片 - 黑暗模式</div>
              <div v-if="websiteForm.titleImageDark" class="upload-preview-with-actions">
                <img :src="websiteForm.titleImageDark" alt="标题图片-黑暗模式" />
                <div class="preview-overlay">
                  <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'titleImageDark')">
                    <a-button type="primary" size="small">重新上传</a-button>
                  </a-upload>
                  <a-button type="primary" danger size="small" @click="websiteForm.titleImageDark = ''">重 置</a-button>
                </div>
              </div>
              <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleUpload(info, 'titleImageDark')">
                <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
              </a-upload>
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">入金链接</div>
              <a-input v-model:value="websiteForm.depositLink" placeholder="请输入" />
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">评论上传图片最大/kb</div>
              <a-input v-model:value="websiteForm.maxImageSizeKb" placeholder="请输入" />
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">评论最大上传图片数量</div>
              <a-input v-model:value="websiteForm.maxCommentImages" placeholder="请输入" />
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">评论上传图片最小/kb</div>
              <a-input v-model:value="websiteForm.minImageSizeKb" placeholder="请输入" />
            </div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-col">
            <div class="form-item">
              <div class="form-label">评论总开关</div>
              <a-switch v-model:checked="websiteForm.commentEnabled" checked-children="开" un-checked-children="关" />
            </div>
          </div>
          <div class="form-col">
            <div class="form-item">
              <!-- 空白占位 -->
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- 网站样式 -->
      <div v-else-if="activeMenu === 'style'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">网站样式</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <!-- 第一行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">首页打开前轮播图</div>
            <a-switch v-model:checked="styleForm.homeCarousel" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">首页VIP显示模式</div>
            <a-select v-model:value="styleForm.vipDisplayMode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="vertical">竖向</a-select-option>
              <a-select-option value="horizontal">横向</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">会员组数</div>
            <a-switch v-model:checked="styleForm.memberGroup" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">登录背景</div>
            <div v-if="styleForm.loginBg" class="upload-preview-with-actions square">
              <img :src="styleForm.loginBg" alt="登录背景" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'loginBg')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.loginBg = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'loginBg')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">开始页面头部背景</div>
            <div v-if="styleForm.headerBg" class="upload-preview-with-actions square">
              <img :src="styleForm.headerBg" alt="头部背景" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'headerBg')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.headerBg = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'headerBg')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
          <div class="form-item">
            <div class="form-label">开始页面VIP按钮背景</div>
            <div v-if="styleForm.vipBtnBg" class="upload-preview-with-actions square">
              <img :src="styleForm.vipBtnBg" alt="VIP按钮背景" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'vipBtnBg')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.vipBtnBg = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'vipBtnBg')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
          <div class="form-item">
            <div class="form-label">用户中心-卡片背景</div>
            <div v-if="styleForm.cardBg" class="upload-preview-with-actions square">
              <img :src="styleForm.cardBg" alt="卡片背景" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'cardBg')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.cardBg = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'cardBg')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
          <div class="form-item">
            <div class="form-label">开始匹配按钮</div>
            <div v-if="styleForm.matchBtn" class="upload-preview-with-actions square">
              <img :src="styleForm.matchBtn" alt="匹配按钮" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'matchBtn')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.matchBtn = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'matchBtn')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
        </div>

        <!-- 第三行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">开始页面-冻结金额</div>
            <a-switch v-model:checked="styleForm.frozenAmount" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">开始页面-更多商品</div>
            <a-switch v-model:checked="styleForm.moreGoods" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">开始页面-利润</div>
            <a-switch v-model:checked="styleForm.profit" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">头部通知按钮</div>
            <a-switch v-model:checked="styleForm.headerNotify" checked-children="开" un-checked-children="关" />
          </div>
        </div>

        <!-- 第四行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">通知按钮-站内信</div>
            <a-switch v-model:checked="styleForm.notifyInbox" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">通知页面-系统通知</div>
            <a-switch v-model:checked="styleForm.systemNotify" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">会员中心-个人资料</div>
            <a-switch v-model:checked="styleForm.profile" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">会员中心-登录日志</div>
            <a-switch v-model:checked="styleForm.loginLog" checked-children="开" un-checked-children="关" />
          </div>
        </div>

        <!-- 第五行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">会员中心-安全日志</div>
            <a-switch v-model:checked="styleForm.securityLog" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">首页模版V2-头部显示模式</div>
            <a-select v-model:value="styleForm.v2HeaderMode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="video">视频</a-select-option>
              <a-select-option value="image">图片</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">首页模版V2-头部显示内容(视频或图片)</div>
            <div v-if="styleForm.v2HeaderContent" class="upload-preview-with-actions square">
              <img :src="styleForm.v2HeaderContent" alt="头部内容" />
              <div class="preview-overlay">
                <a-upload :show-upload-list="false" accept="image/*,video/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'v2HeaderContent')">
                  <a-button type="primary" size="small">重新上传</a-button>
                </a-upload>
                <a-button type="primary" danger size="small" @click="styleForm.v2HeaderContent = ''">重 置</a-button>
              </div>
            </div>
            <a-upload v-else :show-upload-list="false" accept="image/*,video/*" :before-upload="() => false" @change="(info) => handleStyleUpload(info, 'v2HeaderContent')">
              <div class="upload-box"><plus-outlined class="upload-icon" /><div class="upload-text">上传附件</div></div>
            </a-upload>
          </div>
          <div class="form-item">
            <div class="form-label">网页最大宽度</div>
            <a-input v-model:value="styleForm.maxWidth" placeholder="请输入" />
          </div>
        </div>
        </div>
      </div>

      <!-- 网页模版 -->
      <div v-else-if="activeMenu === 'template'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">网页模版</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <!-- 第一行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">充值界面模版)</div>
            <a-select v-model:value="templateForm.rechargeTemplate" placeholder="请选择" style="width: 100%;">
              <a-select-option value="默认">默认</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">匹配商品布局)</div>
            <a-select v-model:value="templateForm.matchLayout" placeholder="请选择" style="width: 100%;">
              <a-select-option value="默认">默认</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">首页模版)</div>
            <a-select v-model:value="templateForm.homeTemplate" placeholder="请选择" style="width: 100%;">
              <a-select-option value="V2(2024.10.28)">V2(2024.10.28)</a-select-option>
              <a-select-option value="默认">默认</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">中奖界面模版)</div>
            <a-select v-model:value="templateForm.winTemplate" placeholder="请选择" style="width: 100%;">
              <a-select-option value="默认">默认</a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">提现界面模版)</div>
            <a-select v-model:value="templateForm.withdrawTemplate" placeholder="请选择" style="width: 100%;">
              <a-select-option value="默认">默认</a-select-option>
            </a-select>
          </div>
          <div class="form-item"></div>
          <div class="form-item"></div>
          <div class="form-item"></div>
        </div>
        </div>
      </div>

      <!-- 会员设置 -->
      <div v-else-if="activeMenu === 'member'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">会员设置</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <!-- 第一行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">认证开关</div>
            <a-switch v-model:checked="memberForm.authEnabled" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">认证-反面图片</div>
            <a-switch v-model:checked="memberForm.authBackImage" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">认证-正面图片</div>
            <a-switch v-model:checked="memberForm.authFrontImage" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">认证-手持反面图片</div>
            <a-switch v-model:checked="memberForm.authHandBackImage" checked-children="开" un-checked-children="关" />
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">认证-手持正面图片</div>
            <a-switch v-model:checked="memberForm.authHandFrontImage" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">邮箱注册</div>
            <a-switch v-model:checked="memberForm.emailRegister" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">手机号注册</div>
            <a-switch v-model:checked="memberForm.phoneRegister" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">下单模式</div>
            <a-select v-model:value="memberForm.orderMode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="需要余额">需要余额</a-select-option>
              <a-select-option value="不需要余额">不需要余额</a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 第三行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">连单模式</div>
            <a-select v-model:value="memberForm.multiOrderMode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="整单确认">整单确认</a-select-option>
              <a-select-option value="分单确认">分单确认</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">最低下单金额</div>
            <a-input v-model:value="memberForm.minOrderAmount" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">利润重置方式</div>
            <a-select v-model:value="memberForm.profitResetMode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="不重置">不重置</a-select-option>
              <a-select-option value="每天重置">每天重置</a-select-option>
              <a-select-option value="每周一重置">每周一重置</a-select-option>
              <a-select-option value="每周日重置">每周日重置</a-select-option>
              <a-select-option value="每月1号">每月1号</a-select-option>
              <a-select-option value="完成任务重置">完成任务重置</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">时区</div>
            <a-select v-model:value="memberForm.timezone" placeholder="请选择" style="width: 100%;" show-search :filter-option="filterTimezone">
              <a-select-option v-for="tz in timezoneList" :key="tz.value" :value="tz.value" :label="tz.label">{{ tz.label }}</a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 第四行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">注册赠送金额</div>
            <a-input v-model:value="memberForm.registerBonus" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">相同IP可注册数量(0不限制)</div>
            <a-input v-model:value="memberForm.sameIpRegisterLimit" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">注册是否需要发生验证码</div>
            <a-switch v-model:checked="memberForm.registerNeedVerify" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">会员登录安全-动态验证</div>
            <a-switch v-model:checked="memberForm.loginDynamicVerify" checked-children="开" un-checked-children="关" />
          </div>
        </div>

        <!-- 第五行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">默认分享码</div>
            <a-input v-model:value="memberForm.defaultShareCode" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">分享码字母格式</div>
            <a-select v-model:value="memberForm.shareCodeFormat" placeholder="请选择" style="width: 100%;">
              <a-select-option value="大小写">大小写</a-select-option>
              <a-select-option value="大写">大写</a-select-option>
              <a-select-option value="小写">小写</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">分享码</div>
            <a-select v-model:value="memberForm.shareCodeRequired" placeholder="请选择" style="width: 100%;">
              <a-select-option value="选填">选填</a-select-option>
              <a-select-option value="必填">必填</a-select-option>
              <a-select-option value="隐藏用默认">隐藏用默认</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">分享码字符</div>
            <a-select v-model:value="memberForm.shareCodeChar" placeholder="请选择" style="width: 100%;">
              <a-select-option value="纯数字">纯数字</a-select-option>
              <a-select-option value="纯字母">纯字母</a-select-option>
              <a-select-option value="数字+字母">数字+字母</a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 第六行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">分享码长度</div>
            <a-input v-model:value="memberForm.shareCodeLength" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">交易区间-开始</div>
            <a-time-picker v-model:value="memberForm.tradeStartTime" format="HH:mm:ss" style="width: 100%;" />
          </div>
          <div class="form-item">
            <div class="form-label">交易区间-结束</div>
            <a-time-picker v-model:value="memberForm.tradeEndTime" format="HH:mm:ss" style="width: 100%;" />
          </div>
          <div class="form-item">
            <div class="form-label">VIP次数</div>
            <a-select v-model:value="memberForm.vipTimes" placeholder="请选择" style="width: 100%;">
              <a-select-option value="不重置">不重置</a-select-option>
              <a-select-option value="每天重置">每天重置</a-select-option>
              <a-select-option value="累计次数">累计次数</a-select-option>
            </a-select>
          </div>
        </div>

        <!-- 第七行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">提现信息条数限制</div>
            <a-input v-model:value="memberForm.withdrawInfoLimit" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">显示分享按钮最低VIP级别</div>
            <a-input v-model:value="memberForm.showShareBtnMinVip" placeholder="请输入" />
          </div>
          <div class="form-item"></div>
          <div class="form-item"></div>
        </div>
        </div>
      </div>

      <!-- 发送验证 -->
      <div v-else-if="activeMenu === 'verify'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">发送设置</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <!-- 第一行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">邮箱账户</div>
            <a-input v-model:value="verifyForm.emailAccount" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">邮箱服务器</div>
            <a-input v-model:value="verifyForm.emailServer" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">邮箱账户授权码</div>
            <a-input v-model:value="verifyForm.emailAuthCode" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">每天最大发送次数</div>
            <a-input v-model:value="verifyForm.maxDailySend" placeholder="请输入" />
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">每个IP每天最大发送次数</div>
            <a-input v-model:value="verifyForm.maxIpDailySend" placeholder="请输入" />
          </div>
          <div class="form-item"></div>
          <div class="form-item"></div>
          <div class="form-item"></div>
        </div>
        </div>
      </div>

      <!-- 提现 -->
      <div v-else-if="activeMenu === 'withdraw'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">提现设置</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <!-- 第一行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">提现-手续费(0.1=10%)</div>
            <a-input v-model:value="withdrawForm.fee" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">提现条件</div>
            <a-select v-model:value="withdrawForm.condition" placeholder="请选择" style="width: 100%;">
              <a-select-option value="完成当前任务">完成当前任务</a-select-option>
              <a-select-option value="无条件">无条件</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">提现-最高</div>
            <a-input v-model:value="withdrawForm.maxAmount" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">提现-最低</div>
            <a-input v-model:value="withdrawForm.minAmount" placeholder="请输入" />
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label">提现模式</div>
            <a-select v-model:value="withdrawForm.mode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="只能全部">只能全部</a-select-option>
              <a-select-option value="随意资产">随意资产</a-select-option>
            </a-select>
          </div>
          <div class="form-item">
            <div class="form-label">提现快捷金额</div>
            <a-input v-model:value="withdrawForm.quickAmounts" placeholder="请输入" />
          </div>
          <div class="form-item">
            <div class="form-label">提现-开关</div>
            <a-switch v-model:checked="withdrawForm.enabled" checked-children="开" un-checked-children="关" />
          </div>
          <div class="form-item">
            <div class="form-label">会员提现信息</div>
            <a-select v-model:value="withdrawForm.memberInfo" placeholder="请选择" style="width: 100%;">
              <a-select-option value="加密货币">加密货币</a-select-option>
              <a-select-option value="银行卡">银行卡</a-select-option>
              <a-select-option value="都支持">都支持</a-select-option>
            </a-select>
          </div>
        </div>
        </div>
      </div>

      <!-- 商品调节 -->
      <div v-else-if="activeMenu === 'goods'" class="content-section">
        <div class="section-header">
          <h3 class="section-title">商品调节</h3>
          <a-button type="primary" @click="handleSave">创建&保存</a-button>
        </div>

        <div class="section-body">
        <div class="form-row-4">
          <div class="form-item">
            <div class="form-label required-label">模式</div>
            <a-select v-model:value="goodsForm.mode" placeholder="请选择" style="width: 100%;">
              <a-select-option value="低于余额全部">低于余额全部</a-select-option>
              <a-select-option value="按余额百分比调节">按余额百分比调节</a-select-option>
              <a-select-option value="按概率">按概率</a-select-option>
              <a-select-option value="接近余额N条">接近余额N条</a-select-option>
            </a-select>
          </div>
          <div class="form-item"></div>
          <div class="form-item"></div>
          <div class="form-item"></div>
        </div>

        <div class="form-item" style="margin-top: 16px;">
          <div class="form-label">区间百分比调节</div>
          <div class="slider-container">
            <a-slider
              v-model:value="goodsForm.percentRange"
              range
              :min="0"
              :max="100"
              :marks="sliderMarks"
            />
            <div class="slider-tip">当前区间：{{ goodsForm.percentRange[0] }}-{{ goodsForm.percentRange[1] }}%</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 时区列表（按GMT偏移排序）
const timezoneList = [
  // GMT-11:00
  { value: 'Pacific/Midway', label: 'Pacific/Midway (GMT-11:00)' },
  { value: 'Pacific/Niue', label: 'Pacific/Niue (GMT-11:00)' },
  { value: 'Pacific/Pago_Pago', label: 'Pacific/Pago_Pago (GMT-11:00)' },
  // GMT-10:00
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (GMT-10:00)' },
  { value: 'Pacific/Rarotonga', label: 'Pacific/Rarotonga (GMT-10:00)' },
  { value: 'Pacific/Tahiti', label: 'Pacific/Tahiti (GMT-10:00)' },
  // GMT-09:30
  { value: 'Pacific/Marquesas', label: 'Pacific/Marquesas (GMT-09:30)' },
  // GMT-09:00
  { value: 'America/Anchorage', label: 'America/Anchorage (GMT-09:00)' },
  { value: 'America/Juneau', label: 'America/Juneau (GMT-09:00)' },
  { value: 'Pacific/Gambier', label: 'Pacific/Gambier (GMT-09:00)' },
  // GMT-08:00
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-08:00)' },
  { value: 'America/Tijuana', label: 'America/Tijuana (GMT-08:00)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (GMT-08:00)' },
  { value: 'Pacific/Pitcairn', label: 'Pacific/Pitcairn (GMT-08:00)' },
  // GMT-07:00
  { value: 'America/Denver', label: 'America/Denver (GMT-07:00)' },
  { value: 'America/Phoenix', label: 'America/Phoenix (GMT-07:00)' },
  { value: 'America/Chihuahua', label: 'America/Chihuahua (GMT-07:00)' },
  { value: 'America/Edmonton', label: 'America/Edmonton (GMT-07:00)' },
  // GMT-06:00
  { value: 'America/Chicago', label: 'America/Chicago (GMT-06:00)' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City (GMT-06:00)' },
  { value: 'America/Belize', label: 'America/Belize (GMT-06:00)' },
  { value: 'America/Costa_Rica', label: 'America/Costa_Rica (GMT-06:00)' },
  { value: 'America/Guatemala', label: 'America/Guatemala (GMT-06:00)' },
  { value: 'America/Managua', label: 'America/Managua (GMT-06:00)' },
  { value: 'America/Regina', label: 'America/Regina (GMT-06:00)' },
  { value: 'America/Tegucigalpa', label: 'America/Tegucigalpa (GMT-06:00)' },
  { value: 'America/Winnipeg', label: 'America/Winnipeg (GMT-06:00)' },
  { value: 'Pacific/Galapagos', label: 'Pacific/Galapagos (GMT-06:00)' },
  // GMT-05:00
  { value: 'America/New_York', label: 'America/New_York (GMT-05:00)' },
  { value: 'America/Toronto', label: 'America/Toronto (GMT-05:00)' },
  { value: 'America/Bogota', label: 'America/Bogota (GMT-05:00)' },
  { value: 'America/Havana', label: 'America/Havana (GMT-05:00)' },
  { value: 'America/Lima', label: 'America/Lima (GMT-05:00)' },
  { value: 'America/Panama', label: 'America/Panama (GMT-05:00)' },
  { value: 'America/Detroit', label: 'America/Detroit (GMT-05:00)' },
  { value: 'America/Jamaica', label: 'America/Jamaica (GMT-05:00)' },
  { value: 'America/Guayaquil', label: 'America/Guayaquil (GMT-05:00)' },
  { value: 'Pacific/Easter', label: 'Pacific/Easter (GMT-05:00)' },
  // GMT-04:00
  { value: 'America/Halifax', label: 'America/Halifax (GMT-04:00)' },
  { value: 'America/Caracas', label: 'America/Caracas (GMT-04:00)' },
  { value: 'America/La_Paz', label: 'America/La_Paz (GMT-04:00)' },
  { value: 'America/Santiago', label: 'America/Santiago (GMT-04:00)' },
  { value: 'America/Santo_Domingo', label: 'America/Santo_Domingo (GMT-04:00)' },
  { value: 'America/Asuncion', label: 'America/Asuncion (GMT-04:00)' },
  { value: 'America/Cuiaba', label: 'America/Cuiaba (GMT-04:00)' },
  { value: 'America/Guyana', label: 'America/Guyana (GMT-04:00)' },
  { value: 'America/Manaus', label: 'America/Manaus (GMT-04:00)' },
  { value: 'America/Puerto_Rico', label: 'America/Puerto_Rico (GMT-04:00)' },
  { value: 'Atlantic/Bermuda', label: 'Atlantic/Bermuda (GMT-04:00)' },
  // GMT-03:30
  { value: 'America/St_Johns', label: 'America/St_Johns (GMT-03:30)' },
  // GMT-03:00
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (GMT-03:00)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'America/Argentina/Buenos_Aires (GMT-03:00)' },
  { value: 'America/Montevideo', label: 'America/Montevideo (GMT-03:00)' },
  { value: 'America/Cayenne', label: 'America/Cayenne (GMT-03:00)' },
  { value: 'America/Fortaleza', label: 'America/Fortaleza (GMT-03:00)' },
  { value: 'America/Recife', label: 'America/Recife (GMT-03:00)' },
  { value: 'America/Paramaribo', label: 'America/Paramaribo (GMT-03:00)' },
  { value: 'Atlantic/Stanley', label: 'Atlantic/Stanley (GMT-03:00)' },
  // GMT-02:00
  { value: 'America/Noronha', label: 'America/Noronha (GMT-02:00)' },
  { value: 'Atlantic/South_Georgia', label: 'Atlantic/South_Georgia (GMT-02:00)' },
  // GMT-01:00
  { value: 'Atlantic/Azores', label: 'Atlantic/Azores (GMT-01:00)' },
  { value: 'Atlantic/Cape_Verde', label: 'Atlantic/Cape_Verde (GMT-01:00)' },
  // GMT+00:00
  { value: 'UTC', label: 'UTC (GMT+00:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+00:00)' },
  { value: 'Europe/Dublin', label: 'Europe/Dublin (GMT+00:00)' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon (GMT+00:00)' },
  { value: 'Africa/Abidjan', label: 'Africa/Abidjan (GMT+00:00)' },
  { value: 'Africa/Accra', label: 'Africa/Accra (GMT+00:00)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+00:00)' },
  { value: 'Africa/Dakar', label: 'Africa/Dakar (GMT+00:00)' },
  { value: 'Africa/Monrovia', label: 'Africa/Monrovia (GMT+00:00)' },
  { value: 'Atlantic/Reykjavik', label: 'Atlantic/Reykjavik (GMT+00:00)' },
  // GMT+01:00
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+01:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+01:00)' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (GMT+01:00)' },
  { value: 'Europe/Brussels', label: 'Europe/Brussels (GMT+01:00)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (GMT+01:00)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (GMT+01:00)' },
  { value: 'Europe/Vienna', label: 'Europe/Vienna (GMT+01:00)' },
  { value: 'Europe/Warsaw', label: 'Europe/Warsaw (GMT+01:00)' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich (GMT+01:00)' },
  { value: 'Europe/Prague', label: 'Europe/Prague (GMT+01:00)' },
  { value: 'Europe/Budapest', label: 'Europe/Budapest (GMT+01:00)' },
  { value: 'Europe/Copenhagen', label: 'Europe/Copenhagen (GMT+01:00)' },
  { value: 'Europe/Oslo', label: 'Europe/Oslo (GMT+01:00)' },
  { value: 'Europe/Stockholm', label: 'Europe/Stockholm (GMT+01:00)' },
  { value: 'Africa/Algiers', label: 'Africa/Algiers (GMT+01:00)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (GMT+01:00)' },
  { value: 'Africa/Tunis', label: 'Africa/Tunis (GMT+01:00)' },
  // GMT+02:00
  { value: 'Europe/Athens', label: 'Europe/Athens (GMT+02:00)' },
  { value: 'Europe/Bucharest', label: 'Europe/Bucharest (GMT+02:00)' },
  { value: 'Europe/Helsinki', label: 'Europe/Helsinki (GMT+02:00)' },
  { value: 'Europe/Kiev', label: 'Europe/Kiev (GMT+02:00)' },
  { value: 'Europe/Sofia', label: 'Europe/Sofia (GMT+02:00)' },
  { value: 'Europe/Riga', label: 'Europe/Riga (GMT+02:00)' },
  { value: 'Europe/Tallinn', label: 'Europe/Tallinn (GMT+02:00)' },
  { value: 'Europe/Vilnius', label: 'Europe/Vilnius (GMT+02:00)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (GMT+02:00)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (GMT+02:00)' },
  { value: 'Africa/Tripoli', label: 'Africa/Tripoli (GMT+02:00)' },
  { value: 'Asia/Beirut', label: 'Asia/Beirut (GMT+02:00)' },
  { value: 'Asia/Jerusalem', label: 'Asia/Jerusalem (GMT+02:00)' },
  { value: 'Asia/Amman', label: 'Asia/Amman (GMT+02:00)' },
  { value: 'Asia/Damascus', label: 'Asia/Damascus (GMT+02:00)' },
  // GMT+03:00
  { value: 'Europe/Moscow', label: 'Europe/Moscow (GMT+03:00)' },
  { value: 'Europe/Istanbul', label: 'Europe/Istanbul (GMT+03:00)' },
  { value: 'Europe/Minsk', label: 'Europe/Minsk (GMT+03:00)' },
  { value: 'Asia/Baghdad', label: 'Asia/Baghdad (GMT+03:00)' },
  { value: 'Asia/Kuwait', label: 'Asia/Kuwait (GMT+03:00)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (GMT+03:00)' },
  { value: 'Asia/Qatar', label: 'Asia/Qatar (GMT+03:00)' },
  { value: 'Asia/Bahrain', label: 'Asia/Bahrain (GMT+03:00)' },
  { value: 'Africa/Addis_Ababa', label: 'Africa/Addis_Ababa (GMT+03:00)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (GMT+03:00)' },
  // GMT+03:30
  { value: 'Asia/Tehran', label: 'Asia/Tehran (GMT+03:30)' },
  // GMT+04:00
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+04:00)' },
  { value: 'Asia/Muscat', label: 'Asia/Muscat (GMT+04:00)' },
  { value: 'Asia/Baku', label: 'Asia/Baku (GMT+04:00)' },
  { value: 'Asia/Tbilisi', label: 'Asia/Tbilisi (GMT+04:00)' },
  { value: 'Asia/Yerevan', label: 'Asia/Yerevan (GMT+04:00)' },
  { value: 'Europe/Samara', label: 'Europe/Samara (GMT+04:00)' },
  { value: 'Indian/Mauritius', label: 'Indian/Mauritius (GMT+04:00)' },
  { value: 'Indian/Reunion', label: 'Indian/Reunion (GMT+04:00)' },
  // GMT+04:30
  { value: 'Asia/Kabul', label: 'Asia/Kabul (GMT+04:30)' },
  // GMT+05:00
  { value: 'Asia/Karachi', label: 'Asia/Karachi (GMT+05:00)' },
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (GMT+05:00)' },
  { value: 'Asia/Yekaterinburg', label: 'Asia/Yekaterinburg (GMT+05:00)' },
  { value: 'Asia/Dushanbe', label: 'Asia/Dushanbe (GMT+05:00)' },
  { value: 'Asia/Ashgabat', label: 'Asia/Ashgabat (GMT+05:00)' },
  { value: 'Indian/Maldives', label: 'Indian/Maldives (GMT+05:00)' },
  // GMT+05:30
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+05:30)' },
  { value: 'Asia/Colombo', label: 'Asia/Colombo (GMT+05:30)' },
  // GMT+05:45
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (GMT+05:45)' },
  // GMT+06:00
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+06:00)' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty (GMT+06:00)' },
  { value: 'Asia/Bishkek', label: 'Asia/Bishkek (GMT+06:00)' },
  { value: 'Asia/Omsk', label: 'Asia/Omsk (GMT+06:00)' },
  { value: 'Indian/Chagos', label: 'Indian/Chagos (GMT+06:00)' },
  // GMT+06:30
  { value: 'Asia/Yangon', label: 'Asia/Yangon (GMT+06:30)' },
  { value: 'Indian/Cocos', label: 'Indian/Cocos (GMT+06:30)' },
  // GMT+07:00
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+07:00)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (GMT+07:00)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (GMT+07:00)' },
  { value: 'Asia/Phnom_Penh', label: 'Asia/Phnom_Penh (GMT+07:00)' },
  { value: 'Asia/Vientiane', label: 'Asia/Vientiane (GMT+07:00)' },
  { value: 'Asia/Krasnoyarsk', label: 'Asia/Krasnoyarsk (GMT+07:00)' },
  { value: 'Asia/Novosibirsk', label: 'Asia/Novosibirsk (GMT+07:00)' },
  { value: 'Indian/Christmas', label: 'Indian/Christmas (GMT+07:00)' },
  // GMT+08:00
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (GMT+08:00)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (GMT+08:00)' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei (GMT+08:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+08:00)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (GMT+08:00)' },
  { value: 'Asia/Manila', label: 'Asia/Manila (GMT+08:00)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (GMT+08:00)' },
  { value: 'Asia/Brunei', label: 'Asia/Brunei (GMT+08:00)' },
  { value: 'Asia/Macau', label: 'Asia/Macau (GMT+08:00)' },
  { value: 'Asia/Irkutsk', label: 'Asia/Irkutsk (GMT+08:00)' },
  { value: 'Australia/Perth', label: 'Australia/Perth (GMT+08:00)' },
  // GMT+08:45
  { value: 'Australia/Eucla', label: 'Australia/Eucla (GMT+08:45)' },
  // GMT+09:00
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+09:00)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (GMT+09:00)' },
  { value: 'Asia/Pyongyang', label: 'Asia/Pyongyang (GMT+09:00)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (GMT+09:00)' },
  { value: 'Asia/Yakutsk', label: 'Asia/Yakutsk (GMT+09:00)' },
  { value: 'Asia/Chita', label: 'Asia/Chita (GMT+09:00)' },
  { value: 'Pacific/Palau', label: 'Pacific/Palau (GMT+09:00)' },
  // GMT+09:30
  { value: 'Australia/Adelaide', label: 'Australia/Adelaide (GMT+09:30)' },
  { value: 'Australia/Darwin', label: 'Australia/Darwin (GMT+09:30)' },
  { value: 'Australia/Broken_Hill', label: 'Australia/Broken_Hill (GMT+09:30)' },
  // GMT+10:00
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10:00)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (GMT+10:00)' },
  { value: 'Australia/Brisbane', label: 'Australia/Brisbane (GMT+10:00)' },
  { value: 'Australia/Hobart', label: 'Australia/Hobart (GMT+10:00)' },
  { value: 'Asia/Vladivostok', label: 'Asia/Vladivostok (GMT+10:00)' },
  { value: 'Pacific/Guam', label: 'Pacific/Guam (GMT+10:00)' },
  { value: 'Pacific/Port_Moresby', label: 'Pacific/Port_Moresby (GMT+10:00)' },
  { value: 'Pacific/Saipan', label: 'Pacific/Saipan (GMT+10:00)' },
  { value: 'Pacific/Chuuk', label: 'Pacific/Chuuk (GMT+10:00)' },
  // GMT+10:30
  { value: 'Australia/Lord_Howe', label: 'Australia/Lord_Howe (GMT+10:30)' },
  // GMT+11:00
  { value: 'Asia/Magadan', label: 'Asia/Magadan (GMT+11:00)' },
  { value: 'Asia/Sakhalin', label: 'Asia/Sakhalin (GMT+11:00)' },
  { value: 'Pacific/Guadalcanal', label: 'Pacific/Guadalcanal (GMT+11:00)' },
  { value: 'Pacific/Noumea', label: 'Pacific/Noumea (GMT+11:00)' },
  { value: 'Pacific/Pohnpei', label: 'Pacific/Pohnpei (GMT+11:00)' },
  { value: 'Pacific/Kosrae', label: 'Pacific/Kosrae (GMT+11:00)' },
  { value: 'Pacific/Efate', label: 'Pacific/Efate (GMT+11:00)' },
  // GMT+12:00
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (GMT+12:00)' },
  { value: 'Pacific/Fiji', label: 'Pacific/Fiji (GMT+12:00)' },
  { value: 'Asia/Kamchatka', label: 'Asia/Kamchatka (GMT+12:00)' },
  { value: 'Asia/Anadyr', label: 'Asia/Anadyr (GMT+12:00)' },
  { value: 'Pacific/Funafuti', label: 'Pacific/Funafuti (GMT+12:00)' },
  { value: 'Pacific/Majuro', label: 'Pacific/Majuro (GMT+12:00)' },
  { value: 'Pacific/Nauru', label: 'Pacific/Nauru (GMT+12:00)' },
  { value: 'Pacific/Tarawa', label: 'Pacific/Tarawa (GMT+12:00)' },
  { value: 'Pacific/Wake', label: 'Pacific/Wake (GMT+12:00)' },
  { value: 'Pacific/Wallis', label: 'Pacific/Wallis (GMT+12:00)' },
  // GMT+12:45
  { value: 'Pacific/Chatham', label: 'Pacific/Chatham (GMT+12:45)' },
  // GMT+13:00
  { value: 'Pacific/Tongatapu', label: 'Pacific/Tongatapu (GMT+13:00)' },
  { value: 'Pacific/Apia', label: 'Pacific/Apia (GMT+13:00)' },
  { value: 'Pacific/Enderbury', label: 'Pacific/Enderbury (GMT+13:00)' },
  { value: 'Pacific/Fakaofo', label: 'Pacific/Fakaofo (GMT+13:00)' },
  // GMT+14:00
  { value: 'Pacific/Kiritimati', label: 'Pacific/Kiritimati (GMT+14:00)' }
]

// 时区过滤函数
const filterTimezone = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// 左侧菜单
const menuList = [
  { key: 'website', label: '网站设置' },
  { key: 'style', label: '网站样式' },
  { key: 'template', label: '网页模版' },
  { key: 'member', label: '会员设置' },
  { key: 'verify', label: '发送验证' },
  { key: 'withdraw', label: '提现' },
  { key: 'goods', label: '商品调节' }
]

const activeMenu = ref('website')

// 网站设置表单
const websiteForm = reactive({
  quickAmounts: '100,200,500,800,1000,2000,5000,10000',
  siteName: 'Kinex Media',
  keywords: 'Kinex Media',
  logo: 'https://picsum.photos/80/80?random=1',
  titleImage: '',
  depositLink: '/my/charge/assets',
  maxCommentImages: '3',
  commentEnabled: false,
  agentEnabled: false,
  description: 'Kinex Media',
  copyright: '© 2024  All Rights Reserved  Founded 2004 | Kinex Media | Privacy Policy',
  favicon: 'https://picsum.photos/80/80?random=2',
  titleImageDark: '',
  maxImageSizeKb: '5120',
  minImageSizeKb: '10'
})

// 网站样式表单
const styleForm = reactive({
  homeCarousel: false,
  headerBg: 'https://picsum.photos/80/80?random=3',
  frozenAmount: false,
  notifyInbox: true,
  securityLog: false,
  vipDisplayMode: 'vertical',
  vipBtnBg: 'https://picsum.photos/80/80?random=4',
  moreGoods: false,
  systemNotify: true,
  v2HeaderMode: 'video',
  memberGroup: false,
  cardBg: 'https://picsum.photos/80/80?random=5',
  profit: true,
  profile: false,
  v2HeaderContent: 'https://picsum.photos/80/80?random=6',
  loginBg: 'https://picsum.photos/80/80?random=7',
  matchBtn: '',
  headerNotify: true,
  loginLog: false,
  maxWidth: '640px'
})

// 网页模版表单
const templateForm = reactive({
  rechargeTemplate: '默认',
  matchLayout: '默认',
  homeTemplate: 'V2(2024.10.28)',
  winTemplate: '默认',
  withdrawTemplate: '默认'
})

// 会员设置表单
const memberForm = reactive({
  authEnabled: false,
  authBackImage: false,
  authFrontImage: false,
  authHandBackImage: false,
  authHandFrontImage: false,
  emailRegister: false,
  phoneRegister: true,
  orderMode: '需要余额',
  multiOrderMode: '分单确认',
  minOrderAmount: '70',
  profitResetMode: '每天重置',
  timezone: 'America/Belize',
  registerBonus: '25',
  sameIpRegisterLimit: '0',
  registerNeedVerify: false,
  loginDynamicVerify: false,
  defaultShareCode: '63A928C7',
  shareCodeFormat: '大写',
  shareCodeRequired: '必填',
  shareCodeChar: '数字+字母',
  shareCodeLength: '4',
  tradeStartTime: null,
  tradeEndTime: null,
  vipTimes: '不重置',
  withdrawInfoLimit: '1',
  showShareBtnMinVip: '4'
})

// 发送验证表单
const verifyForm = reactive({
  emailAccount: 'info@newkinexmediap.com',
  emailServer: 'smtpout.secureserver.net',
  emailAuthCode: 'asWR357Eop66',
  maxDailySend: '10',
  maxIpDailySend: '10'
})

// 提现表单
const withdrawForm = reactive({
  fee: '0',
  condition: '完成当前任务',
  maxAmount: '10000000',
  minAmount: '70',
  mode: '只能全部',
  quickAmounts: '100,200,500,1000,2000,5000',
  enabled: true,
  memberInfo: '加密货币'
})

// 商品调节表单
const goodsForm = reactive({
  mode: '按余额百分比调节',
  percentRange: [40, 90]
})

// 滑块刻度
const sliderMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// 图片上传
const handleUpload = (info, field) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    websiteForm[field] = e.target.result
  }
  reader.readAsDataURL(file)
}

// 网站样式图片上传
const handleStyleUpload = (info, field) => {
  const file = info.file.originFileObj || info.file
  const reader = new FileReader()
  reader.onload = (e) => {
    styleForm[field] = e.target.result
  }
  reader.readAsDataURL(file)
}

// 保存
const handleSave = () => {
  // 保存网站设置到 localStorage
  if (activeMenu.value === 'website') {
    const siteSettings = {
      logo: websiteForm.logo,
      siteName: websiteForm.siteName
    }
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings))

    // 触发自定义事件通知 MainLayout 更新
    window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
      detail: siteSettings
    }))
  }
  message.success('保存成功')
}
</script>

<style scoped lang="less">
.setting-container {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

// 左侧菜单
.setting-menu {
  width: 140px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  padding: 16px 0;

  .menu-item {
    padding: 16px 24px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      background: #e6f7ff;
      border-right: 3px solid #1890ff;
    }
  }
}

// 右侧内容区
.setting-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px;

  .content-section {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e8e8e8;
      background: #fafafa;
      border-radius: 8px 8px 0 0;

      .section-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .section-body {
      padding: 24px;
    }

    .empty-content {
      padding: 60px 0;
    }
  }
}

// 表单网格布局
.form-grid {
  display: flex;
  gap: 48px;
  margin-bottom: 20px;

  .form-col {
    flex: 1;
    min-width: 0;
  }
}

// 四列布局
.form-grid-4 {
  display: flex;
  gap: 24px;

  .form-col {
    flex: 1;
    min-width: 0;
  }
}

// 四列行布局（每行对齐）
.form-row-4 {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;

  > .form-item {
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
  }
}

.form-item {
  margin-bottom: 20px;

  .form-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;

    &.required-label::before {
      content: '*';
      color: #ff4d4f;
      margin-right: 4px;
    }
  }

  :deep(.ant-input) {
    height: 40px;
    border-radius: 6px;
  }

  :deep(.ant-select) {
    width: 100%;

    .ant-select-selector {
      height: 40px !important;
      border-radius: 6px !important;

      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 38px !important;
      }
    }
  }

  :deep(.ant-switch) {
    margin-top: 8px;
  }

  :deep(.ant-picker) {
    width: 100%;
    height: 40px;
    border-radius: 6px;
  }
}

// 滑块容器
.slider-container {
  padding: 16px 24px;
  background: #fafafa;
  border-radius: 8px;

  :deep(.ant-slider) {
    margin: 16px 0;
  }

  :deep(.ant-slider-mark-text) {
    color: #999;
  }

  .slider-tip {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
  }
}

// 上传预览
.upload-preview-with-actions {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 1px solid #e8e8e8;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s;

    :deep(.ant-btn) {
      font-size: 12px;
      height: 24px;
      padding: 0 8px;
    }
  }

  &:hover .preview-overlay {
    opacity: 1;
  }

  // 方形预览
  &.square {
    border-radius: 8px;
  }
}

// 上传框
.upload-box {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: #1890ff;
  }

  .upload-icon {
    font-size: 24px;
    color: #999;
  }

  .upload-text {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
}
</style>
