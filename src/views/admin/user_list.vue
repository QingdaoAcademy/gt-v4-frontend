<script setup lang="ts">
import { ref, h } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Message, Link } from '@arco-design/web-vue';
import { RouterLink } from 'vue-router';
import {
  IdentityOptions,
  School,
  SchoolLabel,
  SchoolOptions,
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
    Axios.get('/admin/user/', {
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
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'real_name',
  },
  {
    title: '身份',
    dataIndex: 'identity',
  },
  {
    title: '学校',
    render: ({ record }: { record: any }) => {
      return SchoolLabel[record.school as keyof typeof SchoolLabel];
    },
  },
  {
    title: '管理',
    dataIndex: 'manage',
    render: ({ record }: { record: any }) => {
      return h(
        RouterLink,
        { to: { name: 'admin-user-detail', params: { id: record.id } } },
        () => h(Link, () => '编辑')
      );
    },
  },
];

// 创建用户
const createUserForm = ref({
    username: '',
    password: '',
    real_name: '',
    student_id: '',
    identity: '学生',
    school: School.qdzx,
  }),
  createUser = () => {
    Axios.post(`/user/`, createUserForm.value)
      .then((_res: any) => {
        Message.success('创建成功');
      })
      .catch(errorHandler);
  };
</script>

<template>
  <a-input-search
    search-button
    v-model="search"
    placeholder="请输入用户名或姓名"
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

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 创建用户 </a-typography-title>
    <a-form :model="createUserForm" auto-label-width>
      <a-form-item label="用户名">
        <a-input v-model="createUserForm.username" />
      </a-form-item>
      <a-form-item label="密码">
        <a-input v-model="createUserForm.password" />
      </a-form-item>
      <a-form-item label="真实姓名">
        <a-input v-model="createUserForm.real_name" />
      </a-form-item>
      <a-form-item label="学号">
        <a-input v-model="createUserForm.student_id" />
      </a-form-item>
      <a-form-item label="身份">
        <a-select
          v-model="createUserForm.identity"
          :options="IdentityOptions"
        />
      </a-form-item>
      <a-form-item label="学校">
        <a-select v-model="createUserForm.school" :options="SchoolOptions" />
      </a-form-item>
    </a-form>
    <a-button type="primary" @click="createUser"> 创建 </a-button>
  </div>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
