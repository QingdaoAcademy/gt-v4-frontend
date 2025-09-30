<script setup lang="ts">
import { PropType } from 'vue';
import { RoleBrief } from '../types';
import Avatar from './Avatar.vue';
import router from '../router';

defineProps({
  role: {
    type: Object as PropType<RoleBrief | null | undefined>,
    required: false,
  },
  size: {
    type: Number,
    default: 28,
  },
});
</script>

<template>
  <span
    :class="['no-select']"
    style="display: inline-flex; align-items: center"
    @click="
      role?.id ? router.push({ name: 'role', params: { id: role.id } }) : ''
    "
  >
    <Avatar
      :size="size"
      :role="role"
      :style="{ marginRight: '8px', cursor: role?.id ? 'pointer' : '' }"
    />
    <a-typography-text
      :style="{
        fontSize: `${1.05 * (size / 28)}em`,
        color: role?.verify ? 'var(--verify-color)' : '',
      }"
      :class="['text-container', role?.id ? 'pointer link' : '']"
    >
      {{ role == null ? '匿名角色' : role?.name }}
      <a-tooltip :content="`认证信息：${role.verify}`" v-if="role?.verify">
        <IconCheckCircleFill />
      </a-tooltip>
    </a-typography-text>
  </span>
</template>
<style scoped lang="scss">
.pointer {
  cursor: pointer;
}

.text-container {
  padding: 0 0.5rem;
  border-radius: 0.2rem;
}

.link {
  transition: all 0.2s ease;
}
.link:hover {
  background-color: var(--color-neutral-2);
}
</style>
