import type { Meta } from '@storybook/react-vite';
import { BookOpenIcon, MapPinIcon, PlusIcon, SettingsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SpeedDial, SpeedDialItem } from '@/components/ui/speed-dial';

export default {
  title: 'SpeedDial',
} satisfies Meta;

export const Default = () => {
  return (
    <SpeedDial icon={<PlusIcon />} label="Actions">
      <SpeedDialItem label="Locations">
        <Button onClick={() => alert('Locations')}>
          <MapPinIcon />
        </Button>
      </SpeedDialItem>
      <SpeedDialItem label="Templates">
        <Button onClick={() => alert('Templates')}>
          <BookOpenIcon />
        </Button>
      </SpeedDialItem>
      <SpeedDialItem label="Create">
        <Button onClick={() => alert('Create')}>
          <PlusIcon />
        </Button>
      </SpeedDialItem>
    </SpeedDial>
  );
};

export const TwoActions = () => {
  return (
    <SpeedDial icon={<SettingsIcon />} label="Settings">
      <SpeedDialItem label="Locations">
        <Button onClick={() => alert('Locations')}>
          <MapPinIcon />
        </Button>
      </SpeedDialItem>
      <SpeedDialItem label="Templates">
        <Button onClick={() => alert('Templates')}>
          <BookOpenIcon />
        </Button>
      </SpeedDialItem>
    </SpeedDial>
  );
};

export const DefaultVariant = () => {
  return (
    <SpeedDial icon={<PlusIcon />} label="Actions" variant="default">
      <SpeedDialItem label="Locations">
        <Button variant="default" onClick={() => alert('Locations')}>
          <MapPinIcon />
        </Button>
      </SpeedDialItem>
      <SpeedDialItem label="Create">
        <Button variant="default" onClick={() => alert('Create')}>
          <PlusIcon />
        </Button>
      </SpeedDialItem>
    </SpeedDial>
  );
};
