# Atlassian Jira MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for Atlassian Jira Cloud. Manage projects, issues, sprints, comments, and workflow transitions — directly from Claude Code or any MCP-compatible AI client.

## Features

- **12 tools** for complete Jira workflow management
- JQL-powered issue search
- Sprint and board management
- Workflow transitions and status changes
- Issue creation, updates, and assignments
- Comment management
- Works with Claude Code, Claude Desktop, Cursor, and other MCP clients

## Prerequisites

- **Node.js** 18+
- **Jira Cloud** account (e.g., `https://yourorg.atlassian.net`)
- **Atlassian API token** — [Generate one here](https://id.atlassian.com/manage-profile/security/api-tokens)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/anssingh3c/ansh-atlassian-jira-mcp.git
cd ansh-atlassian-jira-mcp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
JIRA_BASE_URL=https://yourorg.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-api-token
```

> **Getting an API token:** Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens), click **Create API token**, give it a label, and copy the value.

### 3. Verify it works

```bash
npm start
# Output: JIRA MCP server running on stdio
```

## Integration

### Claude Code

Add to your project's `.mcp.json` or `~/.claude/.mcp.json` for global access:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://yourorg.atlassian.net",
        "JIRA_EMAIL": "you@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://yourorg.atlassian.net",
        "JIRA_EMAIL": "you@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_projects` | List accessible Jira projects | `maxResults`, `startAt` |
| `get_issue` | Get issue details by key | `issueKey` (required) |
| `search_issues` | Search issues using JQL | `jql` (required), `fields`, `maxResults` |
| `create_issue` | Create a new issue | `projectKey`, `issueType`, `summary` (required); `description`, `priority`, `labels` |
| `update_issue` | Update fields on an existing issue | `issueKey` (required); `summary`, `description`, `priority`, `labels` |
| `assign_issue` | Assign or unassign an issue | `issueKey`, `accountId` (required; `null` to unassign) |
| `get_transitions` | List available workflow transitions | `issueKey` (required) |
| `transition_issue` | Move issue through a workflow | `issueKey`, `transitionId` (required) |
| `add_comment` | Add a comment to an issue | `issueKey`, `body` (required) |
| `get_comments` | List comments on an issue | `issueKey` (required), `maxResults` |
| `list_sprints` | List sprints for a board | `boardId` (required), `state` |
| `get_sprint_issues` | Get issues in a sprint | `sprintId` (required), `fields`, `maxResults` |

## Project Structure

```
├── mcp-server/
│   ├── index.js              # Server entry point (stdio transport)
│   ├── jira-client.js        # Jira REST API client (v3 + Agile v1.0)
│   ├── formatters.js         # Output formatting (ADF to plain text, markdown tables)
│   └── tools/
│       ├── list-projects.js
│       ├── get-issue.js
│       ├── search-issues.js
│       ├── create-issue.js
│       ├── update-issue.js
│       ├── assign-issue.js
│       ├── get-transitions.js
│       ├── transition-issue.js
│       ├── add-comment.js
│       ├── get-comments.js
│       ├── list-sprints.js
│       └── get-sprint-issues.js
├── .env.example              # Environment variable template
├── package.json
└── README.md
```

## License

MIT
