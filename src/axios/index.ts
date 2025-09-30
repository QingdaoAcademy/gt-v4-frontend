import axios from 'axios';
import { Message } from '@arco-design/web-vue';
// import router from '../router';
import { useStore, sharedFunctions } from '../stores';

// The '/prod/api' proxy is only used during development when the 'PROD_BACKEND' cookie is present.
// In production, the proxy is not used and '/api' is always the base URL.
let baseUrl;
if (
  document.cookie.search('PROD_BACKEND') !== -1 &&
  process.env.NODE_ENV !== 'production'
) {
  baseUrl = '/prod/api';
} else {
  baseUrl = '/api';
}

export const Axios = axios.create({
  baseURL: baseUrl,
});

Axios.interceptors.request.use(config => {
  if (config.url?.slice(0, 4) !== 'http') {
    const jwts = [];
    sharedFunctions.checkExpired();
    const store = useStore();
    if (store.loggedIn) {
      const payload = btoa(
        JSON.stringify({
          ...store.authorization?.payload,
          role_id: store.roleId,
        })
      );
      const signature = store.authorization?.signature;
      jwts.push(`${payload}.${signature}`);
    }
    if (jwts.length > 0) {
      config.headers['Authorization'] = `JWT ${jwts.join('|')}`;
    }
  }
  return config;
});

Axios.defaults.transformResponse = [
  (data, headers) => {
    if (
      typeof data === 'string' &&
      headers['content-type'] === 'application/json'
    ) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn('JSON Parse Error', e);
      }
    }
    return data;
  },
];

export const errorHandler = (err: any) => {
  let _message = '未知错误';
  if (err.response?.data?.msg) _message = err.response.data.msg;
  else if (err.response?.data?.[0]) _message = err.response.data[0];
  else if (err.request) _message = '网络异常，请检查网络连接';
  Message.error(_message);
  // if (err.response?.data?.action)
  //   router.push({ name: err.response.data.action });
};

export default Axios;
