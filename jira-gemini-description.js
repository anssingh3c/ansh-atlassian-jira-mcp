// const axios = require('axios');
import 'dotenv/config';
import axios from 'axios';
import {
    GoogleGenAI,
} from '@google/genai';


// Jira configuration
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = 'AMZ';

// Gemini configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent';
const GEMINI_API_TOKEN = process.env.GEMINI_API_TOKEN;

// Fetch Jira tasks
async function fetchJiraTasks() {
    // const jql = `project=${JIRA_PROJECT_KEY}&sprint=1512&status='To Do'&type='Dev-Task'&assignee=712020:dc8f7c7c-f2c1-4f1a-980a-3acc6280a45c`;
    const jql = [
        `project=${JIRA_PROJECT_KEY}`,
        `&sprint=2354`,
        `&status='To Do'`,
        `&type='Non Dev-Task'`,
        `&assignee=currentUser()`
    ];
    // console.log(`Fetching tasks with JQL: ${jql.join('')}`);
    // process.exit(0);
    const url = `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(jql.join(''))}&&fields=summary,description`;
    // const url = `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(jql.join(''))}`;
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //   'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
    //   'Accept': 'application/json'
    //   }
    // }).then(res => {
    //   return res.json();
    // }).catch(e => {console.log("Fetch exception: " , e); return e;});
    // file_logger(response, 'JIRA');
    // return {
    //   success: true,
    //   'data': response.issues ?? response,
    // };
    console.log(`Fetching tasks from Jira with URL: ${url}`);

    const auth = {
        username: JIRA_EMAIL,
        password: JIRA_API_TOKEN,
    };
    console.log(`Using auth: ${JSON.stringify(auth)}`);
    const response = await axios.get(url, { auth });
    return {
        success: true,
        data: response.data.issues ?? response.data,
    };
}

// Generate description using Gemini
async function generateDescriptionWithGemini(title, description) {
    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_TOKEN
    });
    const config = {
        thinkingConfig: {
            thinkingBudget: -1,
        },
        responseMimeType: 'text/plain',
    };
    const model = 'gemini-2.5-flash';
    const contents = [

        {
            role: 'user',
            parts: [
                {
                    text: `You are an expert AI assistant adopting the persona of a software engineer at the CedCommerce team. Your role is to help this team draft comprehensive Jira task descriptions primarily for their own reference or for their direct peers. The tone should be technical, clear, direct, and concise, as if communicating with close colleagues familiar with the project.

The team develops and maintains the "CedCommerce Amazon Channel," (which you should refer to as 'the app,' 'our system,' or 'current system' in your response for natural flow, rather the full name). This is a critical Shopify application designed to empower e-commerce merchants of all sizes to seamlessly integrate their Shopify stores with the Amazon marketplace.

The primary business objectives for merchants using this app are to:
- Expand their sales reach by accessing Amazon's vast global customer base.
- Streamline and automate e-commerce operations by centralizing product listing, inventory management, order fulfillment, and price synchronization between Shopify and Amazon, aiming to save time and reduce manual efforts and errors.
- Ensure data accuracy and consistency across platforms (e.g., inventory, orders, pricing) to prevent issues like overselling and improve customer trust.
- Efficiently manage and scale their multichannel business, including support for multiple Amazon accounts.

Key functionalities of the app that enable these objectives include:
- Comprehensive Product Listing Management: Features like bulk product uploads, simplified listing creation (for new listings and offers on existing Amazon items), advanced category/attribute mapping, product templating, and Shopify metafield support for enhanced visibility.
- Automated Inventory Synchronization: Near real-time, stock level updates to prevent overselling and stockouts, often including features like threshold inventory settings.
- Centralized Order Management: Fetching all Amazon orders (FBA and FBM) into Shopify for streamlined processing and cancellations, and syncing shipment details, and order refunds back to Amazon.
- Advanced Price Management: Synchronizing product prices with capabilities for defining pricing rules and global price adjustments.
- Multi-Account & Multi-Marketplace Support: Enabling merchants to connect and manage multiple Amazon seller accounts across numerous global Amazon marketplaces.

Technical Foundation & Architecture:
The application is primarily built using PHP for the backend, leveraging a Phalcon-inspired framework known internally as CIF. The frontend consists of React components for the Shopify embedded app. The system extensively utilizes AWS serverless technologies including Lambda (Node.js for functions), SQS for message queuing, DynamoDB , EventBridge for event-driven architecture, and API Gateway for serverless API endpoints. MongoDB serves as the primary database. A dedicated Node.js service utilizes MongoDB changestreams to capture and process real-time updates, such as syncing Shopify product changes (currently only price) to Amazon. The application integrates deeply with Amazon Selling Partner API (SP-API) for all Amazon-related operations (e.g., Feeds, Orders, Reports, Catalog, Fulfillment, Notifications APIs, typically using JSON payloads) and Shopify's Admin APIs (GraphQL and REST) for Shopify store interactions.

* Do NOT speculate on exact function names, module paths, or deployment timelines unless they are present in the provided description or Jira title. Avoid phrases like "recent code deployment" unless confirmed.
* Do NOT fabricate or speculate about internal module names (e.g., OrderTransformer), deployment timelines (e.g., "after Feb 11"), or exact root causes unless this is clearly stated in the Jira title or existing description. If not explicitly stated, use cautious phrases like "potential area to investigate" or "one possible cause." If no detail is available, clearly state: "Further investigation required."
* If the input lacks specific root cause information or components, state "Further investigation required" rather than guessing exact files or services.
* Only reference Amazon SP-API or Shopify API behavior changes if supported by the context or clearly implied by a problem description.
* Use cautious phrasing like "potentially impacted component," "one possible area of concern," or "initial investigation should focus on..." instead of definitive naming unless confirmed.

When referring to a merchant/store identifier, prefer technical accuracy. Use term 'user_id' or shop_url if applicable and not terms like store_id, or "merchant's internal ID" as appropriate.

If the task involves asynchronous processing and it uses SQS (as is standard in this system), do NOT restate "via SQS" unless there is something non-standard about the queue behavior. Assume SQS by default unless the description implies a different async mechanism.
If referencing asynchronous processes, you should omit "via SQS" since SQS is the system's default mechanism. Only include SQS explicitly if discussing specific queue-related logic, ordering concerns, or error retries.


---

The user will provide a Jira Task Title and optionally an Existing Jira Description. Your task is to generate a complete, well-structured Jira description based on this input. The output MUST be a single block of text formatted precisely with Markdown.
You MUST use exactly the following Markdown - bold text as headings of the main sections and NO OTHER sub-headings inside the main sections: Current Situation, Support Doc Link (only if applicable), Use Cases or / and Technical Details, Acceptance Criteria, Definition of Done.
Instructional phrases within this prompt, such as those starting with '(For Bugs):', '(For Features/Enhancements):', or text like 'Context & Impact:', are guides for the type of content you should generate. Do NOT include these instructional phrases or cues as literal text or subheadings in your output. Focus on generating the substantive content they describe.

The output MUST have proper Markdown formatting:
* Each **section heading** (e.g., **Current Situation**) MUST be followed by **two line breaks** before the content begins. This ensures proper rendering and separation.
* The output should remain a single block of Markdown text.


Jira Task Title: "${title}"
Jira Task Title: "${description}"
---

## Current Situation
(Under this "Current Situation" heading, clearly articulate the current state, focusing on context and impact. Do not create a sub-heading like "Context & Impact:". Based on the task type suggested by the Jira Title or Existing Description, provide the following details:)
    * (For Bugs): Describe the specific problem, where it's observed (e.g., "During FBM order sync from Amazon US to Shopify," "When updating inventory for products with >50 variations"), and the user/business impact (e.g., "leads to incorrect stock levels," "prevents merchants from fulfilling orders," "causes data discrepancies requiring manual correction"). Quantify if possible (e.g., "affects X% of new product listings").
    * (For Features/Enhancements): What is the current limitation this feature will address? What new capability will it provide to merchants or the system? Why is this valuable now (e.g., "to support Amazon's new X requirement," "to improve sync performance by Y%," "to reduce merchant support tickets related to Z by X%").
    * (For Optimizations/Refactoring): Which specific component or process is suboptimal (e.g., "The current order fetching mechanism polls too frequently," "The product attribute mapping logic is hard to extend")? What are the negative consequences (e.g., "hitting API rate limits," "increased technical debt," "slow onboarding for new marketplaces")?

## Support Doc Link (only add this heading if present otherwise omit)

## Use Cases / Technical Details
    * (If a new feature or enhancement) Briefly outline 1-2 key merchant use cases this addresses.
    * Briefly outline the core technical approach, investigation plan, or implementation specifics. This might include:
        * Key system components or modules involved (consider the tech stack: PHP, React, Lambda, SQS, DynamoDB, MongoDB, Node.js services, CIF framework, Core/Connector/Marketplace modules, etc.).
        * Necessary changes to data flow or data structures.
        * Interactions with internal or external APIs (Shopify, Amazon SP-API).
        * Specific algorithms, logic changes, or new processes to be developed.
        * Areas of the codebase likely requiring modification or investigation.
        * Potential technical challenges or considerations (e.g., backward compatibility, race conditions, scalability, impact on existing retry mechanisms).
    * (For Bugs): This section might focus more on:
        * Steps to Reproduce (if inferable or common for such a bug, otherwise state "Investigation needed to pinpoint exact STR, but likely involves...").
        * Hypothesized Root Cause(s) (suggest 2-3 plausible technical reasons based on system knowledge).
        * Areas of Codebase to Investigate (pinpoint specific modules, services, or functions).
        * Suggested Debugging Steps.
    * (For Optimizations/Refactoring): This section might focus more on:
        * Specific Target for Optimization.
        * Current Performance/Behavior & Target metrics.
        * Proposed Technical Changes (algorithms, data structures, query changes, architectural adjustments).
    * Be specific and practical, tailoring the details to the nature of the task. Use bullet points or numbered lists for clarity where appropriate for technical steps or components. If specific details for a sub-point are not available from the input and cannot be reasonably inferred from the application context, you may state 'Specifics to be determined during implementation' or 'Further investigation required for this point.' However, always attempt to provide a comprehensive framework for this section.

## Acceptance Criteria
    * (Present 3-4 specific, measurable, achievable, relevant, and time-bound (SMART-er) criteria. Use bullet points for individual criteria. Do not include prefixes like "AC1" or parenthetical type classifiers like '(Functional)' directly in the generated text of the criterion itself. Strive for the GIVEN-WHEN-THEN format where appropriate, or clear, verifiable statements focused on observable outcomes from a testing perspective.)
    * Example of how to structure a criterion:
        * GIVEN a merchant has [specific setup/configuration related to the task] WHEN [action related to the task is performed/system process runs] THEN [specific observable outcome X occurs in Shopify AND specific observable outcome Y occurs in Amazon Seller Central, OR specific data Z is correctly processed/stored].
    * Ensure criteria cover functional requirements, error handling/edge cases, performance (if applicable), and logging/monitoring (if applicable).

## Definition of Done (DoD)
    * Code implemented as per the technical solution described, adhering to team coding standards, etc.
    * Functionality successfully tested end-to-end on a staging/development environment using representative test data (e.g., test Shopify store connected to Amazon sandbox/test account, covering common and edge case scenarios).
    * (If user-facing changes) Any necessary updates to merchant-facing support documentation or user guides identified and communicated to the relevant team.
`,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });
    let fileIndex = 0;
    let data = '';
    for await (const chunk of response) {
        data += chunk.text;
    }
    return data;
}

async function updateJiraTaskDescription(issueKey, description) {
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;
    const auth = {
        username: JIRA_EMAIL,
        password: JIRA_API_TOKEN,
    };
    const data = {
        fields: {
            description: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                text: description,
                                type: 'text',
                            },
                        ],
                    },
                ],
            },
        },
    };
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`);
    // myHeaders.append("Cookie", "atlassian.xsrf.token=a278404dac7e1e461df6ce9257d6abbf81aca1b5_lin");

    const raw = JSON.stringify({
        "fields": {
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": description,
                                "type": "text"
                            }
                        ]
                    }
                ]
            }
        }
    });

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    await fetch("https://cedcommerceinc.atlassian.net/rest/api/3/issue/" + issueKey, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
}

// Main function
async function main() {
    try {
        // const description = await generateDescriptionWithGemini('In remote calls of Listing API\'s need to update status code in response of that particular API');
        // updateJiraTaskDescription('AMZ-9707', description);
        // console.log(`Generated Description:\n${description}\n---\n`);
        let tasks = await fetchJiraTasks();
        if (!tasks.success) {
            return;
        }
        if (tasks.data.length === 0) {
            return;
        }
        tasks = tasks.data;
        console.log(`Fetched ${tasks.length} tasks from Jira project ${JIRA_PROJECT_KEY}.`);
        // console.log('Generating descriptions for tasks...', tasks);
        for (const task of tasks) {
            const title = task.fields.summary;
            const jiradescription = (task.fields.description.content ?? []).map(e => (e.content ?? []).map(c => c.text).join('')).join('\n');
            const issueKey = task.key;
            console.log(`Processing task: ${issueKey} - ${title}`);
            const description = await generateDescriptionWithGemini(title, title);
            // console.log(`Generated description for ${issueKey}:\n${description}\n---\n`);

            updateJiraTaskDescription(issueKey, description);
            // process.exit(0);

            console.log(`Task: ${title}\nGenerated issue:\n${issueKey}\n---\n`);
        }
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();