<script setup lang="ts">
import router from '../router';
import { Role } from '../types';
import Avatar from './Avatar.vue';
defineProps<{
  role: Role | undefined;
}>();
</script>

<template>
  <a-card>
    <a-skeleton animation v-if="role === undefined" style="margin-top: 1em">
      <a-space direction="vertical" :style="{ width: '100%' }" :size="20">
        <a-space direction="horizontal" style="overflow: hidden; width: 100%">
          <a-skeleton-shape shape="circle" size="large" />
          <a-skeleton-line
            :rows="2"
            :line-height="20"
            :widths="['100px', '200px']"
          />
        </a-space>
        <a-skeleton-line
          :rows="1"
          :line-spacing="10"
          :line-height="20"
          :widths="['100%']"
        />
      </a-space>
    </a-skeleton>

    <div
      v-if="role"
      @click="
        if (role.id) router.push({ name: 'role', params: { id: role.id } });
      "
    >
      <a-space style="margin-bottom: 0.7em">
        <Avatar :role="role" :size="50" style="margin: 0 10px 0 0" />
        <div>
          <a-typography-title
            :heading="5"
            :style="{
              margin: 0,
              color: role?.verify ? 'var(--verify-color)' : '',
            }"
          >
            {{ role?.name }}
            <a-tooltip
              :content="`认证信息：${role.verify}`"
              v-if="role?.verify"
            >
              <IconCheckCircleFill />
            </a-tooltip>
          </a-typography-title>
          <a-typography-text type="secondary">
            {{ role?.description || '这个人很懒，什么都没留下' }}
          </a-typography-text>
        </div>
      </a-space>
    </div>
  </a-card>
</template>

<style lang="scss" scoped>
.arco-skeleton {
  :deep(.arco-space-item) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
