import axios, { AxiosInstance } from 'axios';
import { ServiceNowConfig, ServiceNowIncident, ServiceNowResponse, IncidentQueryParams } from './types.js';

/**
 * ServiceNow API Client
 */
export class ServiceNowClient {
  private client: AxiosInstance;
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: `${config.instanceUrl}/api/now`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Set up authentication
    if (config.username && config.password) {
      // Basic authentication
      this.client.defaults.auth = {
        username: config.username,
        password: config.password
      };
    }
  }

  /**
   * List incidents from ServiceNow
   */
  async listIncidents(params: IncidentQueryParams = {}): Promise<ServiceNowIncident[]> {
    try {
      const queryParams: Record<string, string> = {
        sysparm_display_value: 'true',
        sysparm_limit: String(params.limit || 100),
        sysparm_offset: String(params.offset || 0)
      };

      // Build query string
      const queryParts: string[] = [];

      if (params.state) {
        queryParts.push(`state=${params.state}`);
      }

      if (params.priority) {
        queryParts.push(`priority=${params.priority}`);
      }

      if (params.assigned_to) {
        queryParts.push(`assigned_to.name=${params.assigned_to}`);
      }

      if (params.query) {
        queryParts.push(params.query);
      }

      if (queryParts.length > 0) {
        queryParams.sysparm_query = queryParts.join('^');
      }

      // Make request to ServiceNow Table API
      const response = await this.client.get<ServiceNowResponse>(
        '/table/incident',
        { params: queryParams }
      );

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `ServiceNow API error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific incident by sys_id or number
   */
  async getIncident(identifier: string): Promise<ServiceNowIncident | null> {
    try {
      const queryParams: Record<string, string> = {
        sysparm_display_value: 'true',
        sysparm_query: identifier.startsWith('INC') ? `number=${identifier}` : `sys_id=${identifier}`
      };

      const response = await this.client.get<ServiceNowResponse>(
        '/table/incident',
        { params: queryParams }
      );

      return response.data.result[0] || null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `ServiceNow API error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Test connection to ServiceNow
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/table/incident', {
        params: {
          sysparm_limit: '1'
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
