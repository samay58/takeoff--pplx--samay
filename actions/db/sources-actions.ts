"use server"

import { createSource, getSources } from "@/db/queries/sources-queries"
import { InsertSource, SelectSource } from "@/db/schema"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

export async function createSourceAction(
  source: InsertSource,
  chatId: string,
  userId: string
): Promise<ActionState<SelectSource>> {
  try {
    const newSource = await createSource(userId, chatId, source)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Source created successfully",
      data: newSource
    }
  } catch (error) {
    console.error("Error creating source:", error)
    return { isSuccess: false, message: "Failed to create source" }
  }
}

export async function getSourcesAction(
  chatId: string
): Promise<ActionState<SelectSource[]>> {
  try {
    const sources = await getSources(chatId)
    return {
      isSuccess: true,
      message: "Sources retrieved successfully",
      data: sources
    }
  } catch (error) {
    console.error("Error getting sources:", error)
    return { isSuccess: false, message: "Failed to get sources" }
  }
}