/**
 * Pica ToolKit - Basic Example
 * 
 * This is the basic example for using the Pica ToolKit with the Vercel AI SDK and OpenAI.
 * 
 * @fileoverview Basic Example for the Pica ToolKit
 * @author Pica
 */

import { Pica } from "../src";
import { openai } from "@ai-sdk/openai";
import { stepCountIs, streamText } from "ai";

async function main() {
  if (!process.env.PICA_SECRET_KEY) {
    throw new Error("PICA_SECRET_KEY is not set");
  }

  try {
    const pica = new Pica(process.env.PICA_SECRET_KEY!, {
      knowledgeAgent: true
    });

    const systemPrompt = pica.getSystemPrompt();

    const { textStream } = streamText({
      model: openai("gpt-4.1"),
      tools: { ...pica.tools() },
      system: systemPrompt,
      messages: [{ role: "user", content: "Send an email using gmail" }],
      stopWhen: stepCountIs(25),
    });

    for await (const textPart of textStream) {
      process.stdout.write(textPart);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main().catch(console.error);
