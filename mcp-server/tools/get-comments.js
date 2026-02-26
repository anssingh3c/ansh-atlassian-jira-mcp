import { z } from 'zod';
import { getComments, extractJiraError } from '../jira-client.js';
import { formatComments } from '../formatters.js';

export function registerGetComments(server) {
  server.tool(
    'get_comments',
    'List comments on a JIRA issue',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ issueKey, startAt, maxResults }) => {
      try {
        const data = await getComments(issueKey, startAt, maxResults);
        const comments = data.comments || [];
        const total = data.total || 0;
        const text =
          `${total} comment(s) on ${issueKey} (showing ${comments.length})\n\n` +
          formatComments(comments);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error fetching comments for ${issueKey}: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
