<script setup lang="ts">
import { computed } from 'vue';
import { TableData } from '@arco-design/web-vue';
import TableReport from '../consts/table/report';
import TableReview from '../consts/table/review';

const props = defineProps({
  type: {
    type: String,
  },
  data: {
    type: Array<TableData>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
  expandable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['page-change']);

const pageChange = (page: number) => {
  emit('page-change', page);
};

const columns = computed(() => {
  if (props.type === 'report') {
    return TableReport.columns;
  } else if (props.type === 'review') {
    return TableReview.columns;
  }
  return [];
});
</script>

<template>
  <a-table
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :expandable="expandable ? {} : undefined"
    row-key="id"
    :loading="loading"
    @page-change="pageChange"
  ></a-table>
</template>
