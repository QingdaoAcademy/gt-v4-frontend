<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Link, Message, TableColumnData } from '@arco-design/web-vue';
import router from '../../router';
import ArcoDescriptions from '../../components/ArcoDescriptions.vue';
import { PostFull } from '../../types';
import {
  PostTypeLabel,
  ReviewStatusLabel,
  PostShareWithLabel,
  ReviewStatusOptions,
  PostType,
} from '../../consts/options';
import { formatDatetime } from '../../scripts/time';
import Markdown from '../../components/Markdown.vue';
import { isMobile } from '../../consts/isMobile';
import ReviewMessageTable from '../../components/ReviewMessageTable.vue';
import { RouterLink } from 'vue-router';
import { useStore } from '../../stores';

const store = useStore();

const data = ref({} as PostFull),
  loading = ref(false),
  getData = () => {
    loading.value = true;
    Axios.get(`/admin/post/${router.currentRoute.value.params.id}/`)
      .then(res => {
        data.value = res.data.post;
        versionList.value = res.data.versions;
        versionTable.value.select(data.value.real_version, true);
        getVersion(data.value.real_version);
        reviewStatusForm.value.status = data.value.review_status;
      })
      .catch(errorHandler)
      .finally(() => {
        loading.value = false;
      });
  };
getData();

const descriptionData = computed(() =>
  data.value.id
    ? [
        { label: 'ID', value: data.value.id },
        {
          label: '类型',
          value: PostTypeLabel[data.value.type as keyof typeof PostTypeLabel],
        },
        {
          label: '作者',
          value: h(
            RouterLink,
            {
              to: {
                name: 'admin-role-detail',
                params: { id: data.value.author.id },
              },
            },
            () =>
              h(
                Link,
                () => `[${data.value.author.id}]${data.value.author.name}`
              )
          ),
        },
        { label: '创建时间', value: formatDatetime(data.value.create_time) },
        { label: '编辑时间', value: formatDatetime(data.value.edit_time) },
        { label: '点赞数', value: data.value.like_count },
        { label: '评论数', value: data.value.comment_count },
        { label: '已删除', value: data.value.deleted ? '是' : '否' },
      ]
    : []
);

const versionList = ref([]),
  versionColumns = [
    {
      title: '版本',
      dataIndex: 'version',
      width: 100,
      render: ({ record }) => {
        if (record.version === data.value.real_version)
          return `${record.version}(当前)`;
        else return record.version;
      },
    },
    {
      title: '时间',
      width: 150,
      render: ({ record }) => {
        return formatDatetime(record.create_time);
      },
    },
    {
      title: '创建者',
      width: 150,
      render: ({ record }) => {
        return `${record.user.real_name}(${record.user.username})`;
      },
    },

    {
      title: '审核状态',
      width: 100,
      render: ({ record }) => {
        return ReviewStatusLabel[
          record.review_status as keyof typeof ReviewStatusLabel
        ];
      },
    },
  ] as TableColumnData[],
  versionTable = ref(),
  versionData = ref({} as any),
  getVersion = (version: number) => {
    Axios.get(
      `/admin/post/${router.currentRoute.value.params.id}/version/${version}/`
    )
      .then(res => {
        versionData.value = res.data;
      })
      .catch(errorHandler);
  },
  showVersion = (_rowKeys: any, rowKey: string | number, _record: any) => {
    getVersion(Number(rowKey));
  };

const reviewStatusForm = ref({
    status: 0,
    message: '',
  }),
  saveReviewStatus = () => {
    Axios.post(
      `/admin/post/${router.currentRoute.value.params.id}/review/`,
      reviewStatusForm.value
    )
      .then(() => {
        Message.success('保存成功');
        getData();
      })
      .catch(errorHandler);
  };

const toPost = () => {
  if (data.value.type === PostType.moment)
    router.push({ name: 'moment', params: { id: data.value.id } });
  else if (data.value.type === PostType.article)
    router.push({ name: 'article', params: { id: data.value.id } });
};
</script>

<template>
  <a-typography-title :heading="5"> 帖子信息 </a-typography-title>
  <ArcoDescriptions :data="descriptionData" />
  <div>
    <a-button @click="toPost"> 查看帖子 </a-button>
  </div>

  <a-divider />

  <a-typography-title :heading="5"> 版本信息 </a-typography-title>
  <a-table
    ref="versionTable"
    :data="versionList"
    :loading="loading"
    :columns="versionColumns"
    row-key="version"
    :row-selection="{ type: 'radio' }"
    :pagination="false"
    @select="showVersion"
    style="margin-bottom: 1.5em"
  />
  <ArcoDescriptions
    v-if="versionData.version"
    :data="[
      { label: '版本', value: versionData.version },
      { label: '标题', value: versionData.title || '-' },
      { label: '创建时间', value: formatDatetime(versionData.create_time) },
      { label: '创建者', value: `${versionData.user.real_name}(${versionData.user.username})` },
      { label: '审核状态', value: ReviewStatusLabel[versionData.review_status as keyof typeof ReviewStatusLabel] },
      { label: '分享对象', value: PostShareWithLabel[versionData.share_with as keyof typeof PostShareWithLabel] },
      { label: '允许评论', value: versionData.allow_comment ? '是' : '否' },
    ]"
  />
  <a-tabs type="card-gutter" class="content-preview" lazy-load>
    <a-tab-pane key="text" title="文本预览">
      <pre
        style="font-family: auto; text-wrap: wrap"
        v-text="versionData.content"
      />
    </a-tab-pane>
    <a-tab-pane key="markdown" title="Markdown预览">
      <Markdown :content="versionData.content" />
    </a-tab-pane>
    <a-tab-pane key="images" title="图片预览">
      <a-image-preview-group v-if="versionData.image_items?.length">
        <div
          class="image-container no-select"
          :style="{
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
            margin: '16px 0',
          }"
        >
          <a-image
            :src="`https://image.qaguatian.com/${image.key}`"
            v-for="image in versionData.image_items"
            :key="image.id"
          />
        </div>
      </a-image-preview-group>
      <a-empty v-else />
    </a-tab-pane>
  </a-tabs>

  <a-divider />

  <a-typography-title :heading="5"> 审核信息 </a-typography-title>
  <ReviewMessageTable
    :data="data.review_message"
    :loading="loading"
    style="width: 100%"
  />

  <a-divider />

  <a-typography-title :heading="5"> 管理员操作 </a-typography-title>
  <a-form
    :model="data"
    auto-label-width
    :disabled="!store.permission.admin_forum"
  >
    <a-typography-text style="margin-bottom: 1em; font-size: 1.1em">
      管理员修改审核状态后，会将最新版本设置为管理员设置的审核状态，并将最新版本更新为帖子目前的展示版本。这可能会导致原本能够正常显示旧版本的帖子被隐藏。
    </a-typography-text>
    <a-form-item label="审核状态">
      <a-select
        v-model="reviewStatusForm.status"
        :options="ReviewStatusOptions"
      />
    </a-form-item>
    <a-form-item label="审核信息">
      <a-input v-model="reviewStatusForm.message" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="saveReviewStatus" :loading="loading">
        保存
      </a-button>
    </a-form-item>
  </a-form>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
.content-preview {
  :deep(.arco-tabs-pane) {
    padding: 0.5em 1em;
  }
}

.image-container {
  display: grid;
  gap: 10px;
  :deep(.arco-image-img) {
    width: 100%;
    aspect-ratio: 1/1;
    cursor: pointer;
    object-fit: cover;
  }
}
</style>
