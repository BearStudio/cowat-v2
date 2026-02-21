---
name: rhf-best-practices
description: React Hook Form best practices for this project. Use when writing or reviewing form code, adding form fields, creating multi-step forms, or fixing RHF-related bugs.
---

# React Hook Form Best Practices

Stack: `react-hook-form@7.71`, `@hookform/resolvers/zod` with Zod 4, React Compiler enabled.

---

## 1. Subscriptions: never use `form.watch()`

`form.watch()` is not React Compiler-compatible (`react-hooks/incompatible-library` warning) and the project enforces `--max-warnings 0`. Always use one of the alternatives below.

### Reading a value inside a component

```tsx
// BAD
const type = form.watch('type');

// GOOD — hook, re-renders the whole component
const type = useWatch({ control: form.control, name: 'type' });
```

### Conditionally rendering JSX based on a field value

Prefer `<Watch>` over `useWatch` at the component level — it isolates the re-render to just the render-prop subtree and avoids lifting subscriptions into the parent component.

```tsx
import { Watch } from 'react-hook-form';

// BAD — re-renders the whole page component on every type change
const type = useWatch({ control: form.control, name: 'type' });
return <>{type === 'ROUND' && <InwardStopsStep />}</>;

// GOOD — re-render scoped to the Watch node only
<Watch
  control={form.control}
  names="type"
  render={(type) => (type === 'ROUND' ? <InwardStopsStep /> : null)}
/>
```

`<Watch>` uses the prop `names` (not `name`). The `render` prop receives the watched value directly when a single string is passed.

### Subscribing to form state (isDirty, isSubmitting, etc.)

Use `<FormStateSubscribe>`, the render-prop equivalent of `useFormState`.

```tsx
import { FormStateSubscribe } from 'react-hook-form';

<FormStateSubscribe
  control={form.control}
  render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
/>
```

---

## 2. Zod schemas and `zodResolver`

### Schema definition pattern

Define schemas as factory functions (not constants) so i18n `t()` is called at runtime, not module load:

```ts
export const zFormFieldsCommute = () =>
  z.object({
    date: z.date({ error: t('common:errors.required') }),
    type: zCommuteType(),
    comment: zu.fieldText.nullish(),
    stops: z.array(zStop()).min(2, t('commute:form.errors.stopsMin')),
  })
  .superRefine((data, ctx) => {
    // cross-field validation with precise error paths
    data.stops.forEach((stop, i) => {
      if (!rules.isOutwardInFuture(stop)) {
        ctx.addIssue({
          code: 'custom',
          message: t('commute:form.errors.outwardInPast'),
          path: ['stops', i, 'outwardTime'],
        });
      }
    });
  });
```

### `zu` helpers for text fields

All string form fields must use helpers from `@/lib/zod/zod-utils` instead of raw `z.string()`. HTML inputs always produce strings, so empty values need coercion.

```ts
import { zu } from '@/lib/zod/zod-utils';

zu.fieldText.required()   // empty string → validation error
zu.fieldText.optional()   // empty string → undefined
zu.fieldText.nullable()   // empty string → null (passes validation)
zu.fieldText.nullish()    // empty string → null, also accepts undefined
```

### `zodResolver` validates the full schema on every `trigger()` call

Even `form.trigger(['stops'])` runs the entire Zod schema. For multi-step forms where a single schema field (like a `stops` array) spans multiple steps, always scope `trigger()` to the specific sub-paths visible on the current step (see §4).

---

## 3. Field components and composition

### Two layers: context vs. controller

The form field system has two independent context layers that compose together:

**`<FormField>`** — layout and ID registry. Generates a stable set of IDs and exposes them via context:

| ID | Used by | Purpose |
|---|---|---|
| `id` | input `id=` | links `<label htmlFor>` to the input |
| `labelId` | `<FormFieldLabel id=>` | ARIA reference if needed |
| `descriptionId` | `<FormFieldHelper id=>` | `aria-describedby` (helper text) |
| `errorId` | `<FormFieldError id=>` | `aria-describedby` (error message) |

**`<FormFieldController>`** — RHF wiring. Wraps `<Controller>` and sets up `FormFieldControllerContext` with `{ field, fieldState, type }`. Built-in field components (`FieldText`, etc.) read from both contexts to auto-wire `id`, `aria-invalid`, and `aria-describedby`.

### Composition patterns

**manual composition (explicit label, helper text, or custom layout)**

Wrap in `<FormField>` and place `<FormFieldLabel>`, `<FormFieldController>`, and optionally `<FormFieldHelper>` as siblings. IDs wire up automatically through context.

```tsx
import { FormField, FormFieldController, FormFieldHelper, FormFieldLabel } from '@/components/form';

<FormField>
  <FormFieldLabel required>{t('organization:create.slug')}</FormFieldLabel>
  <FormFieldController type="text" control={form.control} name="slug" />
  <FormFieldHelper>{t('organization:create.slugHelper')}</FormFieldHelper>
</FormField>
```

`<FormFieldLabel>` renders at `htmlFor` / `id`, link to the input is automatic — never set these manually.

`<FormFieldHelper>` renders at `id={descriptionId}`, which is included in the input's `aria-describedby` automatically by built-in field components.

### Error display

`<FormFieldError>` renders the field error automatically when used inside `<FormFieldController>` — it reads from `FormFieldControllerContext` without requiring any props. Built-in field components already include it.

To render the error in a custom position, set `displayError={false}` on `<FormFieldController>` and place `<FormFieldError>` manually:

```tsx
<FormField>
  <FormFieldController
    type="text"
    name="slug"
    control={form.control}
    displayError={false}  // suppress automatic error inside the input
  />
  {/* error rendered elsewhere, e.g. below a sibling element */}
  <FormFieldError control={form.control} name="slug" />
</FormField>
```

`<FormFieldError>` also accepts a `children` render prop for custom error UI:

```tsx
<FormFieldError>{({ error }) => <Banner>{error?.message}</Banner>}</FormFieldError>
```

### Accessibility checklist for custom inputs (`type="custom"`)

When `type="custom"`, the render prop runs inside `FormFieldControllerContext` — so `<FormFieldError>` still works without props. However, the custom input element itself must be wired manually. Because hooks cannot be called inside a render prop, extract the input into its own component:

```tsx
// Extract to a component so useFormField() can be called as a hook
function CustomDateInput({
  field,
  fieldState,
}: {
  field: ControllerRenderProps;
  fieldState: ControllerFieldState;
}) {
  const ctx = useFormField(); // reads FormField context for IDs
  return (
    <DatePicker
      id={ctx.id}                                        // links to <label htmlFor>
      aria-invalid={fieldState.invalid || undefined}     // signals error state to AT
      aria-describedby={ctx.describedBy(fieldState.invalid)} // helper + error when invalid
      aria-required                                      // if the field is required
      {...field}
    />
  );
}

// Usage
<FormField>
  <FormFieldLabel required>{t('...')}</FormFieldLabel>
  <FormFieldController
    type="custom"
    name="date"
    control={form.control}
    render={(props) => <CustomDateInput {...props} />}
  />
</FormField>
```

`ctx.describedBy(invalid)` returns `"<descriptionId> <errorId>"` when invalid (so both helper text and error are announced), and just `"<descriptionId>"` otherwise.

### Accessibility summary

| Concern | Handled by | Notes |
|---|---|---|
| Label–input link (`htmlFor`/`id`) | `<FormField>` context | Automatic; never set `id`/`htmlFor` manually |
| Required indicator | `<FormFieldLabel required>` | Visual `*` only; add `aria-required` or `required` to the input for AT |
| Invalid state | `aria-invalid` on the input | Auto in built-in fields; manual in `type="custom"` |
| Error announcement | `aria-describedby` → `errorId` | Auto in built-in fields; use `ctx.describedBy(invalid)` in custom |
| Helper text announcement | `aria-describedby` → `descriptionId` | Auto in built-in fields; same as above |
| Hidden label | `<FormFieldLabel className="sr-only">` | Always provide a label — never rely solely on `placeholder` |

Available built-in types: `text`, `textarea`, `email`, `tel`, `time`, `select`, `combobox`, `combobox-multiple`, `number`, `otp`, `date`, `checkbox`, `checkbox-group`, `radio-group`.

---

## 4. Multi-step forms

### Page-level setup

Use `noHtmlForm` on `<Form>` — `<MultiStepFormNavigation>` handles submission, not an HTML form element:

```tsx
const form = useForm<FormFields>({
  resolver: zodResolver(zFormFields()),
  defaultValues: DEFAULT_VALUES,
});

const handleSubmit = form.handleSubmit((values) => {
  mutation.mutate(values);
});

return (
  <Form {...form} noHtmlForm>
    <MultiStepForm>
      {/* steps */}
      <MultiStepFormNavigation onSubmit={handleSubmit} />
    </MultiStepForm>
  </Form>
);
```

### Step validation: scoped `trigger()`

Each `<MultiStepFormStep>` receives an `onNext` callback that must return `Promise<boolean>`. Call `form.trigger()` with **only the field paths visible in that step** — not the full schema. `zodResolver` always runs the full Zod schema, but will only mark errors for the triggered fields.

For static fields, list them directly:

```tsx
<MultiStepFormStep
  name={t('...')}
  onNext={() => form.trigger(['date', 'seats', 'type'])}
>
```

For dynamic array fields, build the paths from the current value with `form.getValues()`:

```tsx
<MultiStepFormStep
  name={t('...')}
  onNext={() => {
    const stops = form.getValues('stops');
    return form.trigger(
      stops.flatMap((_, i) => [
        `stops.${i}.locationId` as FieldPath<FormFields>,
        `stops.${i}.outwardTime` as FieldPath<FormFields>,
      ])
    );
  }}
>
```

Use `as FieldPath<FormFields>` when constructing dynamic string paths to maintain TypeScript safety.

### Conditional steps

Wrap optional steps in `<Watch>` so the re-render is isolated and `MultiStepForm` only sees the step when the condition is met:

```tsx
<Watch
  control={form.control}
  names="type"
  render={(type) =>
    type === 'ROUND' ? (
      <MultiStepFormStep name={t('...')} onNext={...}>
        <StepInwardStops />
      </MultiStepFormStep>
    ) : null
  }
/>
```

### Resetting the form (e.g. loading a template)

```tsx
form.reset({ ...DEFAULT_VALUES, ...templateData });
```

Always spread `DEFAULT_VALUES` first so fields not covered by the template fall back to defaults rather than `undefined`.

### Preventing accidental navigation

Place `<FormStateSubscribe>` anywhere inside `<Form>`:

```tsx
<FormStateSubscribe
  control={form.control}
  render={({ isDirty }) => <PreventNavigation shouldBlock={isDirty} />}
/>
```

---

## 5. Dynamic field arrays

Use `useFieldArray` for repeating field groups. Never use the array index as a React key — it triggers `@eslint-react/no-array-index-key` (the project runs `--max-warnings 0`).

```tsx
const { fields, append, remove } = useFieldArray({ control, name: 'stops' });

// BAD — ESLint error
{fields.map((field, index) => <div key={index}>...</div>)}

// GOOD — useFieldArray provides a stable `id` on each item
{fields.map((field, index) => <div key={field.id}>...</div>)}
```

When rendering derived data (not the field array directly), use a stable business-logic identifier:

```tsx
{stops.map((stop) => <div key={stop.locationId}>...</div>)}
```

---

## 6. ESLint rules that affect RHF usage

| Rule | Trigger | Fix |
|---|---|---|
| `react-hooks/incompatible-library` | `form.watch()` | Use `useWatch` or `<Watch>` |
| `@eslint-react/no-array-index-key` | `key={index}` in JSX lists | Use `field.id` or a stable business ID |
