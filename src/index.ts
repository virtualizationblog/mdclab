#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { ServiceNowClient } from './servicenow-client.js';
import { ServiceNowConfig, IncidentQueryParams } from './types.js';

// Load environment variables
dotenv.config();

/**
 * Validate ServiceNow configuration
 */
function getServiceNowConfig(): ServiceNowConfig {
  const instanceUrl = process.env.SERVICENOW_INSTANCE_URL;
  const username = process.env.SERVICENOW_USERNAME;
  const password = process.env.SERVICENOW_PASSWORD;

  if (!instanceUrl) {
    throw new Error('SERVICENOW_INSTANCE_URL is required');
  }

  if (!username || !password) {
    throw new Error('SERVICENOW_USERNAME and SERVICENOW_PASSWORD are required');
  }

  return {
    instanceUrl: instanceUrl.replace(/\/$/, ''), // Remove trailing slash
    username,
    password
  };
}

/**
 * Main server implementation
 */
class ServiceNowMCPServer {
  private server: Server;
  private snClient: ServiceNowClient;

  constructor() {
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'servicenow-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    // Initialize ServiceNow client
    const config = getServiceNowConfig();
    this.snClient = new ServiceNowClient(config);

    // Set up handlers
    this.setupHandlers();

    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up MCP request handlers
   */
  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_incidents',
          description: 'List ServiceNow incidents with optional filters',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of incidents to return (default: 100)',
                default: 100
              },
              offset: {
                type: 'number',
                description: 'Number of incidents to skip (for pagination)',
                default: 0
              },
              state: {
                type: 'string',
                description: 'Filter by incident state (e.g., "1" for New, "2" for In Progress, "6" for Resolved)'
              },
              priority: {
                type: 'string',
                description: 'Filter by priority (1-5, where 1 is Critical)'
              },
              assigned_to: {
                type: 'string',
                description: 'Filter by assigned user name'
              },
              query: {
                type: 'string',
                description: 'Custom ServiceNow query string (encoded query)'
              }
            }
          }
        },
        {
          name: 'get_incident',
          description: 'Get a specific ServiceNow incident by number or sys_id',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Incident number (e.g., INC0010001) or sys_id'
              }
            },
            required: ['identifier']
          }
        },
        {
          name: 'test_connection',
          description: 'Test connection to ServiceNow instance',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_incidents': {
            const args = request.params.arguments as IncidentQueryParams;
            const incidents = await this.snClient.listIncidents(args);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(incidents, null, 2)
                }
              ]
            };
          }

          case 'get_incident': {
            const args = request.params.arguments as { identifier: string };
            if (!args.identifier) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'identifier parameter is required'
              );
            }

            const incident = await this.snClient.getIncident(args.identifier);
            if (!incident) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Incident not found: ${args.identifier}`
                  }
                ]
              };
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(incident, null, 2)
                }
              ]
            };
          }

          case 'test_connection': {
            const isConnected = await this.snClient.testConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: isConnected
                    ? 'Successfully connected to ServiceNow'
                    : 'Failed to connect to ServiceNow'
                }
              ]
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'servicenow://incidents',
          name: 'ServiceNow Incidents',
          description: 'List of all ServiceNow incidents',
          mimeType: 'application/json'
        }
      ]
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'servicenow://incidents') {
        const incidents = await this.snClient.listIncidents({ limit: 100 });
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(incidents, null, 2)
            }
          ]
        };
      }

      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${request.params.uri}`
      );
    });
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ServiceNow MCP Server running on stdio');
  }
}

// Start the server
const server = new ServiceNowMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
