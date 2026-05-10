export function DestinationCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50 bg-card animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function DestinationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[50vh] min-h-[350px] bg-muted" />
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex gap-3 mb-8">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-56 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
