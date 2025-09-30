<script setup lang="ts">
import { Alumni } from '../types/alumni';
import { PropType, ref } from 'vue';

defineProps({
  alumni: {
    type: Object as PropType<Alumni>,
    required: true,
  },
});

const generateAcademicBackground = (alumni: Alumni) => {
  const result: string[] = [];
  const bg = alumni.academic_background;
  if (bg?.length >= 2) {
    result.push(bg[0]);
    result.push(`+${bg.length - 1}项经历...`);
  } else {
    result.push(...bg);
  }
  return result;
};
</script>

<template>
  <a-card class="alumni-container">
    <div class="header">
      <div class="alumni-name">{{ alumni.name }}</div>
      <a-avatar
        :auto-fix-font-size="false"
        class="override-avatar alumni-image"
        :image-url="alumni.avatar"
        :size="105"
        object-fit="contain"
      >
        <div style="font-size: 2.3rem">{{ alumni.name?.slice(0, 1) }}</div>
      </a-avatar>
    </div>
    <div class="information">
      <a-descriptions size="large" :column="1">
        <a-descriptions-item label="姓名">
          {{ alumni.name }}
        </a-descriptions-item>
        <a-descriptions-item label="性别">
          {{ alumni.gender || '不愿透露' }}
        </a-descriptions-item>
        <a-descriptions-item label="毕业年份">
          {{ alumni.year }}
        </a-descriptions-item>
        <a-descriptions-item label="学习经历">
          <div v-if="alumni.academic_background.length === 0">暂无</div>
          <a-space v-else direction="vertical">
            <a-tag v-for="tag of generateAcademicBackground(alumni)">{{
              tag
            }}</a-tag>
          </a-space>
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </a-card>
</template>
<style lang="scss" scoped>
.header {
  position: absolute;
  top: 2rem;
  left: 0;
  width: 100%;
  height: 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-neutral-3);
}

.alumni-container {
  padding: 0 !important;
  height: 20rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 1rem #0000002f;
}
.alumni-container:hover {
  cursor: pointer;
  // transform: scale(1.005);
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 1rem rgba(var(--primary-6), 0.5);
}

.alumni-name {
  margin-left: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.alumni-image {
  // position: absolute;
  z-index: 51;
  background-color: #888;
  border: 0.5rem solid var(--color-bg-2);
  margin-right: 1rem;
}

.override-avatar :deep(.arco-avatar-image img) {
  width: 100% !important;
  height: 100% !important;
  // object-fit: cover !important;
}

.information {
  position: absolute;
  top: 8rem;
  // width: calc(100% - 2rem);
  // padding: 0 1rem;
}
</style>
