import { createFileRoute } from '@tanstack/react-router';

import { PageAccount } from '@/features/account/app/page-account';

export const Route = createFileRoute('/app/$orgSlug/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageAccount params={params} />;
}
