import { Link, type LinkProps, useParams } from '@tanstack/react-router';

type OrgLinkProps = Omit<LinkProps, 'params'> & {
  params?: LinkProps['params'];
  className?: string;
};

export function OrgLink(props: OrgLinkProps) {
  const { orgSlug } = useParams({ strict: false });

  if (!orgSlug) {
    throw new Error('OrgLink must be used inside an organization route.');
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
