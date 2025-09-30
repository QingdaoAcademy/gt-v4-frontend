<script setup lang="ts">
import { MdPreview, Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import '../styles/markdown.css';
import { usePersistStore } from '../stores';

const persistStore = usePersistStore();

defineProps({
  content: String,
});
</script>

<template>
  <MdPreview
    previewOnly
    :modelValue="content"
    :theme="persistStore.currentTheme as Themes"
  />
</template>
