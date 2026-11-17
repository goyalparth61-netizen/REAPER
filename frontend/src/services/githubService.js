/**
 * GitHub Service Interface for REAPER
 * 
 * Hackathon Notice:
 * Real GitHub App OAuth credentials and webhook secrets will be integrated during the hackathon.
 * This service provides a robust, typed interface for authentication state,
 * repository discovery, and branch selection with clear separation of real vs preview data.
 */

const STORAGE_KEY_GITHUB_DEMO = "reaper_github_demo_enabled";
const STORAGE_KEY_GITHUB_AUTH = "reaper_github_auth_state";

// Open-source sample repositories strictly for preview / UI verification
export const DEMO_REPOSITORIES = [
  {
    id: "repo-1",
    name: "payment-gateway",
    owner: "reaper-engine",
    fullName: "reaper-engine/payment-gateway",
    defaultBranch: "main",
    visibility: "private",
    language: "TypeScript",
    description: "Distributed payment processing service with idempotency checks",
    isDemo: true,
    lastScan: "Clean • 2 hrs ago"
  },
  {
    id: "repo-2",
    name: "auth-service",
    owner: "reaper-engine",
    fullName: "reaper-engine/auth-service",
    defaultBranch: "main",
    visibility: "private",
    language: "Go",
    description: "JWT & OAuth2 session management microservice",
    isDemo: true,
    lastScan: "Failing CI • 14 mins ago"
  },
  {
    id: "repo-3",
    name: "data-pipeline",
    owner: "reaper-engine",
    fullName: "reaper-engine/data-pipeline",
    defaultBranch: "master",
    visibility: "public",
    language: "Python",
    description: "High-throughput streaming ETL pipeline with regression test suite",
    isDemo: true,
    lastScan: "Failing tests in test_etl.py"
  },
  {
    id: "repo-4",
    name: "react-dashboard",
    owner: "reaper-engine",
    fullName: "reaper-engine/react-dashboard",
    defaultBranch: "main",
    visibility: "public",
    language: "JavaScript",
    description: "Frontend telemetry console and client application",
    isDemo: true,
    lastScan: "Clean • 1 day ago"
  }
];

export const githubService = {
  /**
   * Check current GitHub connection & configuration status
   */
  getStatus() {
    const isDemo = localStorage.getItem(STORAGE_KEY_GITHUB_DEMO) === "true";
    const authState = localStorage.getItem(STORAGE_KEY_GITHUB_AUTH);

    // If hackathon credentials are not yet configured in environment
    const isOAuthConfigured = false; // Set to true when GITHUB_CLIENT_ID is provided

    if (isDemo) {
      return {
        isConfigured: true,
        isConnected: true,
        isDemo: true,
        username: "reaper-preview",
        userAvatar: null,
        repoCount: DEMO_REPOSITORIES.length,
        message: "Demo Preview Mode active"
      };
    }

    if (authState === "connected" && isOAuthConfigured) {
      return {
        isConfigured: true,
        isConnected: true,
        isDemo: false,
        username: "github-user",
        repoCount: 0,
        message: "Connected via GitHub OAuth"
      };
    }

    return {
      isConfigured: false,
      isConnected: false,
      isDemo: false,
      username: null,
      repoCount: 0,
      message: "GitHub integration not configured yet"
    };
  },

  /**
   * Toggle Demo Mode for evaluating the complete UI workflow
   */
  setDemoMode(enabled) {
    if (enabled) {
      localStorage.setItem(STORAGE_KEY_GITHUB_DEMO, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY_GITHUB_DEMO);
    }
  },

  /**
   * Fetch accessible repositories
   */
  async getRepositories() {
    const status = this.getStatus();
    
    if (status.isDemo) {
      // Simulate realistic network latency
      await new Promise(resolve => setTimeout(resolve, 350));
      return {
        success: true,
        repositories: DEMO_REPOSITORIES,
        isDemo: true
      };
    }

    if (!status.isConnected) {
      return {
        success: false,
        repositories: [],
        error: "GitHub is not connected. Connect your GitHub account or enable Preview Demo Mode.",
        isDemo: false
      };
    }

    // Real OAuth API call will go here once configured
    return {
      success: true,
      repositories: [],
      isDemo: false
    };
  },

  /**
   * Initiate GitHub connection or simulate connection in preview
   */
  async initiateConnection({ useDemoMode = false } = {}) {
    if (useDemoMode) {
      this.setDemoMode(true);
      return {
        success: true,
        isDemo: true,
        message: "Connected in Preview Demo Mode"
      };
    }

    // Real OAuth flow initiation
    return {
      success: false,
      isDemo: false,
      message: "GitHub OAuth integration will be activated during the hackathon. You can enable Preview Demo Mode to test the full UI flow."
    };
  },

  /**
   * Disconnect GitHub
   */
  disconnect() {
    localStorage.removeItem(STORAGE_KEY_GITHUB_DEMO);
    localStorage.removeItem(STORAGE_KEY_GITHUB_AUTH);
    return { success: true };
  }
};
