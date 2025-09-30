<script setup lang="ts">
import isMobile from '../consts/isMobile';
import { copyText } from '../scripts/copy';
import { RoleFull } from '../types';
import { useStore } from '../stores';
import Avatar from './Avatar.vue';
import { ref } from 'vue';
import { Axios, errorHandler } from '../axios';
import AvatarName from './AvatarName.vue';

const store = useStore();

const props = defineProps<{
  role: RoleFull | undefined;
}>();

const emit = defineEmits(['follow']);

const open = (url: string) => {
  url = url.trim();
  if (!url.startsWith('http')) {
    url = 'http://' + url;
  }
  window.open(url, '_blank');
};

const visible = ref(false),
  roleList = ref([] as any[]),
  pagination = ref({
    page: 1,
    page_size: 20,
    total: 0,
  }),
  type = ref(null as 'followings__following' | 'followers__follower' | null);

const getRoles = (_type?: 'followings__following' | 'followers__follower') => {
  if (_type) {
    type.value = _type;
    pagination.value.page = 1;
    pagination.value.total = 0;
    visible.value = true;
  }
  if (type.value === null) return;
  Axios.get('/role/', {
    params: {
      [type.value]: props.role?.id,
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    },
  })
    .then(res => {
      roleList.value = res.data.results;
      pagination.value.total = res.data.count;
    })
    .catch(errorHandler);
};
</script>

<template>
  <div style="text-align: center; margin-top: 2.5em">
    <a-space direction="vertical" size="mini">
      <Avatar :size="128" :role="role" style="text-align: center" />

      <a-typography-title style="text-align: center" :heading="3">
        {{ role?.name }}
      </a-typography-title>

      <a-space fill wrap style="justify-content: center; user-select: none">
        <a-trigger
          :trigger="isMobile ? 'click' : 'hover'"
          update-at-scroll
          :popup-translate="[0, 10]"
          v-if="role?.show_user_info"
        >
          <a-tag color="green" size="large">
            <template #icon> <IconSubscribed /> </template>
            已实名
          </a-tag>
          <template #content>
            <a-card>
              实名信息：{{ role.user_info?.real_name }}({{
                role.user_info?.student_id
              }})
            </a-card>
          </template>
        </a-trigger>
        <a-trigger
          update-at-scroll
          :trigger="isMobile ? 'click' : 'hover'"
          :popup-translate="[0, 10]"
          v-if="role?.verify"
        >
          <a-tag color="blue" size="large">
            <template #icon> <IconCheckCircleFill /> </template>
            已认证
          </a-tag>
          <template #content>
            <a-card> 认证信息：{{ role?.verify }} </a-card>
          </template>
        </a-trigger>
        <a-button
          v-if="!store.isCurrentRole(role)"
          color="gray"
          size="medium"
          @click="emit('follow')"
          :loading="role?.followLoading"
        >
          <template #icon> <IconUserAdd /> </template>
          {{ role?.followed ? '已关注' : '关注' }}
        </a-button>
      </a-space>
    </a-space>
    <a-divider style="max-width: 80vw !important" />

    <a-space :size="60" class="no-select">
      <a-statistic
        title="粉丝"
        :value="role?.follower_count"
        @click="getRoles('followings__following')"
      />
      <a-statistic
        title="关注"
        :value="role?.following_count"
        @click="getRoles('followers__follower')"
      />
    </a-space>
    <a-divider style="max-width: 80vw !important" />

    <a-typography-paragraph style="font-size: 1.1em; margin: 0.5em 0">
      {{ role?.description || '这个人很懒，什么都没留下' }}
    </a-typography-paragraph>

    <a-space size="mini">
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.wechat"
        @click="copyText(role?.external_links?.wechat)"
      >
        <IconWechat size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.qq"
        @click="copyText(role?.external_links?.qq)"
      >
        <IconQq size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.twitter"
        @click="open(role?.external_links?.twitter)"
      >
        <IconTwitter size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.github"
        @click="open(role?.external_links?.github)"
      >
        <IconGithub size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.douyin"
        @click="open(role?.external_links?.douyin)"
        title="别问为什么我的颜色不一样，开发者用的框架是我家的"
      >
        <IconTiktokColor size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.weibo"
        @click="open(role?.external_links?.weibo)"
      >
        <IconWeibo size="1.2em" />
      </a-button>
      <a-button
        type="text"
        shape="circle"
        v-if="role?.external_links?.other"
        @click="open(role?.external_links?.other)"
      >
        <IconLink size="1.2em" />
      </a-button>
    </a-space>
  </div>

  <a-modal
    v-model:visible="visible"
    :title="type === 'followings__following' ? '粉丝' : '关注'"
    :footer="false"
  >
    <a-list
      :pagination-props="pagination"
      @page-change="
        page => {
          pagination.page = page;
          getRoles();
        }
      "
    >
      <a-list-item v-for="role in roleList" :key="role.id">
        <AvatarName :role="role" />
      </a-list-item>
    </a-list>
  </a-modal>
</template>
