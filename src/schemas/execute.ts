/**
 * Pica ToolKit - Execute Schema
 * 
 * These are the schemas for the execute tool for the Pica ToolKit.
 * 
 * @fileoverview Execute schema for the Pica ToolKit
 * @author Pica
 */

import { z } from "zod/v4";

export const executeActionSchema = z.object({
  actionSystemId: z.string().describe("The action system ID from searchPlatformActions results - method and path will be fetched automatically"),
  connectionKey: z.string().describe("The connection key for authentication - use the full connection key exactly"),
  data: z.any().describe("The request payload/body data"),
  pathVariables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().describe("Values for path variables like {{spreadsheetId}} - optional if no template variables"),
  queryParams: z.record(z.string(), z.any()).optional().describe("Query parameters to append to the URL - optional"),
  headers: z.record(z.string(), z.any()).optional().describe("Additional HTTP headers - optional"),
  isFormData: z.boolean().optional().describe("Set to true to send data as multipart/form-data - optional, defaults to false"),
  isFormUrlEncoded: z.boolean().optional().describe("Set to true to send data as application/x-www-form-urlencoded - optional, defaults to false"),
});

export type ExecuteActionParams = z.infer<typeof executeActionSchema>;

export const ExecuteActionResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    responseData: z.any().optional(),
    requestConfig: z.object({
      url: z.string(),
      method: z.string().optional(),
      headers: z.record(z.string(), z.any()),
      params: z.record(z.string(), z.any()).optional(),
      data: z.any().optional()
    })
  }),
  z.object({
    success: z.boolean(),
    error: z.string().optional()
  }),
  z.object({
    executed: z.boolean(),
    requestConfig: z.object({
      url: z.string(),
      method: z.string().optional(),
      headers: z.record(z.string(), z.any()),
      params: z.record(z.string(), z.any()).optional(),
      data: z.any().optional()
    })
  })
]);

export const EXECUTE_ACTION_TOOL_CONFIG = {
  name: "execute",
  description: "Execute an action on a connected platform. Automatically fetches method and path from the knowledge endpoint using actionSystemId. Provide the actionSystemId, connection key, and any required data.",
  schema: executeActionSchema,
  outputSchema: ExecuteActionResponseSchema
};

// Knowledge Agent Execute Tool - returns request config without execution
export const knowledgeAgentExecuteActionSchema = z.object({
  actionSystemId: z.string().describe("The action system ID from searchPlatformActions results - method and path will be fetched automatically"),
  connectionKey: z.string().describe("The connection key for authentication - use the full connection key exactly"),
  data: z.any().describe("The request payload/body data"),
  pathVariables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().describe("Values for path variables like {{spreadsheetId}} - optional if no template variables"),
  queryParams: z.record(z.string(), z.any()).optional().describe("Query parameters to append to the URL - optional"),
  headers: z.record(z.string(), z.any()).optional().describe("Additional HTTP headers - optional"),
  isFormData: z.boolean().optional().describe("Set to true to send data as multipart/form-data - optional, defaults to false"),
  isFormUrlEncoded: z.boolean().optional().describe("Set to true to send data as application/x-www-form-urlencoded - optional, defaults to false"),
});

export type KnowledgeAgentExecuteActionParams = z.infer<typeof knowledgeAgentExecuteActionSchema>;

export const KNOWLEDGE_AGENT_EXECUTE_ACTION_TOOL_CONFIG = {
  name: "execute",
  description: "Generate request configuration for an action without executing it. Returns the complete request config that can be used to create Edge Function code. Automatically fetches method and path from the knowledge endpoint using actionSystemId.",
  schema: knowledgeAgentExecuteActionSchema,
  outputSchema: ExecuteActionResponseSchema
};
