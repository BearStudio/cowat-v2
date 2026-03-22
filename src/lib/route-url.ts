import type { FileRouteTypes } from '@/routeTree.gen';

type RoutePath = FileRouteTypes['to'];

/**
 * Extract `$param` names from a route path as a union of literal strings.
 * e.g. `/app/$orgSlug/commutes/$id/update` → `'orgSlug' | 'id'`
 */
type ExtractParams<T extends string> =
  T extends `${string}/$${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}/$${infer Param}`
      ? Param
      : never;

/**
 * If the route has params, require a `params` record mapping each param name
 * to a string value. If it has none, `params` is omitted.
 */
type RouteUrlOptions<T extends RoutePath> = [ExtractParams<T>] extends [never]
  ? { search?: Record<string, string> }
  : {
      params: Record<ExtractParams<T>, string>;
      search?: Record<string, string>;
    };

/**
 * Build a typesafe absolute URL for a given route path.
 *
 * @example
 * ```ts
 * routeUrl(baseUrl, '/app/$orgSlug/requests', { params: { orgSlug: 'acme' } })
 * // → "https://example.com/app/acme/requests"
 *
 * routeUrl(baseUrl, '/app/$orgSlug/commutes/new', {
 *   params: { orgSlug: 'acme' },
 *   search: { date: '2026-03-22' },
 * })
 * // → "https://example.com/app/acme/commutes/new?date=2026-03-22"
 * ```
 */
export function routeUrl<T extends RoutePath>(
  baseUrl: string,
  path: T,
  ...args: [ExtractParams<T>] extends [never]
    ? [options?: { search?: Record<string, string> }]
    : [options: RouteUrlOptions<T>]
): string {
  const options = args[0] as
    | { params?: Record<string, string>; search?: Record<string, string> }
    | undefined;

  let resolved: string = path;
  if (options && 'params' in options && options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      resolved = resolved.replace(`$${key}`, encodeURIComponent(value));
    }
  }

  const url = `${baseUrl}${resolved}`;

  if (options?.search && Object.keys(options.search).length > 0) {
    const searchParams = new URLSearchParams(options.search);
    return `${url}?${searchParams.toString()}`;
  }

  return url;
}
