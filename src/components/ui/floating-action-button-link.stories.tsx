import type { Meta } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { FloatingActionButtonLink } from '@/components/ui/floating-action-button-link';

const RouterWrapper = ({ children }: { children: ReactNode }) => {
  const router = useMemo(() => {
    const rootRoute = createRootRoute({
      component: () => <>{children}</>,
    });
    const routeTree = rootRoute.addChildren([]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
  }, [children]);

  return <RouterProvider router={router} />;
};

export default {
  title: 'FloatingActionButtonLink',
  decorators: [(Story) => <RouterWrapper>{Story()}</RouterWrapper>],
} satisfies Meta;

export const Default = () => {
  return (
    <FloatingActionButtonLink to="/" icon={<PlusIcon />} label="New commute" />
  );
};

export const Sizes = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <FloatingActionButtonLink
        to="/"
        icon={<PlusIcon />}
        label="Extra small"
        size="xs"
      />
      <FloatingActionButtonLink
        to="/"
        icon={<PlusIcon />}
        label="Small"
        size="sm"
      />
      <FloatingActionButtonLink
        to="/"
        icon={<PlusIcon />}
        label="Default"
        size="default"
      />
      <FloatingActionButtonLink
        to="/"
        icon={<PlusIcon />}
        label="Large"
        size="lg"
      />
    </div>
  );
};

export const Variants = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <FloatingActionButtonLink
        to="/"
        icon={<PlusIcon />}
        label="New commute"
      />
      <FloatingActionButtonLink
        to="/"
        icon={<SearchIcon />}
        label="Search"
        variant="secondary"
      />
    </div>
  );
};
