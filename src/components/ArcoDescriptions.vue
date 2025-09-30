<script setup lang="ts">
defineProps<{
  data: any;
}>();
</script>

<template>
  <a-descriptions
    :data="data"
    :column="{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4 }"
    size="large"
    :align="{ label: 'right' }"
  />
</template>
