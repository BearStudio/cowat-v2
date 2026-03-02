import type { Meta } from '@storybook/react-vite';
import { PlusIcon, SearchIcon, UploadIcon } from 'lucide-react';

import {
  FabPortal,
  FloatingActionButton,
} from '@/components/ui/floating-action-button';

export default {
  title: 'FloatingActionButton',
} satisfies Meta;

export const Default = () => {
  return <FloatingActionButton icon={<PlusIcon />} label="New commute" />;
};

export const Sizes = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <FloatingActionButton icon={<PlusIcon />} label="Extra small" size="xs" />
      <FloatingActionButton icon={<PlusIcon />} label="Small" size="sm" />
      <FloatingActionButton
        icon={<PlusIcon />}
        label="Default"
        size="default"
      />
      <FloatingActionButton icon={<PlusIcon />} label="Large" size="lg" />
    </div>
  );
};

export const Variants = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <FloatingActionButton icon={<PlusIcon />} label="New commute" />
      <FloatingActionButton
        icon={<SearchIcon />}
        label="Search"
        variant="secondary"
      />
      <FloatingActionButton
        icon={<UploadIcon />}
        label="Upload"
        variant="ghost"
      />
    </div>
  );
};

export const FabPortalExample = () => {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        The FAB portal renders its children as a fixed overlay at the
        bottom-right of the screen (above the navigation bar on mobile).
      </p>
      <FabPortal>
        <FloatingActionButton
          icon={<PlusIcon />}
          label="New commute"
          size="sm"
          className="size-14 rounded-full shadow-lg"
        />
      </FabPortal>
    </>
  );
};
