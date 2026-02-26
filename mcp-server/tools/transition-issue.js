import { z } from 'zod';
import { transitionIssue, extractJiraError } from '../jira-client.js';

export function registerTransitionIssue(server) {
  server.tool(
    'transition_issue',
    'Move a JIRA issue through a workflow transition (use get_transitions to find valid IDs)',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      transitionId: z.string().describe('Transition ID (use get_transitions to find available IDs)'),
    },
    async ({ issueKey, transitionId }) => {
      try {
        await transitionIssue(issueKey, transitionId);
        return {
          content: [
            {
              type: 'text',
              text: `${issueKey} transitioned successfully (transition ${transitionId}).`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error transitioning ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
