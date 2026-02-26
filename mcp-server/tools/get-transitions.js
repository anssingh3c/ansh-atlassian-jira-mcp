import { z } from 'zod';
import { getTransitions, extractJiraError } from '../jira-client.js';
import { formatTransitions } from '../formatters.js';

export function registerGetTransitions(server) {
  server.tool(
    'get_transitions',
    'List available workflow transitions for a JIRA issue',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
    },
    async ({ issueKey }) => {
      try {
        const transitions = await getTransitions(issueKey);
        const text =
          `Available transitions for ${issueKey}:\n\n` +
          formatTransitions(transitions);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching transitions for ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
