/**
 * Pica ToolKit - Available Actions API
 * 
 * This is the available actions API for the Pica ToolKit.
 * This API lists available actions for a given platform from the Pica API.
 * 
 * @fileoverview Available Actions API for the Pica ToolKit
 * @author Pica
 */

import axios from "axios";
import { PicaOptions, AvailableAction } from "../types";
import { paginateResults } from "../utils";

const GET_AVAILABLE_ACTIONS_URL = "/v1/available-actions";

interface GetAvailableActionsParams {
  baseUrl: string;
  secret: string;
  platform: string;
  options?: PicaOptions;
}

/**
 * Get the available actions for a given platform
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param platform - The platform to get available actions for
 * @param options - The options for the Pica client
 * @returns The available actions for the platform
 */
export async function getAvailableActions({
  baseUrl,
  secret,
  platform,
  options,
}: GetAvailableActionsParams): Promise<AvailableAction[]> {
  const url = new URL(`${baseUrl}${GET_AVAILABLE_ACTIONS_URL}/${platform}`);

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
    return await paginateResults<AvailableAction>(fetchPage);
  } catch (error) {
    console.error(`Error fetching available actions for platform '${platform}':`, error);
    throw error;
  }
}
