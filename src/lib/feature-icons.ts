import {
  ArrowDownLeft,
  ArrowUpRight,
  InboxIcon,
  MapPinIcon,
  MegaphoneIcon,
  Repeat,
  RouteIcon,
} from 'lucide-react';

import { IconCarDuotone } from '@/components/icons/generated';
export const featureIcons = {
  Locations: MapPinIcon,
  CommuteTemplates: RouteIcon,
  Commutes: IconCarDuotone,
  CommuteRequest: MegaphoneIcon,
  Bookings: InboxIcon,
} as const;

export const tripTypeIcons = {
  ROUND: Repeat,
  ONEWAY: ArrowUpRight,
  RETURN: ArrowDownLeft,
} as const;
