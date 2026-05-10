/**
 * Security utilities for input validation, sanitization, rate limiting, and spam detection
 */

// ─── Blocked Words Filter ────────────────────────────────────────────────────
const BLOCKED_WORDS = [
  'spam', 'scam', 'viagra', 'casino', 'lottery', 'prize',
  'click here', 'buy now', 'free money', 'make money fast',
  'nigger', 'faggot', 'retard',
];

const SUSPICIOUS_PATTERNS = [
  /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
  /(\b\w+\b)(?:\s+\1){4,}/i, // repeated words
  /[A-Z\s]{20,}/, // excessive caps
  /(.{1,3})\1{10,}/, // repeated chars
];

export function containsBlockedContent(text: string): { blocked: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { blocked: true, reason: 'Content contains inappropriate language' };
    }
  }
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: 'Content flagged as suspicious' };
    }
  }
  return { blocked: false };
}

// ─── Input Sanitization ─────────────────────────────────────────────────────
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// ─── Rate Limiting (in-memory, per-server) ──────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt <= now) rateLimitStore.delete(key);
  }
}, 60000);

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ─── Email Validation ────────────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// ─── Password Strength ──────────────────────────────────────────────────────
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  if (password.length > 128) return { valid: false, message: 'Password too long' };
  // Require at least 2 of: uppercase, lowercase, number, special char
  let strength = 0;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  if (strength < 2) return { valid: false, message: 'Password must include at least 2 of: uppercase, lowercase, number, special character' };
  return { valid: true, message: 'Password is strong' };
}

// ─── Upload Security ────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateUpload(contentType: string, fileSize?: number): { valid: boolean; message: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { valid: false, message: 'Only JPEG, PNG, WebP, GIF, and AVIF images are allowed' };
  }
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return { valid: false, message: 'File size must be under 10MB' };
  }
  return { valid: true, message: 'Valid file' };
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 200);
}

// ─── Role Checks ────────────────────────────────────────────────────────────
export function isAdmin(role?: string): boolean {
  return role === 'admin';
}

export function isModerator(role?: string): boolean {
  return role === 'moderator' || role === 'admin';
}

export function canModerateContent(role?: string): boolean {
  return role === 'admin' || role === 'moderator';
}
