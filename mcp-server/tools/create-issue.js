import { z } from 'zod';
import { createIssue, getClient, extractJiraError } from '../jira-client.js';
import { plainTextToAdf } from '../formatters.js';

export function registerCreateIssue(server) {
  server.tool(
    'create_issue',
    'Create a new JIRA issue',
    {
      projectKey: z.string().describe('Project key, e.g. PROJ'),
      issueType: z.string().describe('Issue type name, e.g. Task, Bug, Story'),
      summary: z.string().describe('Issue summary / title'),
      description: z.string().optional().describe('Issue description (plain text, converted to ADF)'),
      assigneeAccountId: z.string().optional().describe('Assignee Atlassian account ID'),
      labels: z.array(z.string()).optional().describe('Labels to add'),
      priority: z.string().optional().describe('Priority name, e.g. High, Medium, Low'),
      parentKey: z.string().optional().describe('Parent issue key for sub-tasks'),
    },
    async ({ projectKey, issueType, summary, description, assigneeAccountId, labels, priority, parentKey }) => {
      try {
        const fields = {
          project: { key: projectKey },
          issuetype: { name: issueType },
          summary,
        };
        if (description) fields.description = plainTextToAdf(description);
        if (assigneeAccountId) fields.assignee = { accountId: assigneeAccountId };
        if (labels) fields.labels = labels;
        if (priority) fields.priority = { name: priority };
        if (parentKey) fields.parent = { key: parentKey };

        const result = await createIssue(fields);
        const { baseURL } = getClient();
        const text =
          `Issue created: [${result.key}](${baseURL}/browse/${result.key})`;
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error creating issue: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
