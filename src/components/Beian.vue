<script setup lang="ts">
import { ref } from 'vue';
const icp = ref('鲁ICP备2025169297号-1');
if (window.location.hostname === 'qdzx.icu') {
  icp.value = '鲁ICP备2020034769号-4';
}
const year = new Date().getFullYear();
</script>

<template>
  <a-space direction="vertical" class="beian" size="mini">
    <RouterLink :to="{ name: 'about' }">
      <a-link> 版权所有 © {{ year }} QA瓜田 </a-link>
    </RouterLink>
    <a-link href="https://beian.miit.gov.cn/" target="_blank">
      {{ icp }}
    </a-link>
    <a-link
      href="https://beian.mps.gov.cn/#/query/webSearch?code=37021202001667"
      target="_blank"
    >
      <template #icon>
        <div style="margin-top: 0.18em">
          <img src="../assets/gaba.png" style="width: auto; height: 1em" />
        </div>
      </template>
      鲁公网安备37021202001667号
    </a-link>
  </a-space>
</template>

<style scoped lang="scss">
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
