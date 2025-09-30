<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Message, Link } from '@arco-design/web-vue';
import router from '../../router';
import { RouterLink } from 'vue-router';
import ArcoDescriptions from '../../components/ArcoDescriptions.vue';
import { PostComment } from '../../types';
import { formatDatetime } from '../../scripts/time';
import ReviewMessageTable from '../../components/ReviewMessageTable.vue';
import { ReviewStatusLabel, ReviewStatusOptions } from '../../consts/options';

const data = ref({} as PostComment),
  loading = ref(false),
  getData = () => {
    loading.value = true;
    Axios.get(`/admin/comment/${router.currentRoute.value.params.id}/`)
      .then(res => {
        data.value = res.data;
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
        { label: '创建时间', value: formatDatetime(data.value.create_time) },
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
        {
          label: '用户',
          value: h(
            RouterLink,
            {
              to: {
                name: 'admin-user-detail',
                params: { id: data.value.user?.id },
              },
            },
            () =>
              h(
                Link,
                () =>
                  `${data.value.user?.real_name}(${data.value.user?.username})`
              )
          ),
        },
        { label: '点赞数', value: data.value.like_count },
        {
          label: '隐藏状态',
          value: data.value.hidden ? '隐藏' : '显示',
        },
        {
          label: '已删除',
          value: data.value.deleted ? '是' : '否',
        },
        {
          label: '置顶状态',
          value: data.value.pinned ? '置顶' : '未置顶',
        },
        {
          label: '深度',
          value: data.value.depth,
        },
        {
          label: '回复评论',
          value: data.value.reply_to
            ? h(
                RouterLink,
                {
                  to: {
                    name: 'admin-comment-detail',
                    params: { id: data.value.reply_to.id },
                  },
                },
                () => h(Link, () => `[${data.value.reply_to}]`)
              )
            : '无',
        },
        {
          label: '父评论',
          value: data.value.parent
            ? h(
                RouterLink,
                {
                  to: {
                    name: 'admin-comment-detail',
                    params: { id: data.value.parent },
                  },
                },
                () => h(Link, () => `[${data.value.parent}]`)
              )
            : '无',
        },
        {
          label: '帖子',
          value: h(
            RouterLink,
            {
              to: {
                name: 'admin-post-detail',
                params: { id: data.value.post?.id },
              },
            },
            () =>
              h(
                Link,
                () =>
                  `[${data.value.post?.id}]${data.value.post?.brief_content}`
              )
          ),
        },
        {
          label: '审核状态',
          value:
            ReviewStatusLabel[
              data.value.review_status as keyof typeof ReviewStatusLabel
            ],
        },
      ]
    : []
);

const reviewStatusForm = ref({
    status: 0,
    message: '',
  }),
  saveReviewStatus = () => {
    Axios.post(
      `/admin/comment/${router.currentRoute.value.params.id}/review/`,
      reviewStatusForm.value
    )
      .then(() => {
        Message.success('保存成功');
        getData();
      })
      .catch(errorHandler);
  };
</script>

<template>
  <a-typography-title :heading="5"> 评论信息 </a-typography-title>
  <ArcoDescriptions :data="descriptionData" />
  <RouterLink :to="{ name: 'comment', params: { id: data.id } }">
    <a-button> 查看评论 </a-button>
  </RouterLink>

  <a-divider />

  <a-typography-title :heading="5"> 评论内容 </a-typography-title>
  <a-typography-paragraph style="font-size: 1.1em">
    {{ data.content }}
  </a-typography-paragraph>

  <a-divider />

  <a-typography-title :heading="5"> 审核信息 </a-typography-title>
  <ReviewMessageTable :data="data.review_message" :loading="loading" />

  <a-divider />

  <a-typography-title :heading="5"> 管理员操作 </a-typography-title>
  <a-form :model="data" auto-label-width>
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
</style>
