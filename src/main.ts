// Vue初始化
import { createApp } from 'vue';
import './styles/arco-override.css';
import './styles/style.scss';
import App from './App.vue';
import '@arco-design/web-vue/dist/arco.css';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { Notification, Message } from '@arco-design/web-vue';

import { initUserInfo } from './scripts/userInfo';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(router).use(pinia);
app.mount('#app');

// Arco组件初始化

Notification._context = app._context;
Message._context = app._context;
// 用户信息获取

initUserInfo();
setInterval(() => {
  initUserInfo();
}, 1000 * 60 * 5);

// Markdown配置

import { config as mdEditorConfig } from 'md-editor-v3';
import mermaid from 'mermaid';

mdEditorConfig({
  editorExtensions: {
    prettier: {
      standaloneJs: '/js/prettier-standalone.min.js',
      parserMarkdownJs: '/js/prettier-parser-markdown.min.js',
    },
    cropper: {
      js: '/js/cropper.min.js',
      css: '/css/cropper.min.css',
    },
    katex: {
      js: '/js/katex.min.js',
      css: '/css/katex.min.css',
    },
    highlight: {
      js: '/js/highlight.min.js',
    },
    screenfull: {
      js: '/js/screenfull.min.js',
    },
    mermaid: {
      instance: mermaid,
    },
  },
});
