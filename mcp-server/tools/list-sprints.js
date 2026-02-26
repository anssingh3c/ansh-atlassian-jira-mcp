import { z } from 'zod';
import { listSprints, extractJiraError } from '../jira-client.js';
import { formatSprints } from '../formatters.js';

export function registerListSprints(server) {
  server.tool(
    'list_sprints',
    'List sprints for a JIRA board',
    {
      boardId: z.number().int().describe('Board ID'),
      state: z
        .enum(['active', 'future', 'closed'])
        .optional()
        .describe('Filter by sprint state'),
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results'),
    },
    async ({ boardId, state, startAt, maxResults }) => {
      try {
        const data = await listSprints(boardId, state, startAt, maxResults);
        const sprints = data.values || [];
        const text =
          `Sprints for board ${boardId}:\n\n` +
          formatSprints(sprints);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing sprints: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
