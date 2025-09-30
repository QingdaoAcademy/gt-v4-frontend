<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Message } from '@arco-design/web-vue';
import { sharedFunctions } from '../../stores';
import router from '../../router';
import ArcoDescriptions from '../../components/ArcoDescriptions.vue';
import { saveUserInfo } from '../../scripts/userInfo';
import { AuthResponse, Permission } from '../../types';
import { formatDatetime } from '../../scripts/time';
import { CoinRecordType, CoinRecordTypeOptions } from '../../consts/options';
import { useStore } from '../../stores';

const currentUser = ref({} as AuthResponse),
  is_active = ref(true),
  loadingGetUser = ref(false),
  getUser = () => {
    loadingGetUser.value = true;
    Axios.get(`/admin/user/${router.currentRoute.value.params.id}/`)
      .then(res => {
        currentUser.value = res.data;
        for (const key in currentUser.value.permission) {
          permissionOptions.value.push({
            label: key,
            value: key,
          });
          if (currentUser.value.permission?.[key as keyof Permission]) {
            permission.value.push(key);
          }
        }
        quota.value = structuredClone(res.data.quota);
        is_active.value = currentUser.value.user.is_active;
      })
      .catch(errorHandler)
      .finally(() => {
        loadingGetUser.value = false;
      });
  };
getUser();

const loginToUser = () => {
  sharedFunctions.logout();
  saveUserInfo(currentUser.value, true, false);
  router.push({ name: 'index' });
};

const copyReturnUrl = () => {
  const store = useStore();
  if (!store.authorization) {
    Message.error('获取信息失败');
    return;
  }
  const payload = btoa(JSON.stringify(store.authorization.payload));
  const signature = store.authorization.signature;
  const jwt = `${payload}.${signature}`;
  const returnUrl = `${window.location.origin}/login?admin_token=JWT ${encodeURIComponent(jwt)}`;
  navigator.clipboard.writeText(returnUrl);
  Message.success('复制url成功');
};

const newPassword = ref(''),
  changePassword = () => {
    Axios.post(`/admin/user/${currentUser.value.user.id}/change-password/`, {
      password: newPassword.value,
    })
      .then((_res: any) => {
        Message.success('密码修改成功');
      })
      .catch(errorHandler);
  };

const permissionOptions = ref([] as { label: string; value: string }[]),
  permission = ref([] as string[]),
  changePermission = () => {
    const data = {} as Record<string, boolean>;
    for (const key of permissionOptions.value) {
      data[key.value] = permission.value.includes(key.value);
    }
    Axios.put(`/admin/user/${currentUser.value.user.id}/?type=permission`, data)
      .then((res: any) => {
        Message.success('权限修改成功');
        currentUser.value.permission = res.data;
      })
      .catch(errorHandler);
  };

const quota = ref({}),
  changeQuota = () => {
    Axios.put(
      `/admin/user/${currentUser.value.user.id}/?type=quota`,
      quota.value
    )
      .then((res: any) => {
        Message.success('配额修改成功');
        currentUser.value.quota = res.data;
      })
      .catch(errorHandler);
  };

const saveActiveInfo = () => {
  Axios.post(`/admin/user/${currentUser.value.user.id}/ban/`, {
    is_active: is_active.value,
  }).then(() => {
    Message.success('封禁状态修改成功');
  });
};

const coinChangeForm = reactive({
    type: CoinRecordType.ADMIN,
    change: 0,
    detail: '',
  }),
  changeCoin = () => {
    Axios.post(
      `/admin/user/${currentUser.value.user.id}/coin/`,
      coinChangeForm
    ).then(() => {
      Message.success('硬币修改成功');
      coinChangeForm.change = 0;
      coinChangeForm.detail = '';
    });
  };
</script>

<template>
  <a-typography-title :heading="5"> 用户信息 </a-typography-title>
  <ArcoDescriptions
    :data="[
      { label: 'ID', value: currentUser?.user?.id },
      { label: '账号', value: currentUser?.user?.username },
      { label: '姓名', value: currentUser?.user?.real_name },
      { label: '学号', value: currentUser?.user?.student_id },
      { label: '学校', value: currentUser?.user?.school },
      { label: '身份', value: currentUser?.user?.identity },
      {
        label: '注册时间',
        value: formatDatetime(currentUser?.user?.date_joined),
      },
    ]"
  />

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 登录 </a-typography-title>
    <a-space>
      <a-button type="primary" @click="loginToUser"> 登录到该账号 </a-button>
      <a-button type="primary" status="warning" @click="copyReturnUrl">复制返回url</a-button>
    </a-space>
  </div>

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 修改密码 </a-typography-title>
    <a-input
      v-model="newPassword"
      placeholder="请输入新密码"
      @keydown.enter="changePassword"
      class="mb-1"
    />
    <a-button type="primary" status="danger" @click="changePassword">
      修改
    </a-button>
  </div>
  <a-divider />

  <div>
    <a-typography-title :heading="5"> 硬币操作 </a-typography-title>
    <a-form :model="coinChangeForm" auto-label-width>
      <a-form-item label="类型">
        <a-select
          v-model="coinChangeForm.type"
          :options="CoinRecordTypeOptions"
        />
      </a-form-item>
      <a-form-item label="数量">
        <a-input-number v-model="coinChangeForm.change" />
      </a-form-item>
      <a-form-item label="说明">
        <a-input v-model="coinChangeForm.detail" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="changeCoin"> 修改 </a-button>
      </a-form-item>
    </a-form>
  </div>

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 修改权限 </a-typography-title>
    <a-transfer
      :data="permissionOptions /* @ts-ignore */"
      v-model:model-value="permission"
      simple
      :title="['未授权', '已授权']"
      class="mb-1"
    />
    <a-button type="primary" status="warning" @click="changePermission">
      修改
    </a-button>
  </div>

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 修改配额 </a-typography-title>
    <a-form-item v-for="i in Object.keys(quota)" :key="i" :label="i">
      <a-input-number v-model="quota[i] /* @ts-ignore */" />
    </a-form-item>
    <a-button type="primary" @click="changeQuota"> 修改 </a-button>
  </div>

  <a-divider />

  <div>
    <a-typography-title :heading="5"> 封禁 </a-typography-title>
    <a-form-item label="允许使用">
      <a-switch v-model:model-value="is_active" />
    </a-form-item>
    <a-button type="primary" @click="saveActiveInfo"> 修改 </a-button>
  </div>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
