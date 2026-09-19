import { useQuery } from '@tanstack/react-query';
import { Cpu, ClipboardList, Users, RefreshCw, Clock } from 'lucide-react';
import { dashboardApi } from '../api/endpoints';
import { StatCard } from '../components/StatCard';
import { BarChart } from '../components/BarChart';
import { Loader } from '../components/Loader';

const statusColorMap: Record<string, 'blue' | 'green' | 'purple' | 'orange' | 'red'> = {
  OPERATIVO: 'green',
  EN_MANTENIMIENTO: 'orange',
  FUERA_DE_SERVICIO: 'red',
  PENDIENTE: 'blue',
  ASIGNADA: 'blue',
  EN_EJECUCION: 'orange',
  PAUSADA: 'orange',
  COMPLETADA: 'green',
  CANCELADA: 'red',
  DISPONIBLE: 'green',
  NO_DISPONIBLE: 'orange',
  INACTIVA: 'red',
};

export function DashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.summary,
  });

  if (isLoading) return <Loader />;
  if (error) return <div className="error">{(error as Error).message}</div>;
  if (!data) return null;

  const assetsByStatus = Object.entries(data.assets.byStatus).map(([label, value]) => ({
    label,
    value,
    color: statusColorMap[label] || 'blue' as const,
  }));

  const ordersByStatus = Object.entries(data.workOrders.byStatus).map(([label, value]) => ({
    label,
    value,
    color: statusColorMap[label] || 'blue' as const,
  }));

  const crewsByStatus = Object.entries(data.crews.byStatus).map(([label, value]) => ({
    label,
    value,
    color: statusColorMap[label] || 'blue' as const,
  }));

  const ordersByType = Object.entries(data.workOrders.byType).map(([label, value]) => ({
    label,
    value,
    color: 'purple' as const,
  }));

  const ordersByPriority = Object.entries(data.workOrders.byPriority).map(([label, value]) => ({
    label,
    value,
    color: label === 'CRITICA' ? 'red' as const : label === 'ALTA' ? 'orange' as const : 'blue' as const,
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard Operacional</h1>
          <p>Estado general de las actividades de mantenimiento</p>
        </div>
        <div className="page-header-actions">
          <button className="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="meta-info">
        <Clock size={13} />
        Última actualización: {new Date(data.generatedAt).toLocaleString()}
      </div>

      <div className="grid-stats">
        <StatCard icon={Cpu} label="Activos registrados" value={data.assets.total} variant="blue" />
        <StatCard icon={ClipboardList} label="Órdenes de trabajo" value={data.workOrders.total} variant="purple" />
        <StatCard icon={Users} label="Cuadrillas activas" value={data.crews.total} variant="green" />
      </div>

      <div className="grid-charts">
        <div className="chart-card">
          <h3><Cpu size={15} /> Activos por estado</h3>
          <BarChart data={assetsByStatus} emptyMessage="Sin activos registrados" />
        </div>

        <div className="chart-card">
          <h3><ClipboardList size={15} /> Órdenes por estado</h3>
          <BarChart data={ordersByStatus} emptyMessage="Sin órdenes registradas" />
        </div>

        <div className="chart-card">
          <h3><Users size={15} /> Cuadrillas por estado</h3>
          <BarChart data={crewsByStatus} emptyMessage="Sin cuadrillas registradas" />
        </div>

        <div className="chart-card">
          <h3><ClipboardList size={15} /> Órdenes por tipo</h3>
          <BarChart data={ordersByType} emptyMessage="Sin datos" />
        </div>

        <div className="chart-card">
          <h3><ClipboardList size={15} /> Órdenes por prioridad</h3>
          <BarChart data={ordersByPriority} emptyMessage="Sin datos" />
        </div>

        <div className="chart-card">
          <h3><Users size={15} /> Carga por cuadrilla</h3>
          <BarChart
            data={data.crews.activeLoad.map((c) => ({
              label: c.crew_name,
              value: c.active_orders,
              color: 'purple' as const,
            }))}
            emptyMessage="Sin cuadrillas"
          />
        </div>
      </div>
    </>
  );
}