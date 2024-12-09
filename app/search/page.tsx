"use server"

import { auth } from "@clerk/nextjs/server"
import ChatArea from "./_components/chat-area"
import { redirect } from "next/navigation"

export default async function SearchPage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="h-full">
      <ChatArea
        initialSources={[]}
        initialMessages={[]}
        userId={userId}
        chatId={""}
      />
    </div>
  )
}
