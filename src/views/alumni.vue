<script setup lang="ts">
import { Axios, errorHandler } from '../axios';
import { _writeToQuery } from '../scripts/writeToQuery';
import { isMobile } from '../consts/isMobile';
import { router } from '../router';
import { nextTick, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '../stores';
import { PageinationData } from '../types';
import { Alumni } from '../types/alumni';
import { sharedFunctions } from '../stores';
import {
  Message,
  FileItem,
  RequestOption,
  UploadRequest,
} from '@arco-design/web-vue';
import { uploadImage, beforeUploadCheck } from '../scripts/uploadImage';
import AlumniCard from '../components/AlumniCard.vue';

const route = useRoute();
const store = useStore();

const search = reactive({
    search: '',
    ordering: '',
    review_status: undefined as number | undefined,
  }),
  pagination = reactive({ page: 1, pageSize: 20, total: 0 } as PageinationData),
  writeToQuery = _writeToQuery(search, pagination, router);
const loading = ref(false),
  data = ref([] as Alumni[]);

const handleQueryChange = () => {
  if (loading.value) return;
  if (route.name !== 'alumni') return;

  loading.value = true;

  search.search = String(route.query.search || '');
  search.ordering = String(route.query.ordering || '');
  if (route.query.page) pagination.page = parseInt(route.query.page as string);
  if (route.query.pageSize)
    pagination.pageSize = parseInt(route.query.pageSize as string);

  const _data = {
    page: pagination.page,
    page_size: pagination.pageSize,
    ...search,
  } as any;
  Axios.get('/alumni/', {
    params: _data,
  })
    .then(res => {
      pagination.total = res.data.count;
      data.value = res.data.results;
      sharedFunctions.scrollTop();
    })
    .finally(() => {
      loading.value = false;
    });
};
handleQueryChange();
watch(
  () => route.query,
  () => {
    writeToQuery();
    handleQueryChange();
  }
);

const generateDescription = (alumni: Alumni) => {
  const result = [];
  if (alumni.name) {
    result.push({ label: '姓名', value: alumni.name });
  }
  if (alumni.gender) {
    result.push({ label: '性别', value: alumni.gender });
  } else {
    result.push({ label: '性别', value: '不愿透露' });
  }
  if (alumni.year) {
    result.push({ label: '毕业年份', value: alumni.year });
  }
  if (alumni.description) {
    result.push({ label: '个人简介', value: alumni.description });
  }
  if (alumni.academic_background?.length) {
    result.push({
      label: '学习经历',
      value: alumni.academic_background,
      tagged: true,
    });
  }
  if (alumni.work_experience?.length) {
    result.push({
      label: '工作经历',
      value: alumni.work_experience,
      tagged: true,
    });
  }
  if (alumni.phone) {
    result.push({ label: '联系电话', value: alumni.phone });
  }
  if (alumni.email) {
    result.push({ label: '电子邮箱', value: alumni.email });
  }
  if (alumni.contact) {
    result.push({ label: '其它联系方式', value: alumni.contact });
  }
  return result;
};

const showDetailModal = ref(false),
  showDetailLoading = ref(false),
  detail = ref({} as Alumni);
const showDetail = (item: Alumni) => {
  if (!store.loggedIn) {
    Message.warning('请先登录');
    return;
  }
  showDetailModal.value = true;
  showDetailLoading.value = true;
  Axios.get(`/alumni/${item.id}/`)
    .then(res => {
      detail.value = res.data;
    })
    .finally(() => {
      showDetailLoading.value = false;
    });
};

const avatarFile = ref({
    url: '',
    uid: '0',
  } as FileItem),
  handleAvatarUpload = (option: RequestOption) => {
    Message.info('正在上传，请耐心等待...');
    uploadImage(option, 'alumni_avatar').then((data: any) => {
      avatarFile.value.url = `https://image.qaguatian.com/${data.key}/avatar`;
      avatarFile.value.uid = data.id;
      createForm.avatar = `https://image.qaguatian.com/${data.key}/avatar`;
      submitCreate(() => {});
    });
    return {} as UploadRequest;
  };
const editItem = (_id: number) => {
  showDetailModal.value = false;
  showCreateModal.value = true;
  Object.assign(createForm, detail.value);
  avatarFile.value.url = detail.value.avatar;
};

const deleteItem = (_id: number) => {
  Axios.delete(`/alumni/${_id}/`)
    .then(() => {
      Message.success('删除成功');
      handleQueryChange();
    })
    .catch(err => {
      errorHandler(err);
    });
};

const showCreateModal = ref(false),
  createForm = reactive({
    id: undefined as number | undefined,
    avatar: '',
    name: '',
    year: new Date().getFullYear(),
    gender: '' as '男' | '女' | '',
    description: '',
    academic_background: [] as string[],
    work_experience: [] as string[],
    phone: '',
    email: '',
    contact: '',
  });

const inputRef0 = ref(),
  inputRef1 = ref();

const handleTagRemove = (list: string[], tag: string) => {
    list.splice(list.indexOf(tag), 1);
  },
  handleTagAdd = (index: 0 | 1) => {
    let list;
    if (index === 0) {
      list = createForm.academic_background;
    } else {
      list = createForm.work_experience;
    }
    if (tagInputVal.value[index].trim()) {
      list.push(tagInputVal.value[index]);
    }
    tagInputVal.value[index] = '';
    showTagInput.value[index] = false;
  },
  handleTagEdit = (index: 0 | 1) => {
    showTagInput.value[index] = true;
    if (index === 0) {
      nextTick(() => {
        inputRef0.value.focus();
      });
    } else {
      nextTick(() => {
        inputRef1.value.focus();
      });
    }
  };

const formRef = ref(),
  submitCreate = (done: (closed: boolean) => void) => {
    formRef.value.validate((errors: any) => {
      if (errors) {
        done(false);
        return;
      }
      if (
        store.user?.real_name !== createForm.name &&
        !store.permission.admin_alumni &&
        !createForm.id
      ) {
        Message.error('你没有为他人创建词条的权限！');
        done(false);
        return;
      }
      let req;
      if (createForm.id) {
        req = Axios.put(`/alumni/${createForm.id}/`, {
          ...createForm,
        });
      } else {
        req = Axios.post('/alumni/', {
          ...createForm,
        });
      }
      req
        .then(() => {
          Message.success('提交成功，刷新后可查看');
          done(true);
        })
        .catch((err: any) => {
          errorHandler(err);
          done(false);
        });
    });
  };

const showTagInput = ref([false, false]),
  tagInputVal = ref(['', '']);

const showAvatar = ref(false);
</script>

<template>
  <div class="alumni">
    <h1>校友墙</h1>
    <a-typography-paragraph
      style="font-size: 1.1em"
      :ellipsis="{
        rows: 1,
        expandable: true,
      }"
    >
      青岛中学和金家岭学校发展至今，已经有许多分布于世界各地的优秀毕业生。这其中的许多人乐于与其它同学个性化地分享经验并提供一定的帮助。然而一直以来，学生与学长、学姐之间缺少相识和沟通的途径。
      <br />
      因此，我们希望能为青中与金家岭的校友文化建设贡献一份力量。建立校友墙是这一计划其中的重要一步。
      <br />
      我们将在此页面展示校友们的相关信息和联系方式。拥有QA瓜田账号的同学可以随时创建、修改和删除自己的信息。由于我们难以联系到往届所有校友，我们将在审核后授予部分同学为他人创建条目的权限。在为他人创建时，创建人应确保信息真实并取得本人同意。
    </a-typography-paragraph>

    <a-divider />

    <div
      style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 2.5em;
      "
    >
      <a-input-search
        :size="isMobile ? 'medium' : 'large'"
        style="max-width: 320px; width: 50vw"
        placeholder="搜索"
        search-button
        v-model="search.search"
        @search="writeToQuery(true)"
        @keydown.enter="writeToQuery(true)"
      />
      <a-button
        type="primary"
        @click="showCreateModal = true"
        v-if="store.loggedIn"
      >
        创建
      </a-button>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 2.5em;
        margin-bottom: 2.5em;
      "
    >
      <div v-for="item of data">
        <AlumniCard :alumni="item" @click="showDetail(item)" />
      </div>
    </div>
    <a-pagination
      :size="isMobile ? 'small' : 'medium'"
      :total="pagination.total"
      :buffer-size="isMobile ? 1 : 2"
      v-model:current="pagination.page"
      hide-on-single-page
      v-model:page-size="pagination.pageSize"
      @change="writeToQuery()"
      @page-size-change="writeToQuery(true)"
    />
  </div>
  <a-image-preview
    :src="detail?.avatar?.replace('/avatar', '')"
    :visible="showAvatar"
    :closable="true"
    @close="showAvatar = false"
  />
  <a-modal
    :width="isMobile ? '100%' : '25rem'"
    v-model:visible="showDetailModal"
    title="校友信息"
    :footer="false"
    @close="detail = {} as Alumni"
  >
    <div style="min-height: 5.5rem">
      <a-spin :spinning="showDetailLoading">
        <a-descriptions size="medium" :column="1">
          <a-descriptions-item
            v-for="i of generateDescription(detail)"
            :label="i.label"
          >
            <a-space v-if="i.tagged" direction="vertical">
              <a-tag v-for="tag of i.value" style="display: inline-block">
                {{ tag }}
              </a-tag>
            </a-space>
            <span v-else>{{ i.value }}</span>
          </a-descriptions-item>
        </a-descriptions>
        <a-avatar
          shape="square"
          :size="95"
          :image-url="detail.avatar"
          style="position: absolute; right: 2rem; top: 1rem"
          :class="[detail?.avatar ? 'pointer' : '']"
          @click="showAvatar = detail?.avatar ? true : false"
        >
          {{ detail.name?.slice(0, 1) }}
        </a-avatar>
      </a-spin>
    </div>
    <a-space v-if="store.permission.admin_alumni || detail.has_permission">
      <a-button status="danger" @click="deleteItem(detail.id)"> 删除 </a-button>
      <a-button type="primary" @click="editItem(detail.id)"> 编辑 </a-button>
    </a-space>
  </a-modal>

  <a-modal
    v-model:visible="showCreateModal"
    title="编辑校友信息"
    @before-ok="submitCreate"
  >
    <a-form :model="createForm" auto-label-width ref="formRef">
      <a-form-item label="头像">
        <a-upload
          :file-list="avatarFile ? [avatarFile] : []"
          :show-file-list="false"
          :custom-request="handleAvatarUpload /* @ts-ignore */"
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
      <a-form-item field="name" label="姓名" :rules="{ required: true }">
        <a-input
          v-model="createForm.name"
          placeholder="请输入姓名"
          :max-length="50"
        />
      </a-form-item>
      <a-form-item field="year" label="毕业年" :rules="{ required: true }">
        <a-input-number
          :style="{ maxWidth: '180px' }"
          placeholder="请输入毕业年"
          v-model="createForm.year"
          mode="button"
          :min="2020"
          :max="2099"
        />
      </a-form-item>
      <a-form-item field="gender" label="性别">
        <a-select v-model="createForm.gender">
          <a-option value="男">男</a-option>
          <a-option value="女">女</a-option>
          <a-option :value="''">不愿透露</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="description" label="个人简介">
        <a-textarea
          v-model="createForm.description"
          placeholder="请输入个人简介"
          :max-length="50"
        />
      </a-form-item>
      <a-form-item field="academic_background" label="学习经历">
        <a-space wrap>
          <a-tag
            v-for="tag of createForm.academic_background"
            size="large"
            :key="tag"
            closable
            @close="handleTagRemove(createForm.academic_background, tag)"
          >
            {{ tag }}
          </a-tag>

          <a-input
            v-if="showTagInput[0]"
            ref="inputRef0"
            :style="{ width: '90px' }"
            v-model.trim="tagInputVal[0]"
            @keyup.enter="handleTagAdd(0)"
            @blur="handleTagAdd(0)"
          />
          <a-tag
            v-else
            size="large"
            :style="{
              width: '65px',
              backgroundColor: 'var(--color-fill-2)',
              border: '1px dashed var(--color-fill-3)',
              cursor: 'pointer',
            }"
            @click="handleTagEdit(0)"
          >
            <template #icon>
              <icon-plus />
            </template>
            添加
          </a-tag>
        </a-space>
      </a-form-item>
      <a-form-item field="work_experience" label="工作经历">
        <a-space wrap>
          <a-tag
            v-for="tag of createForm.work_experience"
            size="large"
            :key="tag"
            closable
            @close="handleTagRemove(createForm.work_experience, tag)"
          >
            {{ tag }}
          </a-tag>

          <a-input
            v-if="showTagInput[1]"
            ref="inputRef1"
            :style="{ width: '90px' }"
            v-model.trim="tagInputVal[1]"
            @keyup.enter="handleTagAdd(1)"
            @blur="handleTagAdd(1)"
          />
          <a-tag
            v-else
            size="large"
            :style="{
              width: '65px',
              backgroundColor: 'var(--color-fill-2)',
              border: '1px dashed var(--color-fill-3)',
              cursor: 'pointer',
            }"
            @click="handleTagEdit(1)"
          >
            <template #icon>
              <icon-plus />
            </template>
            添加
          </a-tag>
        </a-space>
      </a-form-item>
      <a-form-item field="phone" label="电话">
        <a-input v-model="createForm.phone" placeholder="请输入电话" />
      </a-form-item>
      <a-form-item field="email" label="邮箱">
        <a-input v-model="createForm.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item field="contact" label="其它联系方式">
        <a-input v-model="createForm.contact" placeholder="其它联系方式" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped lang="scss">
.alumni {
  padding: 1em;
}
.alumni-card {
  margin: auto;
  width: 250px;
  border-radius: 10px;
  background: var(--color-neutral-1);
  position: relative;
  padding: 1.8rem 1.4rem;
  border: 2px solid var(--color-neutral-4);
  transition: 0.5s ease-out;
  overflow: visible;

  :deep(.arco-descriptions-item-value) {
    padding-right: 2px !important;
  }

  .card-details {
    height: 100%;
    gap: 0.5em;
    display: grid;
    place-content: center;
  }

  .card-button {
    transform: translate(-50%, 125%);
    width: 60%;
    max-width: 130px;
    border-radius: 0.6rem;
    border: none;
    background-color: rgb(var(--arcoblue-7));
    color: #fff;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    position: absolute;
    left: 50%;
    bottom: 0;
    opacity: 0;
    transition: 0.3s ease-out;
    cursor: pointer;
  }
  .avatar-name {
    display: flex;
    align-items: center;
    gap: 1em;
    justify-content: center;
    .name {
      margin: 0 !important;
      font-size: 1.5em;
      font-weight: bold;
    }
  }
}

.alumni-card:hover {
  border-color: rgb(var(--arcoblue-7));
  box-shadow: 0 4px 18px 0 var(--color-neutral-3);
  .card-button {
    transform: translate(-50%, 50%);
    opacity: 1;
  }
}

.pointer {
  cursor: pointer;
}
</style>
