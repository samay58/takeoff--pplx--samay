"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ChatAreaSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
