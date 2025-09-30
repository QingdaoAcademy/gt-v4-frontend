<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Axios, errorHandler } from '../axios';
import { useStore, sharedFunctions } from '../stores';
import Hccaptcha from './Hccaptcha.vue';
import { Message } from '@arco-design/web-vue';

const store = useStore();

const visible = ref(false);
const token = ref('');
let resolvePromise: ((value: boolean) => void) | null = null;
let rejectPromise: ((reason?: any) => void) | null = null;

const doRejectPromise = (message: boolean = true) => {
  if (rejectPromise) {
    if (message) Message.error('人机验证失败');
    rejectPromise();
  }
};

watch(
  () => token.value,
  () => {
    if (token.value === '') return;
    Axios.post('/user/captcha/', { captcha_token: token.value })
      .then((res: any) => {
        visible.value = false;
        store.captcha_expire_time = res.data.captcha_expire_time;
        if (resolvePromise) {
          resolvePromise(true);
        }
      })
      .catch(err => {
        errorHandler(err);
        doRejectPromise();
      })
      .finally(() => {
        token.value = '';
        resolvePromise = null;
        rejectPromise = null;
      });
  }
);

sharedFunctions.checkCaptcha = () => {
  return new Promise<boolean>((resolve, reject) => {
    if (store.captcha_expire_time > Math.ceil(Date.now() / 1000)) {
      resolve(true);
    } else {
      visible.value = true;
      resolvePromise = resolve;
      rejectPromise = reject;
    }
  });
};

const onClose = () => {
  token.value = '';
  setTimeout(() => {
    doRejectPromise(false);
  }, 100);
};
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="人机验证"
    :footer="false"
    :destroy-on-hide="true"
    :modal-style="{ width: '300px' }"
    @before-close="onClose"
  >
    <div style="padding-bottom: 60px">
      <a-typography-paragraph style="margin-bottom: 10px; font-size: 1.1em">
        为防止机器人发起的网络攻击，保证瓜田正常运行，请完成人机验证。
      </a-typography-paragraph>
      <a-typography-paragraph style="margin-bottom: 20px; font-size: 1.1em">
        在账号注册初期，你可能被频繁要求完成人机验证；随着账号使用时长增加，该频率会降低。
      </a-typography-paragraph>
      <Hccaptcha v-model:token="token" />
    </div>
  </a-modal>
</template>
