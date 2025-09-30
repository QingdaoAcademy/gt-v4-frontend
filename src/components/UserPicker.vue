<script setup lang="ts">
import { ref, PropType, computed } from 'vue';
import { SelectOptionData } from '@arco-design/web-vue';
import { Axios } from '../axios';
import { UserBrief } from '../types';

const props = defineProps({
  userId: {
    type: Number as PropType<number>,
    default: undefined,
  },
  userIds: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  defaultOptions: {
    type: Array as PropType<UserBrief[]>,
    default: () => [],
  },
  multiple: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  source: {
    type: String as PropType<'yunxiao' | 'user'>,
    default: 'user',
  },
});

const defaultOptions = computed(() => {
  const data = props.defaultOptions.map(
    (user: UserBrief): SelectOptionData => ({
      label: `${user.real_name}(${user.username})`,
      value: user.id,
      disabled: user.disabled ?? false,
    })
  );
  return data;
});

const emit = defineEmits<{
  (e: 'update:userIds', userIds: number[]): void;
  (e: 'update:userId', userId: number): void;
}>();

const options = ref([] as SelectOptionData[]);
const loading = ref(false);

const handleSearch = (value: string) => {
  loading.value = true;
  Axios.get(`/${props.source}/`, {
    params: {
      search: value,
    },
  })
    .then(res => {
      options.value = [];
      const values = [];
      for (const option of defaultOptions.value) {
        options.value.push(option);
        values.push(option.value);
      }
      for (const user of res.data.results) {
        if (!values.includes(user.id)) {
          options.value.push({
            label: `${user.real_name}(${user.username})`,
            value: user.id,
          });
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleUpdate = (value: any) => {
  if (props.multiple) {
    emit('update:userIds', value as number[]);
  } else {
    emit('update:userId', value as number);
  }
};

const getFallbackOptions = (value: any): SelectOptionData => {
  if (typeof value === 'number') {
    for (const user of props.defaultOptions) {
      if (user.id === value) {
        return {
          label: `${user.real_name}(${user.username})`,
          value,
          disabled: user.disabled ?? false,
        };
      }
    }
  }
  return {
    label: `未知用户(ID=${value})`,
    value,
  };
};
</script>

<template>
  <a-select
    :model-value="multiple ? userIds : userId"
    @update:model-value="handleUpdate"
    :options="options"
    :loading="loading"
    placeholder="请选择用户"
    :fallback-option="getFallbackOptions"
    :multiple="multiple"
    allow-search
    @search="handleSearch"
    :filter-option="false"
    :show-extra-options="false"
  >
    <template #empty>
      <a-empty description="输入姓名或学号以搜索" style="margin: 0.8em 0" />
    </template>
  </a-select>
</template>
