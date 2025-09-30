import { FilterXSS } from 'xss';

const filterXss = new FilterXSS({
  whiteList: {
    a: ['href', 'title', 'target', 'class'],
  },
  allowCommentTag: true,
});

export const xss = (str: string) => filterXss.process(str);

const filterXssAll = new FilterXSS({
  whiteList: {},
  allowCommentTag: true,
});

export const xssAll = (str: string) => filterXssAll.process(str);
