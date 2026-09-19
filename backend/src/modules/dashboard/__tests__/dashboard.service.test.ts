import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dashboardService } from '../dashboard.service';
import { dashboardRepository } from '../dashboard.repository';

vi.mock('../dashboard.repository');

const mockedRepo = vi.mocked(dashboardRepository);

describe('dashboardService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('summary retorna assets, workOrders y crews agregados', async () => {
    mockedRepo.getSummary.mockResolvedValue({
      assets: { total: 5, byStatus: { OPERATIVO: 3 }, byType: [] },
      workOrders: { total: 2, byStatus: { PENDIENTE: 2 }, byType: {}, byPriority: {} },
      crews: { total: 1, byStatus: { DISPONIBLE: 1 }, activeLoad: [] },
      generatedAt: new Date().toISOString(),
    });

    const result = await dashboardService.summary();

    expect(result.assets.total).toBe(5);
    expect(result.workOrders.total).toBe(2);
    expect(result.crews.total).toBe(1);
  });

  it('assets retorna estadísticas de activos', async () => {
    mockedRepo.getAssetStats.mockResolvedValue({
      total: 3, byStatus: { OPERATIVO: 3 }, byType: [],
    });

    const result = await dashboardService.assets();

    expect(result.total).toBe(3);
  });

  it('workOrders retorna estadísticas de OT', async () => {
    mockedRepo.getWorkOrderStats.mockResolvedValue({
      total: 2, byStatus: {}, byType: {}, byPriority: {},
    });

    const result = await dashboardService.workOrders();

    expect(result.total).toBe(2);
  });

  it('crews retorna estadísticas de cuadrillas', async () => {
    mockedRepo.getCrewStats.mockResolvedValue({
      total: 1, byStatus: {}, activeLoad: [],
    });

    const result = await dashboardService.crews();

    expect(result.total).toBe(1);
  });
});