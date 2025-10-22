/**
 * Mock JWT utilities
 * Simple JWT-like tokens for development (NOT secure, for mocking only)
 */

/**
 * Generate mock JWT token
 * Format: base64(userId).base64(timestamp).base64(random)
 */
export function generateMockToken(userId: number): string {
  const header = btoa(JSON.stringify({ userId }));
  const timestamp = btoa(Date.now().toString());
  const random = btoa(Math.random().toString(36).substring(7));

  return `${header}.${timestamp}.${random}`;
}

/**
 * Decode mock JWT token
 */
export function decodeMockToken(token: string): { userId: number } | null {
  try {
    const [header] = token.split('.');
    const decoded = JSON.parse(atob(header)) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract user ID from Authorization header
 */
export function getUserIdFromAuth(authHeader: string | null): number | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = decodeMockToken(token);
  return decoded?.userId ?? null;
}
