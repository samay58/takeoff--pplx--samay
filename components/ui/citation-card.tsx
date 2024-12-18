import React from "react"
import { Card, CardContent, CardHeader } from "./card"
import { Button } from "./button"
import { SelectSource } from "../../db/schema/sources-schema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select"
import { updateSourceAction } from "@/actions/db/sources-actions"

interface CitationCardProps {
  source: SelectSource
  index: number
  onCopy?: () => void
}

export function CitationCard({ source, index, onCopy }: CitationCardProps) {
  const formatCitation = () => {
    const style = source.citationStyle || "apa"
    const date = source.publishedDate?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })

    switch (style) {
      case "mla":
        return `${source.author ? source.author + ". " : ""}"${source.title}." ${
          source.publisher ? source.publisher + ", " : ""
        }${date || ""}`
      case "chicago":
        return `${source.author ? source.author + ". " : ""}"${source.title}." ${
          source.publisher ? source.publisher + ". " : ""
        }${date ? date + ". " : ""}${source.url}`
      case "apa":
      default:
        return `${source.author ? source.author + " (" : ""}${
          source.publishedDate?.getFullYear() || ""
        }${source.author ? "). " : ""}${source.title}. ${
          source.publisher ? source.publisher : ""
        }`
    }
  }

  const handleStyleChange = async (value: string) => {
    await updateSourceAction(source.id, { citationStyle: value })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-600 px-2 py-1 text-sm text-white">
            {index + 1}
          </span>
          <h3 className="font-medium">{source.title}</h3>
        </div>
        <Select
          value={source.citationStyle || "apa"}
          onValueChange={handleStyleChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apa">APA</SelectItem>
            <SelectItem value="mla">MLA</SelectItem>
            <SelectItem value="chicago">Chicago</SelectItem>
          </SelectContent>
        </Select>
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
