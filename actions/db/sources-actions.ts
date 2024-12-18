"use server"

import { createSource, getSources, updateSource } from "@/db/queries/sources-queries"
import { InsertSource, SelectSource } from "@/db/schema"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

async function extractMetadata(url: string) {
  try {
    const response = await fetch(url)
    const text = await response.text()

    // Simple regex-based extraction to avoid dependencies
    const authorMatch = text.match(/<meta[^>]*(?:name|property)="(?:author|article:author)"[^>]*content="([^"]*)"[^>]*>/i)
    const dateMatch = text.match(/<meta[^>]*(?:name|property)="(?:article:published_time|publication_date)"[^>]*content="([^"]*)"[^>]*>/i)
    const publisherMatch = text.match(/<meta[^>]*(?:name|property)="(?:og:site_name|publisher)"[^>]*content="([^"]*)"[^>]*>/i)

    const author = authorMatch?.[1] || null
    const publishedDate = dateMatch?.[1] ? new Date(dateMatch[1]) : null
    const publisher = publisherMatch?.[1] || new URL(url).hostname || null

    return {
      author,
      publishedDate,
      publisher
    }
  } catch (error) {
    console.error("Error extracting metadata:", error)
    return {
      author: null,
      publishedDate: null,
      publisher: null
    }
  }
}

export async function createSourceAction(
  source: InsertSource,
  chatId: string,
  userId: string
): Promise<ActionState<SelectSource>> {
  try {
    // Extract metadata if URL is provided
    if (source.url) {
      const metadata = await extractMetadata(source.url)
      source = {
        ...source,
        author: metadata.author,
        publishedDate: metadata.publishedDate,
        publisher: metadata.publisher,
        citationStyle: source.citationStyle || 'apa' // Default to APA style
      }
    }

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

export async function updateSourceAction(
  sourceId: string,
  data: Partial<InsertSource>
): Promise<ActionState<SelectSource>> {
  try {
    const updatedSource = await updateSource(sourceId, data)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Source updated successfully",
      data: updatedSource
    }
  } catch (error) {
    console.error("Error updating source:", error)
    return { isSuccess: false, message: "Failed to update source" }
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
