import axios from 'axios';

function validateEnv() {
  const required = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in .env or pass via MCP server config.'
    );
  }
}

function createClient() {
  validateEnv();

  const baseURL = process.env.JIRA_BASE_URL.replace(/\/+$/, '');
  const auth = {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  };

  const rest = axios.create({
    baseURL: `${baseURL}/rest/api/3`,
    auth,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  const agile = axios.create({
    baseURL: `${baseURL}/rest/agile/1.0`,
    auth,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  return { rest, agile, baseURL };
}

let clientInstance = null;

function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/** Extract a human-readable error message from a JIRA API error response. */
function extractJiraError(err) {
  if (err.response?.data) {
    const d = err.response.data;
    const parts = [];
    if (d.errorMessages?.length) parts.push(...d.errorMessages);
    if (d.errors && typeof d.errors === 'object') {
      for (const [field, msg] of Object.entries(d.errors)) {
        parts.push(`${field}: ${msg}`);
      }
    }
    if (parts.length) return parts.join('\n');
    if (typeof d === 'string') return d;
  }
  return err.message || String(err);
}

// ── REST API v3 helpers ──

async function getIssue(issueKey, fields) {
  const { rest } = getClient();
  const params = {};
  if (fields) params.fields = fields.join(',');
  const res = await rest.get(`/issue/${issueKey}`, { params });
  return res.data;
}

async function searchIssues(jql, fields, maxResults = 50, startAt = 0) {
  const { rest } = getClient();
  const params = { jql, maxResults };
  if (fields) params.fields = fields.join(',');
  if (startAt) params.startAt = startAt;
  const res = await rest.get('/search/jql', { params });
  return res.data;
}

async function createIssue(fields) {
  const { rest } = getClient();
  const res = await rest.post('/issue', { fields });
  return res.data;
}

async function updateIssue(issueKey, fields) {
  const { rest } = getClient();
  await rest.put(`/issue/${issueKey}`, { fields });
}

async function transitionIssue(issueKey, transitionId) {
  const { rest } = getClient();
  await rest.post(`/issue/${issueKey}/transitions`, {
    transition: { id: transitionId },
  });
}

async function addComment(issueKey, bodyAdf) {
  const { rest } = getClient();
  const res = await rest.post(`/issue/${issueKey}/comment`, { body: bodyAdf });
  return res.data;
}

async function getComments(issueKey, startAt = 0, maxResults = 50) {
  const { rest } = getClient();
  const res = await rest.get(`/issue/${issueKey}/comment`, {
    params: { startAt, maxResults },
  });
  return res.data;
}

async function listProjects(startAt = 0, maxResults = 50) {
  const { rest } = getClient();
  const res = await rest.get('/project/search', {
    params: { startAt, maxResults },
  });
  return res.data;
}

async function getTransitions(issueKey) {
  const { rest } = getClient();
  const res = await rest.get(`/issue/${issueKey}/transitions`);
  return res.data.transitions;
}

async function assignIssue(issueKey, accountId) {
  const { rest } = getClient();
  await rest.put(`/issue/${issueKey}/assignee`, { accountId });
}

// ── Agile API helpers ──

async function listSprints(boardId, state, startAt = 0, maxResults = 50) {
  const { agile } = getClient();
  const params = { startAt, maxResults };
  if (state) params.state = state;
  const res = await agile.get(`/board/${boardId}/sprint`, { params });
  return res.data;
}

async function getSprintIssues(sprintId, fields, startAt = 0, maxResults = 50) {
  const { agile } = getClient();
  const params = { startAt, maxResults };
  if (fields) params.fields = fields.join(',');
  const res = await agile.get(`/sprint/${sprintId}/issue`, { params });
  return res.data;
}

export {
  getClient,
  extractJiraError,
  getIssue,
  searchIssues,
  createIssue,
  updateIssue,
  transitionIssue,
  addComment,
  getComments,
  listProjects,
  getTransitions,
  assignIssue,
  listSprints,
  getSprintIssues,
};
