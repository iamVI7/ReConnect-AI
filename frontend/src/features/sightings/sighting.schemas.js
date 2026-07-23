import { z } from 'zod';

export const sightingSchema = z.object({
  description: z.string().min(10, 'Add a short description (at least 10 characters)'),
  locationAddress: z.string().optional(),
  sightedAt: z.string().optional(),
  photoUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  isAnonymous: z.boolean().optional().default(false),
});