"use server"

import { Suspense } from "react"
import SearchSidebar from "./_components/search-sidebar"
import SearchSidebarSkeleton from "./_components/search-sidebar-skeleton"
import { auth } from "@clerk/nextjs/server"
import { getChatsAction } from "@/actions/db/chats-actions"

export default async function SearchLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<SearchSidebarSkeleton className="w-64 border-r" />}>
        <SearchSidebarFetcher />
      </Suspense>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

async function SearchSidebarFetcher() {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Not authenticated")
  }

  const { data } = await getChatsAction(userId)

  return (
    <SearchSidebar
      className="w-64 border-r"
      userId={userId}
      initialChats={data || []}
    />
  )
}
