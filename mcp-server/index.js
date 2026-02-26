import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerListProjects } from './tools/list-projects.js';
import { registerGetIssue } from './tools/get-issue.js';
import { registerGetTransitions } from './tools/get-transitions.js';
import { registerSearchIssues } from './tools/search-issues.js';
import { registerGetComments } from './tools/get-comments.js';
import { registerAssignIssue } from './tools/assign-issue.js';
import { registerAddComment } from './tools/add-comment.js';
import { registerTransitionIssue } from './tools/transition-issue.js';
import { registerCreateIssue } from './tools/create-issue.js';
import { registerUpdateIssue } from './tools/update-issue.js';
import { registerListSprints } from './tools/list-sprints.js';
import { registerGetSprintIssues } from './tools/get-sprint-issues.js';

const server = new McpServer({
  name: 'jira',
  version: '1.0.0',
  description: 'JIRA MCP Server — interact with Atlassian JIRA from Claude Code',
});

// Register all tools
registerListProjects(server);
registerGetIssue(server);
registerGetTransitions(server);
registerSearchIssues(server);
registerGetComments(server);
registerAssignIssue(server);
registerAddComment(server);
registerTransitionIssue(server);
registerCreateIssue(server);
registerUpdateIssue(server);
registerListSprints(server);
registerGetSprintIssues(server);

// Start server on stdio
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('JIRA MCP server running on stdio');
