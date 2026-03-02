import type { Meta } from '@storybook/react-vite';
import { PenLineIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AccountCardRow } from '@/features/account/account-card-row';

export default {
  title: 'Feature/Account/AccountCardRow',
} satisfies Meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-96 gap-0 p-0">{children}</Card>
);

export const Default = () => {
  return (
    <Wrapper>
      <AccountCardRow label="Email">alice@example.com</AccountCardRow>
    </Wrapper>
  );
};

export const WithEditButton = () => {
  return (
    <Wrapper>
      <AccountCardRow label="Full name">
        <Button variant="link" size="sm" className="-my-1.5">
          <span className="truncate">Alice Martin</span>
          <PenLineIcon className="size-3" />
        </Button>
      </AccountCardRow>
    </Wrapper>
  );
};

export const Multiple = () => {
  return (
    <Wrapper>
      <AccountCardRow label="Full name">
        <Button variant="link" size="sm" className="-my-1.5">
          <span className="truncate">Alice Martin</span>
          <PenLineIcon className="size-3" />
        </Button>
      </AccountCardRow>
      <AccountCardRow label="Email">alice@example.com</AccountCardRow>
      <AccountCardRow label="Phone">
        <Button variant="link" size="sm" className="-my-1.5">
          <span className="truncate">+33 6 12 34 56 78</span>
          <PenLineIcon className="size-3" />
        </Button>
      </AccountCardRow>
      <AccountCardRow label="Profile picture">
        <Button variant="link" size="sm" className="-my-1.5">
          <span className="truncate text-muted-foreground">--</span>
          <PenLineIcon className="size-3" />
        </Button>
      </AccountCardRow>
    </Wrapper>
  );
};

export const EmptyValue = () => {
  return (
    <Wrapper>
      <AccountCardRow label="Phone number">
        <span className="text-xs text-muted-foreground">--</span>
      </AccountCardRow>
    </Wrapper>
  );
};
