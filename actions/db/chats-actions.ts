"use server"

import { createChat, deleteChat, getChats } from "@/db/queries/chats-queries"
import { InsertChat, SelectChat } from "@/db/schema"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"
import { chatsTable } from "@/db/schema"
import { db } from "@/db/db"

export async function createChatAction(
  chat: Omit<InsertChat, "userId">,
  userId: string
): Promise<ActionState<SelectChat>> {
  try {
    const newChat = await createChat(userId, { ...chat, userId })
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Chat created successfully",
      data: newChat
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return { isSuccess: false, message: "Failed to create chat" }
  }
}

export async function getChatsAction(
  userId: string
): Promise<ActionState<SelectChat[]>> {
  try {
    const chats = await getChats(userId)
    return {
      isSuccess: true,
      message: "Chats retrieved successfully",
      data: chats
    }
  } catch (error) {
    console.error("Error getting chats:", error)
    return { isSuccess: false, message: "Failed to get chats" }
  }
}

export async function deleteChatAction(chatId: string): Promise<ActionState<void>> {
  try {
    await db.delete(chatsTable).where(eq(chatsTable.id, chatId))
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Chat deleted successfully"
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
    return { isSuccess: false, message: "Failed to delete chat" }
  }
}

export async function getChatAction(
  chatId: string,
  userId: string
): Promise<ActionState<SelectChat>> {
  try {
    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chatsTable.id, chatId),
        eq(chatsTable.userId, userId)
      )
    })

    if (!chat) {
      return {
        isSuccess: false,
        message: "Chat not found"
      }
    }

    return {
      isSuccess: true,
      message: "Chat retrieved successfully",
      data: chat
    }
  } catch (error) {
    console.error("Error getting chat:", error)
    return { isSuccess: false, message: "Failed to get chat" }
  }
} 