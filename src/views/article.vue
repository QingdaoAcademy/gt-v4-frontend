<script setup lang="ts">
import { isMobile } from '../consts/isMobile';
import { ref, reactive, watch } from 'vue';
import { useStore, usePersistStore, sharedFunctions } from '../stores';
import Markdown from '../components/Markdown.vue';
import RoleCard from '../components/RoleCard.vue';
import LikeCard from '../components/LikeCard.vue';
import CommentCard from '../components/CommentCard.vue';
import { Axios } from '../axios';
import { PostFull, PostComment } from '../types';
import { useRoute } from 'vue-router';
import PostOperationCard from '../components/ArticleOperationCard.vue';
import StatusTag from '../components/StatusTag.vue';
import PostTime from '../components/PostTime.vue';
import { ReviewStatus } from '../consts/options';

const route = useRoute();
const store = useStore(),
  persistStore = usePersistStore();

const loadingArticle = ref(true),
  article = reactive({
    title: '',
    content: '',
  } as PostFull);

const comments = ref([] as PostComment[]),
  loadingComments = ref(false);

let firstFetch = true;

const fetchData = () => {
  Axios.get(`/post/${route.params.id}/?admin_mode=true`).then(res => {
    Object.assign(article, res.data);
    loadingArticle.value = false;
    if (firstFetch && article.review_status === ReviewStatus.pending) {
      firstFetch = false;
      setTimeout(fetchData, 5000);
    }
  });
};

fetchData();

if (isMobile.value) {
  persistStore.commentCardPosition = 'bottom';
}

watch(() => route.params.id, fetchData);
watch(
  () => store.roleId,
  () => {
    Axios.get(`/post/${route.params.id}/like/`).then(res => {
      article.liked = res.data.liked;
      article.like_count = res.data.like_count;
      article.liked_by = res.data.liked_by;
    });
  }
);
</script>

<template>
  <a-layout class="article-page-container" has-sider>
    <a-layout-content class="article-layout">
      <a-skeleton animation :loading="loadingArticle" style="margin-top: 1em">
        <a-space direction="vertical" :style="{ width: '100%' }" :size="30">
          <a-skeleton-line :rows="1" :line-height="50" />
          <a-skeleton-line :rows="1" :widths="['40%']" />
          <a-skeleton-line :rows="10" :line-spacing="20" />
        </a-space>
      </a-skeleton>

      <a-layout v-show="!loadingArticle">
        <a-typography-title
          :heading="3"
          v-text="article.title"
          style="margin-top: 0"
        />

        <a-space class="article-info" size="medium" v-if="article">
          <!-- <a-typography-text> <IconEye />15 </a-typography-text> -->
          <PostTime :post="article" />
          <a-typography-text
            style="cursor: pointer; user-select: none"
            @click="sharedFunctions.showReport(article.id, 'post')"
          >
            <IconExclamationCircle />
            {{ article.author?.id === store.roleId ? '申诉' : '举报' }}
          </a-typography-text>
          <StatusTag
            :review-status="article.review_status"
            :share-with="article.share_with"
            :has-new-version="article.current_version < article.latest_version"
          />
        </a-space>

        <RoleCard
          :role="article.author"
          style="margin-bottom: 1.5rem"
          v-if="isMobile"
        />

        <Markdown v-model:content="article.content" />
      </a-layout>

      <PostOperationCard
        style="margin-top: 1.5rem"
        v-if="
          isMobile &&
          (store.isCurrentRole(article.author) || store.permission.admin_forum)
        "
        :post="article"
      />

      <LikeCard :article="article" v-if="isMobile" style="margin-top: 1.5rem" />

      <CommentCard
        :loading="loadingComments"
        :post="article"
        :comments="comments"
        v-if="persistStore.commentCardPosition === 'bottom'"
        style="margin: 2rem 0"
      />
    </a-layout-content>

    <a-layout-sider v-if="!isMobile" class="sider">
      <a-space direction="vertical" size="large" style="width: 100%">
        <RoleCard :role="article.author" />

        <PostOperationCard
          v-if="
            !isMobile &&
            (store.isCurrentRole(article.author) ||
              store.permission.admin_forum)
          "
          :post="article"
        />

        <LikeCard :article="article" />

        <CommentCard
          :loading="loadingComments"
          :post="article"
          :comments="comments"
          v-if="persistStore.commentCardPosition === 'right'"
        />
      </a-space>
    </a-layout-sider>
  </a-layout>
</template>

<style scoped lang="scss">
.article-page-container {
  width: min(1200px, 95%);
  margin: 10px auto 4vh auto;
}

.article-layout {
  .article-info {
    margin-bottom: 1.5rem;
    .arco-typography {
      color: var(--color-text-3);
    }
  }
}

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

.sider {
  background-color: var(--color-bg-1);
  // height: calc(1vh - var(--global-header-height));
  width: 25vw !important;
  max-width: 350px !important;
  box-shadow: none;
  padding: 10px 0;
  margin-left: 1vw;
}
</style>
