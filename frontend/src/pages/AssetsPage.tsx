import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Cpu } from 'lucide-react';
import { assetsApi, catalogsApi } from '../api/endpoints';
import type { Asset, AssetCriticality, AssetStatus } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';

export function AssetsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsApi.list(),
  });

  const { data: types = [] } = useQuery({ queryKey: ['asset-types'], queryFn: catalogsApi.assetTypes });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: catalogsApi.locations });

  const createMutation = useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowModal(false);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      asset_type_id: Number(fd.get('asset_type_id')),
      location_id: fd.get('location_id') ? Number(fd.get('location_id')) : null,
      criticality: fd.get('criticality') as AssetCriticality,
    });
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Activos ITS</h1>
          <p>{assets.length} activos registrados</p>
        </div>
        <div className="page-header-actions">
          <button className="primary" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            Nuevo activo
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')} style={{ maxWidth: 200 }}>
          <option value="">Todos los estados</option>
          <option value="OPERATIVO">Operativo</option>
          <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
          <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
          <option value="RETIRADO">Retirado</option>
        </select>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title={assets.length === 0 ? 'No hay activos registrados' : 'Sin resultados'}
            description={assets.length === 0 ? 'Crea el primer activo ITS para comenzar' : 'Prueba con otros filtros de búsqueda'}
            action={assets.length === 0 ? { label: '+ Nuevo activo', onClick: () => setShowModal(true) } : undefined}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Criticidad</th>
                <th>Instalación</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: Asset) => (
                <tr key={a.id}>
                  <td><strong>{a.code}</strong></td>
                  <td>{a.name}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><StatusBadge status={a.criticality} /></td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {a.installed_at ? new Date(a.installed_at).toLocaleDateString() : '—'}
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
        title="Nuevo activo ITS"
        subtitle="Registra un nuevo activo en el inventario"
      >
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código <span className="required">*</span></label>
            <input name="code" required minLength={3} maxLength={50} placeholder="PMV-COR1-001" />
          </div>
          <div className="form-group">
            <label>Nombre <span className="required">*</span></label>
            <input name="name" required minLength={3} maxLength={150} placeholder="PMV Corredor 1" />
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
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Crear activo'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}