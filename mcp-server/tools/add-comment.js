import { z } from 'zod';
import { addComment, extractJiraError } from '../jira-client.js';
import { plainTextToAdf } from '../formatters.js';

export function registerAddComment(server) {
  server.tool(
    'add_comment',
    'Add a comment to a JIRA issue',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      body: z.string().describe('Comment text (plain text, will be converted to ADF)'),
    },
    async ({ issueKey, body }) => {
      try {
        const adf = plainTextToAdf(body);
        const comment = await addComment(issueKey, adf);
        return {
          content: [
            {
              type: 'text',
              text: `Comment added to ${issueKey} (id: ${comment.id}).`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error adding comment to ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
