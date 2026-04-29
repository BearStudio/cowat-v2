import { Link, type LinkProps, useParams } from '@tanstack/react-router';

type OrgLinkProps = Omit<LinkProps, 'params'> & {
  params?: LinkProps['params'];
  className?: string;
};

export function OrgLink(props: OrgLinkProps) {
  const { orgSlug } = useParams({ strict: false });

  if (!orgSlug) {
    // Fallback: render a non-navigable span when used outside an org route
    // (e.g. landing page mockup, storybook). Keeps DOM and styling identical.
    const children =
      typeof props.children === 'function'
        ? props.children({ isActive: false, isTransitioning: false })
        : props.children;
    return <span className={props.className}>{children}</span>;
  }

  const { params, ...rest } = props;

  const resolveParams = () => {
    if (typeof params === 'function') return params({ orgSlug });
    if (typeof params === 'boolean') return {};
    return params;
  };
  return (
    <Link
      {...rest}
      params={{
        orgSlug,
        ...resolveParams(),
      }}
    />
  );
}
