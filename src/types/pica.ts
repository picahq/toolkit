/**
 * Pica ToolKit - Pica Types
 * 
 * These are the Pica types for the Pica ToolKit.
 * 
 * @fileoverview Pica types for the Pica ToolKit
 * @author Pica
 */

import { PicaOptions } from "./client";

export interface Connector {
  id: number;
  name: string;
  key: string;
  platform: string;
  platformVersion: string;
  status: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  oauth: boolean;
  tools: number;
  version: string;
  active: boolean;
}

export interface Connection {
  id: string;
  platformVersion: string;
  name: string | null;
  type: string;
  key: string;
  environment: Environment;
  platform: string;
  identity?: string;
  identityType?: string;
  description: string;
  tags: string[];
  version: string;
  active: boolean;
  createdAt: string;
}

export interface ConnectionKey {
  fullKey: string;
  parts: {
    environment: Environment; // e.g. 'test'
    platform: string;         // e.g. 'postgresql'
    namespace: string;        // e.g. 'default'
    id: string;               // e.g. 'c76d7a...'
    identity?: string;        // e.g. 'user-abc'
  };
}

export type Environment = "live" | "test";

export interface ConnectionReference {
  platform: string;
  key: ConnectionKey;
}

export interface ActionSystemId {
  fullId: string;
  parts: {
    prefix: string;   // e.g. 'conn_mod_def'
    metadata: string; // e.g. 'GEoTH7-tRU0'
    suffix: string;   // e.g. 'RbyDQmffR5C14QTGEdELhg'
  };
}

export interface ActionReference {
  title: string;
  method: string;
  path: string;
  systemId: ActionSystemId;
}

export interface PlatformAction {
  systemId: string;
  title: string;
  key: string;
  method: string;
  path: string;
  tags: string[];
}

export interface AvailableAction {
  title: string;
  key: string;
  method: string;
  platform: string;
}

export interface ActionKnowledge {
  id: number;
  _id: string;
  connectionPlatform: string;
  title: string;
  path: string;
  knowledge: string;
  method: string;
  baseUrl: string;
  tags: string[];
  active: boolean;
}

export interface ActionsKnowledgeResponse {
  [systemId: string]: {
    title: string;
    knowledge: string;
    platform: string;
  };
}

export interface RequestConfig {
  url: string;
  method?: string;
  headers: Record<string, any>;
  params?: Record<string, any>;
  data?: any;
}

export interface ExecuteActionResponseSuccess {
  success: boolean;
  responseData?: any;
  requestConfig: RequestConfig;
  platform?: string;
}

export interface ExecuteActionErrorResponse {
  success: boolean;
  error?: string;
  platform?: string;
}

export type ExecuteActionResponse = ExecuteActionResponseSuccess | ExecuteActionErrorResponse;

export interface ExecutePassthroughParams {
  baseUrl: string;
  secret: string;
  actionId: string;
  connectionKey: string;
  data: any;
  path: string;
  method: string;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  isFormData?: boolean;
  isFormUrlEncoded?: boolean;
  options?: PicaOptions;
}
