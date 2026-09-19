import { api } from './client';
import type { Asset, AssetType, Crew, DashboardSummary, Location, WorkOrder } from '../types';

export const assetsApi = {
  list: async (filters?: Record<string, string>): Promise<Asset[]> => {
    const r = await api.get('/assets', { params: filters });
    return r.data.data;
  },
  get: async (id: string): Promise<Asset> => {
    const r = await api.get(`/assets/${id}`);
    return r.data.data;
  },
  create: async (data: Partial<Asset>): Promise<Asset> => {
    const r = await api.post('/assets', data);
    return r.data.data;
  },
  update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const r = await api.put(`/assets/${id}`, data);
    return r.data.data;
  },
  changeStatus: async (id: string, status: string): Promise<Asset> => {
    const r = await api.patch(`/assets/${id}/status`, { status });
    return r.data.data;
  },
  retire: async (id: string): Promise<Asset> => {
    const r = await api.delete(`/assets/${id}`, { data: {} });
    return r.data.data;
  },
};

export const catalogsApi = {
  assetTypes: async (): Promise<AssetType[]> => {
    const r = await api.get('/catalogs/asset-types');
    return r.data.data;
  },
  locations: async (): Promise<Location[]> => {
    const r = await api.get('/catalogs/locations');
    return r.data.data;
  },
};

export const workOrdersApi = {
  list: async (): Promise<WorkOrder[]> => {
    const r = await api.get('/work-orders');
    return r.data.data;
  },
  create: async (data: Partial<WorkOrder>): Promise<WorkOrder> => {
    const r = await api.post('/work-orders', data);
    return r.data.data;
  },
  assign: async (id: string, crewId: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/assign`, { crew_id: crewId });
    return r.data.data;
  },
  start: async (id: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/start`);
    return r.data.data;
  },
  pause: async (id: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/pause`);
    return r.data.data;
  },
  resume: async (id: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/resume`);
    return r.data.data;
  },
  complete: async (id: string, resolution: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/complete`, { resolution });
    return r.data.data;
  },
  cancel: async (id: string, reason: string): Promise<WorkOrder> => {
    const r = await api.patch(`/work-orders/${id}/cancel`, { reason });
    return r.data.data;
  },
};

export const crewsApi = {
  list: async (): Promise<Crew[]> => {
    const r = await api.get('/crews');
    return r.data.data;
  },
  create: async (data: Partial<Crew>): Promise<Crew> => {
    const r = await api.post('/crews', data);
    return r.data.data;
  },
};

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    const r = await api.get('/dashboard/summary');
    return r.data.data;
  },
};