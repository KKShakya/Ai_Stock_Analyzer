import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 bg-white shadow-lg" /> {/* Maybe an action button */}
      </div>

      {/* Top grid: market sentiment + quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full rounded-xl bg-white shadow-lg" /> {/* Market Sentiment */}
        <Skeleton className="h-48 w-full rounded-xl bg-white shadow-lg" /> {/* Quick Stats */}
      </div>

      {/* OI / PCR Table */}
      <div>
        <Skeleton className="h-64 w-full rounded-xl bg-white shadow-lg" /> {/* Table */}
      </div>

      {/* News Section */}
      <div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl bg-white shadow-lg" />
          <Skeleton className="h-20 w-full rounded-xl bg-white shadow-lg" />
          <Skeleton className="h-20 w-full rounded-xl bg-white shadow-lg" />
        </div>
      </div>
    </div>
  )
}
