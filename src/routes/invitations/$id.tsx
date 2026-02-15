import { createFileRoute } from '@tanstack/react-router';

import { PageAcceptInvitation } from '@/features/organization/page-accept-invitation';

export const Route = createFileRoute('/invitations/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <PageAcceptInvitation invitationId={id} />;
}
