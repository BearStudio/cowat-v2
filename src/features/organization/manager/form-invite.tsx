import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { Form } from '@/components/form/form';
import { FormField } from '@/components/form/form-field';
import { FormFieldController } from '@/components/form/form-field-controller';
import { FormFieldLabel } from '@/components/form/form-field-label';
import { Button } from '@/components/ui/button';

import { zInviteForm } from '@/features/organization/schema';

export const FormInvite = () => {
  const { t } = useTranslation(['organization']);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof zInviteForm>>({
    resolver: zodResolver(zInviteForm),
    defaultValues: { email: '', role: 'member' },
  });

  const invite = useMutation({
    mutationFn: (data: z.infer<typeof zInviteForm>) =>
      orpc.organization.inviteMember.call(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.organization.getActiveOrganization.key(),
      });
      toast.success(t('organization:manager.detail.invitationSent'));
      form.reset();
    },
    onError: () => {
      toast.error(t('organization:manager.detail.invitationError'));
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(data) => invite.mutate(data)}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <FormField className="flex-1">
        <FormFieldLabel>{t('organization:members.email')}</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="email"
          name="email"
          size="sm"
          placeholder="user@example.com"
        />
      </FormField>
      <FormField className="sm:w-36">
        <FormFieldLabel>{t('organization:members.role')}</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="select"
          name="role"
          items={[
            { label: t('organization:members.roles.member'), value: 'member' },
            { label: t('organization:members.roles.owner'), value: 'owner' },
          ]}
        />
      </FormField>
      <Button
        type="submit"
        size="sm"
        loading={invite.isPending}
        className="max-sm:w-full"
      >
        <PlusIcon className="size-4" />
        {t('organization:members.invite')}
      </Button>
    </Form>
  );
};
