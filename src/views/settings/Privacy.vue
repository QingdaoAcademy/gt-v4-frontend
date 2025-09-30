<script setup lang="ts">
import { ref, reactive } from 'vue';
import UserPicker from '../../components/UserPicker.vue';
import { Axios, errorHandler } from '../../axios';
import { Message } from '@arco-design/web-vue';
import { UserBrief } from '../../types';
import { useStore } from '../../stores';

const store = useStore();

const generalSettings = reactive({
    allow_show_in_list: false,
    accept_join_role: false,
    trusted_users: [],
  }),
  defaultUserOptions = reactive<UserBrief[]>([]),
  loadingGeneral = ref(true);

Axios.get('/user/setting/privacy/')
  .then(res => {
    Object.assign(generalSettings, res.data.privacy);
    generalSettings.trusted_users = res.data.trusted_users.map(
      (user: UserBrief) => {
        defaultUserOptions.push(user);
        return user.id;
      }
    );
  })
  .finally(() => {
    loadingGeneral.value = false;
  });

const saveGeneral = () => {
  loadingGeneral.value = true;
  Axios.put('/user/setting/privacy/', {
    ...generalSettings,
  })
    .then(_res => {
      Message.success('保存成功');
    })
    .catch(errorHandler)
    .finally(() => {
      loadingGeneral.value = false;
    });
};

const loadingYunxiao = ref(true),
  yunxiaoSettings = reactive({
    password: '',
    save_password: false,
    show_timetable_public: false,
  });

if (store.user?.yunxiao?.id) {
  Axios.get(`/yunxiao/${store.user.yunxiao.id}/`)
    .then(res => {
      yunxiaoSettings.save_password = Boolean(res.data.password);
      yunxiaoSettings.show_timetable_public = res.data.show_timetable_public;
    })
    .finally(() => {
      loadingYunxiao.value = false;
    });
}
</script>

<template>
  <a-layout style="padding: 0 1em">
    <a-typography-text style="margin-bottom: 1em; font-size: 1.1em">
      特别说明：随瓜田的功能逐渐完善，未来可能会有新的隐私设置项加入。未来新增的隐私设置项均会为你默认设置为保护隐私最优的选项。
    </a-typography-text>

    <a-divider />

    <a-typography-title :heading="5"> 通用设置 </a-typography-title>

    <a-form-item
      label="允许被展示在列表中"
      tooltip="允许其他用户在搜索等场景中查看你的用户信息，包括瓜田ID、真实姓名和学号。打开此功能以允许他人进行邀请你加入角色等操作，但同时可能向他人暴露部分信息，包括但不限于你注册瓜田的事实等。"
    >
      <a-switch v-model="generalSettings.allow_show_in_list" />
    </a-form-item>

    <a-form-item
      label="允许加入角色"
      tooltip="允许其他用户邀请你成为共享角色的成员"
    >
      <a-switch v-model="generalSettings.accept_join_role" />
    </a-form-item>

    <a-form-item
      label="信任的用户"
      tooltip="上述隐私设置对你信任的用户不生效。你添加的用户不会收到通知。"
    >
      <UserPicker
        v-model:userIds="generalSettings.trusted_users"
        :defaultOptions="defaultUserOptions"
        multiple
      />
    </a-form-item>

    <a-form-item :label-col-style="{ display: 'none' }">
      <a-button type="primary" :loading="loadingGeneral" @click="saveGeneral">
        保存
      </a-button>
    </a-form-item>
  </a-layout>
</template>

<style lang="scss" scoped>
h5 {
  margin: 0 0 2vh 0;
}
h6 {
  margin: 0 0 1vh 0;
}
.arco-divider {
  margin-bottom: 3em;
}
</style>
