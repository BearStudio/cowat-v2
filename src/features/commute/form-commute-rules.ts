import dayjs from 'dayjs';

export const isTimeInFuture = (date: Date, time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return dayjs(date).hour(hours).minute(minutes).isAfter(dayjs());
};

export const isInwardAfterOutward = (
  outwardTime: string,
  inwardTime: string
) => {
  return inwardTime > outwardTime;
};
