import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ClipboardList, History, Play, Pause, CheckCircle2, XCircle, UserPlus, RotateCcw, Search } from 'lucide-react';
import { workOrdersApi, assetsApi, crewsApi } from '../api/endpoints';
import type { WorkOrder, WorkOrderPriority, WorkOrderType, WorkOrderStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';

type ModalType = 'create' | 'assign' | 'complete' | 'cancel' | 'history' | null;

export function WorkOrdersPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | ''>('');
  const [search, setSearch] = useState('');

  const { data: workOrders = [], isLoading } = useQuery({ queryKey: ['work-orders'], queryFn: workOrdersApi.list });
  const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: () => assetsApi.list() });
  const { data: crews = [] } = useQuery({ queryKey: ['crews'], queryFn: crewsApi.list });
  const { data: history = [] } = useQuery({
    queryKey: ['wo-history', selected?.id],
    queryFn: () => workOrdersApi.history(selected!.id),
    enabled: modal === 'history' && !!selected,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['work-orders'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['assets'] });
    qc.invalidateQueries({ queryKey: ['crews'] });
  };

  const createM = useMutation({
    mutationFn: workOrdersApi.create,
    onSuccess: () => { invalidate(); close(); toast.success('OT creada'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const assignM = useMutation({
    mutationFn: ({ id, crewId }: any) => workOrdersApi.assign(id, crewId),
    onSuccess: () => { invalidate(); close(); toast.success('Cuadrilla asignada', 'OT ahora está ASIGNADA'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const startM = useMutation({
    mutationFn: (id: string) => workOrdersApi.start(id),
    onSuccess: () => { invalidate(); toast.success('OT iniciada', 'Activo pasa a EN MANTENIMIENTO'); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  const pauseM = useMutation({
    mutationFn: (id: string) => workOrdersApi.pause(id),
    onSuccess: () => { invalidate(); toast.success('OT pausada'); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  const resumeM = useMutation({
    mutationFn: (id: string) => workOrdersApi.resume(id),
    onSuccess: () => { invalidate(); toast.success('OT reanudada'); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  const completeM = useMutation({
    mutationFn: ({ id, resolution }: any) => workOrdersApi.complete(id, resolution),
    onSuccess: () => { invalidate(); close(); toast.success('OT completada', 'Activo vuelve a OPERATIVO'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const cancelM = useMutation({
    mutationFn: ({ id, reason }: any) => workOrdersApi.cancel(id, reason),
    onSuccess: () => { invalidate(); close(); toast.success('OT cancelada'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const close = () => { setModal(null); setSelected(null); setError(null); };
  const openCreate = () => { setSelected(null); setModal('create'); };
  const openAssign = (w: WorkOrder) => { setSelected(w); setModal('assign'); };
  const openComplete = (w: WorkOrder) => { setSelected(w); setModal('complete'); };
  const openCancel = (w: WorkOrder) => { setSelected(w); setModal('cancel'); };
  const openHistory = (w: WorkOrder) => { setSelected(w); setModal('history'); };

  const filtered = useMemo(() => {
    return workOrders.filter((w) => {
      const matchStatus = !statusFilter || w.status === statusFilter;
      const matchSearch =
        !search ||
        w.code.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [workOrders, statusFilter, search]);

  const isAnyActionPending = startM.isPending || pauseM.isPending || resumeM.isPending;

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createM.mutate({
      code: fd.get('code') as string,
      asset_id: fd.get('asset_id') as string,
      type: fd.get('type') as WorkOrderType,
      priority: fd.get('priority') as WorkOrderPriority,
      description: fd.get('description') as string,
    });
  };

  if (isLoading) return <SkeletonList />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Órdenes de Trabajo</h1>
          <p>{workOrders.length} órdenes registradas</p>
        </div>
        <div className="page-header-actions">
          <button className="primary" onClick={openCreate}>
            <Plus size={14} /> Nueva OT
          </button>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="search-wrapper">
          <Search size={15} />
          <input
            placeholder="Buscar por código o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | '')}
        >
          <option value="">Todos los estados</option>
          {['PENDIENTE', 'ASIGNADA', 'EN_EJECUCION', 'PAUSADA', 'COMPLETADA', 'CANCELADA'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={workOrders.length === 0 ? 'No hay órdenes registradas' : 'Sin resultados'}
            description={workOrders.length === 0 ? 'Crea la primera orden de trabajo' : 'Prueba con otros filtros'}
            action={workOrders.length === 0 ? { label: '+ Nueva OT', onClick: openCreate } : undefined}
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
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.code}</strong></td>
                  <td>{w.type}</td>
                  <td><StatusBadge status={w.priority} /></td>
                  <td><StatusBadge status={w.status} /></td>
                  <td className="description-cell">{w.description}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="ghost"
                        onClick={() => openHistory(w)}
                        title="Historial"
                        disabled={isAnyActionPending}
                      >
                        <History size={14} />
                      </button>

                      {w.status === 'PENDIENTE' && (
                        <button
                          className="primary"
                          onClick={() => openAssign(w)}
                          title="Asignar cuadrilla"
                          disabled={assignM.isPending}
                        >
                          <UserPlus size={14} /> Asignar
                        </button>
                      )}

                      {w.status === 'ASIGNADA' && (
                        <button
                          className="primary"
                          onClick={() => startM.mutate(w.id)}
                          title="Iniciar"
                          disabled={startM.isPending}
                        >
                          <Play size={14} />
                          {startM.isPending && startM.variables === w.id ? 'Iniciando...' : 'Iniciar'}
                        </button>
                      )}

                      {w.status === 'EN_EJECUCION' && (
                        <>
                          <button
                            className="secondary"
                            onClick={() => pauseM.mutate(w.id)}
                            title="Pausar"
                            disabled={pauseM.isPending}
                          >
                            <Pause size={14} />
                          </button>
                          <button
                            className="primary"
                            onClick={() => openComplete(w)}
                            title="Completar"
                            disabled={completeM.isPending}
                          >
                            <CheckCircle2 size={14} /> Completar
                          </button>
                        </>
                      )}

                      {w.status === 'PAUSADA' && (
                        <button
                          className="primary"
                          onClick={() => resumeM.mutate(w.id)}
                          title="Reanudar"
                          disabled={resumeM.isPending}
                        >
                          <RotateCcw size={14} />
                          {resumeM.isPending && resumeM.variables === w.id ? 'Reanudando...' : 'Reanudar'}
                        </button>
                      )}

                      {!['COMPLETADA', 'CANCELADA'].includes(w.status) && (
                        <button
                          className="ghost"
                          onClick={() => openCancel(w)}
                          title="Cancelar"
                          disabled={cancelM.isPending}
                          style={{ color: 'var(--danger)' }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear OT */}
      <Modal open={modal === 'create'} onClose={close} title="Nueva Orden de Trabajo" subtitle="Planifica una actividad">
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleCreate}>
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
              {['BAJA', 'MEDIA', 'ALTA', 'CRITICA'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción <span className="required">*</span></label>
            <textarea name="description" required rows={3} minLength={5} placeholder="Describe la actividad..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="primary" disabled={createM.isPending}>
              {createM.isPending ? 'Guardando...' : 'Crear OT'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Asignar Cuadrilla */}
      <Modal open={modal === 'assign'} onClose={close} title="Asignar cuadrilla" subtitle={`${selected?.code} — ${selected?.type}`}>
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            assignM.mutate({ id: selected.id, crewId: fd.get('crew_id') as string });
          }}>
            <div className="form-group">
              <label>Cuadrilla disponible <span className="required">*</span></label>
              <select name="crew_id" required defaultValue="">
                <option value="" disabled>Seleccione cuadrilla</option>
                {crews.filter((c) => c.status === 'DISPONIBLE').map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.specialty})</option>
                ))}
              </select>
            </div>
            {crews.filter((c) => c.status === 'DISPONIBLE').length === 0 && (
              <div className="error warning-message">
                No hay cuadrillas disponibles. Crea o libera una primero.
              </div>
            )}
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={close}>Cancelar</button>
              <button
                type="submit"
                className="primary"
                disabled={assignM.isPending || crews.filter((c) => c.status === 'DISPONIBLE').length === 0}
              >
                {assignM.isPending ? 'Asignando...' : 'Asignar cuadrilla'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Completar */}
      <Modal open={modal === 'complete'} onClose={close} title="Completar OT" subtitle={`${selected?.code}`}>
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            completeM.mutate({ id: selected.id, resolution: fd.get('resolution') as string });
          }}>
            <div className="form-group">
              <label>Resolución <span className="required">*</span></label>
              <textarea name="resolution" required rows={4} minLength={5} placeholder="Describe la resolución aplicada..." />
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={close}>Cancelar</button>
              <button type="submit" className="primary" disabled={completeM.isPending}>
                {completeM.isPending ? 'Completando...' : 'Completar OT'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Cancelar */}
      <Modal open={modal === 'cancel'} onClose={close} title="Cancelar OT" subtitle={`${selected?.code}`}>
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            cancelM.mutate({ id: selected.id, reason: fd.get('reason') as string });
          }}>
            <div className="form-group">
              <label>Motivo de cancelación <span className="required">*</span></label>
              <textarea name="reason" required rows={3} minLength={5} placeholder="Describe el motivo..." />
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={close}>Volver</button>
              <button type="submit" className="danger" disabled={cancelM.isPending}>
                {cancelM.isPending ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Drawer Historial */}
      {modal === 'history' && selected && (
        <div className="drawer-overlay" onClick={close}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>Historial de cambios</h3>
                <div className="drawer-subtitle">{selected.code} — {selected.type}</div>
              </div>
              <button className="ghost icon-only" onClick={close}>✕</button>
            </div>
            <div className="drawer-body">
              {history.length === 0 ? (
                <p className="empty-drawer-message">Sin cambios registrados</p>
              ) : (
                history.map((h: any) => (
                  <div key={h.id} className="history-item">
                    <div className="history-dot" />
                    <div className="history-content">
                      <div className="history-title">{h.change_type}</div>
                      {h.description && <div className="history-desc">{h.description}</div>}
                      {h.previous_value && h.new_value && (
                        <div className="history-transition">
                          <StatusBadge status={h.previous_value} /> → <StatusBadge status={h.new_value} />
                        </div>
                      )}
                      <div className="history-meta">
                        {new Date(h.changed_at).toLocaleString()} · {h.changed_by || 'sistema'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}