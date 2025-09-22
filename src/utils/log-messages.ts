/**
 * Pica ToolKit - Log Messages
 * 
 * Centralized log messages for consistent logging across the application.
 * 
 * @fileoverview Log messages for the Pica ToolKit
 * @author Pica
 */

export const LOG_MESSAGES = {
  // Knowledge Agent Mode
  KNOWLEDGE_AGENT_INITIALIZED: "[Pica] 🧠 Knowledge Agent Mode Initialized",
  KNOWLEDGE_AGENT_ACTIONS_ACCESS: "[Pica] Agent has access to all actions for knowledge discovery",
  KNOWLEDGE_AGENT_EXECUTE_CONFIG: "[Pica] Execute tool returns request configurations without execution",
  KNOWLEDGE_AGENT_CONNECTIONS_DISABLED: "[Pica] Connection management tools are disabled in knowledge mode",
  LIST_PICA_INTEGRATIONS_ENABLED: "[Pica] The `listPicaIntegrations` tool is enabled for platform discovery",

  // Standard Mode - Connectors
  ALL_CONNECTORS_ACCESS: "[Pica] Initialized client with access to all connectors",
  LIST_CONNECTIONS_ENABLED: "[Pica] The `listPicaConnections` tool is enabled",
  LIST_CONNECTIONS_DISABLED: "[Pica] The `listPicaConnections` tool is disabled",

  // Standard Mode - Actions
  ALL_ACTIONS_ACCESS: "[Pica] Initialized client with access to all actions",

  // AuthKit
  AUTHKIT_ENABLED: "[Pica] 🔗 AuthKit enabled - The `promptToConnectIntegration` tool is available",

  // Dynamic messages (functions)
  connectorCount: (count: number, pluralizedWord: string) =>
    `[Pica] Initialized client with access to ${count} ${pluralizedWord}`,

  actionCount: (count: number, pluralizedWord: string) =>
    `[Pica] Initialized client with access to ${count} ${pluralizedWord}`,
} as const;
