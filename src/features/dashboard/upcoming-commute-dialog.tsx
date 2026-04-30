import { useMutation } from '@tanstack/react-query';
import {
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PhoneIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { CommuteEnriched } from '@/features/commute/schema';

type Props = {
  commute: CommuteEnriched;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UpcomingCommuteDialog = ({
  commute,
  currentUserId,
  open,
  onOpenChange,
}: Props) => {
  const stops = [...commute.stops].sort((a, b) => a.order - b.order);
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const isDriver = commute.driver?.id === currentUserId;
  const passengerStop = stops.find((stop) =>
    stop.passengers?.some((p) => p.passenger?.id === currentUserId)
  );

  const sendAlert = useMutation(
    orpc.commute.sendAlert.mutationOptions({
      onSuccess: () => toast.success('Message envoyé'),
      onError: () => toast.error("Erreur lors de l'envoi"),
    })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trajet à venir</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Départ</span>
                <span className="font-medium">
                  {firstStop?.outwardTime} · {firstStop?.location?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Retour</span>
                <span className="font-medium">
                  {lastStop?.inwardTime} · {lastStop?.location?.name}
                </span>
              </div>
              {!isDriver && passengerStop && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Votre arrêt</span>
                    <span className="font-medium">
                      {passengerStop.location?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">
                      Adresse
                    </span>
                    <span className="min-w-0 text-right font-medium break-words">
                      {passengerStop.location?.address}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {isDriver ? 'Prévenir les passagers' : 'Prévenir le conducteur'}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">
                  Je suis en retard…
                </p>
                <div className="flex gap-2">
                  {[5, 10, 15].map((min) => (
                    <Button
                      key={min}
                      className="flex-1"
                      size="sm"
                      onClick={() =>
                        sendAlert.mutate({
                          id: commute.id,
                          alertType: 'late',
                          lateMinutes: min,
                        })
                      }
                    >
                      +{min} min
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="justify-start gap-2"
                onClick={() =>
                  sendAlert.mutate({ id: commute.id, alertType: 'arrived' })
                }
              >
                <MapPinIcon className="size-4 shrink-0" />
                Je suis arrivé au point de rendez-vous
              </Button>

              {!isDriver && (
                <>
                  {passengerStop?.location?.address && (
                    <Button
                      className="justify-start gap-2"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            passengerStop.location.address
                          )}`,
                          '_blank'
                        )
                      }
                    >
                      <NavigationIcon className="size-4 shrink-0" />
                      Voir l'adresse du rendez-vous
                    </Button>
                  )}
                  {commute.driver?.phone ? (
                    <Button
                      className="justify-start gap-2"
                      onClick={() => window.open(`tel:${commute.driver.phone}`)}
                    >
                      <PhoneIcon className="size-4 shrink-0" />
                      Appeler le conducteur
                    </Button>
                  ) : null}
                </>
              )}

              <Button className="justify-start gap-2" onClick={() => {}}>
                <MessageCircleIcon className="size-4 shrink-0" />
                Message personnalisé
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
