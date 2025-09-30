<script setup lang="ts">
// @ts-nocheck
import { Message } from '@arco-design/web-vue';
import { onMounted, ref } from 'vue';
import { useStore } from '../stores';
import { Axios, errorHandler } from '../axios';

const store = useStore();

const props = defineProps<{
  video: Object | null;
}>();

const loading = ref(false);
const playtoken = ref(null);

const playerId = Math.random().toString(36).substring(2, 15);

const loadVideo = () => {
  if (window.DogePlayer === undefined) {
    Message.error('播放器初始化失败');
    return;
  }
  if (!props.video.id) {
    Message.error('视频信息缺失');
    return;
  }
  loading.value = true;
  Axios.get(`/video/${props.video.id}/`)
    .then(res => {
      playtoken.value = res.data.playtoken;
      const player = new DogePlayer({
        container: document.getElementById(`doge-player-${playerId}`),
        userId: 3298,
        vcode: props.video.vcode,
        playToken: res.data.playtoken,
      });
    })
    .catch(errorHandler)
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <div v-if="video && video.id">
    <div
      v-if="!video.is_active"
      style="width: 100%; padding: 1em 0; text-align: center"
    >
      <a-spin tip="视频正在转码中..." :size="32" />
    </div>
    <a-result
      v-else-if="playtoken === null"
      :status="null"
      :subtitle="store.loggedIn ? undefined : '请在登录后查看视频'"
    >
      <template #icon>
        <IconFileVideo />
      </template>
      <template #extra>
        <a-button
          type="primary"
          @click="loadVideo"
          :loading="loading"
          v-if="store.loggedIn"
        >
          加载视频
        </a-button>
        <RouterLink :to="{ name: 'login' }" v-else>
          <a-button type="primary"> 登录 </a-button>
        </RouterLink>
      </template>
    </a-result>
    <div
      v-show="playtoken !== null"
      :id="`doge-player-${playerId}`"
      style="
        width: min(max(80%, 500px), 100%);
        aspect-ratio: 16/9;
        margin: 2em auto;
      "
    />
  </div>
</template>
