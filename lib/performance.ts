// Performance utilities for caching and optimization

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl: number = 300000): void {
    // Default 5 minutes TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new MemoryCache<any>();

export function cacheOpenAIResponse(taskTitle: string, response: any): void {
  const key = `openai:${taskTitle.toLowerCase().trim()}`;
  globalCache.set(key, response, 3600000); // 1 hour TTL
}

export function getCachedOpenAIResponse(taskTitle: string): any | null {
  const key = `openai:${taskTitle.toLowerCase().trim()}`;
  return globalCache.get(key);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Database optimization helpers
export const DATABASE_INDEXES = {
  tasks: [
    "CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);",
    "CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);",
    "CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);",
    "CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);",
  ],
};

export function getOptimizedTaskQuery(filters: {
  user_id: string;
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}) {
  let query = "SELECT * FROM tasks WHERE user_id = $1";
  const params: any[] = [filters.user_id];
  let paramIndex = 2;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.priority) {
    query += ` AND priority = $${paramIndex}`;
    params.push(filters.priority);
    paramIndex++;
  }

  query += " ORDER BY created_at DESC";

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  return { query, params };
}
