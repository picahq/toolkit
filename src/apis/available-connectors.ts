/**
 * Pica ToolKit - Available Connectors API
 * 
 * This is the available connectors API for the Pica ToolKit.
 * This API lists available connectors offered by Pica.
 * 
 * @fileoverview Available Connectors API for the Pica ToolKit
 * @author Pica
 */

import axios from "axios";
import { PicaOptions, Connector } from "../types";
import { paginateResults } from "../utils";

export interface PicaIntegration {
  name: string;
  platform: string;
}

const GET_AVAILABLE_CONNECTORS_URL = "/v1/available-connectors";

interface GetAvailableConnectorsParams {
  baseUrl: string;
  secret: string;
  options?: PicaOptions;
}

/**
 * Get the available connectors
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param options - The options for the Pica client
 * @returns The available connectors
 */
export async function getAvailableConnectors({
  baseUrl,
  secret,
  options,
}: GetAvailableConnectorsParams): Promise<Connector[]> {
  const url = new URL(baseUrl + GET_AVAILABLE_CONNECTORS_URL);

  const fetchPage = async (page: number, limit: number) => {
    const response = await axios.get(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": secret,
        ...options?.headers
      },
      params: { page, limit }
    });

    return response.data;
  };

  try {
    return await paginateResults<Connector>(fetchPage);
  } catch (error) {
    console.error("Error fetching available connectors:", error);
    throw error;
  }
}

/**
 * Get available Pica integrations with simplified response
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param options - The options for the Pica client
 * @returns Simplified list of integrations with name and platform
 */
export async function listPicaIntegrations({
  baseUrl,
  secret,
  options,
}: GetAvailableConnectorsParams): Promise<PicaIntegration[]> {
  const connectors = await getAvailableConnectors({ baseUrl, secret, options });

  return connectors.map(connector => ({
    name: connector.name,
    platform: connector.platform
  }));
}
