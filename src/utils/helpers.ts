/**
 * Pica ToolKit - Utils
 * 
 * These are util helper functions for the Pica ToolKit.
 * 
 * @fileoverview Utils for the Pica ToolKit
 * @author Pica
 */

import { Environment } from "../types/index.js";

/**
 * Paginate results from a fetch function
 * @param fetchFn - The function to fetch the results
 * @param limit - The number of results to fetch per page
 * @returns An array of all results
 */
export async function paginateResults<T>(
  fetchFn: (page: number, limit: number) => Promise<{
    rows: T[],
    total: number,
    page: number,
    pages: number
  }>,
  limit = 100
): Promise<T[]> {
  let page = 1;
  let allResults: T[] = [];
  let totalPages = 0;

  try {
    do {
      const response = await fetchFn(page, limit);
      const { rows, pages } = response;
      totalPages = pages;
      allResults = [...allResults, ...rows];
      page++;
    } while (page <= totalPages);

    return allResults;
  } catch (error) {
    console.error("Error in pagination:", error);
    throw error;
  }
}

/**
 * Normalize an action ID
 * @param raw - The raw action ID
 * @returns The normalized action ID
 */
export function normalizeActionId(raw: string): string {
  if (raw.includes("::")) {
    if (!raw.startsWith("conn_mod_def::")) {
      return `conn_mod_def::${raw}`;
    }
    return raw;
  }
  return raw;
}

/**
 * Replace path variables in a path
 * @param path - The path to replace variables in
 * @param variables - The variables to replace in the path
 * @returns The path with the variables replaced
 */
export function replacePathVariables(path: string, variables: Record<string, string | number | boolean>): string {
  return path.replace(/\{\{([^}]+)\}\}/g, (_match, variable) => {
    const value = variables[variable];
    if (!value) {
      throw new Error(`Missing value for path variable: ${variable}`);
    }
    return value.toString();
  });
}

/**
 * Parse a connection key into its component parts
 * Format: environment::platform::namespace::id[|identity]
 * @param key - The connection key to parse
 * @returns The parsed connection key
 * @throws Error if the key format is invalid or environment is not 'live' or 'test'
 */
export function parseConnectionKey(key: string): {
  environment: Environment;
  platform: string;
  namespace: string;
  id: string;
  identity?: string;
} {
  if (!key || typeof key !== 'string') {
    throw new Error('Connection key must be a non-empty string');
  }

  const parts = key.split("::");

  if (parts.length < 4) {
    throw new Error('Invalid connection key format. Expected: environment::platform::namespace::id[|identity]');
  }

  const [environment, platform, namespace, last] = parts;

  if (environment !== "live" && environment !== "test") {
    throw new Error(`Invalid environment '${environment}'. Must be 'live' or 'test'`);
  }

  if (!platform) {
    throw new Error('Platform cannot be empty in connection key');
  }
  if (!namespace) {
    throw new Error('Namespace cannot be empty in connection key');
  }
  if (!last) {
    throw new Error('ID cannot be empty in connection key');
  }

  let id = last;
  let identity: string | undefined;

  if (id.includes("|")) {
    const idParts = id.split("|");
    id = idParts[0] ?? "";
    identity = idParts[1];

    if (!id) {
      throw new Error('ID cannot be empty in connection key');
    }
  }

  return {
    environment,
    platform,
    namespace,
    id,
    identity
  };
}

/**
 * Parse a system ID into its component parts
 * Format: prefix::metadata::suffix
 * @param systemId - The system ID to parse
 * @returns The parsed system ID
 * @throws Error if the system ID format is invalid or any part is empty
 */
export function parseSystemId(systemId: string): {
  prefix: string;
  metadata: string;
  suffix: string;
} {
  if (!systemId || typeof systemId !== 'string') {
    throw new Error('System ID must be a non-empty string');
  }

  const parts = systemId.split("::");

  if (parts.length !== 3) {
    throw new Error('Invalid system ID format. Expected: prefix::metadata::suffix');
  }

  const [prefix, metadata, suffix] = parts;

  if (!prefix) {
    throw new Error('Prefix cannot be empty in system ID');
  }
  if (!metadata) {
    throw new Error('Metadata cannot be empty in system ID');
  }
  if (!suffix) {
    throw new Error('Suffix cannot be empty in system ID');
  }

  return {
    prefix,
    metadata,
    suffix
  };
}

/**
 * Resolve template variables in a path and prepare data for execution
 * @param actionPath - The path to resolve template variables in
 * @param data - The data to resolve template variables in
 * @param pathVariables - The path variables to resolve template variables in
 * @returns The resolved path, cleaned data, and resolved path variables
 */
export function resolveTemplateVariables(
  actionPath: string,
  data: any,
  pathVariables?: Record<string, string | number | boolean>
): {
  resolvedPath: string;
  cleanedData: any;
  resolvedPathVariables: Record<string, string | number | boolean>;
} {
  const templateVariables = actionPath.match(/\{\{([^}]+)\}\}/g);
  let resolvedPath = actionPath;
  let cleanedData = data;
  let resolvedPathVariables = { ...pathVariables };

  if (templateVariables) {
    const requiredVariables = templateVariables.map(v => v.replace(/\{\{|\}\}/g, ''));
    const combinedVariables = {
      ...(Array.isArray(data) ? {} : (data || {})),
      ...(pathVariables || {})
    };

    const missingVariables = requiredVariables.filter(v => !combinedVariables[v]);

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required path variables: ${missingVariables.join(', ')}. ` +
        `Please provide values for these variables.`
      );
    }

    // Clean up data object and prepare path variables
    if (!Array.isArray(data) && data) {
      cleanedData = { ...data };
      requiredVariables.forEach(v => {
        if (cleanedData[v] && (!pathVariables || !pathVariables[v])) {
          resolvedPathVariables[v] = cleanedData[v];
          delete cleanedData[v];
        }
      });
    }

    resolvedPath = replacePathVariables(actionPath, resolvedPathVariables);
  }

  return {
    resolvedPath,
    cleanedData,
    resolvedPathVariables
  };
}

/**
 * Check if initializing with all connectors
 * @param connectors - The connectors to check
 * @returns True if '*' is in the connectors array
 */
export function isInitializingWithAllConnectors(connectors: string[] = []): boolean {
  return connectors?.includes("*");
}

/**
 * Check if initializing with all actions
 * @param actions - The actions to check
 * @returns True if '*' is in the actions array
 */
export function isInitializingWithAllActions(actions: string[] = []): boolean {
  return actions?.includes("*");
}

/**
 * Get the plural form of a word based on count
 * @param count - The count to check
 * @param singular - The singular form of the word
 * @param plural - The plural form of the word (defaults to singular + 's')
 * @returns The appropriate form based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

/**
 * Replace all instances of the original baseUrl with the passthrough URL in the knowledge string
 * Handles both HTTP and HTTPS versions, with and without trailing slashes
 * @param knowledge - The knowledge string to update
 * @param originalBaseUrl - The original baseUrl to replace
 * @param passthroughUrl - The passthrough URL to replace with
 * @returns The updated knowledge string
 */
export function replaceBaseUrlInKnowledge(knowledge: string, originalBaseUrl: string, passthroughUrl: string): string {
  if (!knowledge || !originalBaseUrl) {
    return knowledge;
  }

  let updatedKnowledge = knowledge;

  const normalizedOriginal = originalBaseUrl.replace(/\/$/, '');

  const patterns = [
    normalizedOriginal,
    normalizedOriginal + '/',
    normalizedOriginal.replace(/^https?:\/\//, 'http://'),
    normalizedOriginal.replace(/^https?:\/\//, 'http://') + '/',
    normalizedOriginal.replace(/^https?:\/\//, 'https://'),
    normalizedOriginal.replace(/^https?:\/\//, 'https://') + '/'
  ];

  const uniquePatterns = [...new Set(patterns)];

  uniquePatterns.forEach(pattern => {
    if (pattern) {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPattern, 'g');
      updatedKnowledge = updatedKnowledge.replace(regex, passthroughUrl);
    }
  });

  return updatedKnowledge;
}
