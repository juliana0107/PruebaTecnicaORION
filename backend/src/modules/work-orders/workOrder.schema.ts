import { z } from 'zod';
import {
  WORK_ORDER_TYPES, WORK_ORDER_PRIORITIES, WORK_ORDER_STATUSES,
} from './workOrder.types';

export const createWorkOrderSchema = z.object({
  code: z.string().trim().min(3).max(50),
  asset_id: z.string().uuid(),
  crew_id: z.string().uuid().nullable().optional(),
  type: z.enum(WORK_ORDER_TYPES as unknown as [string, ...string[]]),
  priority: z.enum(WORK_ORDER_PRIORITIES as unknown as [string, ...string[]]),
  description: z.string().trim().min(5).max(1000),
  scheduled_at: z.string().datetime().nullable().optional(),
});

export const assignCrewSchema = z.object({
  crew_id: z.string().uuid(),
});

export const completeWorkOrderSchema = z.object({
  resolution: z.string().trim().min(5).max(2000),
});

export const cancelWorkOrderSchema = z.object({
  reason: z.string().trim().min(5).max(500),
});

export const listWorkOrdersQuerySchema = z.object({
  status: z.enum(WORK_ORDER_STATUSES as unknown as [string, ...string[]]).optional(),
  priority: z.enum(WORK_ORDER_PRIORITIES as unknown as [string, ...string[]]).optional(),
  type: z.enum(WORK_ORDER_TYPES as unknown as [string, ...string[]]).optional(),
  asset_id: z.string().uuid().optional(),
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type ListWorkOrdersQuery = z.infer<typeof listWorkOrdersQuerySchema>;