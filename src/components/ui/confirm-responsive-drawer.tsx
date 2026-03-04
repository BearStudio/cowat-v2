import {
  cloneElement,
  ComponentProps,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';

import { triggerHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResponsiveDrawer,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

export const ConfirmResponsiveDrawer = (props: {
  enabled?: boolean;
  children: ReactElement<{ onClick: () => void }>;
  title?: ReactNode;
  description?: ReactNode;
  onConfirm: () => unknown | Promise<unknown>;
  confirmText?: ReactNode;
  confirmVariant?: ComponentProps<typeof Button>['variant'];
  cancelText?: ReactNode;
  requiredConfirmation?: string;
}) => {
  const { t } = useTranslation(['common', 'components']);
  const [isPending, setIsPending] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const { close, open, isOpen } = useDisclosure();

  const displayHeading =
    !props.title && !props.description
      ? t('components:confirmResponsiveDrawer.heading')
      : props.title;

  if (props.enabled === false) {
    // eslint-disable-next-line @eslint-react/no-clone-element
    const childrenWithOnConfirm = cloneElement(props.children, {
      onClick: () => {
        props.onConfirm();
      },
    });
    return <>{childrenWithOnConfirm}</>;
  }

  // eslint-disable-next-line @eslint-react/no-clone-element
  const childrenWithOnOpen = cloneElement(props.children, {
    onClick: () => {
      triggerHaptic('warning');
      open();
    },
  });

  const isConfirmDisabled =
    props.requiredConfirmation !== undefined &&
    confirmationInput !== props.requiredConfirmation;

  const handleCancel = () => {
    setIsPending(false);
    setConfirmationInput('');
    close();
  };

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    setIsPending(true);
    await props.onConfirm();
    setIsPending(false);
    setConfirmationInput('');
    close();
  };

  return (
    <>
      {childrenWithOnOpen}
      <ResponsiveDrawer
        open={isOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            open();
            return;
          }
          handleCancel();
        }}
      >
        <ResponsiveDrawerContent
          hideCloseButton
          className="sm:max-w-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isConfirmDisabled) {
              e.preventDefault();
              handleConfirm();
            }
          }}
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>{displayHeading}</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              {props.description}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          {props.requiredConfirmation !== undefined && (
            <div className="px-4 pb-2">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('components:confirmResponsiveDrawer.typeToConfirm', {
                  text: props.requiredConfirmation,
                })}
              </p>
              <Input
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={props.requiredConfirmation}
                autoComplete="off"
              />
            </div>
          )}
          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose
              render={<Button variant="secondary" className="max-sm:w-full" />}
            >
              {props.cancelText ??
                t('components:confirmResponsiveDrawer.cancelText')}
            </ResponsiveDrawerClose>
            <Button
              variant={props.confirmVariant ?? 'default'}
              className="max-sm:w-full"
              loading={isPending}
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
            >
              {props.confirmText ??
                t('components:confirmResponsiveDrawer.confirmText')}
            </Button>
          </ResponsiveDrawerFooter>
        </ResponsiveDrawerContent>
      </ResponsiveDrawer>
    </>
  );
};
