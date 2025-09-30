// @ts-ignore
import { DateTime } from 'luxon';

export const timeBeforeNow = (time: string) => {
  if (time === undefined) return false;
  const dt = DateTime.fromISO(time);
  const now = DateTime.now();
  return now.diff(dt, 'seconds').seconds > 0;
};

export const formatDatetime = (time: string) => {
  if (time === undefined) return '';
  const dt = DateTime.fromISO(time);
  return dt.setLocale('zh-CN').toLocaleString(DateTime.DATETIME_SHORT);
};

export const formatTime = (time: string) => {
  if (time === undefined) return '';
  const dt = DateTime.fromISO(time);
  return dt.setLocale('zh-CN').toLocaleString(DateTime.TIME_SIMPLE);
};

export const formatRelativeTime = (time: string, future: boolean = false) => {
  if (time === undefined) return '';
  const dt = DateTime.fromISO(time);
  const now = DateTime.now();
  const diff = now.diff(dt, 'minutes').minutes;

  if (diff < 1 && future === false) {
    return '刚刚';
  }

  return dt.setLocale('zh-CN').toRelative();
};
