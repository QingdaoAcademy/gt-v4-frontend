<script setup lang="ts">
import { PropType } from 'vue';
import { PostFull } from '../types';
import { Axios } from '../axios';
import { Message } from '@arco-design/web-vue';
import { useStore } from '../stores';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const router = useRouter(),
  route = useRoute();
const props = defineProps({
  post: {
    type: Object as PropType<PostFull>,
    required: true,
  },
});
const deleteArticle = () => {
  Axios.delete(`/post/${route.params.id}/`).then(() => {
    Message.success('删除成功');
    router.push({ name: 'index' });
  });
};
</script>

<template>
  <a-card>
    <a-space wrap>
      <span> 操作： </span>
      <RouterLink
        :to="{ name: 'edit', query: { id: props.post.id } }"
        v-if="store.isCurrentRole(props.post.author)"
      >
        <a-button> 修改 </a-button>
      </RouterLink>
      <RouterLink
        :to="{ name: 'admin-post-detail', params: { id: props.post.id } }"
      >
        <a-button> 版本信息 </a-button>
      </RouterLink>
      <a-popconfirm
        content="你确定要删除此文章吗？"
        type="warning"
        v-if="store.isCurrentRole(props.post.author)"
        @ok="deleteArticle"
      >
        <a-button status="danger"> 删除 </a-button>
      </a-popconfirm>
    </a-space>
  </a-card>
</template>
