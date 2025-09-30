<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import {
  Message,
  Modal,
  FileItem,
  RequestOption,
  UploadRequest,
} from '@arco-design/web-vue';
import { uploadImage, beforeUploadCheck } from '../scripts/uploadImage';
import { uploadVideo } from '../scripts/uploadVideo';
import { Axios, errorHandler } from '../axios';
import { useRoute } from 'vue-router';
import {
  PostType,
  PostShareWith,
  PostMediaType,
  PostMediaTypeOptions,
} from '../consts/options';
import router from '../router';
import { useStore, sharedFunctions } from '../stores';
import AvatarName from '../components/AvatarName.vue';
import { isMobile } from '../consts/isMobile';

const route = useRoute();
const store = useStore();

const postForm = reactive({
  post_id: 0,
  author: 0,
  title: '',
  media_type: PostMediaType.image,
  content: '',
  allow_comment: true,
  post_type: PostType.moment,
  share_with: PostShareWith.public,
  images: [] as number[],
  video_id: null,
});

const imageFileList = ref<FileItem[]>([]);
const videoFileList = ref<FileItem[]>([]);

const beforeRemove = async (_fileItem: FileItem) => {
  return new Promise<boolean>(resolve => {
    Modal.open({
      title: `删除${
        postForm.media_type === PostMediaType.image ? '图片' : '视频'
      }`,
      content: '确定删除该文件？',
      modalStyle: {
        width: '80vw !important',
        maxWidth: '300px !important',
      },
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

const handleUpload = (option: RequestOption) => {
  if (postForm.media_type === PostMediaType.image) {
    uploadImage(option, 'post');
  } else if (postForm.media_type === PostMediaType.video) {
    uploadVideo(option).then((data: any) => {
      postForm.video_id = data.id;
    });
  }
  return {} as UploadRequest;
};

const sortImage = (fileItem: FileItem, direction: number) => {
  let index = -1;
  for (const i in imageFileList.value) {
    if (imageFileList.value[i].uid === fileItem.uid) {
      index = Number(i);
      break;
    }
  }
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < imageFileList.value.length) {
    const temp = imageFileList.value[index];
    imageFileList.value[index] = imageFileList.value[newIndex];
    imageFileList.value[newIndex] = temp;
  }
};

const publishLoading = ref(false),
  initPost = (id: string) => {
    publishLoading.value = true;
    Axios.get(`/post/${id}/`, {
      params: {
        for: 'edit',
      },
    })
      .then(res => {
        imageFileList.value = res.data.image_items.map((item: any) => ({
          uid: item.id,
          url: `https://image.qaguatian.com/${item.key}/webp`,
          response: {
            id: item.id,
          },
        }));
        if (res.data.video_id) {
          videoFileList.value = [
            {
              uid: res.data.video_item.id,
              name: res.data.video_item.name,
              response: {
                id: res.data.video_item.id,
              },
            },
          ];
        }
        postForm.post_id = res.data.post.id;
        postForm.title = res.data.title;
        postForm.content = res.data.content;
        postForm.allow_comment = res.data.allow_comment;
        postForm.post_type = res.data.post.type;
        postForm.media_type = res.data.post.media_type;
        postForm.share_with = res.data.share_with;
        postForm.video_id = res.data.video_item.id;
        if (store.roleId !== res.data.post.author) {
          Message.error('当前身份与发布者不符');
        }
      })
      .finally(() => {
        publishLoading.value = false;
      });
  },
  publish = () => {
    console.log(postForm, videoFileList.value);
    if (
      postForm.title.length === 0 &&
      postForm.post_type === PostType.article
    ) {
      Message.error('标题不能为空');
      return;
    } else if (
      postForm.media_type === PostMediaType.video &&
      postForm.video_id === null
    ) {
      Message.error('你还没有上传视频');
      return;
    }

    publishLoading.value = true;

    postForm.images = imageFileList.value.map(item => item.response.id);

    sharedFunctions
      .checkCaptcha()
      .then(() => {
        let req;
        if (postForm.post_id) {
          req = Axios.put(`/post/${postForm.post_id}/`, postForm);
        } else {
          req = Axios.post('/post/', postForm);
        }
        req
          .then(res => {
            Message.success('发布成功');
            console.log(res.data.data);
            if (res.data.data.type === PostType.moment) {
              router.replace({
                name: 'moment',
                params: { id: res.data.data.id },
              });
            } else if (res.data.data.type === PostType.article) {
              router.replace({
                name: 'article',
                params: { id: res.data.data.id },
              });
            }
          })
          .catch(errorHandler)
          .finally(() => {
            publishLoading.value = false;
          });
      })
      .catch(() => {
        publishLoading.value = false;
      });
  };

if (route.query.id) {
  initPost(route.query.id as string);
  watch(
    () => store.roleId,
    (newVal: number | null) => {
      if (newVal !== postForm.author) {
        Message.error('当前身份与发布者不符');
      }
    }
  );
}
</script>

<template>
  <a-layout class="editor-layout">
    <a-typography-title :heading="3" v-if="!isMobile">
      编辑帖子
    </a-typography-title>

    <a-tabs
      type="rounded"
      size="large"
      v-model:active-key="postForm.post_type"
      lazy-load
    >
      <a-tab-pane
        :key="PostType.moment"
        title="动态"
        :disabled="
          postForm.post_id !== 0 && postForm.post_type !== PostType.moment
        "
      >
        <a-textarea
          placeholder="记录此刻..."
          :auto-size="{
            minRows: 5,
            maxRows: 10,
          }"
          class="moment-textarea"
          v-model:model-value="postForm.content"
        />

        <a-form-item label="媒体类型" :disabled="postForm.post_id !== 0">
          <a-radio-group
            v-model:model-value="postForm.media_type"
            :options="PostMediaTypeOptions"
            type="button"
          />
        </a-form-item>

        <a-upload
          v-show="postForm.media_type === PostMediaType.image"
          style="margin-bottom: 2em"
          v-model:file-list="imageFileList"
          list-type="picture-card"
          :auto-upload="true"
          :show-cancel-button="false"
          :custom-request="/* @ts-ignore */ handleUpload"
          :on-before-upload="beforeUploadCheck"
          :on-before-remove="beforeRemove"
          image-preview
          :response-url-key="
            fileItem =>
              `https://image.qaguatian.com/${fileItem.response?.key}/webp`
          "
          draggable
          multiple
          accept="image/png, image/jpeg, image/webp, image/gif, image/heic, image/heif"
        >
          <template #extra-button="fileItem">
            <span>
              <IconLeft @click="sortImage(fileItem, -1)" />
            </span>
            <span>
              <IconRight @click="sortImage(fileItem, 1)" />
            </span>
          </template>
        </a-upload>

        <a-upload
          v-show="postForm.media_type === PostMediaType.video"
          style="margin-bottom: 2em"
          v-model:file-list="videoFileList"
          :auto-upload="true"
          :limit="1"
          :show-remove-button="postForm.post_id === 0"
          :show-cancel-button="false"
          :custom-request="/* @ts-ignore */ handleUpload"
          :on-before-remove="beforeRemove"
          accept="video/*"
        />
      </a-tab-pane>

      <a-tab-pane
        :key="PostType.article"
        title="文章"
        :disabled="
          postForm.post_id !== 0 && postForm.post_type !== PostType.article
        "
      >
        <a-form-item label="标题">
          <a-textarea
            v-model="postForm.title"
            auto-size
            :max-length="200"
            show-word-limit
          />
        </a-form-item>

        <MarkdownEditor v-model:content="postForm.content" class="md-editor" />
      </a-tab-pane>
    </a-tabs>

    <a-layout class="post-config">
      <a-form :model="postForm" auto-label-width>
        <a-form-item label="当前身份" v-if="!postForm.post_id">
          <a-space class="post-config-role">
            <AvatarName :role="store.currentRole" />
            <a-typography-text>
              <a-button
                @click="sharedFunctions.switchRole"
                style="margin-bottom: 1.2em; font-size: 1.1em"
              >
                切换角色
              </a-button>
            </a-typography-text>
          </a-space>
        </a-form-item>

        <a-form-item label="分享对象">
          <a-radio-group v-model:model-value="postForm.share_with">
            <a-radio :value="PostShareWith.public"> 所有人 </a-radio>
            <a-radio :value="PostShareWith.user"> 登录用户可见 </a-radio>
            <a-radio :value="PostShareWith.student"> 仅学生可见 </a-radio>
            <a-radio :value="PostShareWith.private"> 仅我可见 </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="允许评论">
          <a-switch v-model:model-value="postForm.allow_comment" />
        </a-form-item>
      </a-form>

      <a-form-item class="arco-form-item-no-label">
        <a-button
          type="primary"
          class="publish-btn"
          @click="publish"
          :loading="publishLoading"
        >
          发布
        </a-button>
      </a-form-item>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.editor-layout {
  padding: 5vh 5vw;
  max-width: min(min(max(90%, 500px), 95%), 1000px);
  margin: 0 auto;
  h3 {
    margin: 0 0 3vh 0.2em;
  }
}
:deep(.arco-tabs-content),
.post-config {
  padding: 30px 0 0 0;
}

.post-config-role {
  display: flex;
  align-items: center;
  :deep(.arco-btn) {
    margin: 0 !important;
  }
}

.md-editor {
  min-height: 80vh;
  margin: 2em 0;
}

.moment-textarea {
  border: none;
  margin-bottom: 2em;
  :deep(textarea) {
    font-size: 1.1em;
    word-break: break-all;
  }
}

.moment-textarea:focus-within {
  background-color: var(--textarea-bg);
}

:deep(.arco-upload-wrapper.arco-upload-wrapper-type-picture-card) {
  $image-item-size: 10em;
  $image-item-font-size: 2em;

  .arco-upload-list-picture {
    img {
      object-fit: cover;
    }
    .arco-upload-progress {
      line-height: $image-item-size;
      .arco-progress-circle-wrapper {
        width: $image-item-font-size !important;
        height: $image-item-font-size !important;
      }
    }
    .arco-upload-list-picture-operation {
      padding-top: $image-item-font-size;
    }
  }
  .arco-upload.arco-upload-type-picture-card.arco-upload-draggable {
    width: $image-item-size;
    height: $image-item-size;

    .arco-upload-picture-card {
      width: $image-item-size;
      height: $image-item-size;
      .arco-upload-picture-card-text {
        font-size: 2em;
      }
    }
  }
}

:deep(.arco-upload-list-picture) {
  width: 10em;
  height: 10em;
}

.publish-btn {
  margin-top: 1em;
}
</style>
