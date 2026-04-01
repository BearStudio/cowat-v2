import { FlatNamespace } from 'i18next';
import { PlusIcon } from 'lucide-react';
import { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import {
  type FabVariantProps,
  fabVariants,
} from '@/components/ui/floating-action-button';
import { SpeedDial, SpeedDialItem } from '@/components/ui/speed-dial';

import { OrgButtonLink } from '@/features/organization/org-button-link';

export type ActionConfig = {
  key: string;
  label: string;
  icon: ReactNode;
  to: ComponentProps<typeof OrgButtonLink>['to'];
  variant?: ComponentProps<typeof Button>['variant'];
  fabSize?: FabVariantProps['size'];
};

export const COMMUTE_ACTIONS: ActionConfig[] = [
  {
    key: 'locations',
    label: 'commute:list.speedDial.myLocations',
    icon: <featureIcons.Locations />,
    to: '/app/$orgSlug/account/locations',
  },
  {
    key: 'templates',
    label: 'commute:list.speedDial.myCommutes',
    icon: <featureIcons.CommuteTemplates />,
    to: '/app/$orgSlug/account/commute-templates',
  },
  {
    key: 'request',
    label: 'commute:list.speedDial.requestCommute',
    icon: <featureIcons.CommuteRequest />,
    fabSize: 'default',
    to: '/app/$orgSlug/commutes/request',
  },
  {
    key: 'create',
    label: 'commute:list.speedDial.createCommute',
    icon: <PlusIcon />,
    variant: 'secondary',
    fabSize: 'default',
    to: '/app/$orgSlug/commutes/new',
  },
];

type ResponsiveActionsProps = {
  icon: ReactNode;
  label: string;
  actions: ActionConfig[];
  ns?: FlatNamespace | FlatNamespace[];
};

export const ResponsiveActions = ({
  icon,
  label,
  actions,
  ns,
}: ResponsiveActionsProps) => {
  const isMobile = useIsMobile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { t } = useTranslation(ns as any);

  if (isMobile) {
    return (
      <SpeedDial icon={icon} label={t(label)}>
        {actions.map((action) => (
          <SpeedDialItem key={action.key} label={t(action.label)}>
            <OrgButtonLink
              size="icon"
              variant="default"
              className={fabVariants({ size: action.fabSize ?? 'sm' })}
              to={action.to}
            >
              {action.icon}
            </OrgButtonLink>
          </SpeedDialItem>
        ))}
      </SpeedDial>
    );
  }

  return (
    <>
      {actions.map((action) => (
        <OrgButtonLink
          key={action.key}
          variant={action.variant ?? 'ghost'}
          size="sm"
          to={action.to}
        >
          {action.icon}
          {t(action.label)}
        </OrgButtonLink>
      ))}
    </>
  );
};
