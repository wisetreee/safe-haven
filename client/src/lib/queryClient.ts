import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Helper function to handle API response errors
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    
    try {
      // Try to parse the response as JSON to get the error message
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText;
    } catch (e) {
      // If JSON parsing fails, use the response text or status text
      const text = await res.text();
      errorMessage = text || res.statusText;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Standard API request function for making fetch requests
 */
export async function apiRequest<T = any>(
  url: string,
  method: string = 'GET',
  data?: unknown
): Promise<T> {
  try {
    // Use relative URLs for API calls in same-origin setup
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
}

/**
 * Factory for creating query functions with different authorization behaviors
 */
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    
    try {
      const res = await fetch(path, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${path}:`, error);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
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
