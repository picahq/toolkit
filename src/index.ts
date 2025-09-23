/**
 * Pica ToolKit - Main Entry Point
 * 
 * This is the main entry point for the Pica ToolKit.
 * 
 * @fileoverview Main entry point for the Pica ToolKit
 * @author Pica
 */

import { tool, ToolSet } from "ai";
import chalk from "chalk";
import { executeAction } from "./apis/execute.js";
import {
  listConnections,
  clean
} from "./apis/connections.js";
import {
  searchPlatformActions,
  getActionsKnowledge
} from "./apis/action.js";
import { getAvailableActions } from "./apis/available-actions.js";
import { getAvailableConnectors, listPicaIntegrations, PicaIntegration } from "./apis/available-connectors.js";
import { generateDefaultSystemPrompt } from "./prompts/default.js";
import { generateKnowledgeAgentSystemPrompt } from "./prompts/knowledge.js";
import {
  LIST_PICA_CONNECTIONS_TOOL_CONFIG,
  LIST_PICA_INTEGRATIONS_TOOL_CONFIG,
  SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG,
  GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG,
  EXECUTE_ACTION_TOOL_CONFIG,
  PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG,
  SearchPlatformActionsParams,
  GetActionsKnowledgeParams,
  ExecuteActionParams,
  PromptToConnectIntegrationParams
} from "./schemas/index.js";
import {
  PicaOptions,
  Connection,
  ConnectionReference,
  ActionReference,
  Connector,
  AvailableAction,
  ActionsKnowledgeResponse,
  ExecuteActionResponse
} from "./types/index.js";
import {
  isInitializingWithAllConnectors,
  isInitializingWithAllActions,
  pluralize,
  LOG_MESSAGES
} from "./utils/index.js";

export class Pica {
  private secret: string;
  private baseUrl = "https://api.picaos.com";
  private options?: PicaOptions;

  constructor(secret: string, options?: PicaOptions) {
    this.secret = secret;
    this.baseUrl = options?.serverUrl || "https://api.picaos.com";
    this.options = options;

    // Knowledge Agent Mode initialization
    if (this.options?.knowledgeAgent) {
      console.log(chalk.green.bold(LOG_MESSAGES.KNOWLEDGE_AGENT_INITIALIZED));
      console.log(chalk.yellow(LOG_MESSAGES.KNOWLEDGE_AGENT_ACTIONS_ACCESS));
      console.log(chalk.yellow(LOG_MESSAGES.KNOWLEDGE_AGENT_EXECUTE_CONFIG));
      console.log(chalk.gray(LOG_MESSAGES.KNOWLEDGE_AGENT_CONNECTIONS_DISABLED));
      console.log(chalk.magenta(LOG_MESSAGES.LIST_PICA_INTEGRATIONS_ENABLED));

      if (this.options?.authkit) {
        console.log(chalk.blue(LOG_MESSAGES.AUTHKIT_ENABLED));
      }
      return;
    }

    // Standard mode initialization
    this.logConnectorInitialization();
    this.logActionInitialization();

    if (this.options?.authkit) {
      console.log(chalk.blue(LOG_MESSAGES.AUTHKIT_ENABLED));
    }
  }

  get passthroughUrl(): string {
    return `${this.baseUrl}/v1/passthrough`;
  }

  get systemPrompt(): string {
    if (this.options?.knowledgeAgent) {
      return generateKnowledgeAgentSystemPrompt();
    }
    return generateDefaultSystemPrompt(this.options?.connectors, this.options?.actions);
  }

  /**
   * Generate system prompt - optionally combine user prompt with Pica's
   * @param userPrompt - Optional user's custom system prompt
   * @param separator - Optional separator between prompts (default: double newline)
   * @returns Pica's system prompt only, or combined prompt if userPrompt provided
   */
  generateSystemPrompt(userPrompt?: string, separator: string = '\n\n'): string {
    if (!userPrompt) {
      return this.systemPrompt;
    }
    return `${userPrompt}${separator}${this.systemPrompt}`;
  }

  private logConnectorInitialization(): void {
    if (isInitializingWithAllConnectors(this.options?.connectors)) {
      console.log(chalk.cyan(LOG_MESSAGES.ALL_CONNECTORS_ACCESS));
      console.log(chalk.magenta(LOG_MESSAGES.LIST_CONNECTIONS_ENABLED));
    } else {
      const connectorCount = this.options?.connectors?.length || 0;
      console.log(chalk.cyan(LOG_MESSAGES.connectorCount(connectorCount, pluralize(connectorCount, 'connector'))));
      console.log(chalk.magenta(LOG_MESSAGES.LIST_CONNECTIONS_DISABLED));
    }
  }

  private logActionInitialization(): void {
    if (isInitializingWithAllActions(this.options?.actions)) {
      console.log(chalk.cyan(LOG_MESSAGES.ALL_ACTIONS_ACCESS));
    } else {
      const actionCount = this.options?.actions?.length || 0;
      console.log(chalk.cyan(LOG_MESSAGES.actionCount(actionCount, pluralize(actionCount, 'action'))));
    }
  }


  /**
   * @returns List of connected integrations
   */
  async getConnectedIntegrations(): Promise<Connection[]> {
    return await listConnections({
      baseUrl: this.baseUrl,
      secret: this.secret,
      options: this.options
    });
  }

  /**
   * @returns List of all available connectors in Pica
   */
  async getAvailableConnectors(): Promise<Connector[]> {
    return await getAvailableConnectors({
      baseUrl: this.baseUrl,
      secret: this.secret,
      options: this.options
    });
  }

  /**
   * @param platform - The platform to get all available actions for
   * @returns List of all available actions for a given platform
   */
  async getAvailableActions(platform: string): Promise<AvailableAction[]> {
    return await getAvailableActions({
      baseUrl: this.baseUrl,
      secret: this.secret,
      platform,
      options: this.options
    });
  }

  tools(): ToolSet {
    const tools: ToolSet = {};

    // Knowledge agents get the integrations discovery tool
    if (this.options?.knowledgeAgent) {
      tools.listPicaIntegrations = tool({
        name: LIST_PICA_INTEGRATIONS_TOOL_CONFIG.name,
        description: LIST_PICA_INTEGRATIONS_TOOL_CONFIG.description,
        inputSchema: LIST_PICA_INTEGRATIONS_TOOL_CONFIG.schema,
        outputSchema: LIST_PICA_INTEGRATIONS_TOOL_CONFIG.outputSchema,
        execute: async (): Promise<PicaIntegration[]> => {
          return await listPicaIntegrations({
            baseUrl: this.baseUrl,
            secret: this.secret,
            options: this.options
          });
        }
      });
    }

    // Knowledge agents don't need connection management tools
    if (!this.options?.knowledgeAgent && isInitializingWithAllConnectors(this.options?.connectors)) {
      tools.listPicaConnections = tool({
        name: LIST_PICA_CONNECTIONS_TOOL_CONFIG.name,
        description: LIST_PICA_CONNECTIONS_TOOL_CONFIG.description,
        inputSchema: LIST_PICA_CONNECTIONS_TOOL_CONFIG.schema,
        outputSchema: LIST_PICA_CONNECTIONS_TOOL_CONFIG.outputSchema,
        execute: async (): Promise<ConnectionReference[]> => {
          const connections = await listConnections({
            baseUrl: this.baseUrl,
            secret: this.secret,
            options: this.options
          });

          return clean(connections);
        }
      });
    }

    tools.searchPlatformActions = tool({
      name: SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG.name,
      description: SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG.description,
      inputSchema: SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG.schema,
      outputSchema: SEARCH_PLATFORM_ACTIONS_TOOL_CONFIG.outputSchema,
      execute: async ({ platform, query }: SearchPlatformActionsParams): Promise<ActionReference[]> => {
        if (!this.options?.knowledgeAgent && !isInitializingWithAllActions(this.options?.actions) && this.options?.actions?.length === 0) {
          throw new Error("No actions are available. Please initialize the client with specific action ids or ['*'] for all actions.");
        }

        const actions = await searchPlatformActions({
          baseUrl: this.baseUrl,
          secret: this.secret,
          platform,
          query,
          options: this.options?.knowledgeAgent ? { ...this.options, actions: ["*"] } : this.options
        });

        return actions;
      }
    });

    tools.getActionsKnowledge = tool({
      name: GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG.name,
      description: GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG.description,
      inputSchema: GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG.schema,
      outputSchema: GET_ACTIONS_KNOWLEDGE_TOOL_CONFIG.outputSchema,
      execute: async ({ systemIds }: GetActionsKnowledgeParams): Promise<ActionsKnowledgeResponse> => {
        const knowledgeMap = await getActionsKnowledge({
          baseUrl: this.baseUrl,
          secret: this.secret,
          systemIds,
          passthroughUrl: this.passthroughUrl,
          options: this.options?.knowledgeAgent ? { ...this.options, actions: ["*"] } : this.options
        });

        return knowledgeMap;
      }
    });

    // Only add execute tool in standard mode (not in knowledge agent mode)
    if (!this.options?.knowledgeAgent) {
      tools.execute = tool({
        name: EXECUTE_ACTION_TOOL_CONFIG.name,
        description: EXECUTE_ACTION_TOOL_CONFIG.description,
        inputSchema: EXECUTE_ACTION_TOOL_CONFIG.schema,
        outputSchema: EXECUTE_ACTION_TOOL_CONFIG.outputSchema,
        execute: async (params: ExecuteActionParams): Promise<ExecuteActionResponse> => {
          const result = await executeAction({
            baseUrl: this.baseUrl,
            secret: this.secret,
            actionSystemId: params.actionSystemId,
            connectionKey: params.connectionKey,
            data: params.data,
            pathVariables: params.pathVariables,
            queryParams: params.queryParams,
            headers: params.headers,
            isFormData: params.isFormData,
            isFormUrlEncoded: params.isFormUrlEncoded,
            options: this.options
          });

          return result;
        }
      });
    }

    if (this.options?.authkit) {
      tools.promptToConnectIntegration = tool({
        name: PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG.name,
        description: PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG.description,
        inputSchema: PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG.schema,
        outputSchema: PROMPT_TO_CONNECT_INTEGRATION_TOOL_CONFIG.outputSchema,
        execute: async ({ platformName }: PromptToConnectIntegrationParams) => {
          return {
            response: platformName
          }
        }
      });
    }

    return tools;
  }
}