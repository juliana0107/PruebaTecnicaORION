import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Search, Pencil, ArrowRightLeft, X } from 'lucide-react';
import { crewsApi } from '../api/endpoints';
import type { Crew, CrewSpecialty, CrewStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '../auth/permissions';

type ModalType = 'create' | 'edit' | 'status' | null;

const SPECIALTIES: CrewSpecialty[] = ['PMV', 'CCTV', 'METEO', 'SENSORES', 'AFORADORES', 'GENERAL'];
const STATUSES: CrewStatus[] = ['DISPONIBLE', 'ASIGNADA', 'EN_EJECUCION', 'NO_DISPONIBLE', 'INACTIVA'];

export function CrewsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const canManage = PERMISSIONS.canManageCrews(user?.role);

  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Crew | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CrewStatus | ''>('');

  const { data: crews = [], isLoading } = useQuery({ queryKey: ['crews'], queryFn: crewsApi.list });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['crews'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createM = useMutation({
    mutationFn: crewsApi.create,
    onSuccess: () => { invalidate(); close(); toast.success('Cuadrilla creada'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: any) => crewsApi.update(id, data),
    onSuccess: () => { invalidate(); close(); toast.success('Cuadrilla actualizada'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: any) => crewsApi.changeStatus(id, status),
    onSuccess: () => { invalidate(); close(); toast.success('Estado actualizado'); },
    onError: (e: Error) => { setError(e.message); toast.error('Error', e.message); },
  });

  const close = () => { setModal(null); setSelected(null); setError(null); };
  const openCreate = () => { setSelected(null); setModal('create'); };
  const openEdit = (c: Crew) => { setSelected(c); setModal('edit'); };
  const openStatus = (c: Crew) => { setSelected(c); setModal('status'); };

  const filtered = useMemo(() => {
    return crews.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [crews, search, statusFilter]);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createM.mutate({
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      specialty: fd.get('specialty') as CrewSpecialty,
      zone: fd.get('zone') as string,
      leader: fd.get('leader') as string,
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
        specialty: fd.get('specialty') as CrewSpecialty,
        zone: fd.get('zone') as string,
        leader: fd.get('leader') as string,
      },
    });
  };

  if (isLoading) return <SkeletonList />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Cuadrillas</h1>
          <p>{crews.length} cuadrillas registradas</p>
        </div>
        <div className="page-header-actions">
          {canManage && (
            <button className="primary" onClick={openCreate}>
              <Plus size={14} /> Nueva cuadrilla
            </button>
          )}
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
          onChange={(e) => setStatusFilter(e.target.value as CrewStatus | '')}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
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
            icon={Users}
            title={crews.length === 0 ? 'No hay cuadrillas registradas' : 'Sin resultados'}
            description="Crea la primera cuadrilla para asignarla a órdenes"
            action={canManage && crews.length === 0 ? { label: '+ Nueva cuadrilla', onClick: openCreate } : undefined}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Zona</th>
                <th>Líder</th>
                <th>Estado</th>
                {canManage && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}</td>
                  <td><span className="badge purple">{c.specialty}</span></td>
                  <td>{c.zone}</td>
                  <td>{c.leader}</td>
                  <td><StatusBadge status={c.status} /></td>
                  {canManage && (
                    <td>
                      <div className="row-actions">
                        <button
                          className="ghost"
                          onClick={() => openEdit(c)}
                          title="Editar"
                          disabled={c.status === 'INACTIVA' || c.status === 'EN_EJECUCION'}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="ghost"
                          onClick={() => openStatus(c)}
                          title="Cambiar estado"
                          disabled={c.status === 'INACTIVA'}
                        >
                          <ArrowRightLeft size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear */}
      <Modal open={modal === 'create'} onClose={close} title="Nueva cuadrilla" subtitle="Registra un equipo de trabajo">
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Código <span className="required">*</span></label>
            <input name="code" required placeholder="CUA-COR1-001" minLength={3} />
          </div>
          <div className="form-group">
            <label>Nombre <span className="required">*</span></label>
            <input name="name" required placeholder="Cuadrilla PMV Corredor 1" minLength={3} />
          </div>
          <div className="form-group">
            <label>Especialidad <span className="required">*</span></label>
            <select name="specialty" required defaultValue="GENERAL">
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Zona <span className="required">*</span></label>
            <input name="zone" required placeholder="COR1" minLength={2} />
          </div>
          <div className="form-group">
            <label>Líder <span className="required">*</span></label>
            <input name="leader" required placeholder="Juan Pérez" minLength={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={close}>Cancelar</button>
            <button type="submit" className="primary" disabled={createM.isPending}>
              {createM.isPending ? 'Guardando...' : 'Crear cuadrilla'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={modal === 'edit'} onClose={close} title={`Editar ${selected?.code}`} subtitle="Modifica la información">
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={handleEdit}>
            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input name="name" required defaultValue={selected.name} minLength={3} />
            </div>
            <div className="form-group">
              <label>Especialidad <span className="required">*</span></label>
              <select name="specialty" required defaultValue={selected.specialty}>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Zona <span className="required">*</span></label>
              <input name="zone" required defaultValue={selected.zone} minLength={2} />
            </div>
            <div className="form-group">
              <label>Líder <span className="required">*</span></label>
              <input name="leader" required defaultValue={selected.leader} minLength={3} />
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

      {/* Modal Estado */}
      <Modal open={modal === 'status'} onClose={close} title="Cambiar estado" subtitle={selected?.code}>
        {error && <div className="error">{error}</div>}
        {selected && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            statusM.mutate({ id: selected.id, status: fd.get('status') as string });
          }}>
            <div className="form-group">
              <label>Estado actual</label>
              <div><StatusBadge status={selected.status} /></div>
            </div>
            <div className="form-group">
              <label>Nuevo estado <span className="required">*</span></label>
              <select name="status" required defaultValue="">
                <option value="" disabled>Seleccione nuevo estado</option>
                {STATUSES.filter((s) => s !== selected.status).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
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
    </div>
  );
}