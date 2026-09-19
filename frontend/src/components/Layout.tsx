import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Cpu, ClipboardList, Users } from 'lucide-react';

const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Indicadores operacionales' },
  '/assets': { title: 'Activos ITS', subtitle: 'Inventario de infraestructura' },
  '/work-orders': { title: 'Órdenes de Trabajo', subtitle: 'Planificación y control de mantenimiento' },
  '/crews': { title: 'Cuadrillas', subtitle: 'Asignación y disponibilidad' },
};

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Activos', icon: Cpu },
  { to: '/work-orders', label: 'Órdenes', icon: ClipboardList },
  { to: '/crews', label: 'Cuadrillas', icon: Users },
];

export function Layout() {
  const location = useLocation();
  const pageInfo = PAGE_INFO[location.pathname] || { title: 'ORION', subtitle: '' };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">O</div>
          <div>
            <div className="name">ORION</div>
            <div className="tagline">Maintenance Lite</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Operación</div>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          © 2026 Autopistas Inteligentes S.A.
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{pageInfo.title}</div>
            <div className="topbar-subtitle">{pageInfo.subtitle}</div>
          </div>
        </header>
        <main className="container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}