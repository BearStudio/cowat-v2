/** @jsxImportSource jsx-slack */
import type JSXSlack from 'jsx-slack';
import { Mrkdwn, Section } from 'jsx-slack';

export function SlackHeader({
  children,
  aside,
}: {
  aside?: JSXSlack.ChildElement;
  children?: JSXSlack.ChildElement;
}) {
  return (
    <Section>
      <Mrkdwn>{children}</Mrkdwn>
      {aside}
    </Section>
  );
}
