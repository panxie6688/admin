<template>
  <a-select
    :value="modelValue"
    @update:value="handleChange"
    :placeholder="placeholder"
    :disabled="disabled"
    :allow-clear="allowClear"
    :size="size"
    :style="{ width: width }"
    show-search
    :filter-option="filterOption"
  >
    <a-select-option
      v-for="item in phoneCodeOptions"
      :key="item.value"
      :value="item.value"
    >
      <span v-if="showFlag" class="country-flag">{{ getFlag(item.en) }}</span>
      +{{ item.code }} ({{ item.country }})
    </a-select-option>
  </a-select>
</template>

<script setup>
import { phoneCodeOptions } from '@/utils/phoneCode.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择区号'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowClear: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'middle' // 'large' | 'middle' | 'small'
  },
  width: {
    type: String,
    default: '100%'
  },
  showFlag: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 搜索过滤函数
const filterOption = (input, option) => {
  const item = phoneCodeOptions.find(p => p.value === option.value)
  if (!item) return false
  const searchText = input.toLowerCase()
  return item.code.includes(searchText) ||
         item.country.includes(searchText) ||
         item.en.toLowerCase().includes(searchText)
}

// 值变化处理
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 获取国旗 emoji（可选功能）
const getFlag = (countryName) => {
  const flagMap = {
    'United States': '🇺🇸',
    'China': '🇨🇳',
    'United Kingdom': '🇬🇧',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Hong Kong': '🇭🇰',
    'Taiwan': '🇹🇼',
    'Macau': '🇲🇴',
    'Singapore': '🇸🇬',
    'Malaysia': '🇲🇾',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'India': '🇮🇳',
    'Russia': '🇷🇺',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽'
  }
  return flagMap[countryName] || ''
}
</script>

<style scoped lang="less">
.country-flag {
  margin-right: 6px;
}
</style>
