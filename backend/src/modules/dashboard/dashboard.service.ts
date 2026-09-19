import { dashboardRepository } from './dashboard.repository';

export const dashboardService = {
  summary: () => dashboardRepository.getSummary(),
  assets: () => dashboardRepository.getAssetStats(),
  workOrders: () => dashboardRepository.getWorkOrderStats(),
  crews: () => dashboardRepository.getCrewStats(),
};