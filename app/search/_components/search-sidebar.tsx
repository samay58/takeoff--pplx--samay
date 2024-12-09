"use client"

import { SelectChat } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { createChatAction, deleteChatAction } from "@/actions/db/chats-actions"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import Link from "next/link"

interface SearchSidebarProps {
  className?: string
  userId: string
  initialChats: SelectChat[]
}

export default function SearchSidebar({
  className,
  initialChats,
  userId
}: SearchSidebarProps) {
  const [chats, setChats] = useState(initialChats)
  const router = useRouter()

  const handleNewChat = async () => {
    const result = await createChatAction({ name: "NewChat" }, userId)
    if (result.isSuccess && result.data) {
      setChats([result.data, ...chats])
      router.push(`/search/${result.data.id}`)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    const result = await deleteChatAction(chatId)
    if (result.isSuccess) {
      setChats(chats.filter(chat => chat.id !== chatId))
    }
  }

  return (
    <aside className={`bg-[#F5F5F0] p-4 ${className}`}>
      <Button
        onClick={handleNewChat}
        className="mb-4 flex w-full items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Plus className="mr-2 size-4" />
        New Search
      </Button>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Sidebar</h2>
      {chats.map(chat => (
        <Link key={chat.id} href={`/search/${chat.id}`} className="block">
          <div className="group mb-2 flex items-center justify-between rounded-lg p-2 text-neutral-800 hover:bg-[#E8E8E0]">
            <span>{chat.name}</span>
            <Trash2
              className="size-4 cursor-pointer opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
              onClick={e => {
                e.preventDefault()
                handleDeleteChat(chat.id)
              }}
            />
          </div>
        </Link>
      ))}
    </aside>
  )
}
