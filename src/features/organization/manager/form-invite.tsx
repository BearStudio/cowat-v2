import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { orpc } from '@/lib/orpc/client';

import { Form } from '@/components/form/form';
import { FormField } from '@/components/form/form-field';
import { FormFieldController } from '@/components/form/form-field-controller';
import { FormFieldError } from '@/components/form/form-field-error';
import { FormFieldLabel } from '@/components/form/form-field-label';
import { Button } from '@/components/ui/button';

import { zInviteForm } from '@/features/organization/schema';

export const FormInvite = () => {
  const { t } = useTranslation(['organization']);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const form = useForm<z.infer<ReturnType<typeof zInviteForm>>>({
    resolver: zodResolver(zInviteForm()),
    defaultValues: { emails: [], role: 'member' },
  });

  const emails = form.watch('emails');

  const userSearch = useQuery({
    ...orpc.organization.searchUsersToInvite.queryOptions({
      input: { email: debouncedSearch },
    }),
    enabled: debouncedSearch.trim().length >= 2,
    placeholderData: keepPreviousData,
  });

  const suggestions = useMemo(
    () =>
      (userSearch.data ?? []).map((u) => ({
        value: u.email,
        label: u.name ? `${u.name} (${u.email})` : u.email,
      })),
    [userSearch.data]
  );

  const invite = useMutation(
    orpc.organization.inviteMembers.mutationOptions({
      onSuccess: async (data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.organization.getActiveOrganization.key(),
        });
        if (data.succeeded.length > 0) {
          toast.success(
            t('organization:manager.detail.invitationsSent', {
              count: data.succeeded.length,
            })
          );
        }
        if (data.failed.length > 0) {
          toast.error(
            t('organization:manager.detail.invitationsPartialError', {
              count: data.failed.length,
              emails: data.failed.map((f) => f.email).join(', '),
            })
          );
        }
        form.reset();
        setSearchTerm('');
        setDebouncedSearch('');
      },
      onError: () => {
        toast.error(t('organization:manager.detail.invitationError'));
      },
    })
  );

  return (
    <Form
      {...form}
      onSubmit={(data) => invite.mutate(data)}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <FormField className="flex-1">
          <FormFieldLabel required>
            {t('organization:members.emails')}
          </FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select-emails"
            name="emails"
            displayError={false}
            placeholder={t('organization:members.emailsPlaceholder')}
            suggestions={suggestions}
            onInputValueChange={setSearchTerm}
          />
        </FormField>
        <FormField className="sm:w-36">
          <FormFieldLabel required>
            {t('organization:members.role')}
          </FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="role"
            items={[
              {
                label: t('organization:members.roles.member'),
                value: 'member',
              },
              {
                label: t('organization:members.roles.owner'),
                value: 'owner',
              },
            ]}
          />
        </FormField>
        <Button
          type="submit"
          size="sm"
          loading={invite.isPending}
          disabled={emails.length === 0}
          className="max-sm:w-full"
        >
          <PlusIcon className="size-4" />
          {t('organization:members.invite')}
        </Button>
      </div>
      <FormFieldError control={form.control} name="emails" />
    </Form>
  );
};
