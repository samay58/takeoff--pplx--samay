import React from "react"
import { Card, CardContent, CardHeader } from "./card"
import { Button } from "./button"
import { SelectSource } from "../../db/schema/sources-schema"

interface CitationCardProps {
  source: SelectSource
  index: number
  onCopy?: () => void
}

export function CitationCard({ source, index, onCopy }: CitationCardProps) {
  const formatCitation = () => {
    return `${source.author ? source.author + ". " : ""}${source.title}. ${
      source.publisher ? source.publisher + ", " : ""
    }${source.publishedDate?.toLocaleDateString() || ""}`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-2">
        <span className="rounded-full bg-emerald-600 px-2 py-1 text-sm text-white">
          {index + 1}
        </span>
        <h3 className="font-medium">{source.title}</h3>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground text-sm">{source.summary}</p>
        <div className="flex items-center justify-between">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:underline"
          >
            View Source
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(formatCitation())
              onCopy?.()
            }}
          >
            Copy Citation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
