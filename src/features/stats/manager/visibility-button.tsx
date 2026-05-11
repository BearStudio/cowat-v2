import { t } from 'i18next';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const VisibilityButton = ({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className="absolute top-4 right-4 gap-2"
  >
    {visible ? (
      <>
        <Eye className="size-4" />
        {t('stats:app.public')}
      </>
    ) : (
      <>
        <EyeOff className="size-4" />
        {t('stats:app.private')}
      </>
    )}
  </Button>
);
