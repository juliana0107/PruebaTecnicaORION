import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Cpu, Pencil, History, ArrowRightLeft, X } from 'lucide-react';
import { assetsApi, catalogsApi } from '../api/endpoints';
import type { Asset, AssetCriticality, AssetStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';

type ModalType = 'create' | 'edit' | 'status' | 'history' | null;

const ASSET_STATUSES: AssetStatus[] = ['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO', 'RETIRADO'];
const CRITICALITIES: AssetCriticality[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

export function AssetsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');

  const { data: assets = [], isLoading } = useQuery({ queryKey: ['assets'], queryFn: assetsApi.list });
  const { data: types = [] } = useQuery({ queryKey: ['asset-types'], queryFn: catalogsApi.assetTypes });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: catalogsApi.locations });
  const { data: history = [] } = useQuery({
    queryKey: ['asset-history', selected?.id],
    queryFn: () => assetsApi.history(selected!.id),
    enabled: modal === 'history' && !!selected,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['assets'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createM = useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => { invalidate(); close(); toast.success('Activo creado'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: any) => assetsApi.update(id, data),
    onSuccess: () => { invalidate(); close(); toast.success('Activo actualizado'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const statusM = useMutation({
    mutationFn: ({ id, status, reason }: any) => assetsApi.changeStatus(id, status, reason),
    onSuccess: () => { invalidate(); close(); toast.success('Estado actualizado'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const close = () => {
    setModal(null);
    setSelected(null);
    setError(null);
  };

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [assets, search, statusFilter]);

  const openCreate = () => { setSelected(null); setModal('create'); };
  const openEdit = (a: Asset) => { setSelected(a); setModal('edit'); };
  const openStatus = (a: Asset) => { setSelected(a); setModal('status'); };
  const openHistory = (a: Asset) => { setSelected(a); setModal('history'); };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createM.mutate({
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      asset_type_id: Number(fd.get('asset_type_id')),
      location_id: fd.get('location_id') ? Number(fd.get('location_id')) : null,
      criticality: fd.get('criticality') as AssetCriticality,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    updateM.mutate({
      id: selected.id,
      data: {
        name: fd.get('name') as string,
        asset_type_id: Number(fd.get('asset_type_id')),
        location_id: fd.get('location_id') ? Number(fd.get('location_id')) : null,
        criticality: fd.get('criticality') as AssetCriticality,
      },
    });
  };

  const handleStatus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    statusM.mutate({
      id: selected.id,
      status: fd.get('status') as string,
      reason: (fd.get('reason') as string) || undefined,
    });
  };

  if (isLoading) return <SkeletonList />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Activos ITS</h1>
          <p>{assets.length} activos registrados</p>
        </div>
        <div className="page-header-actions">
          <button className="primary" onClick={openCreate}><Plus size={14} /> Nuevo activo</button>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="search-wrapper">
            <Search size={15} />
            <input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')}
        >
            <option value="">Todos los estados</option>
            {ASSET_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        {(search || statusFilter) && (
            <button
            className="toolbar-clear"
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            title="Limpiar filtros"
            >
            <X size={15} />
            </button>
        )}
        </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title={assets.length === 0 ? 'No hay activos registrados' : 'Sin resultados'}
            description="Crea el primer activo ITS para comenzar"
            action={assets.length === 0 ? { label: '+ Nuevo activo', onClick: openCreate } : undefined}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Criticidad</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.code}</strong></td>
                  <td>{a.name}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><StatusBadge status={a.criticality} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="ghost" onClick={() => openHistory(a)} title="Historial"><History size={14} /></button>
                      <button className="ghost" onClick={() => openEdit(a)} title="Editar" disabled={a.status === 'RETIRADO'}><Pencil size={14} /></button>
                      <button className="ghost" onClick={() => openStatus(a)} title="Cambiar estado" disabled={a.status === 'RETIRADO'}><ArrowRightLeft size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear */}
      <Modal open={modal === 'create'} onClose={close} title="Nuevo activo ITS" subtitle="Registra un activo en el inventario">
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Código <span className="required">*</span></label>
            <input name="code" required minLength={3} maxLength={50} placeholder="PMV-COR1-001" />
          </div>
          <div className="form-group">
            <label>Nombre <span className="required">*</span></label>
            <input name="name" required minLength={3} maxLength={150} />
          </div>
          <div className="form-group">
            <label>Tipo <span className="required">*</span></label>
            <select name="asset_type_id" required defaultValue="">
              <option value="" disabled>Seleccione tipo</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Corredor</label>
            <select name="location_id" defaultValue="">
              <option value="">Sin asignar</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Criticidad</label>
            <select name="criticality" defaultValue="MEDIA">
              {CRITICALITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="primary" disabled={createM.isPending}>
              {createM.isPending ? 'Guardando...' : 'Crear activo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={modal === 'edit'} onClose={close} title={`Editar ${selected?.code}`} subtitle="Modifica la información permitida">
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={handleEdit}>
            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input name="name" required defaultValue={selected.name} minLength={3} />
            </div>
            <div className="form-group">
              <label>Tipo <span className="required">*</span></label>
              <select name="asset_type_id" required defaultValue={String(selected.asset_type_id)}>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Corredor</label>
              <select name="location_id" defaultValue={selected.location_id ? String(selected.location_id) : ''}>
                <option value="">Sin asignar</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Criticidad</label>
              <select name="criticality" defaultValue={selected.criticality}>
                {CRITICALITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={close}>Cancelar</button>
              <button type="submit" className="primary" disabled={updateM.isPending}>
                {updateM.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Cambiar Estado */}
      <Modal open={modal === 'status'} onClose={close} title="Cambiar estado" subtitle={selected?.code}>
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={handleStatus}>
            <div className="form-group">
              <label>Estado actual</label>
              <div><StatusBadge status={selected.status} /></div>
            </div>
            <div className="form-group">
              <label>Nuevo estado <span className="required">*</span></label>
              <select name="status" required defaultValue="">
                <option value="" disabled>Seleccione nuevo estado</option>
                {ASSET_STATUSES.filter((s) => s !== selected.status).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Motivo (opcional)</label>
              <textarea name="reason" rows={2} placeholder="Describe el motivo del cambio..." />
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={close}>Cancelar</button>
              <button type="submit" className="primary" disabled={statusM.isPending}>
                {statusM.isPending ? 'Cambiando...' : 'Cambiar estado'}
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
                <div className="drawer-subtitle">{selected.code} — {selected.name}</div>
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