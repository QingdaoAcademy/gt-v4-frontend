<script setup lang="ts">
import { usePersistStore } from '../stores';
import { ref, watch, onMounted } from 'vue';
import '../assets/hccaptcha';
const persistStore = usePersistStore();

const props = defineProps<{
  token: string;
}>();

const emit = defineEmits(['update:token']);

const hccaptchaRef = ref<any>(null);

watch(
  () => props.token,
  newVal => {
    if (newVal === '') {
      hccaptchaRef.value?.reset();
    }
  }
);

onMounted(() => {
  hccaptchaRef.value.onSuccess = (token: string) => {
    emit('update:token', token);
  };
});
</script>

<template>
  <hcc-captcha
    style="max-width: 300px"
    ref="hccaptchaRef"
    :theme="persistStore.currentTheme"
  />
</template>
