import 'dotenv/config';
import axios from 'axios';

// Jira configuration (reusing from existing setup)
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = 'AMZ';

const auth = {
    username: JIRA_EMAIL,
    password: JIRA_API_TOKEN,
};

// Step 1: Fetch all issues in "Ready to Merge" status
async function fetchReadyToMergeIssues() {
    const jql = `project=${JIRA_PROJECT_KEY} AND status="Ready for merging" AND "QA Engineer[User Picker (single user)]"=EMPTY`;
    let allIssues = [];
    let nextPageToken = null;
    const maxResults = 100;

    while (true) {
        const url = `${JIRA_BASE_URL}/rest/api/3/search/jql`;
        const body = {
            jql,
            fields: ['summary', 'status'],
            maxResults,
        };
        if (nextPageToken) body.nextPageToken = nextPageToken;

        console.log(`Fetching issues${nextPageToken ? ' (next page)' : ''}...`);

        const response = await axios.post(url, body, { auth });
        const issues = response.data.issues || [];
        allIssues = allIssues.concat(issues);

        console.log(`  Fetched ${issues.length} issues (total so far: ${allIssues.length})`);

        nextPageToken = response.data.nextPageToken;
        if (!nextPageToken || issues.length === 0) break;
    }

    return allIssues;
}

// Step 2: Get available transitions for an issue and find "Done"
async function getDoneTransitionId(issueKey) {
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`;
    const response = await axios.get(url, { auth });
    const transitions = response.data.transitions || [];

    // Look for a transition that leads to "Done" status
    const doneTransition = transitions.find(
        (t) => t.name.toLowerCase() === 'done' || t.to?.name?.toLowerCase() === 'done'
    );

    if (!doneTransition) {
        console.log(`  Available transitions for ${issueKey}:`, transitions.map(t => `${t.name} (id: ${t.id}, to: ${t.to?.name})`));
    }

    return doneTransition?.id || null;
}

// Step 3: Transition an issue to Done
async function transitionIssueToDone(issueKey, transitionId) {
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`;
    await axios.post(url, { transition: { id: transitionId } }, { auth });
}

// Main
async function main() {
    try {
        console.log('=== Jira Bulk Move: Ready to Merge → Done ===\n');

        // Fetch issues
        const issues = await fetchReadyToMergeIssues();
        if (issues.length === 0) {
            console.log('\nNo issues found in "Ready to Merge" status.');
            return;
        }

        console.log(`\nFound ${issues.length} issue(s) in "Ready to Merge" status:\n`);
        issues.forEach((issue) => {
            console.log(`  ${issue.key} - ${issue.fields.summary}`);
        });

        // Get the Done transition ID from the first issue (should be same for all)
        console.log('\nFinding "Done" transition...');
        const transitionId = await getDoneTransitionId(issues[0].key);
        if (!transitionId) {
            console.error('\nCould not find a "Done" transition. Check the available transitions printed above.');
            console.log('You may need to update the transition name in the script.');
            return;
        }
        console.log(`Found "Done" transition with ID: ${transitionId}\n`);

        // Move each issue
        let successCount = 0;
        let failCount = 0;

        for (const issue of issues) {
            try {
                process.stdout.write(`  Moving ${issue.key} to Done...`);
                await transitionIssueToDone(issue.key, transitionId);
                console.log(' ✓');
                successCount++;
            } catch (err) {
                console.log(` ✗ (${err.response?.data?.errorMessages?.join(', ') || err.message})`);
                failCount++;
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`  Moved to Done: ${successCount}`);
        if (failCount > 0) console.log(`  Failed: ${failCount}`);
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();
