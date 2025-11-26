import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export function todayDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function currentTime(): string {
  return dayjs().format('HH:mm');
}

export function formatDate(date: string): string {
  return dayjs(date).format('DD MMMM YYYY');
}

export function formatTime(time: string): string {
  const reference = dayjs().format('YYYY-MM-DD');
  return dayjs(`${reference} ${time}`).format('HH:mm');
}
