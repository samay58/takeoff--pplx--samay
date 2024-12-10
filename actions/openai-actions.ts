"use server"

import { SelectSource } from "@/db/schema";
import { ActionState } from "@/types";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function generateOpenAIResponseAction(
    userQuery: string, 
    sources: SelectSource[]
): Promise<ActionState<StreamableValue<any, any>>> {
    try {
        const stream = createStreamableValue()
        
        const sourcesContext = sources
        .map(
            (r, i) => 
                `Source ${i + 1}: ${r.title}\nURL: 
            ${r.url}\nSummary: ${r.summary}\nText:
            ${r.text}\n`
        )
        .join("")

        const systemPrompt = `You are a helpful assistant. Use the following sources to answer the user's query. If the sources don't contain relevant information, you can use your general knowledge to answer.

Today's date is ${new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
})}.

Sources:
${sourcesContext}

IMPORTANT FORMATTING INSTRUCTIONS:
1. Use markdown formatting for structure
2. Use headers (##) for main sections
3. Place citations at the end of sentences using [1], [2], etc.
4. Citations should be immediately after the relevant text, before any punctuation
5. Format citations exactly like this: "This is a fact [1]." or "These are facts [1][2]."
6. Never start a line with citations
7. Never output raw source objects or [object Object]

Example good formatting:
## Topic
This is a fact from the first source [1]. Here is another fact that combines two sources [1][2].

## Another Topic
The information comes from the third source [3].`
        ;(async () => {
            const {textStream} = await streamText({
                model: openai("gpt-4o"),
                system: systemPrompt,
                messages: [{role: "user", content: userQuery}],
            })

            for await (const chunk of textStream) {
                stream.update(chunk)
            }

            stream.done()
        })()

        return {
            isSuccess: true,
            message: "OpenAI response generated successfully",
            data: stream.value
        }

    } catch (error) {
        console.error("Error generating OpenAI response", error)
        return {
            isSuccess: false,
            message: "Failed to generate OpenAI response"
        }
    }
}
