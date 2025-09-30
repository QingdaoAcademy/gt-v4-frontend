<script setup lang="ts">
import { ref } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Message } from '@arco-design/web-vue';
import router from '../../router';
import ArcoDescriptions from '../../components/ArcoDescriptions.vue';
import { RoleFull } from '../../types';

const data = ref({} as RoleFull),
  is_active = ref(true),
  loading = ref(false),
  getData = () => {
    loading.value = true;
    Axios.get(`/admin/role/${router.currentRoute.value.params.id}/`)
      .then(res => {
        data.value = res.data;
        is_active.value = data.value.is_active;
      })
      .catch(errorHandler)
      .finally(() => {
        loading.value = false;
      });
  };
getData();

const save = () => {
  loading.value = true;
  Axios.put(`/admin/role/${router.currentRoute.value.params.id}/`, data.value)
    .then(() => {
      Message.success('保存成功');
    })
    .catch(errorHandler)
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <a-typography-title :heading="5"> 角色信息 </a-typography-title>
  <ArcoDescriptions
    :data="[
      { label: 'ID', value: data.id },
      { label: '名称', value: data.name },
      { label: '描述', value: data.description || '-' },
      { label: '匿名角色', value: data.is_private ? '是' : '否' },
      { label: '展示用户信息', value: data.show_user_info ? '是' : '否' },
      { label: '共享角色', value: data.is_shared ? '是' : '否' },
      {
        label: '所有者',
        value: `${data.user_info?.real_name}(${data.user_info?.username})`,
      },
    ]"
  />

  <div v-if="data.members?.length > 0">
    <a-typography-title :heading="5"> 成员 </a-typography-title>
    <a-space>
      <a-tag v-for="user in data.members" :key="user.id" size="large">
        {{ user.real_name }}({{ user.username }})
      </a-tag>
    </a-space>
  </div>

  <a-divider />

  <a-form :model="data" auto-label-width>
    <a-form-item label="可用">
      <a-switch v-model="data.is_active" />
    </a-form-item>
    <a-form-item label="允许编辑">
      <a-switch v-model="data.editable" />
    </a-form-item>
    <a-form-item label="认证信息">
      <a-input
        v-model="data.verify /* @ts-ignore */"
        placeholder="请输入认证信息"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="save" :loading="loading">
        保存
      </a-button>
    </a-form-item>
  </a-form>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
