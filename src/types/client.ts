/**
 * Pica ToolKit - Client Types
 * 
 * These are the client types for the Pica ToolKit.
 * 
 * @fileoverview Client types for the Pica ToolKit
 * @author Pica
 */

export interface PicaOptions {
  /**
   * Array of connector keys to initialize the Pica client with.
   * @default [] - No connectors enabled by default
   * @example
   * // Enable all connectors
   * connectors: ["*"]
   * 
   * // Enable specific connectors
   * connectors: ["test::gmail::default::6faf1d3707f846ef89295c836df71c94"]
   * 
   * @remarks
   * Connection keys can be found in the Pica dashboard at https://app.picaos.com/connections
   * Setting to ["*"] will enable access to all available connectors.
   * An empty array or undefined will disable all connectors.
   */
  connectors?: string[];
  /**
   * Array of action IDs to initialize the Pica client with.
   * @default [] - No actions enabled by default
   * @example
   * // Enable all actions
   * actions: ["*"]
   * 
   * // Enable specific actions
   * actions: ["conn_mod_def::GGSNOTZxFUU::ZWXBuJboTpS3Q_U06pF8gA"]
   * 
   * @remarks
   * Action IDs can be found in the Pica dashboard at https://app.picaos.com/tools
   * Setting to ["*"] will enable access to all available actions.
   * An empty array or undefined will disable all actions.
   */
  actions?: string[];
  /**
   * Permission level for the Pica client to control which HTTP methods are allowed.
   * @default "admin" - Allows all HTTP methods
   * @example
   * // Only allow GET requests
   * permissions: "read"
   * 
   * // Allow POST, PUT, and PATCH requests
   * permissions: "write"
   * 
   * // Allow all HTTP methods (default)
   * permissions: "admin"
   * 
   * @remarks
   * - "read" - Only allows GET requests
   * - "write" - Only allows POST, PUT, and PATCH requests 
   * - "admin" - Allows all HTTP methods
   */
  permissions?: "read" | "write" | "admin";
  /**
   * Optional identity value used to filter connection keys by identity scope.
   * @default undefined - No identity filtering applied
   * @example
   * // Filter connections for a specific user
   * identity: "user_123"
   * 
   * @remarks
   * The identity value is used in conjunction with identityType to scope connections
   * to specific users, teams, organizations or projects. This allows for granular
   * access control of connections based on identity context.
   */
  identity?: string;
  /**
   * Optional identity type used to filter connection keys by identity scope.
   * @default undefined - No identity type filtering applied
   * @example
   * // Filter connections for a specific user
   * identityType: "user"
   * 
   * @remarks
   * The identity type works together with the identity value to scope connections
   * to specific contexts. Valid values are:
   * - "user"
   * - "team"
   * - "organization"
   * - "project"
   */
  identityType?: "user" | "team" | "organization" | "project";
  /**
   * Optional flag to enable AuthKit integration for authentication and authorization.
   * @default false - AuthKit integration is disabled
   * @example
   * // Enable AuthKit integration
   * authkit: true
   * 
   * @remarks
   * When enabled, AuthKit integration provides the `promptToConnectPlatform` tool for handling authentication and authorization flows.
   * The system prompt will automatically adapt to include AuthKit-specific instructions and capabilities.
   * Read more about AuthKit at https://docs.picaos.com/core/authkit
   */
  authkit?: boolean;
  /**
   * Optional flag to enable Knowledge Agent mode.
   * @default false - Knowledge Agent mode is disabled
   * @example
   * // Enable Knowledge Agent mode
   * knowledgeAgent: true
   * 
   * @remarks
   * When enabled, Knowledge Agent mode restricts the client to only retrieving action knowledge
   * without execution capabilities. This is useful for scenarios where you want to explore and
   * understand available actions without allowing actual execution.
   * Tools like `execute` will not be available in this mode.
   */
  knowledgeAgent?: boolean;
  /**
   * Optional additional HTTP headers to send with API requests.
   * @default {} - No additional headers are sent
   * @example
   * // Add custom authorization header
   * headers: {
   *   'Authorization': 'Bearer token123'
   * }
   * 
   * @remarks
   * These headers will be included in all requests made to the Pica API.
   * Headers specified here will be merged with the default headers.
   */
  headers?: Record<string, string>;
  /**
   * Optional custom server URL for the Pica API.
   * @default "https://api.picaos.com"
   * @example
   * // Use a custom API server
   * serverUrl: "https://my-hosted-pica-instance.com"
   * 
   * @remarks
   * This allows you to point the client to a different Pica API server,
   * which can be useful for development, testing, or enterprise deployments
   * with custom hosting requirements.
   */
  serverUrl?: string;
}
