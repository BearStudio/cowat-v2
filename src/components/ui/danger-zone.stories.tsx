import type { Meta } from '@storybook/react-vite';

import { DangerZone, DangerZoneCardItem } from '@/components/ui/danger-zone';

export default {
  title: 'DangerZone',
} satisfies Meta<typeof DangerZone>;

export function Default() {
  return (
    <DangerZone>
      <DangerZoneCardItem
        title="Delete this organization"
        description="Once you delete this organization, there is no going back. Please be certain."
        confirmDescription="Are you sure you want to delete this organization? This action cannot be undone."
        confirmText="Delete organization"
        onConfirm={() => alert('Deleted!')}
      />
    </DangerZone>
  );
}

export function MultipleItems() {
  return (
    <DangerZone>
      <DangerZoneCardItem
        title="Remove all members"
        description="Remove all members from this organization."
        confirmDescription="Are you sure you want to remove all members?"
        confirmText="Remove all members"
        onConfirm={() => alert('Members removed!')}
      />
      <DangerZoneCardItem
        title="Delete this organization"
        description="Permanently delete this organization and all its data."
        confirmDescription="Are you sure? This action cannot be undone."
        confirmText="Delete organization"
        onConfirm={() => new Promise((r) => setTimeout(r, 2000))}
      />
    </DangerZone>
  );
}
