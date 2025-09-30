<script setup lang="ts">
import router from '../router';
</script>

<template>
  <a-result status="404" subtitle="哎呀，找不到此页面。">
    <template #extra>
      <a-space>
        <a-button type="primary" @click="router.push('/')"> 前往首页 </a-button>
      </a-space>
    </template>
  </a-result>
</template>
