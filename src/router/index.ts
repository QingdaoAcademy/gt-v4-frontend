import { sharedFunctions, useStore } from '../stores';
import { createWebHistory, createRouter } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Message } from '@arco-design/web-vue';

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue'),
    meta: {
      title: '首页',
      showBack: false,
    },
  },
  {
    path: '/article/:id/',
    name: 'article',
    component: () => import('../views/article.vue'),
    meta: {
      title: '文章详情',
    },
  },
  {
    path: '/moment/:id/',
    name: 'moment',
    component: () => import('../views/moment.vue'),
    meta: {
      title: '动态详情',
    },
  },
  {
    path: '/post/:id/',
    name: 'post',
    component: () => import('../views/post.vue'),
    meta: {
      title: '帖子截图',
    },
  },
  {
    path: '/edit/',
    name: 'edit',
    component: () => import('../views/edit.vue'),
    meta: {
      title: '编辑帖子',
      requireLogin: true,
    },
  },
  {
    path: '/drop/',
    name: 'drop',
    component: () => import('../views/drop.vue'),
    meta: {
      title: '空投',
    },
  },
  {
    path: '/register/',
    name: 'register',
    component: () => import('../views/register.vue'),
    meta: {
      title: '注册',
      requireUnLogin: true,
    },
  },
  {
    path: '/login/',
    name: 'login',
    component: () => import('../views/login.vue'),
    meta: {
      title: '登录',
      requireUnLogin: true,
    },
  },
  {
    path: '/settings/',
    name: 'settings',
    component: () => import('../views/settings.vue'),
    meta: {
      title: '设置',
      requireLogin: true,
    },
  },
  {
    path: '/email/',
    name: 'email',
    component: () => import('../views/email.vue'),
    meta: {
      title: '绑定邮箱',
      requireLogin: true,
    },
  },
  {
    path: '/admin/',
    name: 'admin',
    component: () => import('../views/admin.vue'),
    children: [
      {
        path: 'report/',
        name: 'admin-report',
        component: () => import('../views/admin/report_list.vue'),
        meta: {
          title: '举报',
        },
      },
      {
        path: 'user/',
        name: 'admin-user',
        component: () => import('../views/admin/user_list.vue'),
        meta: {
          title: '用户列表',
        },
      },
      {
        path: 'user/:id/',
        name: 'admin-user-detail',
        component: () => import('../views/admin/user_detail.vue'),
        meta: {
          title: '用户管理',
        },
      },
      {
        path: 'role/',
        name: 'admin-role',
        component: () => import('../views/admin/role_list.vue'),
        meta: {
          title: '角色列表',
        },
      },
      {
        path: 'role/:id/',
        name: 'admin-role-detail',
        component: () => import('../views/admin/role_detail.vue'),
        meta: {
          title: '角色管理',
        },
      },
      {
        path: 'post/',
        name: 'admin-post',
        component: () => import('../views/admin/post_list.vue'),
        meta: {
          title: '帖子列表',
        },
      },
      {
        path: 'post/:id/',
        name: 'admin-post-detail',
        component: () => import('../views/admin/post_detail.vue'),
        meta: {
          title: '帖子管理',
          permissions: [],
        },
      },
      {
        path: 'comment/',
        name: 'admin-comment',
        component: () => import('../views/admin/comment_list.vue'),
        meta: {
          title: '评论列表',
        },
      },
      {
        path: 'comment/:id/',
        name: 'admin-comment-detail',
        component: () => import('../views/admin/comment_detail.vue'),
        meta: {
          title: '评论管理',
          permissions: [],
        },
      },
      {
        path: 'image/',
        name: 'admin-image',
        component: () => import('../views/admin/image_list.vue'),
        meta: {
          title: '图片列表',
        },
      },
    ],
    meta: {
      title: '管理',
      requireLogin: true,
      permissions: ['base_admin'],
    },
  },
  {
    path: '/alumni/',
    name: 'alumni',
    component: () => import('../views/alumni.vue'),
    meta: {
      title: '校友墙',
    },
  },
  {
    path: '/about/',
    name: 'about',
    component: () => import('../views/about.vue'),
    meta: {
      title: '关于瓜田',
    },
  },
  {
    path: '/role/:id/',
    name: 'role',
    component: () => import('../views/role.vue'),
    meta: {
      title: '角色详情',
    },
  },
  {
    path: '/zero-width/',
    name: 'zero',
    component: () => import('../views/zero.vue'),
    meta: {
      title: '文本暗水印',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/404.vue'),
    meta: {
      title: '404',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

NProgress.configure({
  showSpinner: false,
});

router.beforeEach((to, _from, next) => {
  NProgress.start();
  const store = useStore();
  if (to.name === 'login' && to.query.admin_token) {
    next();
    return;
  }
  if (to.meta.requireLogin && !store.loggedIn) {
    next({ name: 'login', query: { next: to.fullPath } });
    return;
  }
  if (Array.isArray(to.meta.permissions)) {
    for (const permission of to.meta.permissions) {
      // @ts-ignore
      if (!store.permission[permission]) {
        Message.error('您没有权限访问此页面');
        return;
      }
    }
  }
  if (to.meta.requireUnLogin && store.loggedIn) {
    next({ name: 'index' });
    return;
  }
  next();
});

router.afterEach((to, from) => {
  NProgress.done();
  if (to.name !== from.name) {
    sharedFunctions.scrollTop();
  }
  if (to.meta.title) {
    window.document.title = `${to.meta.title} - QA瓜田`;
  } else {
    window.document.title = 'QA瓜田';
  }
});

export default router;
