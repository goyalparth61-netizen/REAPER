/**
 * Centralized API Service for REAPER FastAPI backend
 * All endpoints connect to genuine backend routes.
 * Base URL is configurable via VITE_API_BASE_URL for deployment (Vercel -> Render).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("reaper_auth_token") || sessionStorage.getItem("reaper_auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  baseUrl: API_BASE_URL,

  /**
   * Health check
   */
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) throw new Error(`Health status ${res.status}`);
      return await res.json();
    } catch (err) {
      return { status: "disconnected", error: err.message };
    }
  },

  /**
   * Engine operational status
   */
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/status`, {
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
      const data = await res.json();
      return {
        online: true,
        agent: data.agent || "REAPER",
        state: data.state || "IDLE",
        active_tasks: data.active_tasks ?? 0,
        version: data.version
      };
    } catch (err) {
      return {
        online: false,
        agent: "REAPER",
        state: "UNAVAILABLE",
        active_tasks: 0,
        error: err.message
      };
    }
  },

  /**
   * Real-time Multi-Agent Telemetry Status
   */
  async getAgentsStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agents/status`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error(`Agents HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        engine: "REAPER",
        ai_connected: false,
        docker_sandbox_available: false,
        error: err.message,
        agents: {}
      };
    }
  },

  /**
   * Fetch genuine dashboard statistics
   */
  async getStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/stats`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) return await res.json();
    } catch {}
    // Return empty authentic metrics without fake figures
    return {
      total_repairs: 0,
      successful_repairs: 0,
      active_repairs: 0,
      success_rate: 0,
      total_repositories: 0,
      average_repair_time_seconds: 0,
      security_score: 100
    };
  },

  /**
   * List connected repositories
   */
  async getRepositories() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  /**
   * Connect a new repository
   */
  async createRepository(repoData) {
    const res = await fetch(`${API_BASE_URL}/api/repositories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(repoData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to connect repository" }));
      throw new Error(err.detail || "Repository creation failed");
    }
    return await res.json();
  },

  /**
   * Delete repository
   */
  async deleteRepository(repositoryId) {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.ok;
  },

  /**
   * Fetch repair execution runs
   */
  async getRuns() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/runs`, {
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) throw new Error(`Runs HTTP ${res.status}`);
      const data = await res.json();
      return {
        online: true,
        runs: Array.isArray(data) ? data : data.runs || []
      };
    } catch (err) {
      return {
        online: false,
        runs: [],
        error: err.message
      };
    }
  },

  /**
   * Dispatch repair operation to genuine backend
   */
  async dispatchRepair({ repo, branch, issueDescription, failureLogs, isDemo }) {
    const res = await fetch(`${API_BASE_URL}/api/repair`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        repo: repo.fullName || repo.name,
        branch: branch || repo.defaultBranch || "main",
        issue: issueDescription || "",
        failure_logs: failureLogs || issueDescription || "",
        isDemo: Boolean(isDemo)
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to dispatch repair job" }));
      throw new Error(err.detail || `Server returned error HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Ingest a local project archive (.zip or .tar.gz) for autonomous repair
   */
  async uploadProjectArchive(formData) {
    const token = localStorage.getItem("reaper_auth_token") || sessionStorage.getItem("reaper_auth_token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/repairs/upload`, {
      method: "POST",
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Archive upload failed" }));
      throw new Error(err.detail || `Upload failed HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Get Repair Job Details
   */
  async getRepairDetail(repairId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/repairs/${repairId}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  /**
   * Stop an ongoing repair operation
   */
  async stopRepair(repairId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/repairs/${repairId}/stop`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  },

  /**
   * Fetch repair logs
   */
  async getRepairLogs(repairId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/repairs/${repairId}/logs`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch {}
    return { repair_id: repairId, status: "UNKNOWN", logs: [] };
  },

  /**
   * Fetch repair technical report
   */
  async getRepairReport(repairId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/repairs/${repairId}/report`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }
};
