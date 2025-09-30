<script setup lang="ts">
import { PropType } from 'vue';
import { formatDatetime } from '../scripts/time';

defineProps({
  post: Object as PropType<{
    create_time: string;
    edit_time: string;
    source: string;
  }>,
});
</script>

<template>
  <a-tooltip
    v-if="post"
    :content="`发布于 ${formatDatetime(post.create_time)}`"
    mini
  >
    <a-typography-text style="color: var(--color-text-3)">
      编辑于 {{ formatDatetime(post.edit_time) }}
    </a-typography-text>
  </a-tooltip>
  <span v-if="post?.source === 'wechat'" style="color: var(--color-text-3)">
    <span style="margin: 0 0.5em">·</span>来自微信
  </span>
</template>
