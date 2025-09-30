<script setup lang="ts">
import router from '../router';
import Comment from './Comment.vue';
import { PropType, ref } from 'vue';
import { isMobile } from '../consts/isMobile';
import { formatRelativeTime } from '../scripts/time';
import { Message } from '@arco-design/web-vue';
import { Axios } from '../axios';
import AvatarName from './AvatarName.vue';
import { sharedFunctions, useStore } from '../stores';
import SimpleRichText from './SimpleRichText.vue';
import StatusTag from './StatusTag.vue';
import { PostFull } from '../types';
import PostTime from './PostTime.vue';
import { Coin as IconCoin } from '@vicons/tabler';
import { PostMediaType } from '../consts/options';
import DogeVideo from './DogeVideo.vue';

const store = useStore();

const props = defineProps({
  detail: {
    type: Boolean,
    default: false,
  },
  moment: {
    type: Object as PropType<PostFull>,
    required: true,
  },
});

const emit = defineEmits(['delete', 'selectVersion']);

const showComment = ref(false);

const like = () => {
  if (!store.loggedIn) {
    Message.warning('请先登录');
    return;
  }
  Axios.post(`/post/${props.moment.id}/like/`).then(res => {
    props.moment.liked = res.data.liked;
    props.moment.like_count = res.data.like_count;
  });
};

const deleteMoment = () => {
  Axios.delete(`/post/${props.moment.id}/`).then(() => {
    Message.success('删除成功');
    if (props.detail) {
      router.push({ name: 'index' });
    } else {
      emit('delete');
    }
  });
};

const switchShowComment = () => {
  showComment.value = !showComment.value;
};

const showReport = () => {
  sharedFunctions.showReport(props.moment.id, 'post');
};
</script>

<template>
  <a-card class="post-item-card" :hoverable="!detail" :bordered="false">
    <template #title>
      <AvatarName :role="moment.author" />
    </template>
    <template #extra v-if="!detail" class="no-select">
      <div
        style="color: var(--color-text-3); display: inline-block"
        class="no-select"
      >
        <span>{{ formatRelativeTime(moment.edit_time) }}</span>
        <span v-if="moment.source === 'wechat'"> · 来自微信</span>
        <span v-if="moment.pinned"> · 置顶</span>
      </div>
    </template>
    <template #extra v-else class="no-select">
      <a-trigger trigger="click" :popup-translate="[-55, 10]">
        <a-button type="text">
          <template #icon>
            <IconMore />
          </template>
        </a-button>
        <template #content>
          <a-card>
            <a-space size="large">
              <a-space direction="vertical" :size="detail ? 'small' : -5">
                <a-button
                  v-if="
                    store.isCurrentRole(moment.author) ||
                    store.permission.admin_forum
                  "
                  :type="detail ? undefined : 'text'"
                  size="small"
                  long
                  @click="
                    router.push({
                      name: 'admin-post-detail',
                      params: { id: moment.id },
                    })
                  "
                >
                  <template #icon>
                    <IconFindReplace />
                  </template>
                  版本信息
                </a-button>
                <a-button
                  v-if="store.isCurrentRole(moment.author)"
                  :type="detail ? undefined : 'text'"
                  size="small"
                  long
                  @click="
                    router.push({
                      name: 'edit',
                      query: { id: moment.id },
                    })
                  "
                >
                  <template #icon>
                    <IconEdit />
                  </template>
                  编辑
                </a-button>
                <a-popconfirm
                  content="你确定要删除此动态吗？"
                  type="warning"
                  v-if="store.isCurrentRole(moment.author)"
                  @ok="deleteMoment"
                >
                  <a-button
                    v-if="store.isCurrentRole(moment.author)"
                    :type="detail ? undefined : 'text'"
                    status="danger"
                    size="small"
                    long
                  >
                    <template #icon>
                      <IconDelete />
                    </template>
                    删除
                  </a-button>
                </a-popconfirm>
                <a-button
                  :type="detail ? undefined : 'text'"
                  status="warning"
                  size="small"
                  long
                  @click="showReport"
                >
                  <template #icon>
                    <IconExclamationCircle />
                  </template>
                  {{ store.isCurrentRole(moment.author) ? '申诉' : '举报' }}
                </a-button>
              </a-space>
            </a-space>
          </a-card>
        </template>
      </a-trigger>
    </template>

    <a-typography-paragraph
      :ellipsis="
        detail
          ? false
          : {
              rows: 2,
              expandable: true,
            }
      "
      style="font-size: 1.15em; margin-bottom: 0; word-break: break-all"
    >
      <SimpleRichText :content="moment.content" />
    </a-typography-paragraph>

    <div style="margin-top: 0.6em" v-if="detail">
      <PostTime :post="moment" />
    </div>

    <a-image-preview-group
      v-if="
        moment.media_type === PostMediaType.image &&
        moment.image_items.length > 0
      "
      :actions-layout="[]"
    >
      <div
        class="image-container no-select"
        :style="{
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
          marginTop: '16px',
        }"
      >
        <a-image
          :src="`https://image.qaguatian.com/${image.key}/small`"
          v-for="image in moment.image_items"
          show-loader
          :preview-props="{
            src: `https://image.qaguatian.com/${image.key}/webp`,
          }"
          :key="image.id"
        />
      </div>
    </a-image-preview-group>
    <DogeVideo
      v-if="moment.media_type === PostMediaType.video"
      :video="moment.video_item"
    />

    <!--操作区域-->
    <a-card-meta style="width: 100%">
      <template #avatar>
        <div>
          <a-space
            :size="
              detail ? (isMobile ? 'mini' : 'small') : isMobile ? 0 : 'mini'
            "
          >
            <a-button
              :type="detail ? undefined : 'text'"
              size="small"
              shape="round"
              @click="like"
            >
              <template #icon>
                <IconThumbUpFill v-if="moment.liked" />
                <IconThumbUp v-else />
              </template>
              {{ moment.like_count }}
            </a-button>
            <a-button
              :type="detail ? undefined : 'text'"
              size="small"
              shape="round"
              @click="switchShowComment"
              v-if="!detail"
            >
              <template #icon>
                <IconMessage v-if="moment.allow_comment" />
                <IconMessageBanned v-else />
              </template>
              {{ showComment ? '收起' : moment.comment_count }}
            </a-button>
            <RouterLink :to="{ name: 'moment', params: { id: moment.id } }">
              <a-button
                :type="detail ? undefined : 'text'"
                v-if="!detail"
                size="small"
                shape="round"
                style="padding: 0 15px"
              >
                <template #icon>
                  <IconMore />
                </template>
              </a-button>
            </RouterLink>
            <a-button
              v-if="detail"
              :type="detail ? undefined : 'text'"
              size="small"
              shape="round"
              @click="
                sharedFunctions.showDonateCoin(
                  moment.author,
                  moment.id,
                  moment.coin_record,
                  change => {
                    moment.coin_count += change;
                    moment.coin_record += change;
                  }
                )
              "
            >
              <template #icon>
                <IconCoin class="arco-icon" />
              </template>
              {{ moment.coin_count }}
            </a-button>
          </a-space>
          <StatusTag
            size="medium"
            :review-status="moment.review_status"
            :share-with="moment.share_with"
            :has-new-version="moment.current_version < moment.latest_version"
            @select-version="
              router.push({
                name: 'admin-post-detail',
                params: { id: moment.id },
              })
            "
            style="float: right; margin-top: 0.2rem"
          />
        </div>
        <a-card
          v-show="showComment || detail"
          style="margin-top: 10px; width: 100%"
          :bordered="false"
          class="comment-area"
        >
          <Comment
            :post-id="moment.id"
            root
            :postOwner="moment.author"
            :show="detail || showComment"
            :allow-comment="moment.allow_comment"
          />
        </a-card>
      </template>
    </a-card-meta>
  </a-card>
</template>

<style scoped lang="scss">
.post-item-card {
  :deep(.arco-card-header) {
    padding-bottom: 0;
    border-bottom: none;
    .arco-card-header-extra {
      color: var(--color-text-2);
    }
  }
  :deep(.arco-card-meta-footer) {
    display: block;
  }
}

.image-container {
  display: grid;
  gap: 10px;
  :deep(.arco-image-img) {
    width: 100%;
    aspect-ratio: 1/1;
    cursor: pointer;
    object-fit: cover;
  }
}

:deep(.comment-area .arco-card-body) {
  padding: 10px 5px 10px 5px;
}
</style>
