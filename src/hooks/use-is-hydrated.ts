import { useSyncExternalStore } from 'react';

export const useIsHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
