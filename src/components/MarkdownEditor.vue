<script setup lang="ts">
import { MdEditor, ToolbarNames, Themes } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import '../styles/markdown.css';
import { isMobile } from '../consts/isMobile';
import { usePersistStore } from '../stores';
import { uploadImage } from '../scripts/uploadImage';
import { Message } from '@arco-design/web-vue';

const persistStore = usePersistStore();

defineProps({
  content: String,
});

defineEmits<{
  (e: 'update:content', content: string): void;
}>();

const toolbarsComputer = [
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    'mermaid',
    'katex',
    '-',
    'revoke',
    'next',
    '=',
    'pageFullscreen',
    'preview',
    'catalog',
  ] as ToolbarNames[],
  toolbarsMobile = [
    'bold',
    'title',
    '-',
    'link',
    'image',
    '-',
    'revoke',
    'next',
    '=',
    'previewOnly',
  ] as ToolbarNames[];

const handleUploadImg = async (
  files: File[],
  callback: (
    urls: string[] | { url: string; alt: string; title: string }[]
  ) => void
) => {
  for (const file of files) {
    uploadImage(
      {
        // @ts-ignore
        fileItem: { file },
        onSuccess(image) {
          callback([
            {
              url: `https://image.qaguatian.com/${image.key}/webp`,
              alt: image.name,
              title: '',
            },
          ]);
        },
        onError(error) {
          console.log(error);
          Message.error('上传失败');
        },
        onProgress(_progress) {},
      },
      'post'
    );
  }
};
</script>

<template>
  <MdEditor
    cropperJs="https://cdn.staticfile.org/cropperjs/1.5.12/cropper.min.js"
    cropperCss="https://cdn.staticfile.org/cropperjs/1.5.12/cropper.min.css"
    :modelValue="content"
    :preview="!isMobile"
    @update:modelValue="$emit('update:content', $event)"
    :toolbars="isMobile ? toolbarsMobile : toolbarsComputer"
    :theme="persistStore.currentTheme as Themes"
    placeholder="开始使用 Markdown 编辑..."
    autoDetectCode
    @onUploadImg="handleUploadImg"
  />
</template>

<style lang="scss" scoped>
:deep(.cm-content) {
  font-family: auto;
  color: var(--color-text-2);
}
</style>
