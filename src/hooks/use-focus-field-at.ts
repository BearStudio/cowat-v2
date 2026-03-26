import { useRef } from 'react';

/**
 * Returns a container ref and a function that, after the next paint,
 * focuses the first visible text input inside the element matching
 * `[data-field-index="${index}"]` and scrolls it into view.
 *
 * React Hook Form's `setFocus` does not work reliably with field arrays:
 * when appending a new field, `setFocus` fires before the DOM node exists,
 * so the input is never focused or scrolled into view. This hook uses a
 * DOM-based approach with `requestAnimationFrame` to wait for the next
 * paint, then manually finds and focuses the input.
 */
export function useFocusFieldAt<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);

  const focusFieldAt = (index: number) => {
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(
        `[data-field-index="${index}"]`
      );
      if (!el) return;

      const input = el.querySelector<HTMLInputElement>(
        'input[type="text"], input:not([type])'
      );
      if (!input) return;

      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return { containerRef, focusFieldAt };
}
