"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SearchSidebarSkeleton({
  className = ""
}: {
  className?: string
}) {
  return (
    <div className={`space-y-4 p-4 ${className}`}>
      <Skeleton className="h-10 w-full" />

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}
