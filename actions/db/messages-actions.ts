"use server"

import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { messagesTable } from "@/db/schema"
import { ActionState } from "@/types"
import type { SelectMessage } from "@/db/schema"
import { revalidatePath } from "next/cache"

export async function getMessagesAction(
  chatId: string
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await db.query.messages.findMany({
      where: eq(messagesTable.chatId, chatId),
      orderBy: (messages) => [messages.createdAt]
    })

    return {
      isSuccess: true,
      message: "Messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error getting messages:", error)
    return { isSuccess: false, message: "Failed to get messages" }
  }
}

export async function createMessageAction(
  data: {
    content: string
    role: "user" | "assistant"
    chatId: string
    userId: string
  }
): Promise<ActionState<SelectMessage>> {
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        content: data.content,
        role: data.role,
        chatId: data.chatId
      })
      .returning()

    revalidatePath("/search")

    return {
      isSuccess: true,
      message: "Message created successfully",
      data: newMessage
    }
  } catch (error) {
    console.error("Error creating message:", error)
    return { isSuccess: false, message: "Failed to create message" }
  }
}