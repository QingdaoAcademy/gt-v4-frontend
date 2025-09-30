import { computed } from 'vue';

export const isMobile = computed(() => {
  return window.innerWidth <= 960;
});

export default isMobile;
