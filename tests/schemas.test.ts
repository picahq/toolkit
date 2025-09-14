/**
 * Pica ToolKit - Schemas Tests
 * 
 * @fileoverview Schemas tests for the Pica ToolKit
 * @author Pica
 */

import {
  searchPlatformActionsSchema,
  getActionsKnowledgeSchema,
  executeActionSchema,
  listPicaIntegrationsSchema,
} from "../src/schemas";

describe("Schemas", () => {
  describe("searchPlatformActionsSchema", () => {
    it("should validate correct input", () => {
      const validInput = {
        platform: "gmail",
        query: "send email"
      };

      const result = searchPlatformActionsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should reject missing platform", () => {
      const invalidInput = {
        query: "send email"
      };

      const result = searchPlatformActionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject missing query", () => {
      const invalidInput = {
        platform: "gmail"
      };

      const result = searchPlatformActionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject non-string values", () => {
      const invalidInput = {
        platform: 123,
        query: true
      };

      const result = searchPlatformActionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("getActionsKnowledgeSchema", () => {
    it("should validate correct input", () => {
      const validInput = {
        systemIds: ["conn_mod_def::test::123", "conn_mod_def::test::456"]
      };

      const result = getActionsKnowledgeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should reject non-array systemIds", () => {
      const invalidInput = {
        systemIds: "not-an-array"
      };

      const result = getActionsKnowledgeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject array with non-string elements", () => {
      const invalidInput = {
        systemIds: ["valid-string", 123, true]
      };

      const result = getActionsKnowledgeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept empty array", () => {
      const validInput = {
        systemIds: []
      };

      const result = getActionsKnowledgeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("executeActionSchema", () => {
    it("should validate minimal required input", () => {
      const validInput = {
        actionSystemId: "conn_mod_def::test::123",
        connectionKey: "test::gmail::default::abc123",
        data: { message: "Hello" }
      };

      const result = executeActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should validate complete input with all optional fields", () => {
      const validInput = {
        actionSystemId: "conn_mod_def::test::123",
        connectionKey: "test::gmail::default::abc123",
        data: { message: "Hello" },
        pathVariables: { userId: "456" },
        queryParams: { limit: 10 },
        headers: { "Custom-Header": "value" },
        isFormData: true,
        isFormUrlEncoded: false
      };

      const result = executeActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should reject missing actionSystemId", () => {
      const invalidInput = {
        connectionKey: "test::gmail::default::abc123",
        data: { message: "Hello" }
      };

      const result = executeActionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject missing connectionKey", () => {
      const invalidInput = {
        actionSystemId: "conn_mod_def::test::123",
        data: { message: "Hello" }
      };

      const result = executeActionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept undefined data", () => {
      const validInput = {
        actionSystemId: "conn_mod_def::test::123",
        connectionKey: "test::gmail::default::abc123"
      };

      const result = executeActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate pathVariables types", () => {
      const validInput = {
        actionSystemId: "conn_mod_def::test::123",
        connectionKey: "test::gmail::default::abc123",
        data: {},
        pathVariables: {
          stringVar: "text",
          numberVar: 42,
          boolVar: true
        }
      };

      const result = executeActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("listPicaIntegrationsSchema", () => {
    it("should validate empty object", () => {
      const validInput = {};

      const result = listPicaIntegrationsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should reject non-object input", () => {
      const invalidInputs = ["string", 123, true, null, []];

      invalidInputs.forEach(input => {
        const result = listPicaIntegrationsSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it("should ignore extra properties", () => {
      const inputWithExtra = {
        extraProp: "should be ignored"
      };

      const result = listPicaIntegrationsSchema.safeParse(inputWithExtra);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });
});
