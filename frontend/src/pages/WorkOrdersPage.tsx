import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ClipboardList } from 'lucide-react';
import { workOrdersApi, assetsApi } from '../api/endpoints';
import type { WorkOrder, WorkOrderPriority, WorkOrderType, WorkOrderStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';

export function WorkOrdersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('');

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: workOrdersApi.list,
  });
  const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: () => assetsApi.list() });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['work-orders'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['assets'] });
  };

  const createMutation = useMutation({
    mutationFn: workOrdersApi.create,
    onSuccess: () => { invalidateAll(); setShowModal(false); setError(null); },
    onError: (e: Error) => setError(e.message),
  });

  const startMutation = useMutation({ mutationFn: workOrdersApi.start, onSuccess: invalidateAll });
  const completeMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) => workOrdersApi.complete(id, resolution),
    onSuccess: invalidateAll,
  });
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => workOrdersApi.cancel(id, reason),
    onSuccess: invalidateAll,
  });

  const filtered = useMemo(() => {
    return workOrders.filter((w) => !statusFilter || w.status === statusFilter);
  }, [workOrders, statusFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      code: fd.get('code') as string,
      asset_id: fd.get('asset_id') as string,
      type: fd.get('type') as WorkOrderType,
      priority: fd.get('priority') as WorkOrderPriority,
      description: fd.get('description') as string,
    });
  };

  const handleComplete = (id: string) => {
    const resolution = window.prompt('Describe la resolución aplicada:');
    if (resolution && resolution.length >= 5) completeMutation.mutate({ id, resolution });
  };

  const handleCancel = (id: string) => {
    const reason = window.prompt('Motivo de cancelación:');
    if (reason && reason.length >= 5) cancelMutation.mutate({ id, reason });
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Órdenes de Trabajo</h1>
          <p>{workOrders.length} órdenes registradas</p>
        </div>
        <div className="page-header-actions">
          <button className="primary" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            Nueva OT
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | '')} style={{ maxWidth: 220 }}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ASIGNADA">Asignada</option>
          <option value="EN_EJECUCION">En Ejecución</option>
          <option value="PAUSADA">Pausada</option>
          <option value="COMPLETADA">Completada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={workOrders.length === 0 ? 'No hay órdenes registradas' : 'Sin resultados'}
            description="Crea la primera orden de trabajo para comenzar"
            action={workOrders.length === 0 ? { label: '+ Nueva OT', onClick: () => setShowModal(true) } : undefined}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Descripción</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w: WorkOrder) => (
                <tr key={w.id}>
                  <td><strong>{w.code}</strong></td>
                  <td>{w.type}</td>
                  <td><StatusBadge status={w.priority} /></td>
                  <td><StatusBadge status={w.status} /></td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{w.description}</td>
                  <td style={{ textAlign: 'right' }}>
                    {w.status === 'ASIGNADA' && (
                      <button className="primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => startMutation.mutate(w.id)}>
                        Iniciar
                      </button>
                    )}
                    {w.status === 'EN_EJECUCION' && (
                      <>
                        <button className="primary" style={{ padding: '5px 10px', fontSize: 12, marginRight: 6 }} onClick={() => handleComplete(w.id)}>
                          Completar
                        </button>
                        <button className="secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCancel(w.id)}>
                          Cancelar
                        </button>
                      </>
                    )}
                    {w.status === 'PENDIENTE' && (
                      <button className="secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleCancel(w.id)}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setError(null); }}
        title="Nueva Orden de Trabajo"
        subtitle="Planifica una actividad de mantenimiento"
      >
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código <span className="required">*</span></label>
            <input name="code" required placeholder="OT-PREV-2026-0001" minLength={3} />
          </div>
          <div className="form-group">
            <label>Activo <span className="required">*</span></label>
            <select name="asset_id" required defaultValue="">
              <option value="" disabled>Seleccione activo</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo <span className="required">*</span></label>
            <select name="type" required defaultValue="PREVENTIVA">
              <option value="PREVENTIVA">Preventiva</option>
              <option value="CORRECTIVA">Correctiva</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioridad <span className="required">*</span></label>
            <select name="priority" required defaultValue="MEDIA">
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </div>
          <div className="form-group">
            <label>Descripción <span className="required">*</span></label>
            <textarea name="description" required rows={3} minLength={5} placeholder="Describe la actividad a realizar..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Crear OT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}