import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Cpu, ClipboardList, Users, RefreshCw } from 'lucide-react';
import { dashboardApi } from '../api/endpoints';
import { StatCard } from '../components/StatCard';
import { BarChart } from '../components/BarChart';
import { DonutChart } from '../components/DonutChart';
import { SkeletonDashboard } from '../components/Skeleton';
import { COLOR_HEX, toBarColor } from '../theme';

function toDonutData(obj: Record<string, number>) {
  return Object.entries(obj).map(([label, value]) => ({
    label,
    value,
    color: COLOR_HEX[label] ?? '#3b82f6',
  }));
}

function toBarData(obj: Record<string, number>) {
  return Object.entries(obj).map(([label, value]) => ({
    label,
    value,
    color: toBarColor(label),
  }));
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.summary,
  });

  const donutData = useMemo(
    () =>
      data
        ? {
            assets: toDonutData(data.assets.byStatus),
            workOrders: toDonutData(data.workOrders.byStatus),
            crews: toDonutData(data.crews.byStatus),
          }
        : null,
    [data],
  );

  const barData = useMemo(
    () =>
      data
        ? {
            byType: toBarData(data.workOrders.byType),
            byPriority: toBarData(data.workOrders.byPriority),
            crewLoad: data.crews.activeLoad.map((c) => ({
              label: c.crew_name,
              value: c.active_orders,
              color: 'purple' as const,
            })),
          }
        : null,
    [data],
  );

  if (isLoading) return <SkeletonDashboard />;
  if (error) return <div className="error">{(error as Error).message}</div>;
  if (!data || !donutData || !barData) return null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard Operacional</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="grid-stats">
        <StatCard icon={Cpu} label="Activos registrados" value={data.assets.total} variant="blue" onClick={() => navigate('/assets')} />
        <StatCard icon={ClipboardList} label="Órdenes de trabajo" value={data.workOrders.total} variant="purple" onClick={() => navigate('/work-orders')} />
        <StatCard icon={Users} label="Cuadrillas activas" value={data.crews.total} variant="green" onClick={() => navigate('/crews')} />
      </div>

      <div className="grid-charts" onClick={() => navigate('/assets')}>
        <div className="chart-card">
          <h3><Cpu size={15} /> Activos por estado</h3>
          <DonutChart data={donutData.assets} />
        </div>

        <div className="chart-card" onClick={() => navigate('/work-orders')}>
          <h3><ClipboardList size={15} /> Órdenes por estado</h3>
          <DonutChart data={donutData.workOrders} />
        </div>

        <div className="chart-card" onClick={() => navigate('/crews')}>
          <h3><Users size={15} /> Cuadrillas por estado</h3>
          <DonutChart data={donutData.crews} />
        </div>

        <div className="chart-card" onClick={() => navigate('/work-orders')}>
          <h3><ClipboardList size={15} /> Órdenes por tipo</h3>
          <BarChart data={barData.byType} emptyMessage="Sin datos" />
        </div>

        <div className="chart-card" onClick={() => navigate('/work-orders')}>
          <h3><ClipboardList size={15} /> Órdenes por prioridad</h3>
          <BarChart data={barData.byPriority} emptyMessage="Sin datos" />
        </div>

        <div className="chart-card" onClick={() => navigate('/crews')}>
          <h3><Users size={15} /> Carga por cuadrilla</h3>
          <BarChart data={barData.crewLoad} emptyMessage="Sin cuadrillas" />
        </div>
      </div>
    </div>
  );
}