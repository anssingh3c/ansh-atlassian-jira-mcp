import { z } from 'zod';
import { updateIssue, extractJiraError } from '../jira-client.js';
import { plainTextToAdf } from '../formatters.js';

export function registerUpdateIssue(server) {
  server.tool(
    'update_issue',
    'Update fields on an existing JIRA issue',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      summary: z.string().optional().describe('New summary'),
      description: z.string().optional().describe('New description (plain text, converted to ADF)'),
      assigneeAccountId: z.string().optional().describe('Assignee Atlassian account ID'),
      labels: z.array(z.string()).optional().describe('Replace labels'),
      priority: z.string().optional().describe('Priority name, e.g. High, Medium, Low'),
    },
    async ({ issueKey, summary, description, assigneeAccountId, labels, priority }) => {
      try {
        const fields = {};
        if (summary) fields.summary = summary;
        if (description) fields.description = plainTextToAdf(description);
        if (assigneeAccountId) fields.assignee = { accountId: assigneeAccountId };
        if (labels) fields.labels = labels;
        if (priority) fields.priority = { name: priority };

        if (Object.keys(fields).length === 0) {
          return {
            content: [{ type: 'text', text: 'No fields provided to update.' }],
            isError: true,
          };
        }

        await updateIssue(issueKey, fields);
        return {
          content: [
            {
              type: 'text',
              text: `${issueKey} updated successfully. Changed fields: ${Object.keys(fields).join(', ')}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error updating ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
