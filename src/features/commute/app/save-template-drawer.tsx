import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { FormFieldsCommute } from '@/features/commute/schema';

export const SaveTemplateDrawer = ({
  open,
  onOpenChange,
  commuteValues,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commuteValues: FormFieldsCommute | null;
  onDone: () => void;
}) => {
  const { t } = useTranslation(['commute', 'commuteTemplate']);
  const [templateName, setTemplateName] = useState('');

  const templateCreate = useMutation(
    orpc.commuteTemplate.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commute:new.templateSaved'));
        await context.client.invalidateQueries({
          queryKey: orpc.commuteTemplate.getAll.key(),
          type: 'all',
        });
        onDone();
      },
    })
  );

  const handleSave = () => {
    if (!commuteValues || !templateName.trim()) return;
    templateCreate.mutate({
      name: templateName.trim(),
      seats: commuteValues.seats,
      type: commuteValues.type,
      comment: commuteValues.comment,
      stops: commuteValues.stops.map((stop, index) => ({
        ...stop,
        order: index,
      })),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <DrawerContent initialFocus={false}>
        <DrawerHeader>
          <DrawerTitle>{t('commute:new.saveTemplateTitle')}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t('commute:new.saveTemplateDescription')}
          </p>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={t('commuteTemplate:form.namePlaceholder')}
          />
        </DrawerBody>
        <DrawerFooter>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!templateName.trim()}
            loading={templateCreate.isPending}
          >
            {t('commute:new.saveTemplateConfirm')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDone}>
            {t('commute:new.saveTemplateSkip')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
