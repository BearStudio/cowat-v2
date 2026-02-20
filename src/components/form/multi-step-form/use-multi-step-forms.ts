import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultValues,
  FieldValues,
  Path,
  Resolver,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { z, ZodObject, ZodType } from 'zod';

type AnyZodObject = ZodObject<Record<string, ZodType>>;

export type MultiStepFormStepConfig = {
  schema?: AnyZodObject;
  defaultValues?: Record<string, unknown>;
};

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type InferStepValues<T extends MultiStepFormStepConfig> = T extends {
  schema: ZodObject<infer S>;
}
  ? z.infer<ZodObject<S>>
  : object;

type MergedStepValues<TSteps extends MultiStepFormStepConfig[]> =
  UnionToIntersection<
    { [I in keyof TSteps]: InferStepValues<TSteps[I]> }[number]
  > &
    FieldValues;

export const useMultiStepForms = <TSteps extends MultiStepFormStepConfig[]>(
  steps: TSteps,
  onSubmit: SubmitHandler<MergedStepValues<TSteps>>
) => {
  const schema = steps.reduce<AnyZodObject>(
    (acc, step) => (step.schema ? acc.merge(step.schema) : acc),
    z.object({})
  );

  const mergedDefaults = steps.reduce<Record<string, unknown>>(
    (acc, step) => ({ ...acc, ...step.defaultValues }),
    {}
  );

  const form = useForm<MergedStepValues<TSteps>>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as unknown as Resolver<
      MergedStepValues<TSteps>
    >,
    defaultValues: mergedDefaults as DefaultValues<MergedStepValues<TSteps>>,
  });

  const getStepOnNext = (
    index: number
  ): (() => Promise<boolean>) | undefined => {
    const step = steps[index];
    if (!step?.schema) return undefined;
    const fields = Object.keys(step.schema.shape) as Path<
      MergedStepValues<TSteps>
    >[];
    return () => form.trigger(fields);
  };

  return {
    form,
    handleSubmit: form.handleSubmit((data) => onSubmit(data)),
    getStepOnNext,
  };
};
