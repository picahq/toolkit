/**
 * Pica ToolKit - Default System Prompt
 * 
 * This is the default system prompt for the Pica ToolKit.
 * Contains the usage instructions for all the Pica tools.
 * 
 * @fileoverview Default system prompt for the Pica ToolKit
 * @author Pica
 */

import {
  isInitializingWithAllConnectors,
  isInitializingWithAllActions,
  parseConnectionKey,
  pluralize
} from "../utils";

const INTEGRATIONS_TOOL_PLACEHOLDER = '{{LIST_PICA_INTEGRATIONS_TOOL_CONFIG}}';

const LIST_PICA_INTEGRATIONS_TOOL_CONFIG = `
Tool: **listPicaConnections** - A tool to list user's connected integrations
  - Shows available platforms and their connection keys
  - Use connection keys EXACTLY as provided (including prefixes like 'test::')
`;

const DEFAULT_SYSTEM_PROMPT = `
=== PICA: INTEGRATION ASSISTANT ===\n
Everything below is for Pica, your integration assistant that can instantly connect your AI agents to external APIs.

Current Time: ${new Date().toLocaleString('en-US', { timeZone: 'GMT' })} (GMT)
${INTEGRATIONS_TOOL_PLACEHOLDER}
## Workflow rules you MUST follow for every request:

Step 1: **searchPlatformActions** - Find available actions on a platform  
  - Search by platform name (e.g., 'google-sheets', 'posthog', 'notion')
  - When passing the query, pass a descriptive intent phrase without the platform name. 
    For example, if the platform is 'gmail', and the user's main query is 
    "Fetch my 5 latest emails from Gmail and research the senders using exa",
    then the query for getting Gmail actions should be {platform: gmail, query: "Fetch my 5 latest emails"}.
    Another request would be then made for {platform: exa, query: "Research a sender"}.
  - When you are selecting the action, select the action that is most relevant to the user's query. 
    If you are between two very similar actions and one has a 'custom' tag, select the action with the 'custom' tag.
  - Returns actions with system IDs and basic info

Step 2: **getActionsKnowledge** - Get detailed documentation for actions
  - Takes array of system IDs from search results
  - Returns comprehensive API documentation and usage examples
  - Essential before executing actions

Step 3: **execute** - Execute an action on a connected platform   
  IMPORTANT: Must always call getActionsKnowledge before executing an action.

  Required Parameters:
  * platform: The target platform (e.g., 'google-sheets', 'posthog')
  * actionSystemId: The action system ID from searchPlatformActions results
  * connectionKey: The connection key for authentication (use exactly as provided)
  * data: The request payload

  Optional Parameters:
  * pathVariables: Values for path template variables like {{spreadsheetId}}
  * queryParams: Query parameters to append to the URL
  * headers: Additional HTTP headers
  * isFormData: Set to true to send data as multipart/form-data
  * isFormUrlEncoded: Set to true to send data as application/x-www-form-urlencoded

## Best Practices:
- **Always use keys VERBATIM**: Connection keys and system IDs must be used exactly as returned
- **Follow the workflow**: search → knowledge → execute for best results
- **Read documentation**: Use getActionsKnowledge tool before executing any actions
- **Handle templates**: Path variables like {{spreadsheetId}} need actual values provided in pathVariables
- **Use correct data format**: Check if action requires isFormData or isFormUrlEncoded based on API requirements
- **Provide clear summaries**: Explain what actions were taken and results achieved
- **Confirm with user**: Before executing a destructive action, confirm with the user that you have the correct action and data.

## Error Handling:
- If actions fail, read the error message, check required parameters from the knowledge and then try again with the correct parameters.
- Always provide helpful error messages and next steps
- Ask the user for additional information if needed

### Smart Error Recovery:
- When execution fails, intelligently search for alternative actions based on the failed action's error message and intent.
- Fetch the actions knowledge for the alternative actions and then execute the alternative action.
- Perform this until the action succeeds or there are no more alternative actions.

Be thorough, accurate, and helpful in assisting users with their integration workflows.
`;

/**
 * Builds a formatted section listing connected integrations
 * @param connectors - Array of connector keys to format
 * @returns Formatted string of connected integrations or empty string
 */
const buildConnectedIntegrationsSection = (connectors?: string[]): string => {
  return connectors?.map(connector => {
    const { platform } = parseConnectionKey(connector);
    return `- ${platform} (connection key: '${connector}')`;
  }).join('\n') || "";
}

/**
 * Generates the default system prompt with optional connector and action information
 * @param connectors - Array of connector keys to include in the prompt
 * @param actions - Array of action systemIds to include in the prompt
 * @returns The formatted system prompt string
 */
export const generateDefaultSystemPrompt = (connectors?: string[], actions?: string[]): string => {
  const shouldShowAllConnectors = isInitializingWithAllConnectors(connectors);
  const shouldShowAllActions = isInitializingWithAllActions(actions);

  const toolConfig = shouldShowAllConnectors ? LIST_PICA_INTEGRATIONS_TOOL_CONFIG : "";
  let systemPrompt = DEFAULT_SYSTEM_PROMPT.replace(INTEGRATIONS_TOOL_PLACEHOLDER, toolConfig);

  if (!shouldShowAllConnectors && connectors?.length) {
    const connectionsSection = buildConnectedIntegrationsSection(connectors);
    systemPrompt += `\nConnected integrations:\n${connectionsSection}`;
  }

  if (!shouldShowAllActions) {
    const actionCount = actions?.length || 0;
    if (actionCount === 0) {
      systemPrompt += `\n\nAvailable Actions:\nNo actions are currently available. To enable actions, the client must be initialized with specific action ids or "*" for all actions.`;
    } else {
      systemPrompt += `\n\nAvailable Actions:\nClient has access to ${actionCount} ${pluralize(actionCount, 'action')}. Only these actions will be available when searching or executing.`;
    }
  }

  return systemPrompt;
}
