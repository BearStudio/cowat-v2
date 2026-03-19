import {
  CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';

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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

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
        {match(currentTheme)
          .with('system', () => <SunMoonIcon className="opacity-50" />)
          .with('light', () => <SunIcon className="opacity-50" />)
          .with('dark', () => <MoonIcon className="opacity-50" />)
          .exhaustive()}
        <span className={cn(props.iconOnly && 'sr-only')}>
          {match(currentTheme)
            .with('system', () => t('common:themes.values.system'))
            .with('light', () => t('common:themes.values.light'))
            .with('dark', () => t('common:themes.values.dark'))
            .exhaustive()}
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
