<script setup lang="ts">
import {
  PostShareWith,
  PostShareWithLabel,
  ReviewStatus,
  ReviewStatusLabel,
} from '../consts/options';
import { PropType } from 'vue';

defineProps({
  reviewStatus: {
    type: Number as PropType<number | undefined>,
  },
  shareWith: {
    type: Number,
  },
  showReviewAccepted: {
    type: Boolean,
    default: false,
  },
  hasNewVersion: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
});
</script>

<template>
  <a-space
    v-if="
      (reviewStatus !== undefined &&
        (reviewStatus < ReviewStatus.noNeed || showReviewAccepted)) ||
      (shareWith && shareWith < PostShareWith.public) ||
      hasNewVersion
    "
    size="small"
  >
    <a-tooltip
      content="如有误判，请申诉以要求管理员审核"
      mini
      v-if="reviewStatus && reviewStatus < ReviewStatus.noNeed"
    >
      <a-tag
        :color="
          {
            [-1]: 'orange',
            [-2]: 'orangered',
            [-3]: 'red',
            // @ts-ignore
          }[reviewStatus]
        "
        class="review-status"
        :size="size"
      >
        <template #icon v-if="reviewStatus === -1 || reviewStatus === -2">
          <IconLoading />
        </template>
        {{ ReviewStatusLabel[reviewStatus as keyof typeof ReviewStatusLabel] }}
      </a-tag>
    </a-tooltip>

    <a-tag
      v-else-if="showReviewAccepted"
      color="green"
      class="review-status"
      :size="size"
    >
      审核通过
    </a-tag>

    <a-tag
      v-if="shareWith && shareWith < PostShareWith.public"
      :color="
        {
          [-1]: 'blue',
          [-2]: 'arcoblue',
          [-3]: 'purple',
          // @ts-ignore
        }[shareWith]
      "
      class="review-status"
      :size="size"
    >
      {{ PostShareWithLabel[shareWith as keyof typeof PostShareWithLabel] }}
    </a-tag>

    <a-tag color="cyan" :size="size" v-if="hasNewVersion"> 新版本审核中 </a-tag>
  </a-space>
</template>

<style scoped>
.arco-tag {
  user-select: none;
}
</style>
