import { NumberField } from '@base-ui/react/number-field';
import { Match } from 'effect';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { ComponentProps, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeRefs } from 'react-merge-refs';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import type { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

type InputProps = ComponentProps<typeof Input>;
type InputPropsRoot = Pick<InputProps, 'placeholder' | 'size' | 'aria-invalid'>;

type NumberInputProps = ComponentProps<typeof NumberField.Root> &
  InputPropsRoot & {
    inputProps?: Omit<RemoveFromType<InputProps, InputPropsRoot>, 'endElement'>;
    buttons?: 'classic' | 'mobile';
    inCents?: boolean;
  } & {
    ref?: React.Ref<HTMLInputElement | null>;
  };

export const NumberInput = ({
  inputProps,
  size,
  placeholder,
  locale,
  buttons,
  className,
  onKeyDown,
  ref,
  'aria-invalid': invalid,
  ...props
}: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { i18n } = useTranslation();
  const buttonSize = Match.value(size).pipe(
    Match.when('default', () => 'icon' as const),
    Match.when(undefined, () => 'icon' as const),
    Match.when(null, () => 'icon' as const),
    Match.when('sm', () => 'icon-sm' as const),
    Match.when('lg', () => 'icon-lg' as const),
    Match.exhaustive
  );

  const _locale = locale ?? i18n.language;

  return (
    <NumberField.Root
      {...props}
      locale={_locale}
      className={cn(className)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // Make sure that the value is updated when pressing enter
          inputRef.current?.blur();
          inputRef.current?.focus();
        }
        onKeyDown?.(e);
      }}
    >
      <NumberField.Group className="flex gap-2">
        {buttons === 'mobile' && (
          <NumberField.Decrement
            render={
              <Button
                variant="secondary"
                size={buttonSize}
                disabled={props.disabled || props.readOnly}
              />
            }
          >
            <Minus />
          </NumberField.Decrement>
        )}
        <InputGroup size={size}>
          <NumberField.Input
            render={
              <InputGroupInput
                aria-invalid={invalid}
                ref={mergeRefs([ref, inputRef])}
                placeholder={placeholder}
                inputMode="decimal"
                {...inputProps}
              />
            }
          />
          {buttons === 'classic' && (
            <NumberField.Group
              render={
                <InputGroupAddon
                  align="inline-end"
                  className="flex flex-col gap-0 py-0"
                />
              }
            >
              <NumberField.Increment>
                <ChevronUp />
              </NumberField.Increment>
              <NumberField.Decrement>
                <ChevronDown />
              </NumberField.Decrement>
            </NumberField.Group>
          )}
        </InputGroup>

        {buttons === 'mobile' && (
          <NumberField.Increment
            render={
              <Button
                variant="secondary"
                size={buttonSize}
                disabled={props.disabled || props.readOnly}
              />
            }
          >
            <Plus />
          </NumberField.Increment>
        )}
      </NumberField.Group>
    </NumberField.Root>
  );
};
