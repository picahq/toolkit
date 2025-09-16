# Pica ToolKit

[![npm version](https://img.shields.io/npm/v/%40picahq%2Ftoolkit)](https://npmjs.com/package/@picahq/toolkit)

<img src="https://assets.picaos.com/github/pica-toolkit-banner.svg" alt="Pica ToolKit Banner" style="border-radius: 5px;">

Pica's ToolKit provides enterprise-grade integration capabilities for AI agents built with the Vercel AI SDK. Through Pica's integration layer, agents can seamlessly interact with third-party services and APIs while maintaining enterprise security, compliance, and reliability standards.

## Installation

```bash
npm install @picahq/toolkit
```

## Setup

1. Create a new [Pica account](https://app.picaos.com)
2. Create a Connection via the [Pica Dashboard](https://app.picaos.com/connections)
3. Create a [Pica API key](https://app.picaos.com/settings/api-keys)
4. Set the API key as an environment variable: `PICA_SECRET_KEY=<your-api-key>`

## Usage

The Pica ToolKit seamlessly integrates with [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), enabling powerful AI capabilities in your applications. Below is a simple example showing how to implement it in a Vercel Agent with read-only permissions on a Gmail connection.

```typescript
import { Pica } from '@picahq/ai';
import { openai } from '@ai-sdk/openai';
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs
} from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const pica = new Pica(process.env.PICA_SECRET_KEY!, {
    connectors: ["test::gmail::default::6faf1d3707f846ef89295c836df71c94"],
    permissions: "read"
  });

  const systemPrompt = pica.getSystemPrompt();

  const result = streamText({
    model: openai("gpt-4.1"),
    messages: convertToModelMessages(messages),
    tools: {
      ...pica.tools() // Load the Pica ToolKit
    },
    system: systemPrompt,
    stopWhen: stepCountIs(25)
  });

  return result.toUIMessageStreamResponse();
}
```

> ⭐️ Experience the Pica ToolKit's capabilities firsthand through our interactive demo chat application [here](https://github.com/picahq/toolkit-demo)


## What can Pica do?

After installing the SDK and integrating your platforms through the [Pica dashboard](https://app.picaos.com/connections), you can effortlessly create sophisticated AI agents to orchestrate and automate your business workflows.

![ToolKit Diagram](https://assets.picaos.com/github/toolkit-diagram.svg)

Here are some powerful examples use cases:

### Communication & Productivity
- Compose and send Gmail emails containing meeting summaries to team members
- Schedule Google Calendar events with specified date/time parameters
- Post messages with campaign analytics to designated Slack channels
- Search and retrieve Q3 planning materials from Google Drive

### Data Access & Analysis 
- Execute PostgreSQL queries to identify top customer segments
- Generate new Google Sheets workbooks populated with sales metrics
- Retrieve closing opportunity data from Salesforce CRM
- Maintain project tracking databases in Notion workspaces

### Business Operations
- Create customer support cases in Zendesk from feedback data
- Process customer refund transactions via Stripe
- Convert website inquiries into HubSpot lead entries
- Generate client invoices through QuickBooks integration

### AI & Content
- Create DALL-E images matching product requirements
- Convert meeting audio to text using ElevenLabs
- Conduct market research via Tavily/SerpApi integrations
- Perform sentiment analysis on support interactions

## License

This project is licensed under the GPL-3.0 license. See the [LICENSE](LICENSE) file for details.
