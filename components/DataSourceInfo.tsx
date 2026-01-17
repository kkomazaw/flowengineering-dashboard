"use client";

interface DataSourceInfoProps {
  lastUpdated?: Date | null;
}

export default function DataSourceInfo({ lastUpdated }: DataSourceInfoProps) {
  const githubOrg = process.env.NEXT_PUBLIC_GITHUB_ORG;
  const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  const jiraUrl = process.env.NEXT_PUBLIC_JIRA_URL;
  const jiraProjectKey = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY;

  // Extract domain name from Jira URL
  const jiraDomain = jiraUrl
    ? new URL(jiraUrl).hostname.replace(".atlassian.net", "")
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* GitHub Info */}
          {githubOrg && githubRepo ? (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-xs text-gray-500">GitHub</div>
                <div className="text-sm font-medium text-gray-900">
                  {githubOrg}/{githubRepo}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-xs text-gray-500">GitHub</div>
                <div className="text-sm text-gray-400 italic">未設定</div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300" />

          {/* Jira Info */}
          {jiraDomain && jiraProjectKey ? (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">Jira</div>
                <div className="text-sm font-medium text-gray-900">
                  {jiraDomain} / {jiraProjectKey}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">Jira</div>
                <div className="text-sm text-gray-400 italic">未設定</div>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              最終更新: {lastUpdated.toLocaleDateString("ja-JP")}{" "}
              {lastUpdated.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Connection Status Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              githubOrg && githubRepo ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-xs text-gray-600">
            GitHub {githubOrg && githubRepo ? "接続中" : "未接続"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <div
            className={`w-2 h-2 rounded-full ${
              jiraDomain && jiraProjectKey ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-xs text-gray-600">
            Jira {jiraDomain && jiraProjectKey ? "接続中" : "未接続"}
          </span>
        </div>
      </div>
    </div>
  );
}
