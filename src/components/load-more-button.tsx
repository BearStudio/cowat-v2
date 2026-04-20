import { Button } from '@/components/ui/button';

type LoadMoreButtonProps = {
  query: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };
  label: string;
};

export const LoadMoreButton = ({ query, label }: LoadMoreButtonProps) => {
  if (!query.hasNextPage) return null;
  return (
    <div className="flex justify-center">
      <Button
        size="xs"
        variant="secondary"
        onClick={() => query.fetchNextPage()}
        loading={query.isFetchingNextPage}
      >
        {label}
      </Button>
    </div>
  );
};
