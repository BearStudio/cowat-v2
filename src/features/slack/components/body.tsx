/** @jsxImportSource jsx-slack */

import JSXSlack, { Mrkdwn, Section } from 'jsx-slack';

export function SlackBody({
  children,
  aside,
}: {
  children?: JSXSlack.ChildElement;
  aside?: JSXSlack.ChildElement;
}) {
  if (!children) return null;

  return (
    <Section>
      <Mrkdwn>{children}</Mrkdwn>
      {aside}
    </Section>
  );
}
