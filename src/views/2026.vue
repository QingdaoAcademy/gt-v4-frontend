<script setup lang="ts">
import { ref } from 'vue';

const code = ref(
  document.location.search.replace('?code=', '') || '未找到识别码'
);
</script>

<template>
  <a-typography class="year-page">
    <a-typography-title>
      QA 瓜田
      <br />
      2026 狂欢节活动
    </a-typography-title>
    <br />
    <a-typography-title :heading="4" copyable :copy-text="code">
      你找到的标签识别码为：{{ code }}
    </a-typography-title>
    <br />
    <a-typography-paragraph style="font-size: 1.2em">
      请在 QA 瓜田发帖，附本页面的截图以及你找到 NFC 标签地点的照片。
      <br />
      下午五点我们将在瓜田公布各标签对应奖项，敬请留意。
    </a-typography-paragraph>
  </a-typography>
</template>

<style lang="scss" scoped>
.year-page {
  padding: 20px min(5vw, 100px);
  text-align: center;
  p {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
