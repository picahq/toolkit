/**
 * Pica ToolKit - Util Tests
 * 
 * @fileoverview Utility function tests for the Pica ToolKit
 * @author Pica
 */

import {
  normalizeActionId,
  replacePathVariables,
  parseConnectionKey,
  parseSystemId,
  resolveTemplateVariables,
  isInitializingWithAllConnectors,
  isInitializingWithAllActions,
  pluralize,
} from "../src/utils";

describe("Utils", () => {
  describe("normalizeActionId", () => {
    it("should add prefix when missing", () => {
      const result = normalizeActionId("GGSNOTZxFUU::ZWXBuJboTpS3Q_U06pF8gA");
      expect(result).toBe("conn_mod_def::GGSNOTZxFUU::ZWXBuJboTpS3Q_U06pF8gA");
    });

    it("should not add prefix when already present", () => {
      const result = normalizeActionId("conn_mod_def::GGSNOTZxFUU::ZWXBuJboTpS3Q_U06pF8gA");
      expect(result).toBe("conn_mod_def::GGSNOTZxFUU::ZWXBuJboTpS3Q_U06pF8gA");
    });

    it("should return raw string when no double colon", () => {
      const result = normalizeActionId("new-action-id");
      expect(result).toBe("new-action-id");
    });
  });

  describe("replacePathVariables", () => {
    it("should replace single variable", () => {
      const path = "/api/users/{{userId}}";
      const variables = { userId: "123" };
      const result = replacePathVariables(path, variables);
      expect(result).toBe("/api/users/123");
    });

    it("should replace multiple variables", () => {
      const path = "/api/{{version}}/users/{{userId}}/posts/{{postId}}";
      const variables = { version: "v1", userId: "123", postId: "456" };
      const result = replacePathVariables(path, variables);
      expect(result).toBe("/api/v1/users/123/posts/456");
    });

    it("should handle numeric and boolean values", () => {
      const path = "/api/items/{{id}}/active/{{isActive}}";
      const variables = { id: 42, isActive: true };
      const result = replacePathVariables(path, variables);
      expect(result).toBe("/api/items/42/active/true");
    });

    it("should throw error for missing variable", () => {
      const path = "/api/users/{{userId}}";
      const variables = {};
      expect(() => replacePathVariables(path, variables)).toThrow("Missing value for path variable: userId");
    });

    it("should return unchanged path when no variables", () => {
      const path = "/api/users/static";
      const variables = {};
      const result = replacePathVariables(path, variables);
      expect(result).toBe("/api/users/static");
    });
  });

  describe("parseConnectionKey", () => {
    it("should parse complete connection key", () => {
      const key = "test::gmail::default::6faf1d3707f846ef89295c836df71c94|user-456";
      const result = parseConnectionKey(key);

      expect(result).toEqual({
        environment: "test",
        platform: "gmail",
        namespace: "default",
        id: "6faf1d3707f846ef89295c836df71c94",
        identity: "user-456"
      });
    });

    it("should parse key without identity", () => {
      const key = "live::shopify::default::6faf1d3707f846ef89295c836df71c94";
      const result = parseConnectionKey(key);
      expect(result).toEqual({
        environment: "live",
        platform: "shopify",
        namespace: "default",
        id: "6faf1d3707f846ef89295c836df71c94",
        identity: undefined
      });
    });

    it("should throw error for empty parts", () => {
      const key = "::google-calendar::";
      expect(() => parseConnectionKey(key)).toThrow("Invalid connection key format. Expected: environment::platform::namespace::id[|identity]");
    });

    it("should throw error for malformed key", () => {
      const key = "incomplete";
      expect(() => parseConnectionKey(key)).toThrow("Invalid connection key format. Expected: environment::platform::namespace::id[|identity]");
    });

    it("should throw error for invalid environment", () => {
      const key = "prod::gmail::default::6faf1d3707f846ef89295c836df71c94";
      expect(() => parseConnectionKey(key)).toThrow("Invalid environment 'prod'. Must be 'live' or 'test'");
    });

    it("should throw error for empty platform", () => {
      const key = "test::::default::6faf1d3707f846ef89295c836df71c94";
      expect(() => parseConnectionKey(key)).toThrow("Platform cannot be empty in connection key");
    });

    it("should throw error for empty namespace", () => {
      const key = "test::gmail::::6faf1d3707f846ef89295c836df71c94";
      expect(() => parseConnectionKey(key)).toThrow("Namespace cannot be empty in connection key");
    });

    it("should throw error for empty id", () => {
      const key = "test::gmail::default::";
      expect(() => parseConnectionKey(key)).toThrow("ID cannot be empty in connection key");
    });

    it("should throw error for empty id with identity", () => {
      const key = "test::gmail::default::|user-123";
      expect(() => parseConnectionKey(key)).toThrow("ID cannot be empty in connection key");
    });

    it("should throw error for non-string input", () => {
      expect(() => parseConnectionKey(null as any)).toThrow("Connection key must be a non-empty string");
      expect(() => parseConnectionKey(undefined as any)).toThrow("Connection key must be a non-empty string");
      expect(() => parseConnectionKey("" as any)).toThrow("Connection key must be a non-empty string");
    });
  });

  describe("parseSystemId", () => {
    it("should parse complete system ID", () => {
      const systemId = "conn_mod_def::GEoTH7-tRU0::RbyDQmffR5C14QTGEdELhg";
      const result = parseSystemId(systemId);
      expect(result).toEqual({
        prefix: "conn_mod_def",
        metadata: "GEoTH7-tRU0",
        suffix: "RbyDQmffR5C14QTGEdELhg"
      });
    });

    it("should throw error for incomplete system ID", () => {
      const systemId = "prefix::metadata";
      expect(() => parseSystemId(systemId)).toThrow("Invalid system ID format. Expected: prefix::metadata::suffix");
    });

    it("should throw error for single part", () => {
      const systemId = "single";
      expect(() => parseSystemId(systemId)).toThrow("Invalid system ID format. Expected: prefix::metadata::suffix");
    });

    it("should throw error for too many parts", () => {
      const systemId = "prefix::metadata::suffix::extra";
      expect(() => parseSystemId(systemId)).toThrow("Invalid system ID format. Expected: prefix::metadata::suffix");
    });

    it("should throw error for empty prefix", () => {
      const systemId = "::metadata::suffix";
      expect(() => parseSystemId(systemId)).toThrow("Prefix cannot be empty in system ID");
    });

    it("should throw error for empty metadata", () => {
      const systemId = "prefix::::suffix";
      expect(() => parseSystemId(systemId)).toThrow("Metadata cannot be empty in system ID");
    });

    it("should throw error for empty suffix", () => {
      const systemId = "prefix::metadata::";
      expect(() => parseSystemId(systemId)).toThrow("Suffix cannot be empty in system ID");
    });

    it("should throw error for non-string input", () => {
      expect(() => parseSystemId(null as any)).toThrow("System ID must be a non-empty string");
      expect(() => parseSystemId(undefined as any)).toThrow("System ID must be a non-empty string");
      expect(() => parseSystemId("" as any)).toThrow("System ID must be a non-empty string");
    });
  });

  describe("resolveTemplateVariables", () => {
    it("should resolve variables from data object", () => {
      const path = "/api/users/{{userId}}/posts/{{postId}}";
      const data = { userId: "123", postId: "456", title: "Test Post" };

      const result = resolveTemplateVariables(path, data);

      expect(result.resolvedPath).toBe("/api/users/123/posts/456");
      expect(result.cleanedData).toEqual({ title: "Test Post" });
      expect(result.resolvedPathVariables).toEqual({ userId: "123", postId: "456" });
    });

    it("should prioritize pathVariables over data", () => {
      const path = "/api/users/{{userId}}";
      const data = { userId: "from-data" };
      const pathVariables = { userId: "from-path-vars" };

      const result = resolveTemplateVariables(path, data, pathVariables);

      expect(result.resolvedPath).toBe("/api/users/from-path-vars");
      expect(result.resolvedPathVariables).toEqual({ userId: "from-path-vars" });
    });

    it("should throw error for missing variables", () => {
      const path = "/api/users/{{userId}}";
      const data = {};

      expect(() => resolveTemplateVariables(path, data)).toThrow("Missing required path variables: userId");
    });

    it("should handle array data", () => {
      const path = "/api/users/{{userId}}";
      const data = ["item1", "item2"];
      const pathVariables = { userId: "123" };

      const result = resolveTemplateVariables(path, data, pathVariables);

      expect(result.resolvedPath).toBe("/api/users/123");
      expect(result.cleanedData).toEqual(["item1", "item2"]);
    });

    it("should handle path without variables", () => {
      const path = "/api/users/static";
      const data = { title: "Test" };

      const result = resolveTemplateVariables(path, data);

      expect(result.resolvedPath).toBe("/api/users/static");
      expect(result.cleanedData).toEqual({ title: "Test" });
      expect(result.resolvedPathVariables).toEqual({});
    });
  });

  describe("isInitializingWithAllConnectors", () => {
    it("should return true when array contains '*'", () => {
      expect(isInitializingWithAllConnectors(["*"])).toBe(true);
      expect(isInitializingWithAllConnectors(["connector1", "*", "connector2"])).toBe(true);
    });

    it("should return false when array does not contain '*'", () => {
      expect(isInitializingWithAllConnectors(["connector1", "connector2"])).toBe(false);
      expect(isInitializingWithAllConnectors([])).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isInitializingWithAllConnectors(undefined)).toBe(false);
    });
  });

  describe("isInitializingWithAllActions", () => {
    it("should return true when array contains '*'", () => {
      expect(isInitializingWithAllActions(["*"])).toBe(true);
      expect(isInitializingWithAllActions(["action1", "*", "action2"])).toBe(true);
    });

    it("should return false when array does not contain '*'", () => {
      expect(isInitializingWithAllActions(["action1", "action2"])).toBe(false);
      expect(isInitializingWithAllActions([])).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isInitializingWithAllActions(undefined)).toBe(false);
    });
  });

  describe("pluralize", () => {
    it("should return singular for count of 1", () => {
      expect(pluralize(1, "item")).toBe("item");
      expect(pluralize(1, "person", "people")).toBe("person");
    });

    it("should return plural for count other than 1", () => {
      expect(pluralize(0, "item")).toBe("items");
      expect(pluralize(2, "item")).toBe("items");
      expect(pluralize(5, "item")).toBe("items");
    });

    it("should use custom plural form when provided", () => {
      expect(pluralize(0, "person", "people")).toBe("people");
      expect(pluralize(2, "child", "children")).toBe("children");
    });

    it("should default to adding 's' when no custom plural", () => {
      expect(pluralize(2, "cat")).toBe("cats");
      expect(pluralize(0, "dog")).toBe("dogs");
    });
  });
});
