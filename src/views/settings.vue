<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import PrivacySetting from './settings/Privacy.vue';
import RoleSetting from './settings/Role.vue';
import CoinSetting from './settings/Coin.vue';
import { Axios } from '../axios';
import { Message } from '@arco-design/web-vue';
import { saveUserInfo } from '../scripts/userInfo';
import { useStore, usePersistStore } from '../stores';
import { isMobile } from '../consts/isMobile';
import router from '../router';
import { SchoolLabel } from '../consts/options';

const tabActiveKey = ref('account'),
  tabChange = (key: string | number) => {
    router.replace({ query: { tab: key } });
  };

onMounted(() => {
  setTimeout(() => {
    const tab = router.currentRoute.value.query.tab;
    if (tab) {
      tabActiveKey.value = tab as string;
    } else {
      router.replace({ query: { tab: tabActiveKey.value } });
    }
  }, 100);
});

const store = useStore(),
  persistStore = usePersistStore();

const accountInfoData = ref([
  {
    label: '账号',
    value: store.user?.username,
  },
  {
    label: '姓名',
    value: store.user?.real_name,
  },
  {
    label: '学号',
    value: store.user?.student_id,
  },
  {
    label: '身份',
    value: store.user?.identity,
  },
  {
    label: '学校',
    value: SchoolLabel[store.user?.school as keyof typeof SchoolLabel],
  },
  // {
  //   label: '邮箱',
  //   value: store.user?.email,
  // },
]);

const passwordRules = {
    currentPassword: [
      {
        required: true,
        message: '请输入当前密码',
      },
    ],
    newPassword: [
      {
        required: true,
        message: '请输入新密码',
      },
      {
        minLength: 8,
        message: '密码长度至少为8位',
      },
    ],
    confirmNewPassword: [
      {
        required: true,
        message: '请再次输入新密码',
      },
      {
        validator: (value: string, callback: (error?: string) => void) => {
          if (value !== changePasswordForm.newPassword) {
            callback('两次输入的密码不一致');
          } else {
            callback();
          }
        },
      },
    ],
  },
  changePasswordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  }),
  changePasswordLoading = ref(false),
  changePassword = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) {
      return;
    }
    changePasswordLoading.value = true;
    Axios.post('/user/setting/password/', {
      old_password: values.currentPassword,
      new_password: values.newPassword,
      remember_me: persistStore.remember_me,
    })
      .then(res => {
        saveUserInfo(res.data, false);
        Message.success('密码修改成功');
        changePasswordForm.currentPassword = '';
        changePasswordForm.newPassword = '';
        changePasswordForm.confirmNewPassword = '';
      })
      .finally(() => {
        changePasswordLoading.value = false;
      });
  };
</script>

<template>
  <a-layout class="setting-layout">
    <a-typography-title :heading="3" v-if="!isMobile">
      设置
    </a-typography-title>

    <a-tabs
      type="rounded"
      size="large"
      lazy-load
      animation
      v-model:active-key="tabActiveKey"
      destroy-on-hide
      @change="tabChange"
    >
      <a-tab-pane key="account" title="账号">
        <a-typography-title :heading="5"> 基础信息 </a-typography-title>

        <a-descriptions style="margin: 2em 0 -1em 0">
          <a-descriptions-item
            v-for="item of accountInfoData"
            :label="item.label"
          >
            {{ item.value }}
            <a-link
              v-if="item.label == '邮箱'"
              @click="router.push({ name: 'email' })"
            >
              <icon-edit />
            </a-link>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider style="margin: 3em 0" />

        <a-typography-title :heading="5"> 密码 </a-typography-title>

        <a-typography-text style="font-size: 1.1em">
          修改密码后，账号在除当前设备外的所有设备上的登录将失效。
        </a-typography-text>

        <a-form
          :model="changePasswordForm"
          :rules="passwordRules"
          auto-label-width
          @submit="changePassword"
          style="margin-top: 1.5em"
        >
          <a-form-item label="当前密码" field="currentPassword">
            <a-input-password
              v-model="changePasswordForm.currentPassword"
              placeholder="请输入当前密码"
            />
          </a-form-item>
          <a-form-item label="新密码" field="newPassword">
            <a-input-password
              v-model="changePasswordForm.newPassword"
              placeholder="请输入新密码"
            />
          </a-form-item>
          <a-form-item label="确认新密码" field="confirmNewPassword">
            <a-input-password
              v-model="changePasswordForm.confirmNewPassword"
              placeholder="请再次输入新密码"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              status="warning"
              :loading="changePasswordLoading"
              html-type="submit"
            >
              修改密码
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="coin" title="硬币">
        <CoinSetting />
      </a-tab-pane>
      <a-tab-pane key="privacy" title="隐私">
        <PrivacySetting />
      </a-tab-pane>
      <a-tab-pane key="role" title="角色">
        <RoleSetting />
      </a-tab-pane>
    </a-tabs>
  </a-layout>
</template>

<style lang="scss" scoped>
.setting-layout {
  padding: 5vh 5vw;
  max-width: max(800px, 60vw);
  margin: 0 auto;
  h3 {
    margin: 0 0 3vh 0.2em;
  }
}
:deep(.arco-tabs-content) {
  max-width: max(700px, 55vw);
  padding-top: 30px;
  margin: 0 auto;
}
</style>
