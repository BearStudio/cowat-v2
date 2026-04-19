import {
  ArrowLeft,
  ArrowRight,
  HandIcon,
  InboxIcon,
  MapPinIcon,
  Repeat,
  RouteIcon,
} from 'lucide-react';

import { IconCarDuotone } from '@/components/icons/generated';
export const featureIcons = {
  Locations: MapPinIcon,
  CommuteTemplates: RouteIcon,
  Commutes: IconCarDuotone,
  CommuteRequest: HandIcon,
  Bookings: InboxIcon,
} as const;

export const tripTypeIcons = {
  ROUND: Repeat,
  ONEWAY: ArrowRight,
  RETURN: ArrowLeft,
} as const;
