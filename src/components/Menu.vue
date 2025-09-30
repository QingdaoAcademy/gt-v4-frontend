<script setup lang="ts">
import { useStore, usePersistStore, sharedFunctions } from '../stores';
import { ref, watch } from 'vue';
import router from '../router';
import Avatar from './Avatar.vue';
import { Theme } from '../types';
import isMobile from '../consts/isMobile';
import Axios from '../axios';
import { Notification } from '@arco-design/web-vue';
import { Checks as IconChecks } from '@vicons/tabler';

defineProps<{
  mode: 'horizontal' | 'vertical';
}>();

const emit = defineEmits(['close']);

const store = useStore(),
  persistStore = usePersistStore();

const showSelectRoleModal = ref(false);

const getTheme = () => {
  return document.body.getAttribute('arco-theme');
};

sharedFunctions.switchRole = () => {
  showSelectRoleModal.value = true;
};

const selectedKeys = ref([] as string[]);

const detectMenuKey = () => {
  if (router.currentRoute.value.name) {
    while (selectedKeys.value.length > 0) selectedKeys.value.pop();
    selectedKeys.value.push(
      'route_' + (router.currentRoute.value.name as string)
    );
    return true;
  }
  return false;
};

watch(
  () => router.currentRoute.value.name,
  () => {
    detectMenuKey();
  }
);

const initKeyInterval = setInterval(() => {
  if (detectMenuKey()) {
    clearInterval(initKeyInterval);
  }
}, 100);

const getRandomHints = (coinNum: number) => {
  const hints: { [key: string]: string[] } = {
    '<0': ['今日运势坏到家了', '瓜田怎么搞抢劫？'],
    '0-0.5': ['非酋本酋就是你', '哎，真倒霉'],
    '0.5-1.0': [
      '运气一般',
      '说不定别处运气好点',
      '再少也是币',
      '瓜田也发不起硬币了？',
    ],
    '1.0-1.5': ['小有收获', '积少成多，风雨兴焉'],
    '1.5-2.0': ['尝试就可能带来惊喜', '摆脱非酋的一小步'],
    '2.0-2.5': ['你不妨去试把彩票', '也许今天是你的幸运日', '手气不错'],
    '2.5-inf': [
      '黄金欧皇附体！',
      '考的都会，蒙的全对！',
      '今天注定不凡！',
      '好运连连',
      '今天的一切都会很顺利',
    ],
  };

  const getHint = (key: string) => {
    const hintArray = hints[key];
    if (!hintArray) return '生活总有起伏，保持微笑';
    const randomIndex = Math.floor(Math.random() * hintArray.length);
    return hintArray[randomIndex];
  };

  switch (true) {
    case coinNum < 0:
      return getHint('<0');
    case coinNum >= 0 && coinNum < 0.5:
      return getHint('0-0.5');
    case coinNum >= 0.5 && coinNum < 1.0:
      return getHint('0.5-1.0');
    case coinNum >= 1.0 && coinNum < 1.5:
      return getHint('1.0-1.5');
    case coinNum >= 1.5 && coinNum < 2.0:
      return getHint('1.5-2.0');
    case coinNum >= 2.0 && coinNum < 2.5:
      return getHint('2.0-2.5');
    case coinNum >= 2.5:
      return getHint('2.5-inf');
    default:
      return '生活总有起伏，保持微笑';
  }
};

const handleMenuClick = (key: string) => {
  emit('close');
  if (key.indexOf('theme_') === 0) {
    const theme = key.replace('theme_', '');
    if (persistStore.setTheme(theme as Theme)) {
      window.location.reload();
    } else {
      detectMenuKey();
    }
    return;
  } else if (key === 'switchRole') {
    showSelectRoleModal.value = true;
    return;
  } else if (key.indexOf('route_') === 0) {
    const routeKey = key.replace('route_', '');
    if (router.currentRoute.value.name === routeKey) {
      if (
        routeKey === 'index' &&
        router.currentRoute.value.query.page &&
        Number(router.currentRoute.value.query.page) > 1
      ) {
        router.push({ query: { page: 1 } });
      }
      return;
    }
    const query = {};
    if (routeKey === 'login') {
      // @ts-ignore
      query.next = router.currentRoute.value.fullPath;
    }
    router.push({ name: routeKey, query });
  } else if (key === 'notification') {
    sharedFunctions.showNotification(detectMenuKey);
  } else if (key === 'sign') {
    if (store.signed) {
      router.push({ name: 'settings', query: { tab: 'coin' } });
    } else {
      sharedFunctions.checkCaptcha().then(() => {
        Axios.post('/coin/sign/')
          .then(res => {
            if (res.data.change) {
              Notification.success({
                title: `签到成功，获得${res.data.change}枚硬币`,
                content: getRandomHints(res.data.change),
                duration: 6000,
                closable: true,
              });
              store.signed = true;
            }
          })
          .finally(detectMenuKey);
      });
    }
  }
  while (selectedKeys.value.length > 0) selectedKeys.value.pop();
  selectedKeys.value.push(key);
};

const finishSelectRole = () => {
  showSelectRoleModal.value = false;
  detectMenuKey();
};

const handleLogout = () => {
  sharedFunctions.logout();
  document.location.reload();
};
</script>

<template>
  <a-menu
    :mode="mode"
    @menu-item-click="handleMenuClick"
    v-model:selected-keys="selectedKeys"
    :class="{ 'no-select': true, 'menu-mobile': isMobile }"
    :style="{ height: mode === 'vertical' ? '100%' : undefined }"
  >
    <a-menu-item
      key="LOGO"
      :style="{
        padding: mode === 'vertical' ? '1.5em 0' : 0,
        marginRight: '38px',
        cursor: 'default',
        width: mode === 'vertical' ? '100%' : undefined,
        textAlign: mode === 'vertical' ? 'center' : undefined,
      }"
      disabled
    >
      <div
        :style="{
          width: mode === 'vertical' ? '100%' : '80px',
          height: '30px',
        }"
      >
        <img
          v-if="getTheme() === 'dark'"
          src="../assets/logo-with-text-white.svg"
          alt="Logo"
          style="width: auto; height: 40px; margin-top: 3px; margin: auto"
        />
        <img
          v-else
          src="../assets/logo-with-text.svg"
          alt="Logo"
          style="width: auto; height: 40px; margin-top: 3px; margin: auto"
        />
      </div>
    </a-menu-item>
    <a-menu-item key="route_index">
      <template #icon>
        <IconHome />
      </template>
      <span> 主页 </span>
    </a-menu-item>
    <a-sub-menu key="apps" title="应用">
      <template #icon>
        <IconApps />
      </template>
      <a-menu-item key="route_drop">
        <template #icon>
          <IconShareAlt />
        </template>
        空投
      </a-menu-item>
      <a-menu-item key="route_alumni">
        <template #icon>
          <IconBook />
        </template>
        校友墙
      </a-menu-item>
      <a-menu-item key="route_zero" v-if="store.permission.base_admin">
        <template #icon>
          <icon-eye-invisible />
        </template>
        文本暗水印
      </a-menu-item>
    </a-sub-menu>
    <a-menu-item key="route_settings">
      <template #icon>
        <IconSettings />
      </template>
      <span> 设置 </span>
    </a-menu-item>
    <a-sub-menu
      class="no-scrollbar"
      key="admin"
      title="管理"
      v-if="store.permission.base_admin"
    >
      <template #icon>
        <IconCommand />
      </template>
      <a-menu-item
        key="route_admin-report"
        v-if="store.permission.admin_report"
      >
        举报管理
      </a-menu-item>
      <a-menu-item key="route_admin-user" v-if="store.permission.admin_user">
        用户管理
      </a-menu-item>
      <a-menu-item key="route_admin-role" v-if="store.permission.admin_role">
        角色管理
      </a-menu-item>
      <a-menu-item key="route_admin-post" v-if="store.permission.admin_forum">
        帖子管理
      </a-menu-item>
      <a-menu-item
        key="route_admin-comment"
        v-if="store.permission.admin_forum"
      >
        评论管理
      </a-menu-item>
      <a-menu-item key="route_admin-image"> 图片管理 </a-menu-item>
    </a-sub-menu>

    <div :style="{ float: mode === 'horizontal' ? 'right' : undefined }">
      <a-sub-menu key="theme" title="主题">
        <template #icon>
          <IconBrush />
        </template>
        <a-menu-item key="theme_system">
          <template #icon>
            <IconDesktop />
          </template>
          跟随系统
        </a-menu-item>
        <a-menu-item key="theme_light">
          <template #icon>
            <IconSun />
          </template>
          亮色主题
        </a-menu-item>
        <a-menu-item key="theme_dark">
          <template #icon>
            <IconMoon />
          </template>
          暗色主题
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item key="notification" v-if="store.loggedIn">
        <template #icon>
          <a-badge :count="store.unreadNotificationCount" dot>
            <IconNotification />
          </a-badge>
        </template>
        通知
      </a-menu-item>
      <a-menu-item
        key="sign"
        v-if="store.loggedIn"
        :class="{
          unsigned: !store.signed,
        }"
      >
        <template #icon>
          <IconChecks class="arco-icon" v-if="store.signed" />
          <IconCheck v-else />
        </template>
        {{ store.signed ? '已签到' : '签到' }}
      </a-menu-item>
      <a-menu-item key="switchRole" :style="{}" v-if="store.loggedIn">
        <template #icon>
          <Avatar :role="store.currentRole" />
        </template>
        切换角色
      </a-menu-item>

      <a-menu-item key="route_login" v-else>
        <template #icon>
          <IconUser />
        </template>
        <span> 登录 </span>
      </a-menu-item>
    </div>
  </a-menu>

  <a-modal
    v-model:visible="showSelectRoleModal"
    title="切换角色"
    width="min(max(400px, 30vw), 95vw) !important"
    :cancel-button-props="{ status: 'warning', type: 'primary' }"
    cancel-text="退出账号"
    @before-close="finishSelectRole"
  >
    <a-typography-paragraph
      style="color: var(--color-text-1); font-size: 1.1em"
    >
      当前用户：{{ store.user?.real_name }}({{ store.user?.username }})
    </a-typography-paragraph>
    <a-typography-paragraph
      style="color: var(--color-text-2); font-size: 1.1em"
    >
      切换角色后，部分正在编辑的内容可能会丢失。
    </a-typography-paragraph>
    <template #footer>
      <div style="display: flex; justify-content: space-between">
        <a-button type="primary" status="warning" @click="handleLogout">
          退出账号
        </a-button>
        <a-space>
          <a-button
            @click="
              router.push({ name: 'role', params: { id: store.roleId } });
              showSelectRoleModal = false;
            "
          >
            查看角色
          </a-button>
          <a-button type="primary" @click="showSelectRoleModal = false">
            确定
          </a-button>
        </a-space>
      </div>
    </template>
    <a-select
      placeholder="请选择身份"
      size="large"
      v-if="store.roleId !== null"
      v-model:model-value="store.roleId"
      @change="persistStore.roleId = store.roleId"
    >
      <template #label="{ data }">
        <a-space>
          <Avatar :role="store.getRoleById(data.value)" />
          {{ data?.label }}
        </a-space>
      </template>
      <a-option
        v-for="role in store.roles"
        :key="role.id"
        :value="role.id"
        :label="role.name"
        :disabled="role.is_active === false"
      >
        <a-space>
          <a-badge :count="role.unread_notification_count ?? 0">
            <Avatar :role="role" />
          </a-badge>
          {{ role.name }}
          <a-tag size="small"> ID:{{ role.id }} </a-tag>
          <a-tag v-if="role.is_active === false" size="small" color="red">
            封禁中
          </a-tag>
        </a-space>
      </a-option>
    </a-select>
  </a-modal>
</template>

<style lang="scss" scoped>
.arco-menu-vertical {
  :deep(.arco-menu-item) {
    margin-bottom: 4px !important;
  }
}

:deep(.arco-menu-icon) {
  margin-right: 0.4em !important;
}

:deep(.arco-menu-pop-header) {
  padding-right: 0.3em !important;
}

:deep(.arco-menu-inner) {
  overflow: hidden !important;
}

:deep(.arco-select-option-content) {
  .arco-space {
    margin-top: 7px;
  }
}

:deep(.arco-badge-number) {
  padding: 0;
  min-width: 15px;
  width: 15px;
  height: 15px;
  line-height: 15px;
  font-size: 10px;
}
</style>

<style lang="scss">
.menu-mobile .arco-menu-inner {
  overflow-y: scroll !important;
}

.unsigned {
  color: rgb(var(--orange-6)) !important;
}

.unsigned svg {
  color: rgb(var(--orange-6)) !important;
}

.no-scrollbar::-webkit-scrollbar {
  width: 0;
  display: none;
}
.arco-trigger-menu {
  overflow: unset;
}
.arco-trigger-menu::-webkit-scrollbar {
  width: 0;
  display: none;
}
</style>
