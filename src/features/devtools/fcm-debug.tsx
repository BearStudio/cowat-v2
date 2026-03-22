import { BellIcon, CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

import { getFcmToken } from '@/features/push/firebase-client';

export function FcmDebug() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
  }, []);

  async function handleRequestToken() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;
      const t = await getFcmToken();
      setToken(t);
    } catch (err) {
      toast.error('Failed to get FCM token');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  const badgeVariant: Record<
    NotificationPermission,
    'default' | 'secondary' | 'negative'
  > = {
    granted: 'default',
    denied: 'negative',
    default: 'secondary',
  };

  return (
    <Card className="gap-0 border-dashed p-0 opacity-80">
      <CardHeader className="gap-y-0 py-4">
        <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
          <BellIcon className="size-3.5" />
          FCM Debug
          <Badge variant={badgeVariant[permission]} className="ml-auto text-xs">
            {permission}
          </Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {token ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
              {token}
            </code>
            <Button
              variant="secondary"
              size="icon"
              className="size-7 shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckIcon className="size-3" />
              ) : (
                <CopyIcon className="size-3" />
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRequestToken}
            disabled={loading || permission === 'denied'}
          >
            {permission === 'denied'
              ? 'Permission bloquée'
              : loading
                ? 'Chargement...'
                : 'Obtenir le token FCM'}
          </Button>
        )}
      </div>
    </Card>
  );
}
