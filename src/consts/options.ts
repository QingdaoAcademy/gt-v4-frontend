export const IdentityOptions = [
  { value: '学生', label: '学生' },
  { value: '教师', label: '教师' },
  { value: '家长', label: '家长' },
  { value: '其他', label: '其他' },
];

export const School = {
  qdzx: 'qa',
  jjlxx: 'jjl',
};

export const SchoolLabel = {
  [School.qdzx]: '青岛中学',
  [School.jjlxx]: '金家岭学校',
};

export const SchoolOptions = Object.entries(SchoolLabel).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const PostType = {
  moment: 1,
  article: 2,
};

export const PostTypeLabel = {
  [1]: '动态',
  [2]: '文章',
};

export const PostShareWith = {
  private: -3,
  student: -2,
  user: -1,
  public: 0,
};

export const PostShareWithLabel = {
  [-3]: '仅我可见',
  [-2]: '仅学生可见',
  [-1]: '校内可见',
  [0]: '所有人可见',
};

export const PostShareWithOptions = Object.entries(PostShareWithLabel)
  .map(([value, label]) => ({ value: parseInt(value), label }))
  .sort((a, b) => b.value - a.value);

export const PostMediaType = {
  image: 0,
  link: 1,
  video: 2,
  bilibili: 3,
};

export const PostMediaTypeLabel = {
  [0]: '图片',
  [1]: '链接',
  [2]: '视频',
  [3]: '哔哩哔哩',
};

export const PostMediaTypeOptions = [
  { value: 0, label: '图片' },
  // { value: 1, label: '链接', disabled: true },
  { value: 2, label: '视频' },
  { value: 3, label: '哔哩哔哩', disabled: true },
];

export const ReviewStatus = {
  rejected: -3,
  pendingRecheck: -2,
  pending: -1,
  noNeed: 0,
  accepted: 1,
};

export const ReviewStatusLabel = {
  [-3]: '审核不通过',
  [-2]: '复核中',
  [-1]: '审核中',
  [0]: '默认放行',
  [1]: '审核通过',
};

export const ReviewStatusOptions = [
  { value: -3, label: ReviewStatusLabel[-3] },
  { value: -2, label: ReviewStatusLabel[-2] },
  { value: -1, label: ReviewStatusLabel[-1] },
  { value: 0, label: ReviewStatusLabel[0] },
  { value: 1, label: ReviewStatusLabel[1] },
];

export const ReportContentType = {
  post: 'post',
  comment: 'comment',
  drop: 'drop',
  role: 'role',
  user: 'user',
};

export const ReportContentTypeLabel = {
  post: '帖子',
  comment: '评论',
  drop: '空投',
  role: '角色',
  user: '用户',
};

export const ReportContentTypeOptions = Object.entries(
  ReportContentTypeLabel
).map(([value, label]) => ({
  value,
  label,
}));

export const ReportStatus = {
  reject: -1,
  pending: 0,
  accept: 1,
};

export const ReportStatusLabel = {
  [-1]: '驳回举报',
  [0]: '等待处理',
  [1]: '举报已受理',
};

export const ReportStatusOptions = [
  { value: -1, label: ReportStatusLabel[-1] },
  { value: 0, label: ReportStatusLabel[0] },
  { value: 1, label: ReportStatusLabel[1] },
];

export const PostOrderingOptions = [
  {
    value: '-update_time',
    label: '最新互动',
  },
  {
    value: '-create_time',
    label: '最新发布',
  },
  {
    value: '-like_count',
    label: '最多点赞',
  },
  {
    value: '-comment_count',
    label: '最多评论',
  },
];

export const CommentOrderingOptions = [
  {
    value: 'create_time',
    label: '最早发布',
  },
  {
    value: '-create_time',
    label: '最新发布',
  },
  {
    value: '-like_count',
    label: '最多点赞',
  },
];

export const ExpireDays = {
  DAY_1: 1,
  DAY_3: 3,
  DAY_7: 7,
  DAY_15: 15,
};

export const ExpireDaysOptions = [
  {
    value: 1,
    label: '1天',
  },
  {
    value: 3,
    label: '3天',
  },
  {
    value: 7,
    label: '7天',
  },
  {
    value: 15,
    label: '15天',
  },
];

export const FileStorageLabel = {
  dogecloud: '多吉云',
  aliyun: '阿里云',
};

export const FileStorageOptions = Object.entries(FileStorageLabel).map(
  ([value, label]) => ({ value, label })
);

export const NotificationType = {
  SYSTEM: 'system',
  POST_COMMENT: 'post_comment',
  COMMENT_REPLY: 'comment_reply',
  POST_LIKE: 'post_like',
  COMMENT_LIKE: 'comment_like',
};

export const ImageScene = {
  default: 'default',
  post: 'post',
  avatar: 'avatar',
};

export const ImageSceneLabel = {
  [ImageScene.default]: '默认',
  [ImageScene.post]: '帖子',
  [ImageScene.avatar]: '头像',
};

export const ImageSceneOptions = [
  {
    value: ImageScene.default,
    label: '默认',
  },
  {
    value: ImageScene.post,
    label: '帖子',
  },
  {
    value: ImageScene.avatar,
    label: '头像',
  },
];

export const CoinRecordType = {
  REGISTER: 'register',
  SIGN: 'sign',
  DAILY: 'daily',
  ONE_TIME: 'one_time',
  INVITE: 'invite',
  DONATE: 'donate',
  TRANSFER: 'transfer',
  PUNISH: 'punish',
  CHARGE: 'charge',
  ADMIN: 'admin',
  ROLE: 'role',
};

export const CoinRecordTypeLabel = {
  [CoinRecordType.REGISTER]: '注册',
  [CoinRecordType.SIGN]: '签到',
  [CoinRecordType.DAILY]: '每日任务',
  [CoinRecordType.ONE_TIME]: '一次性任务',
  [CoinRecordType.INVITE]: '邀请',
  [CoinRecordType.DONATE]: '投币',
  [CoinRecordType.TRANSFER]: '转账',
  [CoinRecordType.PUNISH]: '惩罚',
  [CoinRecordType.CHARGE]: '充值',
  [CoinRecordType.ADMIN]: '管理员调整',
  [CoinRecordType.ROLE]: '角色操作',
};

export const CoinRecordTypeOptions = Object.entries(CoinRecordType).map(
  // @ts-ignore
  ([key, value]) => ({
    value,
    label: CoinRecordTypeLabel[value as keyof typeof CoinRecordTypeLabel],
  })
);

export const timetableDays = [
  { key: 1, title: '星期一' },
  { key: 2, title: '星期二' },
  { key: 3, title: '星期三' },
  { key: 4, title: '星期四' },
  { key: 5, title: '星期五' },
  { key: 6, title: '星期六' },
  { key: 0, title: '星期日' },
];
