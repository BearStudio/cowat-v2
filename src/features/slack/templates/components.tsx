/** @jsxImportSource jsx-slack */
import type JSXSlack from 'jsx-slack';
import { Context, Mrkdwn, Section } from 'jsx-slack';

/**
 * The most common notification layout: a main mrkdwn section followed
 * by a context line (date, type, etc.). Used by all booking templates
 * and commute-updated / commute-canceled.
 *
 * Pass an `action` (e.g. a <Button>) to render it as the section accessory.
 * Must be rendered inside <Blocks>.
 */
export function SimpleNotification({
  text,
  context,
  action,
}: {
  text: string;
  context: string;
  action?: JSXSlack.JSX.Element;
}) {
  return (
    <>
      <Section>
        <Mrkdwn>{text}</Mrkdwn>
        {action}
      </Section>
      <Context>
        <Mrkdwn>{context}</Mrkdwn>
      </Context>
    </>
  );
}
