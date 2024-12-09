"use server"

import { db } from "@/db/db"
import { InsertChat, chatsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export const createChat = async (userId: string, data: InsertChat) => {
  try {
    const [newChat] = await db.insert(chatsTable).values(data).returning()
    return newChat
  } catch (error) {
    console.error("Error creating chat:", error)
    throw new Error("Failed to create chat")
  }
}

export const getChats = async (userId: string) => {
  try {
    return db.query.chats.findMany({
      where: eq(chatsTable.userId, userId),
      orderBy: chats => chats.createdAt
    })
  } catch (error) {
    console.error("Error getting chats:", error)
    throw new Error("Failed to get chats")
  }
}

export const deleteChat = async (id: string) => {
  try {
    const [deletedChat] = await db
      .delete(chatsTable)
      .where(eq(chatsTable.id, id))
      .returning()
    return deletedChat
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw new Error("Failed to delete chat")
  }
}
