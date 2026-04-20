import { ChevronRightIcon } from 'lucide-react';

import { OrgLink } from '@/features/organization/org-link';

export function AccountNavLink({
  icon: Icon,
  children,
  ...linkProps
}: Omit<React.ComponentProps<typeof OrgLink>, 'children' | 'className'> & {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <OrgLink
      {...linkProps}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors duration-150 ease-out hover:bg-accent"
    >
      <Icon className="size-5 text-muted-foreground" />
      <span className="flex-1">{children}</span>
      <ChevronRightIcon className="size-4 text-muted-foreground" />
    </OrgLink>
  );
}
