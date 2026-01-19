# API Setup Guide

This guide walks you through setting up GitHub and Jira API credentials for the Flow Engineering Dashboard.

## Prerequisites

- A GitHub account with access to the repository you want to track
- A Jira account with access to the project you want to track
- Admin or appropriate permissions on both platforms

---

## Part 1: GitHub API Setup

### Step 1: Create a Personal Access Token

1. **Navigate to GitHub Token Settings**
   - Go to https://github.com/settings/tokens
   - Or: Profile Picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Name: `VSM Dashboard` (or any descriptive name)
   - Expiration: Choose based on your needs (30 days, 60 days, 90 days, or No expiration)

3. **Select Required Scopes**

   Check these permissions:
   ```
   ✅ repo
      ├─ repo:status
      ├─ repo_deployment
      ├─ public_repo
      ├─ repo:invite
      └─ security_events

   ✅ read:org
      ├─ read:org
      └─ read:org:team

   ✅ read:user
      ├─ read:user
      └─ user:email
   ```

4. **Generate and Save Token**
   - Click **"Generate token"**
   - **CRITICAL:** Copy the token immediately
   - You won't be able to see it again!
   - Store it securely (e.g., password manager)

### Step 2: Get Repository Information

You need three pieces of information:

1. **GitHub Token** - The token you just created
2. **Organization/Username** - The repository owner
3. **Repository Name** - The repository you want to track

**Example:**
```
Repository URL: https://github.com/acme-corp/backend-api
├─ Organization: acme-corp
└─ Repository: backend-api
```

### Step 3: Configure GitHub Environment Variables

Edit `.env.local` and replace these values:

```bash
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GITHUB_ORG=acme-corp
NEXT_PUBLIC_GITHUB_REPO=backend-api
```

---

## Part 2: Jira API Setup

### Step 1: Create a Jira API Token

1. **Navigate to Atlassian Account Security**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Or: Profile Picture → Account settings → Security → API tokens

2. **Create API Token**
   - Click **"Create API token"**
   - Label: `VSM Dashboard`
   - Click **"Create"**
   - **CRITICAL:** Copy the token immediately
   - Store it securely

### Step 2: Get Jira Information

You need four pieces of information:

1. **Jira URL** - Your Atlassian domain
2. **Email** - Your Jira account email
3. **API Token** - The token you just created
4. **Project Key** - Your project identifier

**Finding Your Project Key:**

Method 1 - From URL:
```
Issue URL: https://acme.atlassian.net/browse/TEAM-123
                                              ^^^^ <- This is your project key
```

Method 2 - From Project Settings:
1. Go to your Jira project
2. Click Project settings (gear icon)
3. Look for "Key" in the Details section

**Common Project Key Examples:**
- `PROJ` - Generic project
- `TEAM` - Team project
- `DEV` - Development
- `BACKEND` - Backend team
- `MOBILE` - Mobile team

### Step 3: Configure Jira Environment Variables

Edit `.env.local` and replace these values:

```bash
NEXT_PUBLIC_JIRA_URL=https://acme.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=john.doe@acme.com
NEXT_PUBLIC_JIRA_API_TOKEN=ATATT3xFfGF0xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_JIRA_PROJECT_KEY=TEAM
```

---

## Part 3: Complete Configuration Example

Here's what your `.env.local` should look like with real values:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key-for-development-only

# GitHub API Configuration
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GITHUB_ORG=acme-corp
NEXT_PUBLIC_GITHUB_REPO=backend-api

# Jira API Configuration
NEXT_PUBLIC_JIRA_URL=https://acme.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=john.doe@acme.com
NEXT_PUBLIC_JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_JIRA_PROJECT_KEY=TEAM
```

---

## Part 4: Verify Configuration

### Step 1: Restart Development Server

After updating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Test API Connections

1. **Sign in to the dashboard**
   - Go to http://localhost:3001
   - Sign in with admin credentials: `admin@example.com` / `admin123`

2. **Check for Data**
   - The dashboard should load data from GitHub/Jira
   - Look for work items in the value stream
   - Check if metrics are calculated

3. **Check for Errors**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for API errors

### Common Issues and Solutions

**GitHub Issues:**

❌ `401 Unauthorized`
- Token is invalid or expired
- Generate a new token with correct scopes

❌ `404 Not Found`
- Organization or repository name is incorrect
- Check spelling and case sensitivity

❌ `403 Forbidden`
- Token doesn't have required permissions
- Regenerate token with `repo` and `read:org` scopes

**Jira Issues:**

❌ `401 Unauthorized`
- Email or API token is incorrect
- Verify email matches your Jira account
- Generate a new API token

❌ `404 Not Found`
- Jira URL or project key is incorrect
- Verify URL format: `https://your-domain.atlassian.net`
- Check project key is uppercase

❌ `403 Forbidden`
- Your account doesn't have access to the project
- Contact your Jira administrator

---

## Part 5: Security Best Practices

### 1. Protect Your Tokens

✅ **DO:**
- Store tokens in `.env.local` (already in `.gitignore`)
- Use environment variables
- Set token expiration dates
- Rotate tokens periodically
- Use a password manager

❌ **DON'T:**
- Commit tokens to git
- Share tokens in Slack/email
- Use the same token across multiple apps
- Store tokens in plain text files

### 2. Token Permissions

**Principle of Least Privilege:**
- Only grant necessary permissions
- For read-only dashboards, use read-only scopes
- For write operations, limit to specific repositories

### 3. Monitor Token Usage

**GitHub:**
- Check https://github.com/settings/tokens
- Review which apps are using your tokens
- Revoke unused tokens

**Jira:**
- Check https://id.atlassian.com/manage-profile/security/api-tokens
- Review active tokens
- Delete old tokens

---

## Part 6: Production Deployment

When deploying to production (e.g., Vercel):

### 1. Set Environment Variables in Vercel

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - Name: `NEXT_PUBLIC_GITHUB_TOKEN`
   - Value: Your token
   - Environment: Production (or all)

### 2. Use Different Tokens

**Best Practice:**
- Development: Personal token with broad access
- Production: Service account token with minimal access
- Testing: Separate token for testing

### 3. Secure Sensitive Variables

For production, consider:
- **Vercel Environment Variables** - Built-in encryption
- **HashiCorp Vault** - Enterprise secret management
- **AWS Secrets Manager** - Cloud-native secrets
- **GitHub Actions Secrets** - CI/CD integration

---

## Part 7: Alternative Authentication Methods

### GitHub App (Recommended for Production)

Instead of personal access tokens, create a GitHub App:

**Benefits:**
- More secure
- Fine-grained permissions
- Better rate limits
- Organization-level installation

**Setup:**
1. Go to https://github.com/settings/apps/new
2. Create a GitHub App
3. Install it on your organization
4. Use installation token instead of personal token

### Jira OAuth 2.0 (Advanced)

For better security in production:

1. Create an OAuth 2.0 app in Jira
2. Implement OAuth flow
3. Store refresh tokens securely

---

## Need Help?

**GitHub API Documentation:**
- https://docs.github.com/en/rest

**Jira API Documentation:**
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/

**Common Questions:**

Q: How often do tokens expire?
A: GitHub - You set expiration (or never). Jira - Tokens don't expire unless revoked.

Q: Can I use the same token for multiple projects?
A: Yes, but it's better to create separate tokens for security.

Q: What if my token is compromised?
A: Immediately revoke it and generate a new one. Check access logs for unauthorized usage.

---

## Quick Reference

**Files to Edit:**
- `.env.local` - Local development environment variables

**Never Commit:**
- `.env.local` - Already in `.gitignore`
- Actual token values

**Always Commit:**
- `.env.example` - Template with placeholder values

**Test URLs:**
- GitHub API Test: https://api.github.com/user (with your token)
- Jira API Test: https://your-domain.atlassian.net/rest/api/3/myself

---

## Next Steps

After configuring APIs:

1. ✅ Restart dev server
2. ✅ Sign in to dashboard
3. ✅ Verify data appears
4. ✅ Customize VSM stages to match your workflow
5. ✅ Set up team mappings
6. ✅ Configure work type labels
7. ✅ Share with your team!

Happy tracking! 🚀
