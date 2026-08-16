/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Tracks request counts per IP address with a sliding window.
 *
 * Usage in a route handler:
 *   import { checkRateLimit } from "@/lib/rateLimit";
 *
 *   export async function POST(request) {
 *     const limited = checkRateLimit(request);
 *     if (limited) return limited;
 *     // ... handle request
 *   }
 */

const rateMap = new Map();

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Check if a request exceeds the rate limit.
 *
 * @param {Request} request - The incoming request object
 * @param {object} options
 * @param {number} options.interval - Time window in milliseconds (default: 60s)
 * @param {number} options.limit - Max requests per interval (default: 30)
 * @returns {Response|null} Returns a 429 Response if rate-limited, or null if allowed
 */
export function checkRateLimit(request, { interval = 60_000, limit = 30 } = {}) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const now = Date.now();
  let entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + interval };
  }

  entry.count++;
  rateMap.set(ip, entry);

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}
