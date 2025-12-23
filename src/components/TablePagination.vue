<template>
  <div class="pagination-wrapper">
    <span class="total-text">统计: {{ total }}/条</span>
    <a-pagination
      v-model:current="currentPage"
      v-model:page-size="pageSizeValue"
      :total="total"
      :show-size-changer="showSizeChanger"
      :show-quick-jumper="showQuickJumper"
      size="small"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
  },
  showSizeChanger: {
    type: Boolean,
    default: false
  },
  showQuickJumper: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:current', 'update:pageSize', 'change'])

const currentPage = computed({
  get: () => props.current,
  set: (val) => {
    emit('update:current', val)
    emit('change', val, props.pageSize)
  }
})

const pageSizeValue = computed({
  get: () => props.pageSize,
  set: (val) => {
    emit('update:pageSize', val)
    emit('change', props.current, val)
  }
})
</script>

<style scoped lang="less">
.pagination-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  height: 56px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  box-sizing: border-box;

  .total-text {
    margin-right: 16px;
    color: #666;
    font-size: 14px;
    white-space: nowrap;
  }
}

:deep(.ant-pagination) {
  margin: 0;
}
</style>
