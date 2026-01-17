/**
 * API Connection Test Script
 *
 * Tests connectivity to GitHub and Jira APIs
 * Run with: npx tsx scripts/test-api-connection.ts
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_ORG = process.env.NEXT_PUBLIC_GITHUB_ORG;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;

const JIRA_URL = process.env.NEXT_PUBLIC_JIRA_URL;
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY;

console.log('\n🔍 API Connection Test\n');
console.log('='.repeat(60));

// Test GitHub Connection
async function testGitHub() {
  console.log('\n📦 Testing GitHub API Connection...\n');

  if (!GITHUB_TOKEN || !GITHUB_ORG || !GITHUB_REPO) {
    console.log('❌ GitHub configuration missing!');
    console.log(`   Token: ${GITHUB_TOKEN ? '✓ Set' : '✗ Missing'}`);
    console.log(`   Org: ${GITHUB_ORG || '✗ Missing'}`);
    console.log(`   Repo: ${GITHUB_REPO || '✗ Missing'}`);
    return false;
  }

  console.log(`   Configuration:`);
  console.log(`   - Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
  console.log(`   - Organization: ${GITHUB_ORG}`);
  console.log(`   - Repository: ${GITHUB_REPO}`);
  console.log('');

  try {
    // Test 1: Verify token
    console.log('   Test 1: Verifying token...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Token verification failed: ${userResponse.status} ${userResponse.statusText}`);
    }

    const user = await userResponse.json();
    console.log(`   ✅ Token valid for user: ${user.login}`);
    console.log('');

    // Test 2: Access repository
    console.log('   Test 2: Accessing repository...');
    const repoResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!repoResponse.ok) {
      throw new Error(`Repository access failed: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repo = await repoResponse.json();
    console.log(`   ✅ Repository accessible: ${repo.full_name}`);
    console.log(`   - Description: ${repo.description || 'N/A'}`);
    console.log(`   - Private: ${repo.private ? 'Yes' : 'No'}`);
    console.log(`   - Default branch: ${repo.default_branch}`);
    console.log('');

    // Test 3: Fetch recent issues
    console.log('   Test 3: Fetching recent issues...');
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}/issues?state=all&per_page=5`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!issuesResponse.ok) {
      throw new Error(`Issues fetch failed: ${issuesResponse.status} ${issuesResponse.statusText}`);
    }

    const issues = await issuesResponse.json();
    console.log(`   ✅ Found ${issues.length} recent issues`);

    if (issues.length > 0) {
      console.log(`   - Latest issue: #${issues[0].number} - ${issues[0].title}`);
      console.log(`   - State: ${issues[0].state}`);
      console.log(`   - Created: ${new Date(issues[0].created_at).toLocaleDateString()}`);
    }
    console.log('');

    // Test 4: Check rate limit
    console.log('   Test 4: Checking rate limit...');
    const rateLimitResponse = await fetch('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const rateLimit = await rateLimitResponse.json();
    const remaining = rateLimit.resources.core.remaining;
    const limit = rateLimit.resources.core.limit;
    const resetDate = new Date(rateLimit.resources.core.reset * 1000);

    console.log(`   ✅ Rate limit: ${remaining}/${limit} remaining`);
    console.log(`   - Resets at: ${resetDate.toLocaleString()}`);
    console.log('');

    console.log('✅ GitHub API: All tests passed!\n');
    return true;
  } catch (error) {
    console.log(`❌ GitHub API Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return false;
  }
}

// Test Jira Connection
async function testJira() {
  console.log('📋 Testing Jira API Connection...\n');

  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
    console.log('❌ Jira configuration missing!');
    console.log(`   URL: ${JIRA_URL || '✗ Missing'}`);
    console.log(`   Email: ${JIRA_EMAIL || '✗ Missing'}`);
    console.log(`   Token: ${JIRA_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
    console.log(`   Project Key: ${JIRA_PROJECT_KEY || '✗ Missing'}`);
    return false;
  }

  console.log(`   Configuration:`);
  console.log(`   - URL: ${JIRA_URL}`);
  console.log(`   - Email: ${JIRA_EMAIL}`);
  console.log(`   - Token: ${JIRA_API_TOKEN.substring(0, 15)}...`);
  console.log(`   - Project: ${JIRA_PROJECT_KEY}`);
  console.log('');

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  try {
    // Test 1: Verify authentication
    console.log('   Test 1: Verifying authentication...');
    const myselfResponse = await fetch(`${JIRA_URL}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!myselfResponse.ok) {
      const errorText = await myselfResponse.text();
      throw new Error(`Authentication failed: ${myselfResponse.status} ${myselfResponse.statusText}\n${errorText}`);
    }

    const user = await myselfResponse.json();
    console.log(`   ✅ Authenticated as: ${user.displayName}`);
    console.log(`   - Email: ${user.emailAddress}`);
    console.log(`   - Account ID: ${user.accountId}`);
    console.log('');

    // Test 2: Access project
    console.log('   Test 2: Accessing project...');
    const projectResponse = await fetch(
      `${JIRA_URL}/rest/api/3/project/${JIRA_PROJECT_KEY}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      throw new Error(`Project access failed: ${projectResponse.status} ${projectResponse.statusText}\n${errorText}`);
    }

    const project = await projectResponse.json();
    console.log(`   ✅ Project accessible: ${project.name}`);
    console.log(`   - Key: ${project.key}`);
    console.log(`   - Project Type: ${project.projectTypeKey}`);
    console.log(`   - Lead: ${project.lead?.displayName || 'N/A'}`);
    console.log('');

    // Test 3: Fetch recent issues
    console.log('   Test 3: Fetching recent issues...');
    const jql = `project = ${JIRA_PROJECT_KEY} ORDER BY created DESC`;
    const searchResponse = await fetch(
      `${JIRA_URL}/rest/api/3/search/jql`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jql: jql,
          maxResults: 5,
          fields: ['summary', 'status', 'issuetype', 'created'],
        }),
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Issue search failed: ${searchResponse.status} ${searchResponse.statusText}\n${errorText}`);
    }

    const searchResults = await searchResponse.json();
    console.log(`   ✅ Found ${searchResults.total} total issues (showing 5)`);

    if (searchResults.issues && searchResults.issues.length > 0) {
      const issue = searchResults.issues[0];
      console.log(`   - Latest issue: ${issue.key} - ${issue.fields.summary}`);
      console.log(`   - Status: ${issue.fields.status.name}`);
      console.log(`   - Type: ${issue.fields.issuetype.name}`);
      console.log(`   - Created: ${new Date(issue.fields.created).toLocaleDateString()}`);
    }
    console.log('');

    // Test 4: Get available statuses
    console.log('   Test 4: Fetching project statuses...');
    const statusesResponse = await fetch(
      `${JIRA_URL}/rest/api/3/project/${JIRA_PROJECT_KEY}/statuses`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      }
    );

    if (statusesResponse.ok) {
      const statuses = await statusesResponse.json();
      const allStatuses = new Set();
      statuses.forEach((issueType: any) => {
        issueType.statuses?.forEach((status: any) => {
          allStatuses.add(status.name);
        });
      });
      console.log(`   ✅ Available statuses: ${Array.from(allStatuses).join(', ')}`);
    }
    console.log('');

    console.log('✅ Jira API: All tests passed!\n');
    return true;
  } catch (error) {
    console.log(`❌ Jira API Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting API connectivity tests...\n');

  const githubResult = await testGitHub();
  console.log('='.repeat(60));
  const jiraResult = await testJira();
  console.log('='.repeat(60));

  console.log('\n📊 Test Summary:\n');
  console.log(`   GitHub API: ${githubResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Jira API: ${jiraResult ? '✅ PASS' : '❌ FAIL'}`);

  if (githubResult && jiraResult) {
    console.log('\n🎉 All API connections successful!\n');
    console.log('You can now use the dashboard at http://localhost:3001\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some API connections failed. Please check the errors above.\n');
    console.log('Common issues:');
    console.log('  - Invalid or expired tokens');
    console.log('  - Incorrect organization/project names');
    console.log('  - Missing permissions on the token');
    console.log('  - Network connectivity issues\n');
    process.exit(1);
  }
}

runTests();
