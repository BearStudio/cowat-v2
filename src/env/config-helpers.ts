import { Config } from 'effect';

export const urlConfig = (name: string) =>
  Config.string(name).pipe(
    Config.validate({
      message: `${name} must be a valid URL`,
      validation: (s) => URL.canParse(s),
    })
  );
