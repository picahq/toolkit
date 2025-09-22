/**
 * Pica ToolKit - Connections Schema
 * 
 * These are the schemas for the connections tool for the Pica ToolKit.
 * 
 * @fileoverview Connections schema for the Pica ToolKit
 * @author Pica
 */

import { z } from "zod/v4";

export const ConnectionKeySchema = z.object({
  fullKey: z.string().describe(
    "Opaque connection key. MUST be displayed exactly as provided, including prefixes like 'test::...'. Do not trim."
  ),
  parts: z.object({
    environment: z.string(),         // e.g. 'test'
    platform: z.string(),            // e.g. 'postgresql'
    namespace: z.string(),           // e.g. 'default'
    id: z.string(),                  // e.g. 'c76d7a...'
    identity: z.string().optional(), // e.g. 'user-abc'
  }),
});

export const ConnectionReferenceSchema = z.object({
  platform: z.string(),
  key: ConnectionKeySchema,
});

export const listPicaConnectionsSchema = z.object({});

export type listPicaConnectionsParams = z.infer<typeof listPicaConnectionsSchema>;

export const LIST_PICA_CONNECTIONS_TOOL_CONFIG = {
  name: "listPicaConnections",
  description: "List all connected integrations in the user's Pica account. IMPORTANT: Keys are opaque identifiers and must be shown VERBATIM. Do NOT drop prefixes (e.g., 'test::'). When summarizing, include the `fullKey` exactly as returned.",
  schema: listPicaConnectionsSchema,
  outputSchema: z.array(ConnectionReferenceSchema)
};

export const promptToConnectIntegrationSchema = z.object({
  platformName: z.string(),
});

export type PromptToConnectIntegrationParams = z.infer<typeof promptToConnectIntegrationSchema>;

export const PromptToConnectIntegrationResponseSchema = z.object({
  response: z.string(),
});

export const PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG = {
  name: "promptToConnectIntegration",
  description: "Prompt the user to connect to a platform that they do not currently have access to via AuthKit",
  schema: promptToConnectIntegrationSchema,
  outputSchema: PromptToConnectIntegrationResponseSchema
};
