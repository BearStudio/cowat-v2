import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { getDateFormat } from '@/lib/dayjs/formats';
import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { useIsMobile } from '@/hooks/use-mobile';

import { Calendar } from '@/components/ui/calendar';
import { DateInput } from '@/components/ui/date-input';
import { Drawer, DrawerBody, DrawerContent } from '@/components/ui/drawer';
import { InputGroupButton } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = ComponentProps<typeof DateInput> & {
  noCalendar?: boolean;
  calendarProps?: Omit<
    ComponentProps<typeof Calendar>,
    'onSelect' | 'selected' | 'mode'
  >;
};

export const DatePicker = ({
  calendarProps,
  noCalendar = false,
  ...props
}: DatePickerProps) => {
  const isMobile = useIsMobile();
  const datePicker = useDisclosure();

  const handleSelect = (date: Date | undefined) => {
    props.onChange?.(date ? toNoonUTC(date) : null);
    datePicker.close();
  };

  // Mobile: read-only input that opens a drawer with a full calendar
  if (isMobile) {
    const format = props.format ?? getDateFormat('common:short');
    const displayValue = props.value ? dayjs(props.value).format(format) : '';

    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => {
            if (!noCalendar) datePicker.open();
          }}
        >
          <DateInput
            {...props}
            readOnly
            value={props.value}
            className="[&_[data-slot=input-group-control]]:cursor-pointer"
            endAddon={
              noCalendar ? null : (
                <InputGroupButton size="icon-xs" className="hit-area-3">
                  <CalendarIcon />
                </InputGroupButton>
              )
            }
            placeholder={displayValue || props.placeholder || format}
          />
        </div>
        {!noCalendar && (
          <Drawer
            open={datePicker.isOpen}
            onOpenChange={datePicker.toggle}
            swipeDirection="down"
          >
            <DrawerContent>
              <DrawerBody className="pt-2 pb-6">
                <Calendar
                  mode="single"
                  selected={props.value ?? undefined}
                  onSelect={handleSelect}
                  defaultMonth={props.value ?? undefined}
                  autoFocus
                  className="w-full px-4"
                  style={{ width: '100%' }}
                  classNames={{
                    month_grid: 'w-full',
                    weekdays: 'w-full',
                    weekday: 'w-0 flex-1 text-center',
                    week: 'w-full',
                    day: 'w-0 h-auto flex-1 aspect-square',
                    day_button: 'size-full',
                  }}
                  {...calendarProps}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}
      </>
    );
  }

  // Desktop: text input with popover calendar
  return (
    <DateInput
      {...props}
      endAddon={
        noCalendar ? null : (
          <Popover
            open={datePicker.isOpen}
            onOpenChange={(open) => datePicker.toggle(open)}
          >
            <PopoverTrigger
              render={
                <InputGroupButton size="icon-xs" className="hit-area-3" />
              }
            >
              <CalendarIcon />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={props.value ?? undefined}
                onSelect={handleSelect}
                defaultMonth={props.value ?? undefined}
                autoFocus
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
        )
      }
    />
  );
};
