<script setup lang="ts">
import { isMobile } from '../consts/isMobile';
import PostCardArticle from '../components/PostCardArticle.vue';
import PostCardMoment from '../components/PostCardMoment.vue';
import { reactive, ref, watch, computed } from 'vue';
import { _writeToQuery } from '../scripts/writeToQuery';
import { router } from '../router';
import { sharedFunctions, useStore } from '../stores';
import { useRoute } from 'vue-router';
import { Axios, errorHandler } from '../axios';
import { PostType, PostOrderingOptions } from '../consts/options';
import { PostFull, RoleFull } from '../types';
import RoleCardLarge from '../components/RoleCardLarge.vue';

const store = useStore();
const route = useRoute();

const roleInfo = ref({} as RoleFull);

const getRoleInfo = () => {
  Axios.get(`/role/${route.params.id}/`).then(res => {
    roleInfo.value = res.data.data;
  });
};

getRoleInfo();

const rolePageTabs = computed(() => {
  const tabs = [
    { key: 1, title: '全部内容' },
    { key: 2, title: '动态' },
    { key: 3, title: '文章' },
  ];
  if (roleInfo.value.show_like || store.isCurrentRole(roleInfo.value)) {
    tabs.push({ key: 4, title: '点赞过的' });
  }
  return tabs;
});

const search = reactive({
    search: '',
    ordering: '-update_time',
    type: 1,
  }),
  pagination = reactive({ page: 1, pageSize: 20, total: 0 }),
  writeToQuery = _writeToQuery(search, pagination, router);
const loading = ref(false),
  data = ref([] as PostFull[]);

const handleQueryChange = () => {
  if (loading.value) return;
  if (route.name !== 'role') return;

  loading.value = true;

  search.search = String(route.query.search || '');
  search.ordering = String(route.query.ordering || '-update_time');

  for (const key in pagination) {
    if (route.query[key])
      pagination[key as keyof typeof pagination] = parseInt(
        route.query[key] as string
      );
  }

  if (route.query.page) pagination.page = parseInt(route.query.page as string);
  if (route.query.pageSize)
    pagination.pageSize = parseInt(route.query.pageSize as string);

  const _data = {
    page: pagination.page,
    page_size: pagination.pageSize,
    author: search.type !== 4 ? route.params.id : undefined,
    liked_by: search.type === 4 ? route.params.id : undefined,
    type: [2, 3].includes(search.type) ? search.type - 1 : undefined,
    search: search.search,
    ordering: search.ordering,
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

const followRole = () => {
  roleInfo.value.followLoading = true;
  Axios.post(`/role/${roleInfo.value.id}/follow/`)
    .then(res => {
      roleInfo.value.followed = res.data.followed;
      roleInfo.value.follower_count = res.data.follower_count;
    })
    .catch(errorHandler)
    .finally(() => (roleInfo.value.followLoading = false));
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
watch(
  () => route.params.id,
  () => {
    getRoleInfo();
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
    <a-affix target="#main-scroll" :offset-top="15">
      <a-layout-sider v-if="!isMobile" class="sider">
        <a-alert v-if="roleInfo.is_private" style="margin: 1.5em 0.5em 0 0.5em">
          匿名角色仅所有者可查看详情
        </a-alert>
        <RoleCardLarge :role="roleInfo" @follow="followRole" />
      </a-layout-sider>
    </a-affix>

    <a-layout-content>
      <RoleCardLarge :role="roleInfo" v-if="isMobile" @follow="followRole" />

      <a-space direction="vertical" fill class="post-list" :size="30">
        <a-tabs
          hide-content
          v-model:active-key="search.type"
          @change="handleQueryChange"
        >
          <a-tab-pane
            v-for="tab of rolePageTabs"
            :key="tab.key"
            :title="tab.title"
          />
        </a-tabs>
        <div>
          <a-alert
            style="margin: -1em 0 1.5em 0"
            v-if="search.type === 4 && !roleInfo.show_like"
          >
            根据设置，你的点赞内容仅你可见
          </a-alert>
          <a-space>
            <a-select
              :size="isMobile ? 'medium' : 'large'"
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
              placeholder="搜索"
              search-button
              v-model="search.search"
              @search="writeToQuery(true)"
              @keydown.enter="writeToQuery(true)"
            />
          </a-space>
        </div>

        <a-skeleton animation v-for="i in 3" :key="i" v-if="loading">
          <a-skeleton-line :rows="4" :widths="['30%', '100%', '100%', '25%']" />
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
          @change="writeToQuery(false)"
          @page-size-change="writeToQuery(true)"
        />
      </a-space>
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss">
.post-list {
  padding: 2.5vh 2vw;
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

  .img {
    display: block;
    margin: 0 auto;
  }

  .flex-justify {
    display: flex;
    justify-content: center;
  }

  :deep(.arco-layout-sider-children) {
    overflow: hidden;
  }
}

.beian {
  display: flex;
  align-items: center;
  color: var(--color-text-3);
  margin: 1.5em 0;

  .arco-link {
    color: var(--color-text-3);
    font-size: 0.9em;
  }
}
</style>

<style>
.arco-layout-has-sider > div:first-of-type {
  height: fit-content !important;
}
</style>
