/**
 * ServiceNow Incident interface
 */
export interface ServiceNowIncident {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  urgency: string;
  impact: string;
  assigned_to: {
    display_value: string;
  };
  assignment_group: {
    display_value: string;
  };
  opened_at: string;
  updated_at: string;
  caller_id: {
    display_value: string;
  };
  category: string;
  subcategory: string;
  sys_created_on: string;
  sys_updated_on: string;
}

/**
 * ServiceNow API Response
 */
export interface ServiceNowResponse {
  result: ServiceNowIncident[];
}

/**
 * ServiceNow Configuration
 */
export interface ServiceNowConfig {
  instanceUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Query parameters for incident listing
 */
export interface IncidentQueryParams {
  limit?: number;
  offset?: number;
  state?: string;
  priority?: string;
  assigned_to?: string;
  query?: string;
}
