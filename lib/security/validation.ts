import { z } from 'zod';

// Student validation schemas
export const studentIdSchema = z.object({
  studentId: z.string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long')
    .regex(/^[A-Za-z0-9\-_ .]+$/, 'Student ID contains invalid characters'),
});

export const studentSchema = z.object({
  'Student ID': z.string().min(1).max(50),
  'Full Name': z.string().min(1).max(200),
  'Grade': z.union([z.string(), z.number()]).transform(val => String(val)),
  'Email': z.string().email().optional().or(z.literal('')),
  'Contact Number': z.string().max(20).optional().or(z.literal('')),
});

export const studentArraySchema = z.array(studentSchema);

// Candidate validation schemas
export const candidateSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  position_id: z.string().uuid('Invalid position ID'),
  partylist_id: z.string().uuid('Invalid partylist ID').optional().nullable(),
  platform: z.string().max(2000).optional().nullable(),
  vision: z.string().max(2000).optional().nullable(),
  mission: z.string().max(2000).optional().nullable(),
  photo_url: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

// Position validation schemas
export const positionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  max_votes: z.number().int().min(1).max(10).optional().default(1),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional().default(true),
});

// Partylist validation schemas
export const partylistSchema = z.object({
  name: z.string().min(1).max(100),
  acronym: z.string().max(20).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional().default('#3B82F6'),
  logo_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

// Vote validation schemas
export const voteSchema = z.object({
  election_id: z.string().uuid('Invalid election ID'),
  candidate_id: z.string().uuid('Invalid candidate ID'),
  position_id: z.string().uuid('Invalid position ID'),
});

export const votesArraySchema = z.array(voteSchema);

// UUID validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Generic validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; data: T 
} | { 
  success: false; error: string 
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Invalid input' };
  }
}

// Sanitize string to prevent XSS
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Sanitize object strings recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}
