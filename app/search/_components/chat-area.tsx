"use client"

import { createChatAction, updateChatAction } from "@/actions/db/chats-actions"
import { searchExaAction } from "@/actions/exa-actions"
import { generateOpenAIResponseAction } from "@/actions/openai-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectMessage, SelectSource, InsertSource } from "@/db/schema"
import { readStreamableValue } from "ai/rsc"
import { Search } from "lucide-react"
import { useState } from "react"
import { createMessageAction } from "@/actions/db/messages-actions"
import { createSourceAction } from "@/actions/db/sources-actions"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card"
import { toast } from "@/components/ui/use-toast"
import { CitationCard } from "@/components/ui/citation-card"
import ReactMarkdown from "react-markdown"

interface ChatAreaProps {
  className?: string
  initialSources: any[]
  initialMessages: SelectMessage[]
  chatId: string
  userId: string
}

export default function ChatArea({
  className,
  initialSources,
  initialMessages,
  chatId,
  userId
}: ChatAreaProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [sources, setSources] = useState(initialSources)
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleSearch = async (userQuery: string) => {
    setIsSearching(true)

    let currentChatId = chatId
    let isNewChat = !chatId

    if (isNewChat) {
      const newChat = await createChatAction(
        {
          name: userQuery.slice(0, 50)
        },
        userId
      )

      if (newChat.isSuccess && newChat.data) {
        currentChatId = newChat.data.id
      } else {
        console.error("Failed to create chat:", newChat.message)
        return
      }
    } else {
      const firstMessage = messages.find(m => m.role === "user")
      if (!firstMessage && userQuery) {
        await updateChatAction(
          currentChatId,
          {
            name: userQuery.slice(0, 50)
          },
          userId
        )
      }
    }

    const userMessageId = Date.now().toString()
    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        chatId: currentChatId,
        content: userQuery,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    const exaResponse = await searchExaAction(userQuery)
    if (!exaResponse.isSuccess) {
      console.error(exaResponse.message)
      setIsSearching(false)
      return
    }

    const searchSources = (exaResponse.data || []).map((result, idx) => ({
      id: `${idx}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      chatId: currentChatId,
      author: null,
      publishedDate: null,
      publisher: null,
      citationStyle: null,
      ...result
    }))

    setSources(searchSources)
    setIsSearching(false)
    setIsGenerating(true)

    const assistantMessageId = Date.now().toString() + 1
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Analyzing sources...",
        chatId: currentChatId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    for (const source of searchSources) {
      const sourceData: InsertSource = {
        chatId: currentChatId,
        url: source.url,
        title: source.title,
        text: source.text,
        summary: source.summary
      }

      await createSourceAction(sourceData, currentChatId, userId)
    }

    const openaiResponse = await generateOpenAIResponseAction(
      userQuery,
      searchSources
    )
    if (!openaiResponse.isSuccess) {
      console.error(openaiResponse.message)
      setIsGenerating(false)
      return
    }

    setIsGenerating(false)

    let fullContent = ""
    try {
      for await (const chunk of readStreamableValue(
        openaiResponse.data || {}
      )) {
        if (chunk) {
          fullContent += chunk
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error("Error generating full response:", error)
    }

    await createMessageAction({
      content: userQuery,
      role: "user",
      chatId: currentChatId,
      userId
    })

    await createMessageAction({
      content: fullContent,
      role: "assistant",
      chatId: currentChatId,
      userId
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSearch(inputValue.trim())
      setInputValue("")
    }
  }

  const renderWithCitations = (children: React.ReactNode) => {
    if (!children) return null

    const text = children
      .toString()
      .replace(/\[object Object\]/g, "")
      .replace(/["""]/g, "") // Remove weird quotes
      .trim()

    // Split by citation markers but preserve them
    const parts = text.split(/(\[\d+\])/g)

    return (
      <div className="inline">
        {parts.map((part, index) => {
          const citationMatch = part.match(/\[(\d+)\]/)
          if (citationMatch) {
            const sourceIndex = parseInt(citationMatch[1]) - 1
            const source = sources[sourceIndex]

            if (source) {
              return (
                <HoverCard key={index}>
                  <HoverCardTrigger asChild>
                    <sup className="cursor-pointer rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs text-white hover:bg-emerald-700">
                      {citationMatch[1]}
                    </sup>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" align="right" sideOffset={8}>
                    <CitationCard
                      source={source}
                      index={sourceIndex}
                      onCopy={() => {
                        toast({
                          title: "Citation copied",
                          description:
                            "The citation has been copied to your clipboard"
                        })
                      }}
                    />
                  </HoverCardContent>
                </HoverCard>
              )
            }
          }
          return part
        })}
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col bg-[#FAF9F6] ${className}`}>
      {messages.length === 0 ? (
        <div className="flex size-full items-center justify-center">
          <div className="w-full max-w-2xl space-y-8 px-4 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
              Ask anything
              <span className="ml-1 inline-block animate-pulse text-emerald-600">
                _
              </span>
            </h1>
            <div className="relative w-full">
              <Input
                placeholder="Search anything..."
                className="h-12 border-emerald-200 bg-[#F5F5F0] pr-12 text-lg text-neutral-900 placeholder:text-neutral-500 focus-visible:ring-emerald-500"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-emerald-600 hover:bg-[#E8E8E0] hover:text-emerald-700"
                onClick={() => {
                  if (inputValue.trim()) {
                    handleSearch(inputValue.trim())
                    setInputValue("")
                  }
                }}
              >
                <Search className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-8">
          {messages.map((msg, index) => (
            <div key={msg.id} className="w-full">
              {msg.role === "user" ? (
                <div className="mb-4 text-xl font-medium">{msg.content}</div>
              ) : null}

              {msg.role === "user" &&
                index === messages.length - 2 &&
                sources.length > 0 && (
                  <div className="-mx-4 overflow-x-auto px-4 pb-4">
                    <div className="flex min-w-min gap-4">
                      {sources.map(source => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 flex-col rounded-lg border bg-[#F5F5F0] p-3 transition hover:bg-[#E8E8E0]"
                          style={{ width: "200px" }}
                        >
                          <div className="mb-2 line-clamp-2 text-sm font-medium text-neutral-900">
                            {source.title}
                          </div>
                          <div className="mt-auto truncate text-xs text-emerald-600 hover:text-emerald-700">
                            {source.url}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {msg.role === "assistant" && (
                <div className="prose max-w-none rounded-lg border bg-[#F5F5F0] p-6 text-neutral-900">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4">{renderWithCitations(children)}</p>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2">
                          {renderWithCitations(children)}
                        </li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-4 text-2xl font-bold">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 text-xl font-bold">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-3 text-lg font-bold">{children}</h3>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
