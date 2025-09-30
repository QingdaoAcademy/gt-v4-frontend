<script setup lang="ts">
import { ref } from 'vue';
import { useStore, sharedFunctions } from '../stores';
import { Message } from '@arco-design/web-vue';
import { Axios, errorHandler } from '../axios';
import { RoleBrief } from '../types';
import { Coin as IconCoin } from '@vicons/tabler';

const store = useStore();

const visible = ref(false),
  loading = ref(false);

const coin = ref(1);
const _role = ref<RoleBrief>({} as RoleBrief);
const _post_id = ref<number | null>(null);
const min_value = ref<number>(0);
let _callback: ((change: number) => void) | null = null;

sharedFunctions.showDonateCoin = (
  role: RoleBrief,
  post_id?: number,
  value?: number,
  callback?: (change: number) => void
) => {
  if (!store.user) {
    Message.warning('请先登录');
    return;
  }
  _role.value = role;
  _post_id.value = post_id ?? null;
  coin.value = value ?? 1;
  min_value.value = value ?? 0;
  _callback = callback ?? null;
  visible.value = true;
};

const handleOk = () => {
  loading.value = true;
  if (_post_id.value) {
    Axios.post(`/post/${_post_id.value}/donate/`, {
      amount: coin.value,
    })
      .then(() => {
        Message.success('投币成功');
        if (_callback) {
          _callback(coin.value - min_value.value);
        }
      })
      .catch(errorHandler)
      .finally(() => {
        loading.value = false;
      });
  }
};

const handleChange = (value: number) => {
  if (min_value.value && value < min_value.value) {
    coin.value = min_value.value;
    Message.warning('不能撤销过去的投币');
  }
};
</script>

<template>
  <a-modal
    v-model:visible="visible"
    unmount-on-close
    title="投币"
    @ok="handleOk"
    :ok-loading="loading"
    width="auto"
  >
    <a-typography-text style="font-size: 1.1em">
      投币的50%将奖励给创作者。
    </a-typography-text>
    <div style="margin-top: 1em; text-align: center">
      <a-rate v-model:model-value="coin" @change="handleChange">
        <template #character>
          <IconCoin class="arco-icon" />
        </template>
      </a-rate>
    </div>
  </a-modal>
</template>
