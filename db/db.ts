import {
  profilesTable,
  chatsTable,
  messagesTable,
  sourcesTable
} from "@/db/schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const schema = {
  profiles: profilesTable,
  chats: chatsTable,
  messages: messagesTable,
  sources: sourcesTable
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
