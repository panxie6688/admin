<template>
  <div class="article-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧二级菜单 -->
      <div class="left-menu">
        <a-menu
          v-model:selectedKeys="selectedMenu"
          mode="inline"
          :style="{ border: 'none' }"
        >
          <a-menu-item key="agreement">用户协议</a-menu-item>
          <a-menu-item key="privacy">隐私政策</a-menu-item>
          <a-menu-item key="about">关于我们</a-menu-item>
          <a-menu-item key="important">重要公告</a-menu-item>
          <a-menu-item key="faq">常见问题</a-menu-item>
          <a-menu-item key="popup">开屏弹框</a-menu-item>
          <a-menu-item key="wallet">钱包说明</a-menu-item>
          <a-menu-item key="header">首页V2头文本</a-menu-item>
          <a-menu-item key="lottery">中奖界面V2-连单说明</a-menu-item>
          <a-menu-item key="recharge">充值V2</a-menu-item>
        </a-menu>
      </div>

      <!-- 右侧内容区（包含标题、语言面板、编辑器） -->
      <div class="right-content">
        <!-- 顶部标题栏 -->
        <div class="content-header">
          <h2 class="panel-title">文本管理</h2>
          <a-button type="primary" class="save-btn" @click="handleSave">创建&保存</a-button>
        </div>

        <!-- 内容主体 -->
        <div class="content-body">
          <!-- 语言列表 -->
          <div class="lang-panel">
            <a-button type="primary" block class="add-lang-btn" @click="handleAddLang">
              添加语言
            </a-button>

            <div class="lang-list">
              <div
                v-for="(item, index) in languages"
                :key="item.code"
                class="lang-item"
                :class="{ active: selectedLangIndex === index }"
              >
                <span class="lang-name" @click="selectedLangIndex = index">{{ item.name || item.code }}</span>
                <a-popconfirm
                  title="确定删除该语言吗？"
                  placement="top"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDeleteLang(index)"
                >
                  <DeleteOutlined class="delete-icon" @click.stop />
                </a-popconfirm>
              </div>
            </div>
          </div>

          <!-- 编辑器 -->
          <div class="editor-panel">
            <template v-if="currentLang">
              <RichTextEditor
                :key="currentLang.code"
                v-model="currentLang.content"
                :placeholder="`请输入内容（${currentLang.name || currentLang.code}）`"
              />
            </template>
            <div v-else class="editor-empty">
              <span>请添加或选择语言</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加语言弹窗 -->
    <a-modal
      v-model:open="addLangModalVisible"
      :width="480"
      @ok="handleConfirmAddLang"
      @cancel="addLangModalVisible = false"
      okText="确 定"
      cancelText="取 消"
      :rootClassName="'warning-modal'"
    >
      <template #title>
        <div class="modal-title-with-icon">
          <span class="warning-icon">!</span>
          <span>增加语言</span>
        </div>
      </template>
      <div class="add-lang-content">
        <a-alert type="warning" :show-icon="false" class="warning-tip-box">
          <template #message>
            <div class="tip-text">一般标识用带有-的。比如：zh-cn</div>
            <div class="tip-text">如果忘记标识可以参考：<a class="link" @click="langRefModalVisible = true">国际语言标识表</a></div>
          </template>
        </a-alert>

        <a-select
          v-model:value="selectedNewLang"
          style="width: 100%; margin-bottom: 12px;"
          placeholder="选择语言"
          show-search
          allow-clear
          size="large"
          :filter-option="filterLangOption"
          :getPopupContainer="(triggerNode) => triggerNode.parentNode"
        >
          <a-select-option v-for="lang in availableLangs" :key="lang.code" :value="lang.code" :name="lang.name">
            {{ lang.name }} ({{ lang.code }})
          </a-select-option>
        </a-select>

        <a-input
          v-model:value="newLangText"
          placeholder="请输入"
          size="large"
        />
      </div>
    </a-modal>

    <!-- 语言代码表弹窗 -->
    <a-modal
      v-model:open="langRefModalVisible"
      title="语言代码表"
      :footer="null"
      :width="600"
    >
      <div class="lang-ref-content">
        <a-input-search
          v-model:value="langSearchText"
          placeholder="搜索语言代码或名称"
          style="margin-bottom: 12px"
          allow-clear
        />
        <a-table
          :columns="langRefColumns"
          :data-source="filteredLangRefData"
          :pagination="false"
          size="small"
          :scroll="{ y: 'calc(100vh - 300px)' }"
          :row-class-name="() => 'lang-row-clickable'"
          :custom-row="(record) => ({
            onClick: () => handleSelectLangFromRef(record)
          })"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 菜单配置
const menuItems = [
  { key: 'agreement', label: '用户协议' },
  { key: 'privacy', label: '隐私政策' },
  { key: 'about', label: '关于我们' },
  { key: 'important', label: '重要公告' },
  { key: 'faq', label: '常见问题' },
  { key: 'popup', label: '开屏弹框' },
  { key: 'wallet', label: '钱包说明' },
  { key: 'header', label: '首页V2头文本' },
  { key: 'lottery', label: '中奖界面V2-连单说明' },
  { key: 'recharge', label: '充值V2' }
]

// 当前选中的菜单
const selectedMenu = ref(['agreement'])

// 所有菜单的内容数据（按菜单key存储）
const allContents = reactive({
  agreement: [
    { code: 'zh-cn', name: '中文(简体)', content: '<p>欢迎来到 Kinex Media 及其一系列服务！</p><p>为了保护网站和商家之间的个人信息安全，您必须仔细阅读平台的"条款和条件"。充分理解条款和条件非常重要，特别是服务条款和任何相关限制，以及与每个条款和条件相关的任何单独协议。您必须相应地接受或拒绝责任。</p><p>通过使用本网站，您确认您已年满 18 岁，并已阅读并同意条款和条件。否则，您将无权下载、安装软件或使用服务。</p>' },
    { code: 'en-us', name: '英语(美国)', content: '' },
    { code: 'es-es', name: '西班牙语(西班牙)', content: '' }
  ],
  privacy: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  about: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  important: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  faq: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  popup: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  wallet: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  header: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  lottery: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ],
  recharge: [
    { code: 'zh-cn', name: '中文(简体)', content: '' },
    { code: 'en-us', name: '英语(美国)', content: '' }
  ]
})

// 当前菜单的语言列表
const currentMenuKey = computed(() => selectedMenu.value[0])
const languages = computed(() => allContents[currentMenuKey.value] || [])

// 当前选中的语言索引
const selectedLangIndex = ref(0)

// 当前选中的语言
const currentLang = computed(() => {
  const langs = languages.value
  if (langs.length > 0 && selectedLangIndex.value >= 0 && selectedLangIndex.value < langs.length) {
    return langs[selectedLangIndex.value]
  }
  return null
})

// 切换菜单时重置语言索引
watch(selectedMenu, () => {
  selectedLangIndex.value = 0
})

// 添加语言弹窗
const addLangModalVisible = ref(false)
const selectedNewLang = ref('')
const newLangText = ref('')

// 语言参考表弹窗
const langRefModalVisible = ref(false)
const langSearchText = ref('')

// 语言参考表列
const langRefColumns = [
  { title: '语言代码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '语言名称', dataIndex: 'name', key: 'name' }
]

// 语言数据
const langRefData = [
  { code: 'af', name: '南非语' },
  { code: 'ar', name: '阿拉伯语' },
  { code: 'bg', name: '保加利亚语' },
  { code: 'cs', name: '捷克语' },
  { code: 'da', name: '丹麦语' },
  { code: 'de', name: '德语' },
  { code: 'el', name: '希腊语' },
  { code: 'en', name: '英语' },
  { code: 'en-us', name: '英语(美国)' },
  { code: 'en-gb', name: '英语(英国)' },
  { code: 'es', name: '西班牙语' },
  { code: 'es-es', name: '西班牙语(西班牙)' },
  { code: 'et', name: '爱沙尼亚语' },
  { code: 'fi', name: '芬兰语' },
  { code: 'fr', name: '法语' },
  { code: 'he', name: '希伯来语' },
  { code: 'hi', name: '印地语' },
  { code: 'hr', name: '克罗地亚语' },
  { code: 'hu', name: '匈牙利语' },
  { code: 'id', name: '印度尼西亚语' },
  { code: 'it', name: '意大利语' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '朝鲜语' },
  { code: 'lt', name: '立陶宛语' },
  { code: 'lv', name: '拉脱维亚语' },
  { code: 'ms', name: '马来语' },
  { code: 'nl', name: '荷兰语' },
  { code: 'no', name: '挪威语' },
  { code: 'pl', name: '波兰语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'pt-br', name: '葡萄牙语(巴西)' },
  { code: 'ro', name: '罗马尼亚语' },
  { code: 'ru', name: '俄语' },
  { code: 'sk', name: '斯洛伐克语' },
  { code: 'sl', name: '斯洛文尼亚语' },
  { code: 'sr', name: '塞尔维亚语' },
  { code: 'sv', name: '瑞典语' },
  { code: 'th', name: '泰语' },
  { code: 'tr', name: '土耳其语' },
  { code: 'uk', name: '乌克兰语' },
  { code: 'vi', name: '越南语' },
  { code: 'zh-cn', name: '中文(简体)' },
  { code: 'zh-tw', name: '中文(繁体)' }
]

// 可用语言列表（过滤已添加的）
const availableLangs = computed(() => {
  const addedCodes = languages.value.map(l => l.code)
  return langRefData.filter(lang => !addedCodes.includes(lang.code))
})

// 语言选项（用于 Select 组件）
const langOptions = computed(() => {
  return availableLangs.value.map(lang => ({
    value: lang.code,
    label: `${lang.name} (${lang.code})`
  }))
})

// 过滤后的语言数据
const filteredLangRefData = computed(() => {
  if (!langSearchText.value) {
    return langRefData
  }
  const keyword = langSearchText.value.toLowerCase()
  return langRefData.filter(item =>
    item.code.toLowerCase().includes(keyword) ||
    item.name.toLowerCase().includes(keyword)
  )
})

// 语言搜索过滤（支持按名称和代码搜索）
const filterLangOption = (input, option) => {
  const searchText = input.toLowerCase()
  const value = (option.value || '').toLowerCase()
  const name = (option.name || '').toLowerCase()
  return value.includes(searchText) || name.includes(searchText)
}

// 打开添加语言弹窗
const handleAddLang = () => {
  selectedNewLang.value = ''
  newLangText.value = ''
  addLangModalVisible.value = true
}

// 确认添加语言
const handleConfirmAddLang = () => {
  const langCode = selectedNewLang.value || newLangText.value
  if (!langCode) {
    message.warning('请选择或输入语言')
    return
  }

  const currentLangs = allContents[currentMenuKey.value]
  const exists = currentLangs.some(l => l.code === langCode)
  if (exists) {
    message.warning('该语言已添加')
    return
  }

  // 查找语言名称
  const langInfo = langRefData.find(l => l.code === langCode)
  const langName = langInfo ? langInfo.name : langCode

  currentLangs.push({
    code: langCode,
    name: langName,
    content: ''
  })
  selectedLangIndex.value = currentLangs.length - 1
  addLangModalVisible.value = false
  selectedNewLang.value = ''
  newLangText.value = ''
  message.success('添加成功')
}

// 从参考表选择语言
const handleSelectLangFromRef = (record) => {
  selectedNewLang.value = record.code
  langRefModalVisible.value = false
  message.success(`已选择语言: ${record.name} (${record.code})`)
}

// 删除语言
const handleDeleteLang = (index) => {
  const currentLangs = allContents[currentMenuKey.value]
  currentLangs.splice(index, 1)
  if (currentLangs.length === 0) {
    selectedLangIndex.value = 0
  } else if (selectedLangIndex.value >= currentLangs.length) {
    selectedLangIndex.value = currentLangs.length - 1
  }
  message.success('删除成功')
}

// 保存
const handleSave = () => {
  message.success('保存成功')
}
</script>

<style scoped lang="less">
.article-container {
  background: #fff;
  border-radius: 8px;
  height: calc(100vh - 64px - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .main-content {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .left-menu {
    width: 160px;
    flex-shrink: 0;
    border-right: 1px solid #f0f0f0;
    overflow-y: auto;

    :deep(.ant-menu) {
      .ant-menu-item {
        margin: 0;
        border-radius: 0;
        height: 44px;
        line-height: 44px;
        font-size: 14px;
        color: #333;

        &:hover {
          background: #f5f5f5;
        }

        &.ant-menu-item-selected {
          background: #e6f7ff;
          color: #1890ff;

          &::after {
            display: none;
          }
        }
      }
    }
  }

  .right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;

    .content-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 24px;
      border-bottom: 1px solid #f0f0f0;

      .panel-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .save-btn {
        border-radius: 6px;
      }
    }

    .content-body {
      flex: 1;
      display: flex;
      min-height: 0;
    }
  }

  .lang-panel {
    width: 160px;
    flex-shrink: 0;
    padding: 16px;
    border-right: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;

    .add-lang-btn {
      height: 36px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 12px;
      flex-shrink: 0;
    }

    .lang-list {
      flex: 1;
      overflow-y: auto;

      .lang-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .lang-name {
          flex: 1;
          padding: 8px 12px;
          color: #333;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
          border: 1px solid #d9d9d9;
          background: #fff;
          text-align: center;

          &:hover {
            border-color: #40a9ff;
          }
        }

        .delete-icon {
          color: #ff4d4f;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 4px;
          margin-left: 8px;

          &:hover {
            color: #ff7875;
            transform: scale(1.1);
          }
        }

        &.active {
          .lang-name {
            border-color: #1890ff;
            background: #1890ff;
            color: #fff;
          }
        }
      }
    }
  }

  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .editor-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #bfbfbf;
      font-size: 14px;
      background: #fafafa;
    }
  }
}
</style>

<style lang="less">
// 弹窗样式
.warning-modal {
  .ant-modal-content {
    border-radius: 8px;
  }

  .modal-title-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;

    .warning-icon {
      width: 22px;
      height: 22px;
      background: #faad14;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.add-lang-content {
  .warning-tip-box {
    margin-bottom: 16px;
    border-radius: 6px;

    .tip-text {
      font-size: 13px;
      color: #666;
      line-height: 1.8;

      .link {
        color: #1890ff;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .ant-select-lg {
    .ant-select-selector {
      height: 44px !important;
      border-radius: 8px !important;

      .ant-select-selection-search-input {
        height: 42px !important;
      }

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        line-height: 42px !important;
        font-size: 14px !important;
      }
    }
  }

  .ant-input-lg {
    height: 44px;
    border-radius: 8px;
  }
}

.lang-ref-content {
  .ant-table-thead > tr > th {
    font-size: 15px;
    font-weight: 600;
  }

  .lang-row-clickable {
    cursor: pointer;

    &:hover {
      background-color: #e6f7ff !important;
    }
  }
}
</style>
