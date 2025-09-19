/**
 * Pica ToolKit - Execute API
 * 
 * This is the execute API for the Pica ToolKit.
 * This API executes actions on connected platforms via the Pica Passthrough API.
 * 
 * @fileoverview Execute API for the Pica ToolKit
 * @author Pica
 */

import axios from "axios";
import FormData from "form-data";
import { normalizeActionId, resolveTemplateVariables } from "../utils";
import { listConnections } from "./connections";
import { getActionSpec } from "./action";
import {
  PicaOptions,
  RequestConfig,
  ExecuteActionResponse,
  ExecutePassthroughParams
} from "../types";

const PASSTHROUGH_URL = "/v1/passthrough";

interface ExecuteActionParams {
  baseUrl: string;
  secret: string;
  actionSystemId: string;
  connectionKey: string;
  data?: any;
  pathVariables?: Record<string, string | number | boolean>;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  isFormData?: boolean;
  isFormUrlEncoded?: boolean;
  returnRequestConfigWithoutExecution?: boolean;
  options?: PicaOptions;
}

/**
 * Execute an action
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param actionSystemId - The system ID of the action to execute
 * @param connectionKey - The connection key to use for executing the action
 * @param data - The data to execute the action with
 * @param pathVariables - The path variables to execute the action with
 * @param queryParams - The query parameters to execute the action with
 * @param headers - The headers to execute the action with
 * @param isFormData - Whether to execute the action as a form data request
 * @param isFormUrlEncoded - Whether to execute the action as a form urlencoded request
 * @param returnRequestConfigWithoutExecution - Whether to return request config without executing
 * @param options - The options for the Pica client
 * @returns The response from the action
 */
export async function executeAction({
  baseUrl,
  secret,
  actionSystemId,
  connectionKey,
  data,
  pathVariables,
  queryParams,
  headers,
  isFormData,
  isFormUrlEncoded,
  returnRequestConfigWithoutExecution,
  options,
}: ExecuteActionParams): Promise<ExecuteActionResponse> {
  await validateConnectionKey(baseUrl, secret, connectionKey, options);

  const action = await getActionSpec(baseUrl, secret, actionSystemId, options);

  if (!action) {
    throw new Error(`Could not fetch knowledge for action system ID: ${actionSystemId}`);
  }

  // For custom actions, always include connection key in the data
  if (action.tags.includes("custom")) {
    const customData = {
      ...data,
      connectionKey
    };

    data = customData;
  }

  // Resolve template variables in the action path
  const { resolvedPath, cleanedData } = resolveTemplateVariables(
    action.path,
    data,
    pathVariables
  );

  // Execute passthrough request
  return await executePassthrough({
    baseUrl,
    secret,
    actionId: normalizeActionId(actionSystemId),
    connectionKey,
    data: cleanedData,
    path: resolvedPath,
    method: action.method,
    queryParams,
    headers,
    isFormData,
    isFormUrlEncoded,
    returnRequestConfigWithoutExecution,
    options
  });
}

/**
 * Validate the connection key
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param connectionKey - The connection key to validate
 * @param options - The options for the Pica client
 * @throws An error if the connection key does not exist or is not accessible
 */
async function validateConnectionKey(
  baseUrl: string,
  secret: string,
  connectionKey: string,
  options?: PicaOptions
): Promise<void> {
  const connections = await listConnections({ baseUrl, secret, options });
  const connectionExists = connections.some(conn => conn.key === connectionKey);

  if (!connectionExists) {
    throw new Error(`Connection key '${connectionKey}' does not exist or is not accessible.`);
  }
}

/**
 * Execute a passthrough request
 * @param baseUrl - The base URL of the Pica API
 * @param secret - The Pica API key
 * @param actionId - The ID of the action to execute
 * @param connectionKey - The connection key to use for executing the action
 * @param data - The data to execute the action with
 * @param path - The path to execute the action on
 * @param method - The method to execute the action with
 * @param queryParams - The query parameters to execute the action with
 * @param headers - The headers to execute the action with
 * @param isFormData - Whether to execute the action as a form data request
 * @param isFormUrlEncoded - Whether to execute the action as a form urlencoded request
 * @param returnRequestConfigWithoutExecution - Whether to return request config without executing
 * @param options - The options for the Pica client
 * @returns The response from the passthrough request
 */
async function executePassthrough({
  baseUrl,
  secret,
  actionId,
  connectionKey,
  data,
  path,
  method,
  queryParams,
  headers,
  isFormData,
  isFormUrlEncoded,
  returnRequestConfigWithoutExecution,
  options
}: ExecutePassthroughParams): Promise<ExecuteActionResponse> {
  try {
    const allHeaders = {
      "Content-Type": "application/json",
      "x-pica-secret": secret,
      "x-pica-connection-key": connectionKey,
      "x-pica-action-id": actionId,
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      ...(isFormUrlEncoded ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...options?.headers,
      ...headers
    };

    // Remove Content-Type header if no data is being sent
    const finalHeaders = !data
      ? Object.entries(allHeaders)
        .filter(([key]) => key.toLowerCase() !== "content-type")
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      : allHeaders;

    const url = `${baseUrl}${PASSTHROUGH_URL}${path.startsWith("/") ? path : "/" + path}`;

    const requestConfig: RequestConfig = {
      url,
      method,
      headers: finalHeaders,
      params: queryParams
    };

    if (method?.toLowerCase() !== "get") {
      if (isFormData) {
        const formData = new FormData();

        if (data && typeof data === "object" && !Array.isArray(data)) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          });
        }

        requestConfig.data = formData;

        const formHeaders = formData.getHeaders();
        requestConfig.headers = {
          ...requestConfig.headers,
          ...formHeaders
        };
      } else if (isFormUrlEncoded) {
        const params = new URLSearchParams();

        if (data && typeof data === "object" && !Array.isArray(data)) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "object") {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, String(value));
            }
          });
        }

        requestConfig.data = params.toString();
      } else {
        requestConfig.data = data;
      }
    }

    // Return request config without execution if requested
    if (returnRequestConfigWithoutExecution) {
      requestConfig.headers['x-pica-secret'] = "YOUR_PICA_SECRET_KEY_HERE";

      return {
        executed: false,
        requestConfig
      };
    }

    const response = await axios(requestConfig);

    return {
      success: true,
      responseData: response.data,
      requestConfig: {
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          "x-pica-secret": "****REDACTED****"
        }
      }
    };
  } catch (error) {
    console.error("Error executing passthrough request:", error);

    return {
      success: false,
      error: JSON.stringify(error)
    }
  }
}
