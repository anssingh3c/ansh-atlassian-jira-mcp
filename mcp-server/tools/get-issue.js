import { z } from 'zod';
import { getIssue, getClient, extractJiraError } from '../jira-client.js';
import { formatIssueDetail } from '../formatters.js';

export function registerGetIssue(server) {
  server.tool(
    'get_issue',
    'Get JIRA issue details by key (e.g. PROJ-123)',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
    },
    async ({ issueKey }) => {
      try {
        const issue = await getIssue(issueKey);
        const { baseURL } = getClient();
        const text = formatIssueDetail(issue, baseURL);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching issue ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
