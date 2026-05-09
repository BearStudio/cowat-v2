import { Match } from 'effect';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';
import { useIsHydrated } from '@/hooks/use-is-hydrated';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const themes = ['system', 'light', 'dark'] as const;

export const ThemeSwitcher = (props: { iconOnly?: boolean }) => {
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();
  const hydrated = useIsHydrated();

  if (!hydrated) {
    return <div className="size-9" />;
  }

  const currentTheme: (typeof themes)[number] = themes.includes(
    theme as (typeof themes)[number]
  )
    ? (theme as (typeof themes)[number])
    : 'system';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={props.iconOnly ? 'ghost' : 'link'}
            size={props.iconOnly ? 'icon' : 'default'}
          />
        }
      >
        {Match.value(currentTheme).pipe(
          Match.when('system', () => <SunMoonIcon className="opacity-50" />),
          Match.when('light', () => <SunIcon className="opacity-50" />),
          Match.when('dark', () => <MoonIcon className="opacity-50" />),
          Match.exhaustive
        )}
        <span className={cn(props.iconOnly && 'sr-only')}>
          {Match.value(currentTheme).pipe(
            Match.when('system', () => t('common:themes.values.system')),
            Match.when('light', () => t('common:themes.values.light')),
            Match.when('dark', () => t('common:themes.values.dark')),
            Match.exhaustive
          )}
        </span>
        {!props.iconOnly && <ChevronsUpDownIcon className="opacity-50" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => {
              setTheme(item);
            }}
          >
            <CheckIcon
              className={cn(
                'mt-0.5 size-4 self-start text-current',
                currentTheme === item ? 'opacity-100' : 'opacity-0'
              )}
            />
            {t(`common:themes.values.${item}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
