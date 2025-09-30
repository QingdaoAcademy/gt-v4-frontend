<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Message } from '@arco-design/web-vue';
import { PostComment, Role } from '../types';
import { formatDatetime, formatRelativeTime } from '../scripts/time';
import { sharedFunctions, useStore } from '../stores';
import SimpleRichText from './SimpleRichText.vue';
import Avatar from './Avatar.vue';
import { Axios, errorHandler } from '../axios';
import { CommentOrderingOptions, ReviewStatus } from '../consts/options';
import StatusTag from './StatusTag.vue';
import router from '../router';
import isMobile from '../consts/isMobile';

const store = useStore();

export default defineComponent({
  name: 'Comment',
  components: {
    Avatar,
    SimpleRichText,
    StatusTag: StatusTag,
  },
  props: {
    postId: {
      type: Number,
      required: false,
    },
    postOwner: {
      type: Object as PropType<Role>,
      default: null,
    },
    root: {
      type: Boolean,
      default: false,
    },
    allowComment: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Object as PropType<PostComment[] | null>,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
    bold: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
  },
  data() {
    return {
      comments: null as PostComment[] | null,
      startedLoad: false,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      ordering: 'create_time',
      showReply: 0,
      commentContent: '',
      replyContent: '',
      likeInfo: {} as { [key: number]: { liked: boolean; like_count: number } },
      loading: [] as number[],
      sendLoading: false,
      store,
      sharedFunctions,
      CommentOrderingOptions,
      ReviewStatus,
      router,
      isMobile,
    };
  },
  methods: {
    loadComments() {
      if (this.postId === undefined) {
        return;
      }
      this.startedLoad = true;
      this.comments = null;
      Axios.get('/comment/', {
        params: {
          post: this.postId,
          parent: 0,
          start: 0,
          page: this.pagination.page,
          page_size: this.pagination.pageSize,
          ordering: this.ordering,
        },
      }).then(res => {
        this.comments = res.data.results;
        this.pagination.total = res.data.count;
      });
    },
    handleReply(comment?: PostComment) {
      this.sendLoading = true;
      sharedFunctions
        .checkCaptcha()
        .then(() => {
          Axios.post('/comment/', {
            content: comment ? this.replyContent : this.commentContent,
            post: this.postId,
            reply_to: comment?.id ?? null,
          })
            .then(res => {
              Message.success('回复成功');
              const commentItem = res.data.data;
              commentItem.preview = true;
              let flag = 0;
              if (comment) {
                this.replyContent = '';
                this.showReply = 0;
                if (comment.children_count === -1) {
                  this.comments?.push(commentItem);
                  flag = 1;
                } else {
                  comment.children.push(commentItem);
                  flag = 2;
                }
              } else {
                this.commentContent = '';
                this.comments?.push(commentItem);
                flag = 1;
              }
              if (flag) {
                setTimeout(() => {
                  Axios.get(`/comment/${commentItem.id}/`).then(res => {
                    const review_status = res.data.review_status;
                    const updatedComment = {
                      ...commentItem,
                      review_status,
                    };
                    if (flag === 1) {
                      const index = this.comments?.indexOf(commentItem);
                      if (
                        index !== undefined &&
                        index !== -1 &&
                        this.comments
                      ) {
                        this.comments[index] = updatedComment;
                      }
                    } else if (flag === 2 && comment) {
                      const index = comment.children.indexOf(commentItem);
                      if (index !== undefined && index !== -1) {
                        comment.children[index] = updatedComment;
                      }
                    }
                  });
                }, 3000);
              }
            })
            .catch(errorHandler)
            .finally(() => {
              this.sendLoading = false;
            });
        })
        .catch(() => {
          this.sendLoading = false;
        });
    },
    loadCommentChildren(comment: PostComment) {
      this.loading.push(comment.id);
      Axios.get('/comment/', {
        params: {
          post: this.postId,
          parent: comment.id,
          start: comment.children[comment.children.length - 1].id,
        },
      })
        .then(res => {
          if (res.data.results.length > 0) {
            comment.children.push(...res.data.results);
          } else {
            comment.children_count = comment.children.length;
          }
        })
        .catch(errorHandler)
        .finally(() => {
          this.loading = this.loading.filter(id => id !== comment.id);
        });
    },
    like(comment: PostComment) {
      if (!store.loggedIn) {
        Message.warning('请先登录');
        return;
      }
      Axios.post(`/comment/${comment.id}/like/`)
        .then(res => {
          this.likeInfo[comment.id] = {
            liked: res.data.liked,
            like_count: res.data.like_count,
          };
        })
        .catch(errorHandler);
    },
    deleteComment(comment: PostComment) {
      Axios.delete(`/comment/${comment.id}/`)
        .then(() => {
          Object.assign(comment, { deleted: true });
        })
        .catch(errorHandler);
    },
    report(comment: PostComment) {
      sharedFunctions.showReport(comment.id, 'comment');
    },
    pin(comment: PostComment) {
      Axios.post(`/comment/${comment.id}/pin/`)
        .then(res => {
          if (res.data.pinned) {
            Message.success('置顶成功');
          } else {
            Message.success('取消置顶成功');
          }
          comment.pinned = res.data.pinned;
        })
        .catch(errorHandler);
    },
    toRolePage(id: number | undefined) {
      if (id) {
        router.push({ name: 'role', params: { id } });
      }
    },
    formatDatetime,
    formatRelativeTime,
  },
  watch: {
    show(newVal: boolean) {
      if (newVal && !this.startedLoad) this.loadComments();
    },
    postId(newVal: number | undefined) {
      if (newVal) this.loadComments();
    },
    'store.roleId'() {
      if (this.root && this.allowComment) {
        this.comments = null;
        this.loadComments();
      }
    },
  },
  computed: {
    commentable() {
      if (!store.loggedIn) {
        return 1;
      }
      if (
        store.currentRole?.is_private &&
        this.postOwner?.id !== store.roleId
      ) {
        return 2;
      }
      return 0;
    },
  },
  created() {
    if (this.data) {
      this.comments = this.data;
    }
    if (this.show && !this.startedLoad && this.allowComment) {
      this.loadComments();
    }
  },
});
</script>

<template>
  <a-empty description="评论区已关闭" v-if="!allowComment">
    <template #image>
      <IconStop />
    </template>
  </a-empty>

  <a-comment v-else-if="root && comments === null">
    <template #avatar>
      <a-skeleton animation>
        <a-skeleton-shape shape="circle" size="small" />
      </a-skeleton>
    </template>
    <template #author>
      <a-skeleton animation>
        <a-skeleton-line :widths="['20%']" :line-height="15" />
      </a-skeleton>
    </template>
    <template #content>
      <a-skeleton animation>
        <a-skeleton-line
          :rows="2"
          :widths="['100%', '100%']"
          :line-height="15"
        />
      </a-skeleton>
    </template>
  </a-comment>

  <a-empty description="暂无评论" v-else-if="root && comments?.length === 0" />

  <div v-else>
    <a-select
      v-if="root"
      :size="isMobile ? 'small' : 'medium'"
      v-model:model-value="ordering"
      :options="CommentOrderingOptions"
      @change="loadComments"
      :style="{ marginBottom: '1.5em', maxWidth: isMobile ? '8em' : '10em' }"
    >
      <template #label="{ data }">
        <span>
          <icon-sort style="margin-right: 0.5rem" v-if="!isMobile" />
          {{ data?.label }}
        </span>
      </template>
    </a-select>
    <a-comment
      v-for="comment in comments"
      :key="comment.id"
      :datetime="formatRelativeTime(comment.create_time)"
    >
      <template #content>
        <a-space
          style="margin-bottom: 0.5em"
          v-if="
            comment.review_status <= ReviewStatus.pending ||
            comment.hidden ||
            // comment.deleted ||
            comment.pinned
          "
        >
          <a-tag size="small" color="blue" v-if="comment.pinned"> 置顶 </a-tag>
          <a-tag size="small" color="red" v-if="comment.hidden"> 已隐藏 </a-tag>
          <!-- <a-tag size="small" color="red" v-if="comment.deleted">
            已删除
          </a-tag> -->
          <StatusTag :review-status="comment.review_status" size="small" />
        </a-space>
        <a-typography-paragraph
          :ellipsis="{
            rows: 2,
            expandable: true,
          }"
          style="margin-bottom: 0; word-break: break-all"
        >
          <span
            v-if="
              comment.review_status <= ReviewStatus.pending ||
              comment.hidden ||
              comment.deleted
            "
            style="color: var(--color-text-3)"
          >
            {{
              (() => {
                if (comment.deleted) {
                  return '该评论已被删除';
                } else if (comment.review_status === ReviewStatus.rejected) {
                  return '该评论已被屏蔽';
                } else if (
                  comment.review_status === ReviewStatus.pendingRecheck
                ) {
                  return '该评论正在复核中';
                } else if (comment.review_status === ReviewStatus.pending) {
                  return '该评论正在审核中';
                }
              })()
            }}
          </span>
          <SimpleRichText v-else :content="comment.content ?? ''" />
        </a-typography-paragraph>
      </template>
      <template #author>
        <a-space style="margin-bottom: 0.5em">
          <span
            :style="{
              color: comment.author?.verify
                ? 'var(--verify-color)'
                : 'var(--color-text-2)',
            }"
            @click="toRolePage(comment.author?.id)"
          >
            {{ comment.author?.name || '未知角色' }}
            <a-tooltip
              :content="`认证信息：${comment.author?.verify}`"
              v-if="comment.author?.verify"
            >
              <IconCheckCircleFill />
            </a-tooltip>
          </span>

          <a-tag
            size="small"
            v-if="comment.author?.id === postOwner?.id"
            class="role-tag"
          >
            楼主
          </a-tag>

          <span v-if="comment.reply_to"> 回复 </span>
          <span
            v-if="comment.reply_to"
            :style="{
              color: comment.reply_to.author?.verify
                ? 'var(--verify-color)'
                : 'var(--color-text-2)',
            }"
            @click="toRolePage(comment.reply_to.author?.id)"
          >
            {{ comment.reply_to.author?.name ?? '未知角色' }}
            <a-tooltip
              :content="`认证信息：${comment.reply_to.author?.verify}`"
              v-if="comment.reply_to.author?.verify"
            >
              <IconCheckCircleFill />
            </a-tooltip>
          </span>
          <a-tag
            size="small"
            v-if="
              comment.reply_to?.author &&
              comment.reply_to?.author?.id === postOwner?.id
            "
            class="role-tag"
          >
            楼主
          </a-tag>
        </a-space>
      </template>
      <template #actions>
        <div v-if="comment.preview" style="color: var(--color-text-3)">
          <icon-exclamation-circle />
          当前处于预览状态，评论实际展示位置可能变化
        </div>
        <a-space size="medium" v-if="!comment.deleted">
          <span
            class="action"
            key="heart"
            @click="like(comment)"
            :style="
              likeInfo[comment.id]?.liked ?? comment.liked ? 'color: red' : ''
            "
          >
            <IconHeartFill
              v-if="likeInfo[comment.id]?.liked ?? comment.liked"
            />
            <IconHeart v-else />
            {{ likeInfo[comment.id]?.like_count ?? comment.like_count }}
          </span>
          <span
            class="action"
            key="reply"
            @click="showReply = comment.id"
            v-if="commentable === 0"
          >
            <IconMessage /> 回复
          </span>

          <a-trigger
            :trigger="['click']"
            :unmount-on-close="false"
            :content-style="{
              backgroundColor: 'var(--trigger-bg)',
            }"
            update-at-scroll
          >
            <span class="action" key="more">
              <IconMoreVertical />
            </span>
            <template #content>
              <a-space direction="vertical" class="action-more" size="medium">
                <span
                  class="action action-more"
                  key="pin"
                  v-if="comment.depth === 1 && store.isCurrentRole(postOwner)"
                  @click="pin(comment)"
                >
                  <IconToTop />
                  {{ comment.pinned ? '取消置顶' : '置顶' }}
                </span>
                <a-popconfirm
                  content="你确定要删除此评论吗？"
                  v-if="
                    store.isCurrentRole(comment.author) ||
                    store.isCurrentRole(postOwner)
                  "
                  @ok="deleteComment(comment)"
                >
                  <span class="action action-more" key="delete">
                    <IconDelete /> 删除
                  </span>
                </a-popconfirm>
                <span
                  class="action action-more"
                  key="report"
                  @click="report(comment)"
                >
                  <IconExclamationCircle />
                  {{ comment.author.id === store.roleId ? '申诉' : '举报' }}
                </span>
                <span
                  class="action action-more"
                  key="review"
                  @click="
                    router.push({
                      name: 'admin-comment-detail',
                      params: { id: comment.id },
                    })
                  "
                  v-if="
                    store.isCurrentRole(comment.author) ||
                    store.permission.admin_forum
                  "
                >
                  <IconFindReplace /> 信息
                </span>
                <div class="comment-id">ID:{{ comment.id }}</div>
              </a-space>
            </template>
          </a-trigger>
        </a-space>
      </template>
      <template #avatar>
        <Avatar :role="comment.author" to-role-page />
      </template>

      <!-- 回复 -->
      <a-comment
        v-if="showReply === comment.id"
        :style="comment.children.length > 0 ? 'margin-bottom: 1em' : 'margin-bottom: 0.5em'"
      >
        <template #avatar>
          <Avatar :role="store.currentRole" switch-role />
        </template>
        <template #actions>
          <a-button
            type="primary"
            size="small"
            @click="handleReply(comment)"
            :loading="sendLoading"
          >
            回复
          </a-button>
          <a-button
            type="secondary"
            size="small"
            @click="showReply = 0"
            :disabled="sendLoading"
          >
            取消
          </a-button>
        </template>
        <template #content>
          <a-textarea
            v-model="replyContent"
            placeholder="请输入评论"
            :max-length="600"
            :show-word-limit="false"
            auto-size
            @keydown.ctrl.enter="handleReply(comment)"
          />
        </template>
      </a-comment>

      <Comment
        :postId="postId"
        :data="comment.children"
        :postOwner="postOwner"
        :bold="bold"
      />

      <a-button
        type="text"
        size="small"
        shape="round"
        v-if="comment.children_count > comment.children.length"
        :style="{
          top: '-5px',
          left: '-10px',
        }"
        @click="loadCommentChildren(comment)"
        :loading="loading.includes(comment.id)"
      >
        展开{{ comment.children_count - comment.children.length }}条
      </a-button>
    </a-comment>
  </div>

  <div style="display: flex; flex-direction: row-reverse" v-if="root">
    <a-pagination
      style="margin: 1em"
      :total="pagination.total"
      v-model:current="pagination.page"
      :page-size="pagination.pageSize"
      :base-size="isMobile ? 3 : 5"
      :buffer-size="isMobile ? 0 : 1"
      :size="isMobile ? 'small' : 'medium'"
      hide-on-single-page
      @change="loadComments"
    />
  </div>

  <a-comment v-if="root && comments !== null && allowComment">
    <template #avatar>
      <Avatar :role="store.currentRole" switch-role />
    </template>
    <template #content>
      <a-textarea
        v-model="commentContent"
        :placeholder="
          ['请输入评论', '请先登录', '匿名角色只能评论自己的内容'][commentable]
        "
        :max-length="600"
        :show-word-limit="false"
        auto-size
        @keydown.ctrl.enter="handleReply()"
        :disabled="commentable !== 0"
      />
    </template>
    <template #actions>
      <a-button
        type="primary"
        size="small"
        @click="handleReply()"
        :disabled="commentable !== 0"
        :loading="sendLoading"
      >
        评论
      </a-button>
    </template>
  </a-comment>
</template>

<style scoped lang="scss">
.role-tag {
  padding: 0 4px;
}

:deep(.arco-comment-title),
:deep(.arco-comment-actions) {
  user-select: none;
}

.action {
  color: var(--color-text-3);
  cursor: pointer;
}
.action-more {
  padding: 10px 8px;
}
.comment-id {
  color: var(--color-text-3);
  text-align: center;
  font-size: 0.8em;
}
</style>
