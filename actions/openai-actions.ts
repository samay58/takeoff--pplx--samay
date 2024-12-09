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

        const systemPrompt = `You are a helpful assistant. Use the following sources
        to answer the user's query. If the sources don't contain relevant information,
        you can use your general knowledge to answer.

        Today's date is ${new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })}.

        Sources:
        ${sourcesContext}

        IMPORTANT FORMATTING INSTRUCTIONS:
        1. Start each new topic or section with a clear heading
        2. Do not start lines with citations
        3. Place citations at the end of relevant sentences or paragraphs using [1], [2], etc.
        4. Never output [object Object] or raw source objects
        5. Format citations exactly like this: "This is a fact [1]." or "Multiple sources [1][2]"

        Example:
        "The beach is beautiful [1]. Visitors can enjoy swimming and surfing [2]."

        Respond in markdown format.`
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
