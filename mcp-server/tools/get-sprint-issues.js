import { z } from 'zod';
import { getSprintIssues, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueTable } from '../formatters.js';

export function registerGetSprintIssues(server) {
  server.tool(
    'get_sprint_issues',
    'Get issues in a JIRA sprint',
    {
      sprintId: z.number().int().describe('Sprint ID'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Fields to return (default: summary, status, assignee, issuetype, priority)'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ sprintId, fields, startAt, maxResults }) => {
      try {
        const defaultFields = ['summary', 'status', 'assignee', 'issuetype', 'priority'];
        const data = await getSprintIssues(sprintId, fields || defaultFields, startAt, maxResults);
        const issues = data.issues || [];
        const total = data.total || 0;
        const { baseURL } = getClient();
        const text =
          `Sprint ${sprintId}: ${total} issues (showing ${issues.length})\n\n` +
          formatIssueTable(issues, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching sprint issues: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
