<script setup lang="ts">
import { ref, h } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Link } from '@arco-design/web-vue';
import { RouterLink } from 'vue-router';
import Avatar from '../../components/Avatar.vue';

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
    Axios.get('/admin/role/', {
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
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    render: ({ record }: { record: any }) => {
      return h(Avatar, { role: record });
    },
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '所有者',
    dataIndex: 'user_info',
    render: ({ record }: { record: any }) => {
      return `${record.user_info.real_name}(${record.user_info.username})`;
    },
  },
  {
    title: '管理',
    dataIndex: 'manage',
    render: ({ record }: { record: any }) => {
      return h(
        RouterLink,
        { to: { name: 'admin-role-detail', params: { id: record.id } } },
        () => h(Link, () => '编辑')
      );
    },
  },
];
</script>

<template>
  <a-input-search
    search-button
    v-model="search"
    placeholder="请输入角色名称"
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
