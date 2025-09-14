/**
 * Pica ToolKit - Connections API
 * 
 * This is the connections API for the Pica ToolKit.
 * This API lists and cleans connections from the Pica Vault API.
 * 
 * @fileoverview Connections API for the Pica ToolKit
 * @author Pica
 */

import axios from "axios";
import {
  Connection,
  PicaOptions,
  ConnectionReference
} from "../types";
import {
  paginateResults,
  parseConnectionKey
} from "../utils";

const GET_CONNECTIONS_URL = "/v1/vault/connections";

interface ListConnectionsParams {
  baseUrl: string;
  secret: string;
  options?: PicaOptions;
}

/**
 * 
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param options - The options for the Pica client
 * @returns The connections connected to the Pica account
 */
export async function listConnections({
  baseUrl,
  secret,
  options,
}: ListConnectionsParams): Promise<Connection[]> {
  const url = new URL(baseUrl + GET_CONNECTIONS_URL);
  const params: Record<string, string> = {};

  if (!options?.connectors?.includes("*")) {
    if (options?.connectors?.length) {
      params.keys = options.connectors.join(",");
    } else {
      return [];
    }
  }

  if (options?.identityType) {
    params.identityType = options.identityType;
  }

  if (options?.identity) {
    params.identity = options.identity;
  }

  const fetchPage = async (page: number, limit: number) => {
    const response = await axios.get(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": secret,
        ...options?.headers
      },
      params: { ...params, page, limit }
    });

    return response.data;
  };

  try {
    return await paginateResults<Connection>(fetchPage);
  } catch (error) {
    console.error("Error fetching user's connections:", error);
    throw error;
  }
}

/**
 * @param connections - The connections to clean
 * @returns The cleaned connections with typed connection references
 */
export function clean(connections: Connection[]): ConnectionReference[] {
  return connections
    .filter(conn => conn.active)
    .map(conn => {
      const fullKey = conn.key;
      const parts = parseConnectionKey(fullKey);
      return {
        platform: parts.platform,
        key: {
          fullKey,
          parts
        }
      };
    });
}
