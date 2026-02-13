import { BackButton } from '@/components/back-button';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageLocationUpdate = (_props: { params: { id: string } }) => {
  return (
    <PageLayout>
      <PageLayoutTopBar startActions={<BackButton />}>
        <PageLayoutTopBarTitle>Edit Location</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div>Edit Location</div>
      </PageLayoutContent>
    </PageLayout>
  );
};
