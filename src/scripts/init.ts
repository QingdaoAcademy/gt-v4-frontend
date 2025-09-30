import { usePersistStore } from '../stores';

export const themeInit = () => {
  const persistStore = usePersistStore();
  document.body.setAttribute('arco-theme', persistStore.currentTheme);
};
