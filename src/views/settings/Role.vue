<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { sharedFunctions } from '../../stores';
import ArcoDescriptions from '../../components/ArcoDescriptions.vue';
import { Message, FileItem, RequestOption, UploadRequest } from '@arco-design/web-vue';
import { useStore } from '../../stores';
import { Axios, errorHandler } from '../../axios';
import { RoleFull, UserBrief } from '../../types';
import UserPicker from '../../components/UserPicker.vue';
import { uploadImage, beforeUploadCheck } from '../../scripts/uploadImage';

const store = useStore();

const createRoleName = ref(''),
  createRoleLoading = ref(false),
  createRole = () => {
    if (!createRoleName.value) {
      Message.error('请输入角色名称');
      return;
    }
    createRoleLoading.value = true;
    Axios.post('/role/', {
      name: createRoleName.value,
    })
      .then(res => {
        store.roles.push(res.data.data);
        sharedFunctions.setRoleId(res.data.data.id);
        Message.success('创建成功');
        createRoleName.value = '';
      })
      .catch(errorHandler)
      .finally(() => {
        createRoleLoading.value = false;
      });
  };

const roleData = ref({} as RoleFull),
  editRoleForm = reactive({
    id: 0,
    name: '',
    description: '',
    is_shared: false,
    is_private: false,
    show_user_info: false,
    show_like: false,
    user_info: null as UserBrief | null,
    editable: false,
    verify: null,
    avatar: null as string | null,
    members_id: [] as number[],
    external_links: {
      github: '',
      wechat: '',
      qq: '',
      twitter: '',
      weibo: '',
      douyin: '',
      other: '',
    },
  }),
  defaultUserOptions = reactive<UserBrief[]>([]),
  roleInfoData = ref([
    {
      label: '角色ID',
      value: computed(() => roleData.value.id ?? '-'),
    },
    {
      label: '不可编辑角色',
      value: computed(() => (roleData.value.editable ? '否' : '是')),
    },
    {
      label: '匿名角色',
      value: computed(() => (roleData.value.is_private ? '是' : '否')),
    },
    // {
    //   label: '创建时间',
    //   value: '2024-02-01 12:00:00',
    // },
    {
      label: '认证信息',
      value: computed(() => roleData.value.verify || '-'),
    },
    {
      label: '所有者',
      value: computed(() => {
        if (roleData.value.user_info) {
          return `${roleData.value.user_info.real_name}(${roleData.value.user_info.username})`;
        }
        return '-';
      }),
    },
  ]);

const avatarFile = ref({
  url: '',
  uid: '0',
} as FileItem);

const updateLocalInfo = (data: any) => {
    editRoleForm.members_id = data.members.map((user: UserBrief) => {
      defaultUserOptions.push(user);
      return user.id;
    });
    for (const key in data) {
      if (key in editRoleForm) {
        // @ts-ignore
        editRoleForm[key] = data[key];
      }
    }
    roleData.value = data;
    avatarFile.value.url = data.avatar;

    for (const role of store.roles) {
      if (role.id === data.id) {
        role.avatar = data.avatar;
        role.name = data.name;
        role.verify = data.verify;
        break;
      }
    }
  },
  getRoleInfo = () => {
    Axios.get(`/role/${store.roleId}/`).then(res => {
      updateLocalInfo(res.data.data);
    });
  },
  saveRoleLoading = ref(false),
  saveRole = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) return;
    if (!values.is_shared) values.members_id = [];
    saveRoleLoading.value = true;
    Axios.put(`/role/${values.id}/`, values)
      .then(res => {
        updateLocalInfo(res.data.data);
        Message.success('保存成功');
      })
      .catch(errorHandler)
      .finally(() => {
        saveRoleLoading.value = false;
      });
  },
  deleteRole = () => {
    Axios.delete(`/role/${store.roleId}/`).then(() => {
      store.roles = store.roles.filter(role => role.id !== store.roleId);
      sharedFunctions.setRoleId(store.roles[0].id);
      Message.success('删除成功');
    });
  };

getRoleInfo();
watch(
  () => store.roleId,
  () => {
    getRoleInfo();
  }
);

const handleAvatarUpload = (option: RequestOption) => {
  Message.info('正在上传，请耐心等待...');
  uploadImage(option, 'avatar').then((data: any) => {
    avatarFile.value.url = `https://image.qaguatian.com/${data.key}/avatar`;
    avatarFile.value.uid = data.id;
    editRoleForm.avatar = `https://image.qaguatian.com/${data.key}/avatar`;
    saveRole({ values: editRoleForm, errors: undefined });
  });
  return {} as UploadRequest;
};

const disableEdit = computed(() => {
  return (
    !editRoleForm.editable ||
    (editRoleForm.user_info && editRoleForm.user_info.id !== store.user?.id) ||
    false
  );
});
</script>

<template>
  <a-layout style="padding: 0 1em">
    <a-typography-paragraph
      style="margin-bottom: 1.2em; font-size: 1.1em"
      :ellipsis="{ rows: 3, expandable: true }"
    >
      为了更好地满足大家保护隐私的需求，瓜田的绝大多数功能以“角色”作为数据主体。
      <br />
      每个角色的数据都是独立的（这意味着你的一个角色可以给另一个角色的帖子点赞和评论），同时若你选择不展示身份信息，他人无法将你的角色与你的真实身份或你拥有的其他角色关联起来。
      <br />
      每个人可以创建多个角色，角色也可以共享给他人。社团等组织创建的角色还可以向我们申请认证。
      <br />
      为了保证账号功能的正常使用，我们在注册时为你创建了不可修改的匿名角色，该角色采用统一的名称和头像，能够进一步保护你的身份信息。
    </a-typography-paragraph>

    <a-divider />
    <a-space size="large" style="margin-bottom: 1.2em">
      <a-typography-title :heading="5" style="margin: 0">
        角色设置
      </a-typography-title>

      <a-button @click="sharedFunctions.switchRole" style="font-size: 1.1em">
        切换角色
      </a-button>
    </a-space>

    <a-form
      :model="editRoleForm"
      @submit="saveRole"
      auto-label-width
      :disabled="disableEdit"
    >
      <a-form-item v-if="disableEdit">
        <a-alert type="warning" v-if="!editRoleForm.editable">
          当前角色不可修改
        </a-alert>
        <a-alert type="warning" v-else> 只有所有者可以修改角色 </a-alert>
      </a-form-item>
      <a-form-item label="角色头像">
        <a-upload
          :file-list="avatarFile ? [avatarFile] : []"
          :show-file-list="false"
          :custom-request="handleAvatarUpload"
          :on-before-upload="beforeUploadCheck"
        >
          <template #upload-button>
            <div
              :class="`arco-upload-list-item${
                avatarFile && avatarFile.status === 'error'
                  ? ' arco-upload-list-item-error'
                  : ''
              }`"
            >
              <div
                class="arco-upload-list-picture custom-upload-avatar"
                v-if="avatarFile && avatarFile.url"
              >
                <img :src="avatarFile.url" />
                <div class="arco-upload-list-picture-mask">
                  <IconEdit />
                </div>
              </div>
              <div class="arco-upload-picture-card" v-else>
                <div class="arco-upload-picture-card-text">
                  <IconPlus />
                  <div style="margin-top: 10px; font-weight: 600">上传头像</div>
                </div>
              </div>
            </div>
          </template>
        </a-upload>
      </a-form-item>

      <a-form-item
        field="name"
        label="角色名称"
        :rules="[{ required: true, message: '请输入角色名称' }]"
        :validate-trigger="['change', 'input']"
        hide-asterisk
      >
        <a-input
          v-model="editRoleForm.name"
          placeholder="请输入角色名称"
          :max-length="20"
          show-word-limit
        />
      </a-form-item>
      <a-form-item field="description" label="角色描述" asterisk-position="end">
        <a-textarea
          v-model="editRoleForm.description"
          placeholder="请输入角色描述"
          auto-size
          :max-length="50"
          show-word-limit
        />
      </a-form-item>
      <a-form-item field="show_user_info" label="展示身份信息">
        <a-switch v-model="editRoleForm.show_user_info" />
      </a-form-item>
      <a-form-item field="show_like" label="展示点赞内容">
        <a-switch v-model="editRoleForm.show_like" />
      </a-form-item>
      <a-form-item field="is_shared" label="共享角色">
        <a-switch v-model="editRoleForm.is_shared" />
      </a-form-item>
      <a-form-item
        field="members_id"
        label="共享用户列表"
        v-show="editRoleForm.is_shared"
      >
        <UserPicker
          v-model:userIds="editRoleForm.members_id"
          :defaultOptions="defaultUserOptions"
          multiple
        />
      </a-form-item>
      <a-form-item label="外部链接">
        <a-space wrap>
          <a-space>
            <IconGithub />
            <a-input
              v-model="editRoleForm.external_links.github"
              placeholder="GitHub主页链接"
            />
          </a-space>
          <a-space>
            <IconWechat />
            <a-input
              v-model="editRoleForm.external_links.wechat"
              placeholder="微信号"
            />
          </a-space>
          <a-space>
            <IconQq />
            <a-input
              v-model="editRoleForm.external_links.qq"
              placeholder="QQ号"
            />
          </a-space>
          <a-space>
            <IconTwitter />
            <a-input
              v-model="editRoleForm.external_links.twitter"
              placeholder="Twitter主页链接"
            />
          </a-space>
          <a-space>
            <IconWeibo />
            <a-input
              v-model="editRoleForm.external_links.weibo"
              placeholder="微博主页链接"
            />
          </a-space>
          <a-space>
            <IconTiktokColor />
            <a-input
              v-model="editRoleForm.external_links.douyin"
              placeholder="抖音主页链接"
            />
          </a-space>
          <a-space>
            <IconLink />
            <a-input
              v-model="editRoleForm.external_links.other"
              placeholder="任意链接"
            />
          </a-space>
        </a-space>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button
            type="primary"
            html-type="submit"
            :loading="saveRoleLoading"
          >
            保存
          </a-button>
          <a-popconfirm
            content="你确认要删除该角色吗？"
            @ok="deleteRole"
            type="warning"
          >
            <a-button type="primary" status="danger"> 删除角色 </a-button>
          </a-popconfirm>
        </a-space>
      </a-form-item>
      <ArcoDescriptions :data="roleInfoData" />
    </a-form>

    <a-divider />

    <a-typography-title :heading="5"> 创建角色 </a-typography-title>

    <a-form-item label="角色名称">
      <a-input v-model="createRoleName" placeholder="请输入角色名称" />
    </a-form-item>
    <a-form-item :label-col-style="{ display: 'none' }">
      <a-button type="primary" @click="createRole" :loading="createRoleLoading">
        创建
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
