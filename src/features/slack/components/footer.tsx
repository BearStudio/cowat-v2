/** @jsxImportSource jsx-slack */
import JSXSlack, { Context, Divider, Mrkdwn } from 'jsx-slack';

export function SlackFooter({ children }: { children: JSXSlack.ChildElement }) {
  return (
    <>
      <Divider />
      <Context>
        <Mrkdwn>{children}</Mrkdwn>
      </Context>
    </>
  );
}
