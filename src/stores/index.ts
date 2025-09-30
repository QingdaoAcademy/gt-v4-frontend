import { defineStore } from 'pinia';

import {
  Theme,
  User,
  RoleBrief,
  Authorization,
  Permission,
  Quota,
} from '../types';

export const useStore = defineStore('__default__', {
  state: () => ({
    user: null as User | null,
    quota: {} as Quota,
    permission: {} as Permission,
    roles: [] as RoleBrief[],
    authorization: null as Authorization | null,
    roleId: null as number | null,
    unreadNotificationCount: 0 as number,
    captcha_expire_time: 0 as number,
    signed: false as boolean,
  }),
  actions: {
    logout() {
      this.authorization = null;
      this.roleId = null;
      this.quota = {} as Quota;
      this.permission = {} as Permission;
      this.roles = [] as RoleBrief[];
      this.captcha_expire_time = 0;
      this.signed = false;
    },
  },
  getters: {
    loggedIn(state) {
      return state.authorization !== null;
    },
    getRoleById(state) {
      return (id: number): RoleBrief | undefined => {
        return state.roles.find(role => role.id === id);
      };
    },
    currentRole(state) {
      if (state.roleId === null) {
        return undefined;
      }
      return state.roles.find(role => role.id === state.roleId);
    },
    isCurrentRole(state) {
      return (role: RoleBrief | null | undefined): boolean => {
        if (state.roleId === null || role === null || role === undefined) {
          return false;
        }
        return state.roleId === role.id;
      };
    },
  },
  persist: {
    storage: sessionStorage,
  },
});

export const usePersistStore = defineStore('persistStorage', {
  state: () => ({
    theme: 'system' as Theme,
    commentCardPosition: 'right' as 'right' | 'bottom',
    authorization: null as Authorization | null,
    roleId: null as number | null,
    remember_me: false as boolean,
  }),
  actions: {
    setTheme(theme: Theme) {
      const oldTheme = this.currentTheme;
      this.theme = theme;
      return oldTheme !== this.currentTheme;
    },
    logout() {
      this.authorization = null;
      this.roleId = null;
    },
  },
  getters: {
    currentTheme(state): 'light' | 'dark' {
      if (state.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      return state.theme;
    },
    loggedIn(state) {
      return state.authorization !== null;
    },
  },
  persist: true,
});

export const sharedFunctions = {
  switchRole() {},
  setRoleId(id: number) {
    const store = useStore();
    store.roleId = id;
    const persistStore = usePersistStore();
    persistStore.roleId = id;
  },
  logout() {
    const store = useStore();
    const persistStore = usePersistStore();
    store.logout();
    persistStore.logout();
  },
  checkExpired() {
    const store = useStore();
    const persistStore = usePersistStore();
    const time = Math.round(Date.now() / 1000) - 60;
    if (store.authorization !== null) {
      if (store.authorization.payload.exp < time) {
        store.logout();
      }
    }
    if (persistStore.authorization !== null) {
      if (persistStore.authorization.payload.exp < time) {
        persistStore.logout();
      }
    }
  },
  // @ts-ignore
  showReport(content_id: string | number, content_type: string) {},
  showDonateCoin(
    // @ts-ignore
    role: RoleBrief,
    // @ts-ignore
    post_id?: number,
    // @ts-ignore
    value?: number | null,
    // @ts-ignore
    callback?: (change: number) => void
  ) {},
  scrollTop() {},
  // @ts-ignore
  showNotification(onClose: () => void) {},
  checkCaptcha(): Promise<boolean | void> {
    return new Promise<boolean>((_resolve, reject) => {
      reject(false);
    });
  },
};
