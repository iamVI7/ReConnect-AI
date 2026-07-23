import { z } from 'zod';

export const createSightingSchema = z.object({
  description: z.string().min(10, 'Add a short description (at least 10 characters)'),
  photos: z.array(z.string().url('Each photo must be a valid URL')).optional().default([]),
  locationAddress: z.string().optional(),
  sightedAt: z.coerce.date().optional(),
  relatedMissingPersonId: z.string().optional(),
  // Lets a signed-in citizen still choose to report without attaching
  // their identity, per "Report a sighting — anonymously, if you prefer."
  isAnonymous: z.coerce.boolean().optional().default(false),
});
