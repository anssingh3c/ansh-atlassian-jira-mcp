import { z } from 'zod';
import { listProjects, extractJiraError } from '../jira-client.js';
import { formatProjects } from '../formatters.js';

export function registerListProjects(server) {
  server.tool(
    'list_projects',
    'List accessible JIRA projects',
    {
      startAt: z.number().int().min(0).default(0).describe('Pagination offset'),
      maxResults: z.number().int().min(1).max(100).default(50).describe('Max results to return'),
    },
    async ({ startAt, maxResults }) => {
      try {
        const data = await listProjects(startAt, maxResults);
        const projects = data.values || [];
        const total = data.total || projects.length;
        const text =
          `Showing ${projects.length} of ${total} projects\n\n` +
          formatProjects(projects);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error listing projects: ${extractJiraError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
