"use server"

import { db } from "@/db/db"
import { InsertSource, sourcesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export const createSource = async (
  userId: string,
  chatId: string,
  data: InsertSource
) => {
  try {
    const [newSource] = await db.insert(sourcesTable).values(data).returning()
    return newSource
  } catch (error) {
    throw new Error("Failed to create source")
  }
}

export const getSources = async (chatId: string) => {
  try {
    return db.query.sources.findMany({
      where: eq(sourcesTable.chatId, chatId),
      orderBy: sources => sources.createdAt
    })
  } catch (error) {
    throw new Error("Failed to get sources")
  }
}

export const updateSource = async (
  sourceId: string,
  data: Partial<InsertSource>
) => {
  try {
    const [updatedSource] = await db
      .update(sourcesTable)
      .set(data)
      .where(eq(sourcesTable.id, sourceId))
      .returning()
    return updatedSource
  } catch (error) {
    throw new Error("Failed to update source")
  }
}
