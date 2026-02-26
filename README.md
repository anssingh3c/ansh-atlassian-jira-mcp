# JIRA MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that connects Claude Code to Atlassian JIRA Cloud. Provides 12 tools for managing projects, issues, sprints, comments, and workflow transitions — all accessible directly from your Claude Code session.

## Prerequisites

- **Node.js** 18+
- **JIRA Cloud** account (e.g., `https://yourorg.atlassian.net`)
- **Atlassian API token** — [Generate one here](https://id.atlassian.com/manage-profile/security/api-tokens)

## Project Structure

```
jira/
├── .mcp.json                        # Claude Code MCP configuration
├── .env                             # Environment variables (git-ignored)
├── package.json                     # Dependencies and scripts
├── jira-bulk-move-to-done.js        # Utility: bulk transition issues to Done
├── jira-gemini-description.js       # Utility: AI-generated issue descriptions
└── mcp-server/
    ├── index.js                     # Server entry point (stdio transport)
    ├── jira-client.js               # JIRA API client (REST v3 + Agile v1.0)
    ├── formatters.js                # Output formatting (ADF ↔ plain text, markdown tables)
    └── tools/
        ├── list-projects.js
        ├── get-issue.js
        ├── search-issues.js
        ├── create-issue.js
        ├── update-issue.js
        ├── assign-issue.js
        ├── get-transitions.js
        ├── transition-issue.js
        ├── add-comment.js
        ├── get-comments.js
        ├── list-sprints.js
        └── get-sprint-issues.js
```

## Setup

### 1. Install dependencies

```bash
git clone <repo-url> && cd jira
npm install
```

### 2. Create a `.env` file

```env
JIRA_BASE_URL=https://yourorg.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-api-token
```

> **Generating an API token:** Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens), click **Create API token**, give it a label, and copy the value into `JIRA_API_TOKEN`.

### 3. Verify the server starts

```bash
npm run mcp
# Output: JIRA MCP server running on stdio
```

## Claude Code Integration

Add the following to your `.mcp.json` (project root or `~/.claude/.mcp.json` for global):

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/absolute/path/to/jira/mcp-server/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://yourorg.atlassian.net",
        "JIRA_EMAIL": "you@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Replace the placeholder values with your actual credentials. Once configured, Claude Code will automatically start the MCP server and expose the JIRA tools.

## Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_projects` | List accessible JIRA projects | `maxResults`, `startAt` |
| `get_issue` | Get issue details by key | `issueKey` (required) |
| `search_issues` | Search issues using JQL | `jql` (required), `fields`, `maxResults` |
| `create_issue` | Create a new issue | `projectKey`, `issueType`, `summary` (required); `description`, `assigneeAccountId`, `labels`, `priority`, `parentKey` |
| `update_issue` | Update fields on an existing issue | `issueKey` (required); `summary`, `description`, `assigneeAccountId`, `labels`, `priority` |
| `assign_issue` | Assign/unassign an issue | `issueKey`, `accountId` (required; `null` to unassign) |
| `get_transitions` | List available workflow transitions | `issueKey` (required) |
| `transition_issue` | Move issue through a workflow transition | `issueKey`, `transitionId` (required) |
| `add_comment` | Add a comment to an issue | `issueKey`, `body` (required) |
| `get_comments` | List comments on an issue | `issueKey` (required), `maxResults`, `startAt` |
| `list_sprints` | List sprints for a board | `boardId` (required), `state` |
| `get_sprint_issues` | Get issues in a sprint | `sprintId` (required), `fields`, `maxResults` |

## Utility Scripts

These standalone scripts are not part of the MCP server but use the same JIRA API:

- **`jira-bulk-move-to-done.js`** — Bulk-transitions issues matching a JQL filter (e.g., "Ready for merging") to Done. Useful for end-of-sprint cleanup.
- **`jira-gemini-description.js`** — Generates structured task descriptions using Google Gemini AI based on issue titles, then updates the issues in JIRA.

## Tech Stack

- **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)** — MCP server framework
- **[axios](https://www.npmjs.com/package/axios)** — HTTP client for JIRA REST API
- **[zod](https://www.npmjs.com/package/zod)** — Schema validation for tool parameters
- **[dotenv](https://www.npmjs.com/package/dotenv)** — Environment variable management

## License

MIT
