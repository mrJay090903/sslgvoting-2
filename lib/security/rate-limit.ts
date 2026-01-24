import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiter (for development/simple deployments)
// For production, use Redis-based rate limiting with @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,  // 60 requests per minute
};

const strictConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,  // 10 requests per minute (for sensitive endpoints)
};

export function getRateLimitConfig(path: string): RateLimitConfig {
  // Stricter limits for authentication endpoints
  if (path.includes('/api/students/verify') || path.includes('/auth')) {
    return strictConfig;
  }
  return defaultConfig;
}

export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs 
    };
  }

  if (record.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: record.resetTime - now 
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now 
  };
}

export function rateLimitResponse(resetIn: number) {
  return NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(resetIn / 1000)
    },
    { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
        'X-RateLimit-Remaining': '0',
      }
    }
  );
}

export function getClientIdentifier(request: NextRequest | Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}
