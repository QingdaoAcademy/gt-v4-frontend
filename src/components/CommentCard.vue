<script setup lang="ts">
import { isMobile } from '../consts/isMobile';
import { usePersistStore } from '../stores';
import Comment from './Comment.vue';
import type { PostFull } from '../types';
import { PropType } from 'vue';

const persistStore = usePersistStore();

defineProps({
  post: {
    type: Object as PropType<PostFull>,
    required: true,
  },
});
</script>

<template>
  <a-card class="comment-card">
    <div class="comment-card-header">
      <a-typography-title :heading="6">
        评论 ({{ post.comment_count }})
      </a-typography-title>
      <a-radio-group
        v-model="persistStore.commentCardPosition"
        type="button"
        v-if="!isMobile"
      >
        <a-radio value="right"> 侧边 </a-radio>
        <a-radio value="bottom"> 底部 </a-radio>
      </a-radio-group>
    </div>
    <Comment
      root
      :post-owner="post.author"
      :post-id="post.id"
      show
      :allow-comment="post.allow_comment"
    />
  </a-card>
</template>

<style lang="scss" scoped>
.comment-card {
  .comment-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    h6 {
      margin: 0;
    }
  }
}
</style>
