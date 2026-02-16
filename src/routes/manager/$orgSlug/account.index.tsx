import { createFileRoute } from '@tanstack/react-router';

import { PageAccount } from '@/features/account/manager/page-account';

export const Route = createFileRoute('/manager/$orgSlug/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageAccount params={params} />;
}
