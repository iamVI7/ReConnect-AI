import { z } from 'zod';

export const createMissingPersonSchema = z.object({
  fullName: z.string().min(2, 'Enter the full name of the missing person'),
  age: z.coerce.number().min(0).max(130).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).default('unknown'),
  height: z.coerce.number().min(0).optional(),
  photos: z.array(z.string().url('Each photo must be a valid URL')).optional().default([]),
  identifyingMarks: z.array(z.string()).optional().default([]),
  clothingDescription: z.string().optional(),
  descriptionText: z.string().min(10, 'Add a short description (at least 10 characters)'),
  lastKnownAddress: z.string().optional(),
  lastSeenAt: z.coerce.date().optional(),
});

export const updateMissingPersonSchema = createMissingPersonSchema.partial().extend({
  status: z.enum(['pending_embedding', 'active', 'matched', 'closed', 'cold']).optional(),
});