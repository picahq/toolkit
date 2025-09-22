/**
 * Pica ToolKit - Pica Tests
 * 
 * @fileoverview Pica tests for the Pica ToolKit
 * @author Pica
 */

import { Pica } from "../src";
import { PicaOptions } from "../src/types";
import { LOG_MESSAGES } from "../src/utils";

jest.mock("axios");

describe("Pica", () => {
  const mockSecret = "test-secret-key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with secret", () => {
      const pica = new Pica(mockSecret);
      expect(pica).toBeInstanceOf(Pica);
    });

    it("should use custom base URL when provided", () => {
      const customUrl = "https://custom-api.example.com";
      const pica = new Pica(mockSecret, { serverUrl: customUrl });
      expect(pica).toBeInstanceOf(Pica);
    });

    it("should log connector initialization with wildcard", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { connectors: ["*"] });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.ALL_CONNECTORS_ACCESS)
      );
    });

    it("should log connector count with specific connectors", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { connectors: ["conn-key-1", "conn-key-2"] });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.connectorCount(2, "connectors"))
      );
    });

    it("should log action initialization with wildcard", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { actions: ["*"] });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.ALL_ACTIONS_ACCESS)
      );
    });

    it("should log action count with specific actions", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { actions: ["action-id-1"] });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.actionCount(1, "action"))
      );
    });

    it("should log knowledge agent initialization when knowledgeAgent is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { knowledgeAgent: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.KNOWLEDGE_AGENT_INITIALIZED)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.LIST_PICA_INTEGRATIONS_ENABLED)
      );
    });

    it("should not log standard initialization when knowledgeAgent is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { knowledgeAgent: true, connectors: ["*"], actions: ["*"] });

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.ALL_CONNECTORS_ACCESS)
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.ALL_ACTIONS_ACCESS)
      );
    });

    it("should log AuthKit initialization when authkit is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { authkit: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.AUTHKIT_ENABLED)
      );
    });

    it("should log AuthKit initialization in knowledge agent mode when authkit is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      new Pica(mockSecret, { knowledgeAgent: true, authkit: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(LOG_MESSAGES.AUTHKIT_ENABLED)
      );
    });
  });

  describe("getSystemPrompt", () => {
    it("should return a system prompt", () => {
      const pica = new Pica(mockSecret);
      const prompt = pica.systemPrompt;

      expect(typeof prompt).toBe("string");
      expect(prompt).toContain("PICA: INTEGRATION ASSISTANT");
    });

    it("should include listPicaConnections tool information in prompt when using wildcard connectors", () => {
      const pica = new Pica(mockSecret, { connectors: ["*"] });
      const prompt = pica.systemPrompt;

      expect(prompt).toContain("listPicaConnections");
    });

    it("should handle specific connectors in prompt", () => {
      const pica = new Pica(mockSecret, {
        connectors: ["test::gmail::default::123"]
      });
      const prompt = pica.systemPrompt;

      expect(prompt).toContain("Connected integrations");
      expect(prompt).toContain("gmail");
    });

    it("should return knowledge agent prompt when knowledgeAgent is true", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: true });
      const prompt = pica.systemPrompt;

      expect(typeof prompt).toBe("string");
      expect(prompt).toContain("PICA: KNOWLEDGE AGENT");
    });

    it("should return default prompt when knowledgeAgent is false", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: false });
      const prompt = pica.systemPrompt;

      expect(typeof prompt).toBe("string");
      expect(prompt).toContain("PICA: INTEGRATION ASSISTANT");
      expect(prompt).not.toContain("PICA: KNOWLEDGE AGENT");
    });
  });

  describe("tools", () => {
    it("should return tools object", () => {
      const pica = new Pica(mockSecret, { connectors: ["*"], actions: ["*"] });
      const tools = pica.tools();

      expect(typeof tools).toBe("object");
      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
      expect(tools).toHaveProperty("execute");
    });

    it("should include listPicaConnections when using wildcard connectors", () => {
      const pica = new Pica(mockSecret, { connectors: ["*"] });
      const tools = pica.tools();

      expect(tools).toHaveProperty("listPicaConnections");
    });

    it("should not include listPicaConnections when using specific connectors", () => {
      const pica = new Pica(mockSecret, { connectors: ["specific-connector"] });
      const tools = pica.tools();

      expect(tools).not.toHaveProperty("listPicaConnections");
    });

    it("should load knowledge agent execute tool when knowledgeAgent is true", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: true });
      const tools = pica.tools();

      expect(tools).toHaveProperty("execute");
      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
      expect(tools).not.toHaveProperty("listPicaConnections");

      const executeToolDescription = tools.execute.description;
      expect(executeToolDescription).toContain("Generate request configuration for an action without executing it");
      expect(executeToolDescription).not.toContain("Execute an action on a connected platform");
    });

    it("should include listPicaIntegrations tool when knowledgeAgent is true", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: true });
      const tools = pica.tools();

      expect(tools).toHaveProperty("listPicaIntegrations");
      expect(tools.listPicaIntegrations.description).toContain("List all available Pica integrations/platforms");
    });

    it("should not include listPicaIntegrations tool when knowledgeAgent is false", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: false, actions: ["*"], connectors: ["*"] });
      const tools = pica.tools();

      expect(tools).not.toHaveProperty("listPicaIntegrations");
    });

    it("should load regular execute tool when knowledgeAgent is false", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: false, actions: ["*"], connectors: ["*"] });
      const tools = pica.tools();

      expect(tools).toHaveProperty("execute");
      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
      expect(tools).toHaveProperty("listPicaConnections");

      const executeToolDescription = tools.execute.description;
      expect(executeToolDescription).toContain("Execute an action on a connected platform");
      expect(executeToolDescription).not.toContain("Generate request configuration for an action without executing it");
    });

    it("should load regular execute tool when knowledgeAgent is not set", () => {
      const pica = new Pica(mockSecret, { actions: ["*"], connectors: ["*"] });
      const tools = pica.tools();

      expect(tools).toHaveProperty("execute");
      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
      expect(tools).toHaveProperty("listPicaConnections");

      const executeToolDescription = tools.execute.description;
      expect(executeToolDescription).toContain("Execute an action on a connected platform");
      expect(executeToolDescription).not.toContain("Generate request configuration for an action without executing it");
    });

    it("should always include core tools", () => {
      const pica = new Pica(mockSecret);
      const tools = pica.tools();

      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
      expect(tools).toHaveProperty("execute");
    });

    it("should include promptToConnectIntegration tool when authkit is enabled", () => {
      const pica = new Pica(mockSecret, { authkit: true });
      const tools = pica.tools();

      expect(tools).toHaveProperty("promptToConnectIntegration");
      expect(tools.promptToConnectIntegration.description).toContain("Prompt the user to connect to a platform");
    });

    it("should not include promptToConnectIntegration tool when authkit is disabled", () => {
      const pica = new Pica(mockSecret, { authkit: false });
      const tools = pica.tools();

      expect(tools).not.toHaveProperty("promptToConnectIntegration");
    });

    it("should include promptToConnectIntegration tool in knowledge agent mode when authkit is enabled", () => {
      const pica = new Pica(mockSecret, { knowledgeAgent: true, authkit: true });
      const tools = pica.tools();

      expect(tools).toHaveProperty("promptToConnectIntegration");
      expect(tools).toHaveProperty("execute");
      expect(tools).toHaveProperty("searchPlatformActions");
      expect(tools).toHaveProperty("getActionsKnowledge");
    });
  });

  describe("options handling", () => {
    it("should handle empty arrays in options", () => {
      expect(() => new Pica(mockSecret, {
        connectors: [],
        actions: []
      })).not.toThrow();
    });

    it("should handle all option types", () => {
      const options: PicaOptions = {
        connectors: ["*"],
        actions: ["*"],
        permissions: "admin",
        identity: "test-user",
        identityType: "user",
        authkit: true,
        knowledgeAgent: false,
        headers: { "Custom-Header": "value" },
        serverUrl: "https://custom.example.com"
      };

      expect(() => new Pica(mockSecret, options)).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should handle malformed options", () => {
      expect(() => new Pica(mockSecret, {} as PicaOptions)).not.toThrow();
    });
  });
});
