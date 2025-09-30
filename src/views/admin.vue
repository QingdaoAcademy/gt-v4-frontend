<script setup lang="ts">
import { isMobile } from '../consts/isMobile';
import { useRoute } from 'vue-router';
import { useStore } from '../stores';
import '../styles/admin-components.scss';

const route = useRoute();
const store = useStore();
</script>

<template>
  <a-watermark
    :gap="[50, 50]"
    :alpha="0.5"
    :content="
      store.loggedIn ? [store.user?.real_name as string, store.user?.username as string] : ''
    "
  >
    <a-layout class="admin-layout">
      <a-typography-title :heading="3" v-if="!isMobile && route.meta.title">
        {{ route.meta.title }}
      </a-typography-title>

      <RouterView />
    </a-layout>
  </a-watermark>
</template>

<style lang="scss" scoped>
.admin-layout {
  padding: 2vh 5vw;
  max-width: max(800px, 60vw);
  min-height: 50vh;
  margin: 0 auto;

  h3 {
    margin: 0 0 3vh 0.2em;
  }
}

.pane-wrapper {
  width: 100%;
  justify-content: center;
  align-items: center;
  height: 22rem;
}

:deep(.arco-tabs-content) {
  max-width: min(max(1100px, 50vw), 90vw);
  margin: -1em auto 0 auto;
}
</style>
