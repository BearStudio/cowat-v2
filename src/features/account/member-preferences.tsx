import { useTranslation } from 'react-i18next';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

import { AccountCardRow } from '@/features/account/account-card-row';
import { AutoAcceptToggle } from '@/features/account/auto-accept-toggle';

export const MemberPreferences = () => {
  const { t } = useTranslation(['account']);
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <CardTitle>{t('account:memberPreferences.title')}</CardTitle>
      </CardHeader>
      <AccountCardRow
        label={t('account:userCard.autoAccept.label')}
        className="sm:items-center"
      >
        <AutoAcceptToggle />
      </AccountCardRow>
    </Card>
  );
};
