import type { Meta } from '@storybook/react-vite';
import { PenLineIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { CardCommuteTemplateHeader } from '@/features/commute-template/card-commute-template-header';

export default {
  title: 'Feature/CommuteTemplate/CardCommuteTemplateHeader',
} satisfies Meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-96">
    <CardHeader>{children}</CardHeader>
  </Card>
);

export const RoundTrip = () => {
  return (
    <Wrapper>
      <CardCommuteTemplateHeader
        name="Morning commute"
        type="ROUND"
        stopsCount={3}
        seats={4}
      />
    </Wrapper>
  );
};

export const OneWay = () => {
  return (
    <Wrapper>
      <CardCommuteTemplateHeader
        name="Evening ride"
        type="ONEWAY"
        stopsCount={2}
        seats={3}
      />
    </Wrapper>
  );
};

export const WithActions = () => {
  return (
    <Wrapper>
      <CardCommuteTemplateHeader
        name="Morning commute"
        type="ROUND"
        stopsCount={3}
        seats={4}
        actions={
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm">
              <PenLineIcon />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Trash2Icon />
            </Button>
          </div>
        }
      />
    </Wrapper>
  );
};

export const LongName = () => {
  return (
    <Wrapper>
      <CardCommuteTemplateHeader
        name="Very long commute template name that might overflow the card"
        type="ROUND"
        stopsCount={5}
        seats={6}
        actions={
          <Button variant="ghost" size="icon-sm">
            <PenLineIcon />
          </Button>
        }
      />
    </Wrapper>
  );
};
