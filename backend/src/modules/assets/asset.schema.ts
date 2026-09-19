import { z } from 'zod';
import { ASSET_CRITICALITIES, ASSET_STATUSES } from './asset.types';

export const createAssetSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede superar 50 caracteres'),
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede superar 150 caracteres'),
  asset_type_id: z.number().int().positive('Tipo de activo inválido'),
  location_id: z.number().int().positive().nullable().optional(),
  status: z.enum(ASSET_STATUSES as unknown as [string, ...string[]]).optional(),
  criticality: z
    .enum(ASSET_CRITICALITIES as unknown as [string, ...string[]])
    .optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  installed_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD')
    .nullable()
    .optional(),
});

export const updateAssetSchema = createAssetSchema
  .omit({ code: true, status: true })
  .partial();

export const retireAssetSchema = z.object({
  reason: z.string().trim().min(3).max(500).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(ASSET_STATUSES as unknown as [string, ...string[]]),
  reason: z.string().trim().min(3).max(500).optional(),
});

export const listAssetsQuerySchema = z.object({
  status: z.enum(ASSET_STATUSES as unknown as [string, ...string[]]).optional(),
  asset_type_id: z.coerce.number().int().positive().optional(),
  location_id: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type RetireAssetInput = z.infer<typeof retireAssetSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>;