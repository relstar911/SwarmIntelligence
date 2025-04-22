import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { WorldState, TimelineEvent } from './types';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Helper to parse JSON response
async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  }
  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Simulation-specific API functions
export const simulationApi = {
  // Get active simulation
  async getActiveSimulation() {
    const res = await apiRequest("GET", '/api/simulation');
    return parseJsonResponse(res);
  },
  
  // Create a new simulation
  async createSimulation(name: string, initialState: WorldState) {
    const res = await apiRequest("POST", '/api/simulation', { name, initialState });
    return parseJsonResponse(res);
  },
  
  // Save simulation state
  async saveSimulationState(simulationId: number, state: WorldState) {
    const res = await apiRequest("PUT", `/api/simulation/${simulationId}`, state);
    return parseJsonResponse(res);
  },
  
  // Get agent memories
  async getAgentMemories(agentId: string) {
    const res = await apiRequest("GET", `/api/agent/${agentId}/memories`);
    return parseJsonResponse(res);
  },
  
  // Add agent memory
  async addAgentMemory(agentId: string, memory: any) {
    const res = await apiRequest("POST", `/api/agent/${agentId}/memory`, memory);
    return parseJsonResponse(res);
  },
  
  // Get timeline events
  async getTimelineEvents(simulationId: number) {
    const res = await apiRequest("GET", `/api/simulation/${simulationId}/timeline`);
    return parseJsonResponse(res);
  },
  
  // Add timeline event
  async addTimelineEvent(simulationId: number, event: TimelineEvent) {
    const res = await apiRequest("POST", `/api/simulation/${simulationId}/timeline`, event);
    return parseJsonResponse(res);
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
