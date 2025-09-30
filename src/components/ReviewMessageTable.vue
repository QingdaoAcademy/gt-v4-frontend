<script setup lang="ts">
import { TableColumnData } from '@arco-design/web-vue';
import { formatDatetime } from '../scripts/time';
import { ReviewStatusLabel } from '../consts/options';

defineProps<{
  data: any;
  loading?: boolean;
}>();

const columns = [
  {
    title: '类型',
    width: 80,
    render: ({ record }) => {
      switch (record.reviewer_type) {
        case 'admin':
          return '管理员';
        case 'machine':
          return '机审';
        default:
          return record.reviewer_type;
      }
    },
  },
  {
    title: '状态',
    width: 110,
    render: ({ record }) => {
      return ReviewStatusLabel[record.status as keyof typeof ReviewStatusLabel];
    },
  },
  {
    title: '时间',
    width: 150,
    render: ({ record }) => {
      return formatDatetime(record.review_time);
    },
  },
  {
    title: '消息',
    width: 150,
    ellipsis: true,
    tooltip: true,
    render: ({ record }) => {
      return record.message;
    },
  },
] as TableColumnData[];
</script>

<template>
  <a-table
    v-if="data"
    :data="data"
    :loading="loading"
    :columns="columns"
    :pagination="false"
  />
</template>
