/**
 * Pica ToolKit - Actions API
 * 
 * This is the actions API for the Pica ToolKit.
 * This API searches for actions on a given platform and also fetches the knowledge for the actions.
 * 
 * @fileoverview Actions API for the Pica ToolKit
 * @author Pica
 */

import axios from "axios";
import {
  PicaOptions,
  PlatformAction,
  ActionReference,
  ActionKnowledge,
  ActionsKnowledgeResponse,
} from "../types";
import {
  isInitializingWithAllActions,
  parseSystemId,
  normalizeActionId
} from "../utils";

const SEARCH_ACTIONS_URL = "/v1/available-actions/search";
const KNOWLEDGE_URL = "/v1/knowledge";

interface SearchPlatformActionsParams {
  baseUrl: string;
  secret: string;
  platform: string;
  query: string;
  options?: PicaOptions;
}

/**
 * Search for actions on a given platform
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param platform - The platform to search actions for
 * @param query - The query to search for
 * @param options - The options for the Pica client
 * @returns The actions found for the platform that match the query
 */
export async function searchPlatformActions({
  baseUrl,
  secret,
  platform,
  query,
  options,
}: SearchPlatformActionsParams): Promise<ActionReference[]> {
  const url = new URL(`${baseUrl}${SEARCH_ACTIONS_URL}/${platform}`);

  url.searchParams.set('query', query);
  url.searchParams.set('limit', '5');

  try {
    const response = await axios.get(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": secret,
        ...options?.headers
      }
    });

    const cleanedActions = clean(response.data, options);

    // If no actions found from search and we have specific action IDs, fetch them directly
    if (cleanedActions.length === 0 && !isInitializingWithAllActions(options?.actions)) {
      return await getActionReferences(baseUrl, secret, platform, options?.actions || [], options);
    }

    return cleanedActions;
  } catch (error) {
    throw error;
  }
}

/**
 * Clean the actions to return only the actions that match the permissions and allowed actions
 * @param actions - The actions to clean
 * @param options - The options for the Pica client
 * @returns The cleaned actions
 */
export function clean(actions: PlatformAction[], options?: PicaOptions): ActionReference[] {
  const permissionFilteredActions = filterByPermissions(actions, options?.permissions);
  const actionFilteredActions = filterByAllowedActions(permissionFilteredActions, options?.actions);

  return actionFilteredActions.map(action => {
    const fullId = action.systemId;
    const parts = parseSystemId(fullId);
    return {
      title: action.title,
      method: action.method,
      path: action.path,
      systemId: {
        fullId,
        parts
      }
    };
  });
}

/**
 * Filter the actions to return only the actions that match the permissions
 * @param actions - The actions to filter
 * @param permissions - The permissions to filter by
 * @returns The filtered actions
 */
function filterByPermissions(actions: PlatformAction[], permissions?: "read" | "write" | "admin"): PlatformAction[] {
  if (!permissions || permissions === "admin") {
    return actions;
  }

  if (permissions === "read") {
    return actions.filter(action => action.method === "GET");
  }

  if (permissions === "write") {
    return actions.filter(action =>
      action.method === "POST" ||
      action.method === "PUT" ||
      action.method === "PATCH"
    );
  }

  return actions;
}

/**
 * Filter the actions to return only the actions that are in the allowed actions list
 * @param actions - The actions to filter
 * @param allowedActions - The allowed action systemIds
 * @returns The filtered actions
 */
function filterByAllowedActions(actions: PlatformAction[], allowedActions?: string[]): PlatformAction[] {
  if (!allowedActions || allowedActions.length === 0) {
    return [];
  }

  if (isInitializingWithAllActions(allowedActions)) {
    return actions;
  }

  return actions.filter(action => allowedActions.includes(action.systemId));
}

interface GetActionsKnowledgeParams {
  baseUrl: string;
  secret: string;
  systemIds: string[];
  options?: PicaOptions;
}

/**
 * Get the knowledge for a given system ID
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param systemIds - The system IDs to get knowledge for
 * @param options - The options for the Pica client
 * @returns The knowledge for the system IDs
 */
export async function getActionsKnowledge({
  baseUrl,
  secret,
  systemIds,
  options,
}: GetActionsKnowledgeParams): Promise<ActionsKnowledgeResponse> {
  const knowledgeMap: ActionsKnowledgeResponse = {};

  const promises = systemIds.map(async (systemId) => {
    try {
      const url = new URL(`${baseUrl}${KNOWLEDGE_URL}`);
      url.searchParams.set('_id', normalizeActionId(systemId));

      const response = await axios.get(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": secret,
          ...options?.headers
        }
      });

      if (response.data.rows && response.data.rows.length > 0) {
        const actionKnowledge: ActionKnowledge = response.data.rows[0];
        knowledgeMap[systemId] = actionKnowledge.knowledge;
      }
    } catch (error) {
      console.error(`Error fetching knowledge for action '${systemId}':`, error);
      throw error;
    }
  });

  await Promise.all(promises);

  return knowledgeMap;
}

/**
 * Fetch action references for multiple action IDs using Promise.all
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param platform - The platform to filter actions by
 * @param actionIds - Array of action IDs to fetch references for
 * @param options - The options for the Pica client
 * @returns Array of ActionReference objects filtered by platform
 */
export async function getActionReferences(
  baseUrl: string,
  secret: string,
  platform: string,
  actionIds: string[],
  options?: PicaOptions
): Promise<ActionReference[]> {
  try {
    const promises = actionIds.map(async (actionId) => {
      const actionKnowledge = await getActionSpec(baseUrl, secret, actionId, options);

      if (!actionKnowledge || actionKnowledge.connectionPlatform !== platform) {
        return null;
      }

      const fullId = actionKnowledge._id;
      const parts = parseSystemId(fullId);

      return {
        title: actionKnowledge.title,
        method: actionKnowledge.method,
        path: actionKnowledge.path,
        systemId: { fullId, parts }
      };
    });

    const results = await Promise.all(promises);

    return results.filter((result): result is ActionReference => result !== null);
  } catch (error) {
    console.error('Error fetching action specs for IDs:', error);
    throw error;
  }
}

/**
 * Fetch the action spec for a given system ID
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param actionSystemId - The system ID of the action to fetch spec for
 * @param options - The options for the Pica client
 * @returns The action method, path, and tags
 */
export async function getActionSpec(
  baseUrl: string,
  secret: string,
  actionSystemId: string,
  options?: PicaOptions
): Promise<ActionKnowledge | null> {
  try {
    const normalizedSystemId = normalizeActionId(actionSystemId);

    const url = new URL(`${baseUrl}${KNOWLEDGE_URL}`);
    url.searchParams.set('_id', normalizedSystemId);

    const response = await axios.get(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": secret,
        ...options?.headers
      }
    });

    // Extract knowledge from the first (and only) row
    if (response.data.rows && response.data.rows.length > 0) {
      return response.data.rows[0] as ActionKnowledge;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching action spec for '${actionSystemId}':`, error);
    throw error;
  }
}