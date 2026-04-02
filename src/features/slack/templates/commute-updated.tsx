/** @jsxImportSource jsx-slack */
import { Blocks, Button, Divider, Mrkdwn, Section } from 'jsx-slack';

import i18n from '@/lib/i18n';
import { routeUrl } from '@/lib/route-url';

import { SlackBody } from '@/features/slack/components/body';
import { SlackHeader } from '@/features/slack/components/header';
import type { CommuteUpdatedEvent } from '@/server/notifications/types';

import { formatDate, localizeCommuteType } from '../utils';

type Props = {
  event: CommuteUpdatedEvent;
  baseUrl: string;
};

export function CommuteUpdated({ event, baseUrl }: Props) {
  const commutesUrl = routeUrl(baseUrl, '/app/$orgSlug/commutes', {
    params: { orgSlug: event.payload.orgSlug },
  });
  const { payload } = event;

  const previousDate = formatDate(payload.commuteDate);
  const newDate = formatDate(payload.newCommuteDate);
  const previousType = localizeCommuteType(payload.commuteType);
  const newType = localizeCommuteType(payload.newCommuteType);

  const dateChanged = previousDate !== newDate;
  const typeChanged = payload.commuteType !== payload.newCommuteType;

  const diffLines = [
    dateChanged
      ? i18n.t('notifications:commute.updatedDate', { previousDate, newDate })
      : null,
    typeChanged
      ? i18n.t('notifications:commute.updatedType', { previousType, newType })
      : null,
  ].filter(Boolean) as string[];

  return (
    <Blocks>
      <SlackHeader
        aside={
          <Button url={commutesUrl}>
            {i18n.t('notifications:commute.viewCommutes')}
          </Button>
        }
      >
        {i18n.t('notifications:commute.updated.headline')}
      </SlackHeader>
      <SlackBody>
        {i18n.t('notifications:commute.updated.body', {
          driverName: payload.driverName,
        })}
      </SlackBody>
      {diffLines.length > 0 ? (
        <>
          <Divider />
          <Section>
            <Mrkdwn>
              <>
                {diffLines[0]}
                {diffLines[1] !== undefined && (
                  <>
                    <br />
                    {diffLines[1]}
                  </>
                )}
              </>
            </Mrkdwn>
          </Section>
        </>
      ) : null}
    </Blocks>
  );
}
