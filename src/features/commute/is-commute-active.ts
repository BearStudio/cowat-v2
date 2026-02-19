import dayjs from 'dayjs';

export function isCommuteActive(commute: {
  date: Date;
  stops: { outwardTime: string }[];
}): boolean {
  const commuteDay = dayjs(commute.date);

  if (commuteDay.isToday()) return true;

  const firstOutward = commute.stops.at(0)?.outwardTime;
  if (!firstOutward) return false;

  const [hours, minutes] = firstOutward.split(':').map(Number);
  const departure = commuteDay.hour(hours!).minute(minutes!);

  return departure.diff(dayjs(), 'hour', true) <= 3;
}
