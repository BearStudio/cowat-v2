import { useEffect, useMemo, useRef } from 'react';
import { Control, UseFormReturn, useWatch } from 'react-hook-form';

import type { FormFieldsCommuteBase } from '@/features/commute/schema';

const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Auto-computes inward times for stops before the last one,
 * using the same time intervals as the outward trip.
 *
 * The last stop holds the inward departure time (user input).
 * Earlier stops are computed as:
 *   lastInward + (lastOutward - stopOutward)
 *
 * Only recomputes when outward times or the last stop's inward
 * time change — direct edits to other inward times are preserved.
 *
 * `autoComputedIndices` is derived: a stop is "auto-computed" when
 * its current inward time matches the formula output.
 */
export const useAutoInwardTimes = ({
  control,
  setValue,
}: {
  control: Control<FormFieldsCommuteBase>;
  setValue: UseFormReturn<FormFieldsCommuteBase>['setValue'];
}) => {
  const commuteType = useWatch({
    control,
    name: 'type',
  });

  const stops = useWatch({
    control,
    name: 'stops',
  });

  const lastIndex = (stops?.length ?? 1) - 1;

  const computeKey = [
    commuteType,
    ...(stops?.map((s) => s?.outwardTime) ?? []),
    stops?.[lastIndex]?.inwardTime,
    stops?.length,
  ].join('|');

  const prevComputeKeyRef = useRef('');

  useEffect(() => {
    if (computeKey === prevComputeKeyRef.current) return;
    prevComputeKeyRef.current = computeKey;

    if (commuteType !== 'ROUND' || !stops || stops.length <= 1) return;

    const lastOutward = stops[lastIndex]?.outwardTime;
    const lastInward = stops[lastIndex]?.inwardTime;
    const canCompute = !!lastOutward && !!lastInward;

    const outwardMinutes = stops.map((stop) =>
      stop?.outwardTime ? timeToMinutes(stop.outwardTime) : null
    );
    for (let i = 1; i < outwardMinutes.length; i++) {
      if (
        outwardMinutes[i] !== null &&
        outwardMinutes[i - 1] !== null &&
        outwardMinutes[i]! < outwardMinutes[i - 1]!
      ) {
        outwardMinutes[i]! += 24 * 60;
      }
    }
    const lastOutwardMin =
      canCompute && outwardMinutes[lastIndex] != null
        ? outwardMinutes[lastIndex]
        : 0;
    const lastInwardMin = canCompute ? timeToMinutes(lastInward) : 0;

    for (let i = 0; i < lastIndex; i++) {
      const stopOutward = outwardMinutes[i];
      const computed =
        canCompute && stopOutward
          ? minutesToTime(lastInwardMin + (lastOutwardMin - stopOutward))
          : null;

      if ((stops[i]?.inwardTime ?? null) !== computed) {
        setValue(`stops.${i}.inwardTime`, computed, {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
    }
  }, [computeKey, commuteType, stops, setValue, lastIndex]);

  const autoComputedIndices = useMemo(() => {
    if (commuteType !== 'ROUND' || !stops || stops.length <= 1)
      return new Set<number>();

    const lastOutward = stops[lastIndex]?.outwardTime;
    const lastInward = stops[lastIndex]?.inwardTime;
    if (!lastOutward || !lastInward) return new Set<number>();

    const outwardMinutes = stops.map((stop) =>
      stop?.outwardTime ? timeToMinutes(stop.outwardTime) : null
    );

    for (let i = 1; i < outwardMinutes.length; i++) {
      if (
        outwardMinutes[i] !== null &&
        outwardMinutes[i - 1] !== null &&
        outwardMinutes[i]! < outwardMinutes[i - 1]!
      ) {
        outwardMinutes[i]! += 24 * 60;
      }
    }
    const lastOutwardMin =
      outwardMinutes[lastIndex] != null ? outwardMinutes[lastIndex] : 0;
    const lastInwardMin = timeToMinutes(lastInward);

    const result = new Set<number>();
    for (let i = 0; i < lastIndex; i++) {
      const stopOutward = outwardMinutes[i];
      if (!stopOutward) continue;
      const computed = minutesToTime(
        lastInwardMin + (lastOutwardMin - stopOutward)
      );
      if (stops[i]?.inwardTime === computed) {
        result.add(i);
      }
    }
    return result;
  }, [commuteType, stops, lastIndex]);

  return { commuteType, stops, autoComputedIndices };
};
