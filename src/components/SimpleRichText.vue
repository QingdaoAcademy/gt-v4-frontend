<script setup lang="ts">
import { computed } from 'vue';
import { xss, xssAll } from '../scripts/xss';

const props = defineProps<{
  content: string;
}>();

const richContent = computed(() => {
  const urlRegex = /(https?):\/\/[-A-Za-z0-9]+(?:\.[-A-Za-z0-9]+)+(?::\d+)?(?:\/[-A-Za-z0-9+&@#\/%?=~_|!:,.]*)?/g;
  const content = xssAll(props.content);
  const html = content.replace(
    urlRegex,
    url => `<a href="${url}" target="_blank" class="link">${url}</a>`
  );
  return xss(html);
});
</script>

<template>
  <pre class="simple-rich-text" v-html="richContent" />
</template>

<style lang="scss">
.simple-rich-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
  .link {
    color: rgb(var(--link-6));
  }
}
</style>
