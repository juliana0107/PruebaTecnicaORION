import { z } from 'zod';
import { CREW_STATUSES, CREW_SPECIALTIES } from './crew.types';

export const createCrewSchema = z.object({
  code: z.string().trim().min(3).max(50),
  name: z.string().trim().min(3).max(150),
  specialty: z.enum(CREW_SPECIALTIES as unknown as [string, ...string[]]),
  zone: z.string().trim().min(2).max(50),
  leader: z.string().trim().min(3).max(150),
});

export const updateCrewSchema = createCrewSchema.partial().omit({ code: true });

export const changeCrewStatusSchema = z.object({
  status: z.enum(CREW_STATUSES as unknown as [string, ...string[]]),
});

export type CreateCrewInput = z.infer<typeof createCrewSchema>;
export type UpdateCrewInput = z.infer<typeof updateCrewSchema>;