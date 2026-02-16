import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

export const OrgMembers = (props: {
  orgId: string;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }>;
}) => {
  const { t } = useTranslation(['organization']);

  return (
    <DataList>
      <DataListRow>
        <DataListCell>
          <h2 className="text-sm font-medium">
            {t('organization:members.title')}
          </h2>
        </DataListCell>
      </DataListRow>
      {!props.members.length ? (
        <DataListEmptyState className="min-h-20">
          {t('organization:manager.detail.noMembers')}
        </DataListEmptyState>
      ) : (
        props.members.map((member) => (
          <DataListRow key={member.id} className="">
            <DataListCell className="flex-none">
              <Avatar>
                <AvatarImage
                  src={member.user.image ?? undefined}
                  alt={member.user.name ?? ''}
                />
                <AvatarFallback
                  variant="boring"
                  name={member.user.name ?? ''}
                />
              </Avatar>
            </DataListCell>
            <DataListCell>
              <DataListText className="font-medium">
                {member.user.name}
              </DataListText>
              <DataListText className="text-xs text-muted-foreground">
                {member.user.email}
              </DataListText>
            </DataListCell>
            <DataListCell className="flex-none">
              <Badge
                variant={
                  member.role === 'owner' || member.role === 'admin'
                    ? 'default'
                    : 'secondary'
                }
              >
                {t(
                  // @ts-expect-error -- dynamic i18n key
                  `organization:members.roles.${member.role}`
                )}
              </Badge>
            </DataListCell>
          </DataListRow>
        ))
      )}
    </DataList>
  );
};
