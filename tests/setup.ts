/**
 * Pica ToolKit - Setup
 * 
 * @fileoverview Setup for the Pica ToolKit tests
 * @author Pica
 */

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

jest.setTimeout(10000);
