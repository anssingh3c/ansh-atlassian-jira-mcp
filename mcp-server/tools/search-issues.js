import { z } from 'zod';
import { searchIssues, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerSearchIssues(server) {
  server.tool(
    'search_issues',
    'Search JIRA issues using JQL',
    {
      jql: z.string().describe('JQL query string, e.g. "project = PROJ AND status = Open"'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: summary, status, assignee, issuetype, priority)'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
    },
    async ({ jql, fields, maxResults, startAt }) => {
      try {
        const defaultFields = ['summary', 'status', 'assignee', 'issuetype', 'priority'];
        const data = await searchIssues(jql, fields || defaultFields, maxResults, startAt);
        const issues = data.issues || [];
        const total = data.total || 0;
        const { baseURL } = getClient();
        const text =
          `Found ${total} issues (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error searching issues: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
