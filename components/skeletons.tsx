export function FeedSkeleton() {
  return (
    <div className="animate-pulse space-y-14">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="aspect-[16/10] rounded-sm bg-wash" />
        <div className="space-y-4">
          <div className="h-3 w-32 rounded bg-wash" />
          <div className="h-10 w-full rounded bg-wash" />
          <div className="h-10 w-4/5 rounded bg-wash" />
          <div className="h-4 w-full rounded bg-wash" />
          <div className="h-4 w-3/4 rounded bg-wash" />
        </div>
      </div>
      <div className="grid gap-10 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[16/10] rounded-sm bg-wash" />
            <div className="h-3 w-24 rounded bg-wash" />
            <div className="h-7 w-full rounded bg-wash" />
            <div className="h-4 w-4/5 rounded bg-wash" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse space-y-6 px-5 py-14 sm:px-8">
      <div className="h-3 w-28 rounded bg-wash" />
      <div className="h-14 w-full rounded bg-wash" />
      <div className="h-14 w-3/4 rounded bg-wash" />
      <div className="aspect-[16/9] rounded-sm bg-wash" />
      <div className="space-y-3 pt-6">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="h-4 w-full rounded bg-wash" />
        ))}
      </div>
    </div>
  );
}
