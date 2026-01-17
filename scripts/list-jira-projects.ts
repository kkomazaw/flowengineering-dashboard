/**
 * List Jira Projects Script
 *
 * Lists all available Jira projects to help find the correct project key
 * Run with: npx tsx scripts/list-jira-projects.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const JIRA_URL = process.env.NEXT_PUBLIC_JIRA_URL;
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;

async function listProjects() {
  console.log('\n📋 Jira Projects List\n');
  console.log('='.repeat(60));

  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    console.log('❌ Jira configuration missing in .env.local');
    process.exit(1);
  }

  console.log(`\nConnecting to: ${JIRA_URL}`);
  console.log(`As: ${JIRA_EMAIL}\n`);

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  try {
    // Fetch all projects
    const response = await fetch(`${JIRA_URL}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const projects = await response.json();

    if (projects.length === 0) {
      console.log('⚠️  No projects found. You may not have access to any projects.');
      console.log('\nPlease check:');
      console.log('  1. You have access to at least one Jira project');
      console.log('  2. Your Jira administrator has granted you permissions');
      process.exit(0);
    }

    console.log(`✅ Found ${projects.length} project(s):\n`);
    console.log('='.repeat(60));

    projects.forEach((project: any, index: number) => {
      console.log(`\n${index + 1}. ${project.name}`);
      console.log(`   Key: ${project.key} 👈 Use this in .env.local`);
      console.log(`   Type: ${project.projectTypeKey}`);
      console.log(`   Lead: ${project.lead?.displayName || 'N/A'}`);

      if (project.description) {
        console.log(`   Description: ${project.description}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📝 To use a project, update your .env.local file:\n');
    console.log(`   NEXT_PUBLIC_JIRA_PROJECT_KEY=${projects[0].key}`);
    console.log('\n');

  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

listProjects();
