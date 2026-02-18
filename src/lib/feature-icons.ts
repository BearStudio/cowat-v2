import {
  ArrowDownLeft,
  ArrowUpRight,
  CarIcon,
  MapPinIcon,
  Repeat,
  RouteIcon,
} from 'lucide-react';

export const featureIcons = {
  Locations: MapPinIcon,
  CommuteTemplates: RouteIcon,
  Commutes: CarIcon,
} as const;

export const tripTypeIcons = {
  ROUND: Repeat,
  ONEWAY: ArrowUpRight,
  RETURN: ArrowDownLeft,
} as const;
