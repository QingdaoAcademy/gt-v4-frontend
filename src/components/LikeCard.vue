<script setup lang="ts">
import { Axios } from '../axios';
import Avatar from './Avatar.vue';
import { Message } from '@arco-design/web-vue';
import { sharedFunctions, useStore } from '../stores';
import { Coin as IconCoin } from '@vicons/tabler';

const store = useStore();

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
});

const like = () => {
  if (!store.loggedIn) {
    Message.warning('请先登录');
    return;
  }
  Axios.post(`/post/${props.article.id}/like/`, {
    action: props.article.liked ? 'unlike' : 'like',
  }).then(res => {
    props.article.liked = res.data.liked;
    props.article.like_count = res.data.like_count;
    props.article.liked_by = res.data.liked_by;
  });
};
</script>

<template>
  <a-card>
    <div
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.7em;
      "
    >
      <a-space :size="0">
        <a-button type="text" size="large" shape="round" @click="like">
          <template #icon>
            <IconThumbUpFill v-if="article.liked" />
            <IconThumbUp v-else />
          </template>
          {{ article.like_count }}
        </a-button>
        <a-button
          type="text"
          size="large"
          shape="round"
          @click="
            sharedFunctions.showDonateCoin(
              article.author,
              article.id,
              article.coin_record,
              change => {
                article.coin_count += change;
                article.coin_record += change;
              }
            )
          "
        >
          <template #icon>
            <IconCoin class="arco-icon" />
          </template>
          {{ article.coin_count }}
        </a-button>
      </a-space>
      <a-avatar-group
        :max-count="10"
        :size="30"
        v-if="article?.liked_by?.length"
      >
        <Avatar v-for="role in article.liked_by" :key="role.id" :role="role" />
      </a-avatar-group>
    </div>
  </a-card>
</template>
