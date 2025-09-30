<script setup lang="ts">
import { ref, h } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Link } from '@arco-design/web-vue';
import { RouterLink } from 'vue-router';
import { formatDatetime } from '../../scripts/time';
import {
  PostTypeLabel,
  PostShareWithLabel,
  ReviewStatusLabel,
} from '../../consts/options';

const search = ref('');

const loadingList = ref(false),
  data = ref([]),
  pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  }),
  getData = () => {
    loadingList.value = true;
    Axios.get('/admin/post/', {
      params: {
        search: search.value,
        page: pagination.value.current,
        page_size: pagination.value.pageSize,
      },
    })
      .then(res => {
        data.value = res.data.results;
        pagination.value.total = res.data.count;
      })
      .catch(errorHandler)
      .finally(() => {
        loadingList.value = false;
      });
  };
getData();

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    render: ({ record }: { record: any }) => {
      return h(
        'span',
        {
          style: {
            textDecoration: record.deleted ? 'line-through' : 'none',
            color: record.deleted ? 'var(--color-text-3)' : 'inherit',
          },
        },
        record.id
      );
    },
  },
  {
    title: '标题',
    dataIndex: 'title',
    ellipsis: true,
    tooltip: true,
    width: 200,
  },
  {
    title: '内容',
    dataIndex: 'content',
    ellipsis: true,
    tooltip: true,
    width: 200,
  },
  {
    title: '作者',
    dataIndex: 'author',
    render: ({ record }: { record: any }) => {
      return `[${record.author.id}]${record.author.name}`;
    },
    width: 150,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '类型',
    dataIndex: 'type',
    render: ({ record }: { record: any }) => {
      return PostTypeLabel[record.type as keyof typeof PostTypeLabel];
    },
    width: 60,
  },
  {
    title: '分享范围',
    dataIndex: 'share_with',
    render: ({ record }: { record: any }) => {
      return PostShareWithLabel[
        record.share_with as keyof typeof PostShareWithLabel
      ];
    },
    width: 110,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '审核状态',
    dataIndex: 'review_status',
    render: ({ record }: { record: any }) => {
      return ReviewStatusLabel[
        record.review_status as keyof typeof ReviewStatusLabel
      ];
    },
    width: 100,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '更新时间',
    dataIndex: 'edit_time',
    width: 150,
    render: ({ record }: { record: any }) => {
      return formatDatetime(record.edit_time);
    },
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '管理',
    dataIndex: 'manage',
    render: ({ record }: { record: any }) => {
      return h(
        RouterLink,
        { to: { name: 'admin-post-detail', params: { id: record.id } } },
        () => h(Link, () => '编辑')
      );
    },
    width: 75,
  },
];
</script>

<template>
  <a-input-search
    search-button
    v-model="search"
    placeholder="请输入标题或内容关键词"
    class="mb-1"
    style="max-width: 300px"
    @search="
      pagination.current = 1;
      getData();
    "
    @keydown.enter="
      pagination.current = 1;
      getData();
    "
  />
  <a-table
    :columns="columns"
    :data="data"
    :pagination="pagination"
    row-key="id"
    :loading="loadingList"
    @page-change="(page:number) => {
        pagination.current = page;
        getData();
      }"
  />
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
