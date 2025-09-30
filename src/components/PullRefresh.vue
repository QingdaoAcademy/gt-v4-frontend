<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  onRefresh: () => void | Promise<void>;
}>();

const startY = ref(0);
const distance = ref(0);
const refreshing = ref(false);
const container = ref<HTMLElement | null>(null);

const THRESHOLD = 80; // 触发刷新的阈值

const touchStart = (e: TouchEvent) => {
  if (window.scrollY <= 0.1 && container.value?.scrollTop === 0) {
    startY.value = e.touches[0].clientY;
  }
};

const touchMove = (e: TouchEvent) => {
  if (!startY.value) return;

  const currentY = e.touches[0].clientY;
  const diff = currentY - startY.value;

  if (diff > 0 && container.value?.scrollTop === 0) {
    distance.value = Math.min(diff * 0.7, THRESHOLD * 1.15);
    e.preventDefault();
  }
};

const touchEnd = async () => {
  if (distance.value >= THRESHOLD && !refreshing.value) {
    refreshing.value = true;
    try {
      await props.onRefresh();
    } finally {
      refreshing.value = false;
    }
  }
  startY.value = 0;
  distance.value = 0;
};

onMounted(() => {
  container.value?.addEventListener('touchstart', touchStart);
  container.value?.addEventListener('touchmove', touchMove);
  container.value?.addEventListener('touchend', touchEnd);
});

onUnmounted(() => {
  container.value?.removeEventListener('touchstart', touchStart);
  container.value?.removeEventListener('touchmove', touchMove);
  container.value?.removeEventListener('touchend', touchEnd);
});
</script>

<template>
  <div class="pull-to-refresh" ref="container">
    <div
      class="pull-to-refresh__indicator"
      :style="{ height: `${distance}px` }"
    >
      <span v-if="refreshing">刷新中...</span>
      <span v-else-if="distance >= 15">
        <IconRefresh
          :rotate="(distance >= THRESHOLD ? THRESHOLD : distance) * 2.5"
        />
        {{ distance >= THRESHOLD ? '释放刷新' : '下拉刷新' }}
      </span>
    </div>
    <div class="pull-to-refresh__content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pull-to-refresh {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  &__indicator {
    height: 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-3);
    font-size: 15px;
    transition: height 0.2s;
  }

  &__content {
    min-height: 100%;
  }
}
</style>
