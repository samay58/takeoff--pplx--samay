"use server"

import { auth } from "@clerk/nextjs/server"
import { getChatAction } from "@/actions/db/chats-actions"
import { getMessagesAction } from "@/actions/db/messages-actions"
import { getSourcesAction } from "@/actions/db/sources-actions"
import ChatArea from "../_components/chat-area"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ChatAreaSkeleton from "../_components/chat-area-skeleton"

interface SearchChatPageProps {
  params: {
    chatId: string
  }
}

export default async function SearchChatPage({ params }: SearchChatPageProps) {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  return (
    <div className="h-full">
      <Suspense fallback={<ChatAreaSkeleton />}>
        <ChatAreaFetcher chatId={params.chatId} userId={userId} />
      </Suspense>
    </div>
  )
}

async function ChatAreaFetcher({
  chatId,
  userId
}: {
  chatId: string
  userId: string
}) {
  const [chatResponse, messagesResponse, sourcesResponse] = await Promise.all([
    getChatAction(chatId, userId),
    getMessagesAction(chatId),
    getSourcesAction(chatId)
  ])

  if (!chatResponse.isSuccess || !chatResponse.data) {
    redirect("/search")
  }

  return (
    <ChatArea
      initialMessages={messagesResponse.data || []}
      initialSources={sourcesResponse.data || []}
      userId={userId}
      chatId={chatId}
    />
  )
}
