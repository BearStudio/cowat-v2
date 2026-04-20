import type { Meta } from '@storybook/react-vite';
import { InboxIcon, SearchIcon, UsersIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default {
  title: 'UI/Empty',
} satisfies Meta;

export const Default = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find what you&apos;re looking
          for.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export const WithIconMedia = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>Your inbox is empty</EmptyTitle>
        <EmptyDescription>
          You have no pending notifications at the moment.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export const WithAction = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>No members yet</EmptyTitle>
        <EmptyDescription>
          Invite team members to start collaborating.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Invite members</Button>
      </EmptyContent>
    </Empty>
  );
};

export const WithSearchIcon = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No commutes found</EmptyTitle>
        <EmptyDescription>
          No commutes match your current search. Try a different date or
          location.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary">Clear filters</Button>
      </EmptyContent>
    </Empty>
  );
};

export const WithImageMedia = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <img
            src="https://placehold.co/80x80"
            alt=""
            className="size-20 rounded-full"
          />
        </EmptyMedia>
        <EmptyTitle>No profile picture</EmptyTitle>
        <EmptyDescription>
          Upload a photo to personalise your profile.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Upload photo</Button>
      </EmptyContent>
    </Empty>
  );
};
