<script setup lang="ts">
import Axios from '../axios';
import { NotificationType, PostType } from '../consts/options';
import router from '../router';
import { formatRelativeTime } from '../scripts/time';
import { sharedFunctions, useStore } from '../stores';
import { ref, watch } from 'vue';

const store = useStore();

const visible = ref(false);
const notifications = ref([] as any),
  pagination = ref({
    page: 1,
    page_size: 20,
    total: 0,
  });

let onCloseCallback = () => {};

sharedFunctions.showNotification = (onClose: (() => void) | null = null) => {
  visible.value = true;
  if (onClose) {
    onCloseCallback = onClose;
  }
};

const getNotification = () => {
  if (!store.loggedIn) return;
  Axios.get('/notification/', {
    params: {
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    },
  }).then(res => {
    notifications.value = res.data.results;
    pagination.value.total = res.data.count;

    store.unreadNotificationCount = res.data.unread_count;
    store.currentRole!.unread_notification_count = res.data.unread_count;
  });
};

getNotification();
setInterval(getNotification, 1000 * 60 * 5);
watch(() => store.roleId, getNotification);

const getTitle = (n: any) => {
    if (n.type === NotificationType.POST_LIKE) {
      return '有人点赞了你的帖子';
    } else if (n.type === NotificationType.COMMENT_LIKE) {
      return '有人点赞了你的评论';
    } else if (n.type === NotificationType.COMMENT_REPLY) {
      return `${n.content.reply_author_name}回复了你的评论`;
    } else if (n.type === NotificationType.POST_COMMENT) {
      return `${n.content.comment_author_name}评论了你的帖子`;
    }
  },
  getDescription = (n: any) => {
    if (n.type === NotificationType.POST_LIKE) {
      return `${n.content.role_names}点赞了你的帖子：${n.content.post_info}`;
    } else if (n.type === NotificationType.COMMENT_LIKE) {
      return `${n.content.role_names}点赞了你的评论：${n.content.comment_info}`;
    } else if (n.type === NotificationType.COMMENT_REPLY) {
      return n.content.reply_comment_info;
    } else if (n.type === NotificationType.POST_COMMENT) {
      return n.content.comment_info;
    }
  },
  go = (n: any) => {
    Axios.post(`/notification/${n.id}/read/`).then(() => {
      n.is_read = true;
      // @ts-ignore
      if (store.currentRole.unread_notification_count > 0)
        // @ts-ignore
        store.currentRole.unread_notification_count -= 1;
      if (store.unreadNotificationCount > 0) store.unreadNotificationCount -= 1;
    });
    if (
      [
        NotificationType.POST_LIKE,
        NotificationType.POST_COMMENT,
        NotificationType.COMMENT_LIKE,
        NotificationType.COMMENT_REPLY,
      ].includes(n.type)
    ) {
      router.push({
        name: n.content.post_type === PostType.moment ? 'moment' : 'article',
        params: { id: n.content.post_id },
      });
    }
    visible.value = false;
  };

const readAll = () => {
    Axios.post('/notification/read_all/').then(() => getNotification());
  },
  deleteAll = () => {
    Axios.delete('/notification/').then(() => getNotification());
  };

const close = () => {
  onCloseCallback();
};
</script>

<template>
  <a-drawer
    width="min(80vw, 500px)"
    v-model:visible="visible"
    unmountOnClose
    title="通知"
    hide-cancel
    @beforeOpen="getNotification"
    @beforeClose="close"
  >
    <div style="margin-bottom: 45px">
      <a-space style="float: right">
        <a-button @click="readAll"> 全部已读 </a-button>
        <a-button @click="deleteAll"> 全部删除 </a-button>
      </a-space>
    </div>
    <a-list
      :pagination-props="{
        current: pagination.page,
        pageSize: pagination.page_size,
        total: pagination.total,
      }"
      @pageChange="
        page => {
          pagination.page = page;
          getNotification();
        }
      "
    >
      <a-list-item
        v-for="n in notifications"
        :key="n.id"
        action-layout="vertical"
        @click="go(n)"
        :style="n.is_read ? '' : 'font-weight: bold'"
      >
        <a-list-item-meta
          :title="getTitle(n)"
          :description="getDescription(n)"
        />
        <template #actions>
          <div
            style="
              font-size: 12px;
              color: var(--color-text-3);
              margin-top: -8px;
            "
          >
            {{ formatRelativeTime(n.time) }}
          </div>
        </template>
      </a-list-item>
    </a-list>
  </a-drawer>
</template>
