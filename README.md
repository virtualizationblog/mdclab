# ServiceNow MCP Server

A Model Context Protocol (MCP) server that provides integration with ServiceNow to list and manage incidents over HTTPS.

## Features

- **List Incidents**: Retrieve ServiceNow incidents with optional filters
- **Get Incident**: Fetch specific incident details by number or sys_id
- **Test Connection**: Verify connectivity to your ServiceNow instance
- **Secure HTTPS**: All communications with ServiceNow use secure HTTPS connections
- **Flexible Filtering**: Filter incidents by state, priority, assigned user, and custom queries

## Prerequisites

- Node.js 18 or higher
- A ServiceNow instance with API access
- ServiceNow credentials (username/password or OAuth)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mdclab
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your ServiceNow credentials in `.env`:
```env
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
```

5. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

Or run in development mode:
```bash
npm run dev
```

### Available Tools

The MCP server exposes the following tools:

#### 1. list_incidents

List ServiceNow incidents with optional filters.

**Parameters:**
- `limit` (number, optional): Maximum number of incidents to return (default: 100)
- `offset` (number, optional): Number of incidents to skip for pagination (default: 0)
- `state` (string, optional): Filter by incident state
  - "1" = New
  - "2" = In Progress
  - "3" = On Hold
  - "6" = Resolved
  - "7" = Closed
- `priority` (string, optional): Filter by priority (1-5, where 1 is Critical)
- `assigned_to` (string, optional): Filter by assigned user name
- `query` (string, optional): Custom ServiceNow encoded query string

**Example:**
```json
{
  "limit": 50,
  "state": "2",
  "priority": "1"
}
```

#### 2. get_incident

Get a specific ServiceNow incident by number or sys_id.

**Parameters:**
- `identifier` (string, required): Incident number (e.g., "INC0010001") or sys_id

**Example:**
```json
{
  "identifier": "INC0010001"
}
```

#### 3. test_connection

Test the connection to your ServiceNow instance.

**Parameters:** None

### Resources

The server also exposes resources that can be accessed:

- `servicenow://incidents`: Returns a list of all ServiceNow incidents (up to 100)

## ServiceNow Incident States

Common incident state values:
- **1**: New
- **2**: In Progress
- **3**: On Hold
- **6**: Resolved
- **7**: Closed
- **8**: Canceled

## ServiceNow Priority Values

Priority levels:
- **1**: Critical
- **2**: High
- **3**: Moderate
- **4**: Low
- **5**: Planning

## Configuration Options

### Basic Authentication

Set these environment variables for basic authentication:
```env
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
```

### Instance URL

Your ServiceNow instance URL should be in the format:
```env
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
```

Do not include a trailing slash or API path.

## Development

### Project Structure

```
mdclab/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   ├── servicenow-client.ts  # ServiceNow API client
│   └── types.ts              # TypeScript type definitions
├── dist/                     # Compiled JavaScript output
├── .env                      # Environment variables (not in git)
├── .env.example              # Example environment configuration
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Testing Connection

After configuring your credentials, test the connection:
```bash
npm start
```

Then use the `test_connection` tool to verify connectivity.

## Security Considerations

- **Never commit `.env` file**: The `.gitignore` file is configured to exclude it
- **Use strong passwords**: Ensure ServiceNow credentials are secure
- **HTTPS Only**: All API calls use HTTPS for encryption
- **Credential Storage**: Consider using environment variables or secret management systems in production
- **API Permissions**: Ensure the ServiceNow user has appropriate read permissions for the incident table

## Troubleshooting

### Connection Issues

If you can't connect to ServiceNow:
1. Verify your instance URL is correct (no trailing slash)
2. Check your username and password
3. Ensure your ServiceNow user has API access and incident read permissions
4. Verify network connectivity to your ServiceNow instance
5. Check if your ServiceNow instance requires IP whitelisting

### Authentication Errors

- Verify credentials are correct in `.env`
- Check if the user account is locked or expired
- Ensure the user has the `rest_api_explorer` role or equivalent

### No Incidents Returned

- Verify incidents exist in your ServiceNow instance
- Check filter parameters are correctly formatted
- Ensure the user has read access to the incident table

## API Reference

This server uses the ServiceNow Table API:
- Endpoint: `/api/now/table/incident`
- Documentation: [ServiceNow Table API](https://docs.servicenow.com/bundle/vancouver-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html)

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All new features include appropriate error handling
- Documentation is updated for new features

## License

MIT

## Support

For issues and questions:
- Check the ServiceNow API documentation
- Review the troubleshooting section above
- Open an issue in the repository
