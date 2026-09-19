import { api } from './client';
import type { Asset, AssetType, Crew, DashboardSummary, Location, WorkOrder } from '../types';

export const assetsApi = {
  list: async (): Promise<Asset[]> => (await api.get('/assets')).data.data,
  get: async (id: string): Promise<Asset> => (await api.get(`/assets/${id}`)).data.data,
  history: async (id: string): Promise<any[]> => (await api.get(`/assets/${id}/history`)).data.data,
  create: async (data: Partial<Asset>): Promise<Asset> => (await api.post('/assets', data)).data.data,
  update: async (id: string, data: Partial<Asset>): Promise<Asset> => (await api.put(`/assets/${id}`, data)).data.data,
  changeStatus: async (id: string, status: string, reason?: string): Promise<Asset> =>
    (await api.patch(`/assets/${id}/status`, { status, reason })).data.data,
  retire: async (id: string, reason?: string): Promise<Asset> =>
    (await api.delete(`/assets/${id}`, { data: { reason } })).data.data,
};

export const catalogsApi = {
  assetTypes: async (): Promise<AssetType[]> => (await api.get('/catalogs/asset-types')).data.data,
  locations: async (): Promise<Location[]> => (await api.get('/catalogs/locations')).data.data,
};

export const workOrdersApi = {
  list: async (): Promise<WorkOrder[]> => (await api.get('/work-orders')).data.data,
  history: async (id: string): Promise<any[]> => (await api.get(`/work-orders/${id}/history`)).data.data,
  create: async (data: Partial<WorkOrder>): Promise<WorkOrder> => (await api.post('/work-orders', data)).data.data,
  assign: async (id: string, crewId: string): Promise<WorkOrder> =>
    (await api.patch(`/work-orders/${id}/assign`, { crew_id: crewId })).data.data,
  start: async (id: string): Promise<WorkOrder> => (await api.patch(`/work-orders/${id}/start`)).data.data,
  pause: async (id: string): Promise<WorkOrder> => (await api.patch(`/work-orders/${id}/pause`)).data.data,
  resume: async (id: string): Promise<WorkOrder> => (await api.patch(`/work-orders/${id}/resume`)).data.data,
  complete: async (id: string, resolution: string): Promise<WorkOrder> =>
    (await api.patch(`/work-orders/${id}/complete`, { resolution })).data.data,
  cancel: async (id: string, reason: string): Promise<WorkOrder> =>
    (await api.patch(`/work-orders/${id}/cancel`, { reason })).data.data,
};

export const crewsApi = {
  list: async (): Promise<Crew[]> => (await api.get('/crews')).data.data,
  create: async (data: Partial<Crew>): Promise<Crew> => (await api.post('/crews', data)).data.data,
  update: async (id: string, data: Partial<Crew>): Promise<Crew> => (await api.put(`/crews/${id}`, data)).data.data,
  changeStatus: async (id: string, status: string): Promise<Crew> =>
    (await api.patch(`/crews/${id}/status`, { status })).data.data,
};

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => (await api.get('/dashboard/summary')).data.data,
};