<script setup lang="ts">
import { reactive } from 'vue';
import { Axios } from '../axios';
import { useRoute } from 'vue-router';
import PostCardMoment from '../components/PostCardMoment.vue';
import { PostFull } from '../types';
import { PostType } from '../consts/options';
import PostCardArticle from '../components/PostCardArticle.vue';
// @ts-ignore
import VueQr from 'vue-qr/src/packages/vue-qr.vue';

const route = useRoute();
const post = reactive({} as PostFull);

const fetchData = () => {
  Axios.get(`/post/${route.params.id}/`).then(res => {
    Object.assign(post, res.data);
  });
};

fetchData();

const url = window.location.href;
</script>

<template>
  <div style="margin: 2.5vh 2vw; max-width: min(600px, 95vw); margin: 2em auto">
    <PostCardMoment
      :moment="post"
      v-if="post.id && post.type === PostType.moment"
    />
    <PostCardArticle
      :article="post"
      v-else-if="post.id && post.type === PostType.article"
    />

    <a-space
      style="display: flex; justify-content: space-between; margin: 30px 10px"
    >
      <a-space direction="vertical" style="color: var(--color-text-3)">
        <span style="margin-bottom: 5px">QA瓜田每日帖子分享</span>
        <span>长按识别二维码前往瓜田互动</span>
      </a-space>
      <VueQr
        :text="url"
        :size="75"
        :margin="5"
        colorLight="#fff"
        colorDark="#000"
      />
    </a-space>
  </div>
</template>
