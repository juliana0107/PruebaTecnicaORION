import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Search } from 'lucide-react';
import { crewsApi } from '../api/endpoints';
import type { Crew, CrewSpecialty, CrewStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';

export function CrewsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CrewStatus | ''>('');

  const { data: crews = [], isLoading } = useQuery({ queryKey: ['crews'], queryFn: crewsApi.list });

  const createMutation = useMutation({
    mutationFn: crewsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crews'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowModal(false);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const filtered = useMemo(() => {
    return crews.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [crews, search, statusFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      specialty: fd.get('specialty') as CrewSpecialty,
      zone: fd.get('zone') as string,
      leader: fd.get('leader') as string,
    });
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Cuadrillas</h1>
          <p>{crews.length} cuadrillas registradas</p>
        </div>
        <div className="page-header-actions">
          <button className="primary" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            Nueva cuadrilla
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CrewStatus | '')} style={{ maxWidth: 200 }}>
          <option value="">Todos los estados</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="ASIGNADA">Asignada</option>
          <option value="EN_EJECUCION">En Ejecución</option>
          <option value="NO_DISPONIBLE">No Disponible</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={crews.length === 0 ? 'No hay cuadrillas registradas' : 'Sin resultados'}
            description="Crea la primera cuadrilla para asignar órdenes de trabajo"
            action={crews.length === 0 ? { label: '+ Nueva cuadrilla', onClick: () => setShowModal(true) } : undefined}
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: Crew) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}</td>
                  <td><span className="badge purple">{c.specialty}</span></td>
                  <td>{c.zone}</td>
                  <td>{c.leader}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setError(null); }}
        title="Nueva cuadrilla"
        subtitle="Registra un equipo de trabajo"
      >
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
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
              <option value="PMV">PMV</option>
              <option value="CCTV">CCTV</option>
              <option value="METEO">Meteorología</option>
              <option value="SENSORES">Sensores</option>
              <option value="AFORADORES">Aforadores</option>
              <option value="GENERAL">General</option>
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
            <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Crear cuadrilla'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}