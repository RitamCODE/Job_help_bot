const API_BASE = "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  getHealth: () => request("/health"),
  getJobs: () => request<{ items: unknown[]; total: number }>("/jobs"),
  getJob: (id: number) => request(`/jobs/${id}`),
  importUrl: (payload: unknown) => request("/jobs/import-url", { method: "POST", body: JSON.stringify(payload) }),
  updateJobStatus: (id: number, status: string) => request(`/jobs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  addJobNote: (id: number, content: string) => request(`/jobs/${id}/notes`, { method: "PATCH", body: JSON.stringify({ content }) }),
  scoreJob: (id: number) => request(`/jobs/${id}/score`, { method: "POST" }),
  getProfiles: () => request("/profiles"),
  createProfile: (payload: unknown) => request("/profiles", { method: "POST", body: JSON.stringify(payload) }),
  getResumes: () => request("/resumes"),
  createResume: (payload: unknown) => request("/resumes", { method: "POST", body: JSON.stringify(payload) }),
  getSources: () => request("/sources"),
  runSync: (payload: unknown) => request("/sync/run", { method: "POST", body: JSON.stringify(payload) }),
  getRuns: () => request("/sync/runs"),
  getSettings: () => request("/settings"),
  getAnalytics: () => request("/analytics/summary"),
};
