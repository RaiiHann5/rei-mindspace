import Skeleton from '@/components/ui/Skeleton'

// Shown inside the Suspense boundary around each lazy-loaded page (see
// routes/index.jsx) while its chunk downloads — usually just a flash on a
// fast connection, but keeps first navigation to a given page from looking
// like a frozen/blank screen.
export default function RouteLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
