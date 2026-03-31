import { EllipsisVerticalIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { OrgButtonLink } from '@/features/organization/org-button-link';

const CommuteOptionLinks = ({
  size = 'sm',
  className,
}: {
  size?: ComponentProps<typeof OrgButtonLink>['size'];
  className?: string;
}) => {
  const { t } = useTranslation(['commute']);

  return (
    <>
      <OrgButtonLink
        variant="secondary"
        size={size}
        className={className}
        to="/app/$orgSlug/account/commute-templates"
      >
        <featureIcons.CommuteTemplates />
        {t('commute:list.speedDial.myCommutes')}
      </OrgButtonLink>
      <OrgButtonLink
        variant="secondary"
        size={size}
        className={className}
        to="/app/$orgSlug/account/locations"
      >
        <featureIcons.Locations />
        {t('commute:list.speedDial.myLocations')}
      </OrgButtonLink>
    </>
  );
};

export const CommuteOptionsMenu = () => {
  return (
    <>
      <div className="hidden md:contents">
        <CommuteOptionLinks size="sm" />
      </div>
      <div className="contents md:hidden">
        <Drawer swipeDirection="up">
          <DrawerTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <EllipsisVerticalIcon />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerBody className="flex-col gap-2 pt-6 pb-4">
              <CommuteOptionLinks
                size="default"
                className="w-full justify-start"
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
