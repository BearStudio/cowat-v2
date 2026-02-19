import { useTranslation } from 'react-i18next';

import { featureIcons } from '@/lib/feature-icons';

import { BackButton } from '@/components/back-button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

type PageCommuteViewProps = {
  commuteId: string;
};

export const PageCommuteView = ({ commuteId }: PageCommuteViewProps) => {
  const { t } = useTranslation(['commute']);

  return (
    <PageLayout>
      <PageLayoutTopBar startActions={<BackButton />}>
        <PageLayoutTopBarTitle>
          <span>{t('commute:view.title')}</span>
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <p className="text-muted-foreground">{commuteId}</p>
      </PageLayoutContent>
    </PageLayout>
  );
};
