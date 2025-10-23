import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim());
}

export function validateTaskInput(input: {
  title: string;
  description?: string;
  priority: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (input.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (input.description && input.description.length > 1000) {
    errors.push("Description must be less than 1000 characters");
  }

  const validPriorities = ["low", "medium", "high", "urgent"];
  if (!validPriorities.includes(input.priority)) {
    errors.push("Invalid priority level");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function rateLimitCheck(
  userId: string,
  action: string,
  windowMs: number = 60000,
  maxRequests: number = 10
): boolean {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const key = `${userId}:${action}`;
  const now = Date.now();

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const store = global.rateLimitStore as Map<string, number[]>;
  const requests = store.get(key) || [];

  // Remove old requests outside the window
  const validRequests = requests.filter((time) => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return false;
  }

  validRequests.push(now);
  store.set(key, validRequests);

  return true;
}

// Extend global type for rate limiting
declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}
