import {
  type ComponentProps,
  Fragment,
  type KeyboardEvent,
  useMemo,
  useState,
} from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

type EmailItem = {
  label: string;
  value: string;
};

export const FieldSelectEmails = (
  props: FieldProps<{
    containerProps?: ComponentProps<typeof FormFieldContainer>;
    placeholder?: string;
    showClear?: boolean;
    suggestions?: EmailItem[];
    onInputValueChange?: (value: string) => void;
  }>
) => {
  const {
    containerProps,
    placeholder,
    showClear = true,
    suggestions = [],
    onInputValueChange: onInputValueChangeProp,
  } = props;

  const anchor = useComboboxAnchor();
  const ctx = useFormField();
  const { field, fieldState } = useFormFieldController();

  const [inputValue, setInputValue] = useState('');

  const emails: string[] = useMemo(() => field.value ?? [], [field.value]);

  const availableSuggestions = useMemo(
    () => suggestions.filter((s) => !emails.includes(s.value)),
    [suggestions, emails]
  );

  const items = useMemo(
    (): EmailItem[] => [
      ...emails.map((e) => ({ value: e, label: e })),
      ...availableSuggestions,
    ],
    [emails, availableSuggestions]
  );

  const addEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (email && !emails.includes(email)) {
      field.onChange([...emails, email]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ' '].includes(e.key) && inputValue.trim()) {
      if (e.key === 'Enter' && availableSuggestions.length > 0) return;
      e.preventDefault();
      addEmail(inputValue);
      setInputValue('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const parts = pasted.split(/[\s,;]+/).filter(Boolean);
    if (parts.length > 1) {
      e.preventDefault();
      for (const part of parts) addEmail(part);
      setInputValue('');
    }
  };

  return (
    <FormFieldContainer {...containerProps}>
      <Combobox
        multiple
        items={items}
        disabled={field.disabled}
        inputValue={inputValue}
        onInputValueChange={(value) => {
          setInputValue(value);
          onInputValueChangeProp?.(value);
        }}
        value={items.filter((item) => emails.includes(item.value))}
        isItemEqualToValue={(a, b) =>
          (a as EmailItem).value === (b as EmailItem).value
        }
        itemToStringLabel={(item) => (item as EmailItem).label}
        itemToStringValue={(item) => (item as EmailItem).value}
        onValueChange={(selected) => {
          const values = (selected as EmailItem[]).map((i) => i.value);
          field.onChange(values);
          if (values.length > emails.length) {
            setInputValue('');
          }
        }}
        inputRef={field.ref}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(chipItems: EmailItem[]) => (
              <Fragment>
                {chipItems?.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={ctx.id}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid ? true : undefined}
                  aria-describedby={ctx.describedBy(fieldState.invalid)}
                  placeholder={placeholder}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
                {!!showClear && <ComboboxClear />}
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        {availableSuggestions.length > 0 && (
          <ComboboxContent anchor={anchor}>
            <ComboboxList>
              {(item: EmailItem) => (
                <ComboboxItem value={item} key={item.value}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
      <FormFieldError />
    </FormFieldContainer>
  );
};
