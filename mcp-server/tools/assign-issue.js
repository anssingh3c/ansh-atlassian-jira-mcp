import { z } from 'zod';
import { assignIssue, extractJiraError } from '../jira-client.js';

export function registerAssignIssue(server) {
  server.tool(
    'assign_issue',
    'Assign a JIRA issue to a user (by accountId) or unassign it',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      accountId: z
        .string()
        .nullable()
        .describe('Atlassian account ID of the assignee, or null to unassign'),
    },
    async ({ issueKey, accountId }) => {
      try {
        await assignIssue(issueKey, accountId);
        const action = accountId ? `assigned to ${accountId}` : 'unassigned';
        return {
          content: [{ type: 'text', text: `${issueKey} ${action} successfully.` }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error assigning ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
