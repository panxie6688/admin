<template>
  <div class="rich-text-editor">
    <Editor
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :api-key="apiKey"
      :init="editorInit"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Editor from '@tinymce/tinymce-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  height: {
    type: [String, Number],
    default: '100%'
  },
  // 是否显示菜单栏
  menubar: {
    type: [Boolean, String],
    default: 'file edit view insert format tools table help'
  },
  // 是否显示状态栏
  statusbar: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])

// TinyMCE API Key
const apiKey = 'gi9o0q815ws4m9zlu3e37k1txaet5yi5u9r6a47bticec4zl'

// 编辑器配置
const editorInit = computed(() => ({
  height: props.height,
  language: 'zh_CN',
  language_url: '/tinymce/langs/zh_CN.js',
  plugins: [
    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'image', 'code', 'fullscreen', 'preview'
  ],
  toolbar: [
    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | emoticons charmap codesample | code fullscreen preview removeformat'
  ],
  toolbar_mode: 'wrap',
  menubar: props.menubar,
  branding: false,
  promotion: false,
  elementpath: true,
  resize: false,
  statusbar: props.statusbar,
  placeholder: props.placeholder,
  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 1.8; padding: 12px; }',
  // 图片上传配置 - 点击后打开本地文件选择
  file_picker_types: 'image',
  file_picker_callback: (callback, value, meta) => {
    if (meta.filetype === 'image') {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.onchange = function() {
        const file = this.files[0]
        const reader = new FileReader()
        reader.onload = function() {
          callback(reader.result, { alt: file.name })
        }
        reader.readAsDataURL(file)
      }
      input.click()
    }
  }
}))
</script>

<style scoped lang="less">
.rich-text-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.tox-tinymce) {
    border: none !important;
    border-radius: 0 !important;
    flex: 1 !important;
    height: 100% !important;
  }

  :deep(.tox-editor-header) {
    border-bottom: 1px solid #e8e8e8 !important;
  }

  :deep(.tox-toolbar__primary) {
    background: #fafafa !important;
  }

  :deep(.tox-menubar) {
    background: #fafafa !important;
    border-bottom: 1px solid #e8e8e8 !important;
  }

  :deep(.tox-sidebar-wrap) {
    flex: 1 !important;
  }

  :deep(.tox-edit-area) {
    flex: 1 !important;
  }

  :deep(.tox-edit-area__iframe) {
    height: 100% !important;
  }
}
</style>
