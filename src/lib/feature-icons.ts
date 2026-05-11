import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
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
  Statistics: ChartNoAxesCombined,
} as const;

export const tripTypeIcons = {
  ROUND: Repeat,
  ONEWAY: ArrowRight,
  RETURN: ArrowLeft,
} as const;
