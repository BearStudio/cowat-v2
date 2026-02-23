/** @jsxImportSource jsx-slack */
import { Context, Mrkdwn, Section } from 'jsx-slack';

/**
 * The most common notification layout: a main mrkdwn section followed
 * by a context line (date, type, etc.). Used by all booking templates
 * and commute-updated / commute-canceled.
 *
 * Must be rendered inside <Blocks>.
 */
export function SimpleNotification({
  text,
  context,
}: {
  text: string;
  context: string;
}) {
  return (
    <>
      <Section>
        <Mrkdwn>{text}</Mrkdwn>
      </Section>
      <Context>
        <Mrkdwn>{context}</Mrkdwn>
      </Context>
    </>
  );
}
