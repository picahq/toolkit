/**
 * Pica ToolKit - Actions Schema
 * 
 * These are the schemas for the actions tool for the Pica ToolKit.
 * 
 * @fileoverview Actions schema for the Pica ToolKit
 * @author Pica
 */

import { z } from "zod/v4";

export const searchPlatformActionsSchema = z.object({
  platform: z.string().describe("Platform name to search actions for (e.g., 'google-sheets', 'shopify')"),
  query: z.string().describe("Search query to find relevant actions")
});

export type SearchPlatformActionsParams = z.infer<typeof searchPlatformActionsSchema>;

export const ActionSystemIdSchema = z.object({
  fullId: z.string().describe(
    "Opaque system ID. MUST be displayed exactly as provided. Do not trim."
  ),
  parts: z.object({
    prefix: z.string(),   // e.g. 'conn_mod_def'
    metadata: z.string(), // e.g. 'GEoTH7-tRU0'
    suffix: z.string(),   // e.g. 'RbyDQmffR5C14QTGEdELhg'
  }),
});

export const ActionReferenceSchema = z.object({
  title: z.string(),
  method: z.string(),
  path: z.string(),
  systemId: ActionSystemIdSchema,
});

export const getActionsKnowledgeSchema = z.object({
  systemIds: z.array(z.string()).describe("Array of full system IDs to get knowledge for")
});

export type GetActionsKnowledgeParams = z.infer<typeof getActionsKnowledgeSchema>;

export const ActionsKnowledgeResponseSchema = z.record(z.string(), z.object({
  title: z.string(),
  knowledge: z.string(),
  platform: z.string()
}));

export const SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG = {
  name: "searchPlatformActions",
  description: "Search for available actions on a specific platform. Use this to find APIs and operations you can perform on integrated platforms. Results are filtered based on your permission level: 'read' shows only GET methods, 'write' shows POST/PUT/PATCH methods, 'admin' shows all methods.",
  schema: searchPlatformActionsSchema,
  outputSchema: z.array(ActionReferenceSchema)
};

export const GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG = {
  name: "getActionsKnowledge",
  description: "Get detailed knowledge and documentation for specific actions using their system IDs. Call this after searching for actions to get comprehensive information about how to use them.",
  schema: getActionsKnowledgeSchema,
  outputSchema: ActionsKnowledgeResponseSchema
};
