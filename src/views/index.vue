<script setup lang="ts">
import { isMobile } from '../consts/isMobile';
import PostCardArticle from '../components/PostCardArticle.vue';
import PostCardMoment from '../components/PostCardMoment.vue';
import { reactive, ref, watch } from 'vue';
import { _writeToQuery } from '../scripts/writeToQuery';
import { router } from '../router';
import { sharedFunctions, useStore } from '../stores';
import { useRoute } from 'vue-router';
import { Axios } from '../axios';
import { PostType, PostOrderingOptions } from '../consts/options';
import { PostFull, PageinationData } from '../types';
import Beian from '../components/Beian.vue';
import PullRefresh from '../components/PullRefresh.vue';

const store = useStore();
const route = useRoute();

const yiyan = ref({ content: '' });
fetch('https://api.yixiangzhilv.com/yiyan/sentence/get/')
  .then(res => res.json())
  .then(data => {
    yiyan.value = data;
  })
  .catch(() => {
    console.log('亿言获取失败');
  });

const search = reactive({
    search: '',
    ordering: '-update_time',
    review_status: undefined as number | undefined,
  }),
  pagination = reactive({ page: 1, pageSize: 20, total: 0 } as PageinationData),
  writeToQuery = _writeToQuery(search, pagination, router);
const loading = ref(false),
  data = ref([] as PostFull[]);

const handleQueryChange = () => {
  if (loading.value) return;
  if (route.name !== 'index') return;

  loading.value = true;

  search.search = String(route.query.search || '');
  search.ordering = String(route.query.ordering || '-update_time');
  // const tags = [];
  // if (route.query.tags) {
  //   for (const tag of route.query.tags.split(',')) {
  //     tags.push(parseInt(tag));
  //   }
  // }
  // search.value.tags = tags;
  if (route.query.page) pagination.page = parseInt(route.query.page as string);
  if (route.query.pageSize)
    pagination.pageSize = parseInt(route.query.pageSize as string);

  const _data = {
    page: pagination.page,
    page_size: pagination.pageSize,
    ...search,
    // tags: search.value.tags.join(','),
  } as any;
  Axios.get('/post/', {
    params: _data,
  })
    .then(res => {
      pagination.total = res.data.count;
      data.value = res.data.results;
      sharedFunctions.scrollTop();
    })
    .finally(() => {
      loading.value = false;
    });
};
handleQueryChange();
watch(
  () => route.query,
  () => {
    writeToQuery();
    handleQueryChange();
  }
);
watch(
  () => store.roleId,
  () => {
    handleQueryChange();
  }
);
// writeToQuery();
</script>

<template>
  <a-layout
    :style="isMobile ? 'padding: 2px 0 1em 0' : 'padding: 2px 2vw 1em 2vw'"
    has-sider
  >
    <!-- FOR LAPTOP -->
    <a-affix :offset-top="65" v-if="!isMobile">
      <a-layout-sider class="sider">
        <img
          src="../assets/logo-single.svg"
          alt="Logo"
          style="width: 40%; height: auto; margin: 0 30%"
        />
        <a-typography-paragraph class="hitokoto">
          {{ yiyan.content }}
        </a-typography-paragraph>
        <a-divider />
        <a-space direction="vertical" style="display: flex" :size="10">
          <a-button long @click="router.push({ name: 'edit' })">
            <template #icon>
              <IconPlus />
            </template>
            新内容
          </a-button>
        </a-space>
        <a-divider />
        <Beian />
      </a-layout-sider>
    </a-affix>
    <!-- END FOR LAPTOP -->

    <a-layout-content style="height: fit-content">
      <a-space direction="vertical" fill class="post-list" :size="30">
        <div>
          <!-- FOR MOBILE -->
          <a-space>
            <a-button @click="router.push({ name: 'edit' })" v-if="isMobile">
              新内容
              <template #icon>
                <IconPlus />
              </template>
            </a-button>

            <a-select
              v-if="!isMobile"
              :size="'large'"
              v-model:model-value="search.ordering"
              :options="PostOrderingOptions"
              @change="writeToQuery(true)"
            >
              <template #label="{ data }">
                <span>
                  <icon-sort style="margin-right: 0.5rem" v-if="!isMobile" />
                  {{ data?.label }}
                </span>
              </template>
            </a-select>
          </a-space>

          <a-space style="float: right">
            <a-input-search
              :size="isMobile ? 'medium' : 'large'"
              style="max-width: 320px; width: 50vw"
              placeholder="搜索"
              search-button
              v-model="search.search"
              @search="writeToQuery(true)"
              @keydown.enter="writeToQuery(true)"
            />

            <a-trigger
              trigger="click"
              :unmount-on-close="false"
              :popup-offset="10"
              update-at-scroll
              :popup-translate="[-55, 0]"
              v-if="isMobile"
            >
              <a-button :size="'medium'" type="primary">
                <template #icon> <IconSort /> </template>
              </a-button>
              <template #content>
                <a-card>
                  <a-form :model="search" layout="vertical">
                    <a-form-item label="排序">
                      <a-select
                        :size="'large'"
                        v-model:model-value="search.ordering"
                        :options="PostOrderingOptions"
                        @change="writeToQuery(true)"
                      >
                        <template #label="{ data }">
                          <span>
                            <icon-sort
                              style="margin-right: 0.5rem"
                              v-if="!isMobile"
                            />
                            {{ data?.label }}
                          </span>
                        </template>
                      </a-select>
                    </a-form-item>
                  </a-form>
                </a-card>
              </template>
            </a-trigger>
          </a-space>
        </div>
        <!-- END FOR MOBILE -->
        <PullRefresh @refresh="handleQueryChange">
          <a-skeleton animation v-for="i in 3" :key="i" v-if="loading">
            <a-skeleton-line
              :rows="5"
              :widths="['30%', '100%', '100%', '25%', '0']"
            />
          </a-skeleton>
          <a-empty
            style="margin-top: 2em"
            v-else-if="!loading && data.length === 0"
          />
          <div v-else style="display: flex; flex-direction: column">
            <div
              v-for="(post, index) in data"
              :style="{ marginBottom: post.deleted ? '0' : '20px' }"
            >
              <PostCardArticle
                v-if="post.type === PostType.article && !post.deleted"
                :article="post"
              />
              <PostCardMoment
                v-else-if="post.type === PostType.moment && !post.deleted"
                :moment="post"
                @delete="data[index].deleted = true"
              />
            </div>
          </div>
        </PullRefresh>
        <a-pagination
          :size="isMobile ? 'small' : 'medium'"
          :total="pagination.total"
          hide-on-single-page
          :buffer-size="isMobile ? 1 : 2"
          :show-jumper="!isMobile"
          :show-page-size="!isMobile"
          :page-size-options="[20, 50, 100]"
          v-model:current="pagination.page"
          v-model:page-size="pagination.pageSize"
          @change="writeToQuery()"
          @page-size-change="writeToQuery(true)"
        />
      </a-space>

      <Beian v-if="isMobile" />
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss">
.post-list {
  padding: 2.5vh 2vw;
}

.search-bar {
  max-width: 320px;
  width: 50vw;
}

.mobile-search-bar {
  width: max-content;
}

.sider {
  height: fit-content;
  background-color: var(--color-bg-1);
  width: 25vw !important;
  max-width: 300px !important;
  box-shadow: none;
  padding: 10px 0;
  .hitokoto {
    color: var(--color-text-3);
    text-align: center;
    margin: 0 20px;
  }
}
</style>

<style>
.arco-layout-has-sider > div:first-of-type {
  height: fit-content !important;
}
</style>
