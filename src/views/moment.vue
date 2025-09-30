<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Axios } from '../axios';
import { useRoute } from 'vue-router';
import { useStore } from '../stores';
import PostCardMoment from '../components/PostCardMoment.vue';
import { PostFull } from '../types';
import { ReviewStatus } from '../consts/options';

const route = useRoute();
const store = useStore();
const moment = reactive({} as PostFull);

let firstFetch = true;

const fetchData = () => {
  Axios.get(`/post/${route.params.id}/`).then(res => {
    Object.assign(moment, res.data);
    if (firstFetch && moment.review_status === ReviewStatus.pending) {
      firstFetch = false;
      setTimeout(fetchData, 5000);
    }
  });
};

fetchData();

watch(() => route.params.id, fetchData);
watch(
  () => store.roleId,
  () => {
    Axios.get(`/post/${route.params.id}/like/`).then(res => {
      moment.liked = res.data.liked;
      moment.like_count = res.data.like_count;
    });
  }
);
</script>

<template>
  <div style="max-width: min(900px, 95vw); margin: 2em auto">
    <PostCardMoment detail :moment="moment" v-if="moment.id" />
  </div>
</template>
