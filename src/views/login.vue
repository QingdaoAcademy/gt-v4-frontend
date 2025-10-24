<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { Axios, errorHandler } from '../axios';
import { saveUserInfo } from '../scripts/userInfo';
import { Message, Modal } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import Hccaptcha from '../components/Hccaptcha.vue';
import { sharedFunctions } from '../stores';
import { useStore } from '../stores';

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  remember_me: false,
  captcha_token: '',
});

const loginLoading = ref(false),
  login = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) {
      return;
    } else if (form.captcha_token === '') {
      Message.warning('请完成人机验证');
      return;
    }
    loginLoading.value = true;
    Axios.post('/user/login/', values)
      .then(res => {
        saveUserInfo(res.data, true, form.remember_me);
        Message.success('登录成功');
        if (router.currentRoute.value.query.next) {
          router.replace(router.currentRoute.value.query.next as string);
        } else {
          router.replace({ name: 'index' });
        }
      })
      .catch(err => {
        form.captcha_token = '';
        errorHandler(err);
      })
      .finally(() => {
        loginLoading.value = false;
      });
  };

onMounted(() => {
  const adminToken = router.currentRoute.value.query.admin_token;
  if (adminToken && typeof adminToken === 'string') {
    loginLoading.value = true;
    const store = useStore();
    if (store.loggedIn) {
      sharedFunctions.logout();
    }
    Axios.get('/user/info/', {
      headers: {
        Authorization: adminToken,
      },
    })
      .then(res => {
        saveUserInfo(res.data, true, false);
        Message.success('登录成功');
        router.replace({ name: 'index' });
      })
      .catch(err => {
        errorHandler(err);
      })
      .finally(() => {
        loginLoading.value = false;
      });
  }
});

const resetPassword = () => {
  Modal.info({
    title: '忘记密码',
    content: '请联系微信QA瓜田服务（微信号qagtservice）重置密码。',
  });
};
</script>

<template>
  <div class="card-container">
    <a-card>
      <a-typography-title :heading="2"> 登录 </a-typography-title>

      <a-divider class="divider-30" />

      <a-form :model="form" layout="vertical" @submit="login">
        <a-form-item
          field="username"
          label="账号"
          :rules="[{ required: true, message: '请输入账号' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
          tooltip="你在注册时设置的瓜田账号"
        >
          <a-input v-model="form.username" placeholder="请输入账号" />
        </a-form-item>
        <a-form-item
          field="password"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
          tooltip="通过云校注册的初始密码为爱云校密码"
        >
          <a-input-password v-model="form.password" placeholder="请输入密码" />
        </a-form-item>
        <Hccaptcha v-model:token="form.captcha_token" />
        <a-form-item>
          <a-checkbox v-model="form.remember_me"> 记住我 </a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loginLoading">
              登录
            </a-button>
            <RouterLink :to="{ name: 'register' }">
              <a-button> 去注册 </a-button>
            </RouterLink>
            <a-button @click="resetPassword"> 忘记密码 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
