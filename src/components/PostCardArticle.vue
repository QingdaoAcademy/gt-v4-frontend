<script setup lang="ts">
import { formatRelativeTime } from '../scripts/time';
import AvatarName from './AvatarName.vue';
import { isMobile } from '../consts/isMobile';
import { plainTextOnly } from '../scripts/format';
import StatusTag from './StatusTag.vue';

defineProps({
  article: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <a-card class="post-item-card" hoverable :bordered="false">
    <template #title>
      <RouterLink :to="{ name: 'article', params: { id: article.id } }">
        <a-space>
          <a-tag size="medium" color="blue">
            {{ isMobile ? '文' : '文章' }}
          </a-tag>
          <a-typography-title
            :heading="6"
            style="margin: 0 0.25em 0 0; font-size: 1.2em"
            :ellipsis="{ rows: 1, css: true }"
          >
            {{ article.title }}
          </a-typography-title>
        </a-space>
      </RouterLink>
    </template>

    <template #extra>
      <a-space size="small">
        <span style="color: var(--color-text-3)">
          <span>{{ formatRelativeTime(article.edit_time) }}</span>
          <span v-if="article.pinned"> · 置顶</span>
        </span>
      </a-space>
    </template>

    <RouterLink :to="{ name: 'article', params: { id: article.id } }">
      <a-typography-paragraph
        :ellipsis="{ rows: 2 }"
        style="color: var(--color-text-2)"
      >
        {{ plainTextOnly(article.content) }}
      </a-typography-paragraph>
    </RouterLink>

    <a-card-meta>
      <template #avatar>
        <a-space :size="0">
          <AvatarName :role="article.author" />

          <a-divider direction="vertical" />

          <RouterLink :to="{ name: 'article', params: { id: article.id } }">
            <a-space size="medium" style="color: var(--color-text-3)">
              <!-- <div><IconEye /> {{ article.read_count }}</div> -->
              <div><IconThumbUp /> {{ article.like_count }}</div>
              <div><IconMessage /> {{ article.comment_count }}</div>
            </a-space>
          </RouterLink>
        </a-space>
      </template>
    </a-card-meta>
    <template #actions>
      <StatusTag
        :review-status="article.review_status"
        :share-with="article.share_with"
        :has-new-version="article.current_version < article.latest_version"
        style="margin-left: auto"
      />
    </template>
  </a-card>
</template>

<style scoped lang="scss">
.post-item-card {
  :deep(.arco-card-header) {
    padding-bottom: 0px;
    border-bottom: none;
    .arco-card-header-extra {
      color: var(--color-text-2);
    }
  }
  :deep(.arco-card-body) {
    padding-top: 0.5em;
  }
}
</style>
