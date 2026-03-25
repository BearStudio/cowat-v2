import type { Meta } from '@storybook/react-vite';
import { ChevronDownIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default {
  title: 'UI/Collapsible',
} satisfies Meta;

export const Default = () => {
  return (
    <Collapsible className="w-80">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium">
        Toggle section
        <ChevronDownIcon className="size-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        This content is hidden by default and revealed when the trigger is
        clicked.
      </CollapsibleContent>
    </Collapsible>
  );
};

export const DefaultOpen = () => {
  return (
    <Collapsible defaultOpen className="w-80">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium">
        Toggle section
        <ChevronDownIcon className="size-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        This section is open by default.
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Inline = () => {
  return (
    <div className="w-80">
      <Collapsible>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Advanced options</h4>
          <CollapsibleTrigger className="text-sm text-muted-foreground underline underline-offset-4">
            Show more
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-1 rounded-md border p-3 text-sm text-muted-foreground">
          <p>Option A — configure advanced settings</p>
          <p>Option B — enable experimental features</p>
          <p>Option C — manage integrations</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const Multiple = () => {
  return (
    <div className="w-80 space-y-2">
      {['Section A', 'Section B', 'Section C'].map((section) => (
        <Collapsible key={section}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium">
            {section}
            <ChevronDownIcon className="size-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 rounded-md border px-4 py-3 text-sm text-muted-foreground">
            Content for {section}.
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};
