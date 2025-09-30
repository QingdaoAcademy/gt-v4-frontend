<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue';
import Menu from './components/Menu.vue';
import { themeInit } from './scripts/init';
import { isMobile } from './consts/isMobile';
import { useRoute } from 'vue-router';
import router from './router';
import { useStore } from './stores';
import { sharedFunctions } from './stores';
const CaptchaModal = defineAsyncComponent(
  () => import('./components/CaptchaModal.vue')
);
const Report = defineAsyncComponent(() => import('./components/Report.vue'));
const DonateCoin = defineAsyncComponent(
  () => import('./components/DonateCoin.vue')
);
const NotificationList = defineAsyncComponent(
  () => import('./components/Notification.vue')
);

const route = useRoute();
const store = useStore();
const goBack = () => {
  console.log(window.history.length);
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};

themeInit();

const showMenuDrawer = ref(false);

onMounted(() => {
  sharedFunctions.scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
});
</script>

<template>
  <a-config-provider>
    <a-layout>
      <a-layout-header
        class="shadow-5"
        :style="{
          position: 'fixed',
          top: 0,
          overflow: 'hidden',
          height: 'var(--global-header-height)',
          width: '100%',
          zIndex: 1000,
          padding: isMobile ? '0' : '0 1vw',
          backgroundColor: 'var(--color-menu-light-bg)',
        }"
      >
        <Menu :mode="'horizontal'" v-if="!isMobile" />
        <a-page-header
          v-else-if="route.meta.showHeader !== false"
          :style="{ height: 'var(--global-header-height)', padding: '10px 0' }"
          :title="route.meta.title as string"
          :subtitle="(route.meta.subtitle ?? 'QA瓜田') as string"
          :show-back="route.meta.showBack !== false"
          @back="goBack"
        >
          <template #extra>
            <a-button
              type="text"
              size="large"
              style="font-size: 1.5em"
              @click="showMenuDrawer = true"
            >
              <template #icon>
                <a-badge :count="store.unreadNotificationCount" dot>
                  <IconMenu />
                </a-badge>
              </template>
            </a-button>
          </template>
        </a-page-header>
      </a-layout-header>
      <a-layout
        :style="{
          paddingTop:
            isMobile && route.meta.showHeader === false
              ? '0'
              : 'var(--global-header-height)',
        }"
      >
        <div style="width: min(max(75vw, 1300px), 95vw); margin: 0 auto">
          <!-- <RouterView v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </RouterView> -->
          <RouterView />
        </div>
        <a-back-top />
      </a-layout>
    </a-layout>

    <a-drawer
      width="min(300px, 80vw)"
      style="z-index: 1200"
      v-model:visible="showMenuDrawer"
      :header="false"
      :footer="false"
    >
      <Menu :mode="'vertical'" @close="showMenuDrawer = false" />
    </a-drawer>

    <Suspense> <Report /> </Suspense>
    <Suspense> <DonateCoin /> </Suspense>
    <Suspense> <NotificationList /> </Suspense>
    <Suspense> <CaptchaModal /> </Suspense>
  </a-config-provider>
</template>
