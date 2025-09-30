<script setup lang="ts">
import { PropType } from 'vue';
import { RoleBrief } from '../types';
import { sharedFunctions } from '../stores';
import router from '../router';

const props = defineProps({
  role: {
    type: Object as PropType<RoleBrief | null | undefined>,
    required: false,
  },
  size: {
    type: Number,
    default: 28,
  },
  edit: {
    type: Boolean,
    default: false,
  },
  switchRole: {
    type: Boolean,
    default: false,
  },
  toRolePage: {
    type: Boolean,
    default: false,
  },
});

const getColorFromId = (name: string): string => {
  // Use a simple hash function to generate a seed
  const seed = name
    .split('')
    .reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);

  // Generate RGB components
  let r = (seed & 0xff0000) >> 16;
  let g = (seed & 0x00ff00) >> 8;
  let b = seed & 0x0000ff;

  // 调整亮度和饱和度
  const adjustColor = (component: number) => {
    // 增加饱和度
    const saturated = Math.min(255, component * 1.2);
    // 调整亮度,使颜色更鲜艳
    return Math.floor(128 + (saturated - 128) * 1.2);
  };

  r = adjustColor(r);
  g = adjustColor(g);
  b = adjustColor(b);

  // 如果颜色太深，增加亮度
  const minBrightness = 150;
  const currentBrightness = r + g + b;
  if (currentBrightness < minBrightness) {
    const brightnessIncrease = Math.ceil(
      (minBrightness - currentBrightness) / 3
    );
    r = Math.min(255, r + brightnessIncrease);
    g = Math.min(255, g + brightnessIncrease);
    b = Math.min(255, b + brightnessIncrease);
  }

  // Convert to hex
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const handleClick = () => {
  if (props.switchRole) {
    sharedFunctions.switchRole();
  } else if (props.toRolePage) {
    router.push({ name: 'role', params: { id: props.role?.id } });
  }
};
</script>

<template>
  <a-avatar
    v-if="role?.avatar || role === null"
    :size="size"
    :image-url="role?.avatar || 'https://image.qaguatian.com/anonymous.jpg/avatar'"
    @click="handleClick"
  >
    <template #trigger-icon v-if="edit || switchRole">
      <IconEdit v-if="edit" />
      <IconSwap v-else-if="switchRole" />
    </template>
  </a-avatar>
  <a-avatar
    v-else-if="role?.name"
    :size="size"
    :style="{ backgroundColor: getColorFromId(role.name) }"
    :trigger-icon-style="{}"
    @click="handleClick"
  >
    <template #trigger-icon v-if="edit || switchRole">
      <IconEdit v-if="edit" />
      <IconSwap v-else-if="switchRole" />
    </template>
    {{ role.name.slice(0, 2) || '' }}
  </a-avatar>
  <a-avatar v-else :size="size">
    <IconUser style="font-size: 1.2em" />
  </a-avatar>
</template>
