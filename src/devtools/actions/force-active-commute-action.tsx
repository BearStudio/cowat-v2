import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY } from '@/features/commute/commute-active';

export function ForceActiveCommuteAction() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY) === 'true'
  );

  const toggle = () => {
    const next = !enabled;
    if (next) {
      localStorage.setItem(DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY, 'true');
    } else {
      localStorage.removeItem(DEVTOOLS_FORCE_ACTIVE_COMMUTE_KEY);
    }
    setEnabled(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Force Active Commute</CardTitle>
        <CardDescription>
          Make all commute cards appear as active
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={enabled ? 'destructive' : 'secondary'}
          size="sm"
          onClick={toggle}
        >
          {enabled ? 'Disable' : 'Enable'}
        </Button>
      </CardContent>
    </Card>
  );
}
