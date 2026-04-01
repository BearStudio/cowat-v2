import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

import {
  FormFieldsCommuteRequest,
  zFormFieldsCommuteRequest,
} from '@/features/commute/schema';

export const RequestCommuteDrawer = ({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}) => {
  const { t } = useTranslation(['commute']);
  const navigate = useNavigate();
  const { orgSlug } = useParams({ strict: false });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const form = useForm<FormFieldsCommuteRequest>({
    resolver: zodResolver(zFormFieldsCommuteRequest()),
    mode: 'onSubmit',
    defaultValues: { date: initialDate, destination: null, comment: null },
  });

  useEffect(() => {
    if (open) {
      form.reset({ date: initialDate, destination: null, comment: null });
    }
  }, [open, form, initialDate]);

  const commuteRequest = useMutation(
    orpc.commuteRequest.create.mutationOptions({
      onSuccess: () => {
        toast.success(t('commute:new.requestDrawer.success'));
        onOpenChange(false);
        navigate({
          to: '/app/$orgSlug/requests',
          params: { orgSlug: orgSlug as string },
          search: { tab: 'commuteRequests' },
        });
      },
    })
  );

  const handleSubmit = form.handleSubmit(({ date, destination, comment }) => {
    commuteRequest.mutate({
      date: toNoonUTC(date),
      destination: destination ?? undefined,
      comment: comment ?? undefined,
    });
  });

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <ResponsiveDrawerContent>
        <Form {...form} noHtmlForm>
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('commute:new.requestDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              {t('commute:new.requestDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody className="flex-col gap-4 pt-2 pb-4">
            <FormField>
              <FormFieldLabel required>{t('commute:form.date')}</FormFieldLabel>
              <FormFieldController
                type="date"
                control={form.control}
                name="date"
                calendarProps={{
                  disabled: (d) => d < today,
                  startMonth: today,
                }}
              />
            </FormField>
            <FormField>
              <FormFieldLabel>
                {t('commute:new.requestDrawer.destination')}
              </FormFieldLabel>
              <FormFieldController
                type="text"
                control={form.control}
                name="destination"
                placeholder={t(
                  'commute:new.requestDrawer.destinationPlaceholder'
                )}
              />
            </FormField>
            <FormField>
              <FormFieldLabel>
                {t('commute:new.requestDrawer.comment')}
              </FormFieldLabel>
              <FormFieldController
                type="textarea"
                control={form.control}
                name="comment"
                placeholder={t('commute:new.requestDrawer.commentPlaceholder')}
                rows={3}
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              className="w-full"
              disabled={commuteRequest.isPending}
              loading={commuteRequest.isPending}
              onClick={handleSubmit}
            >
              {t('commute:new.requestDrawer.submit')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
