import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cpu, ClipboardList, Users, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '../auth/permissions';

const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Indicadores operacionales' },
  '/assets': { title: 'Activos ITS', subtitle: 'Inventario de infraestructura' },
  '/work-orders': { title: 'Órdenes de Trabajo', subtitle: 'Planificación y control' },
  '/crews': { title: 'Cuadrillas', subtitle: 'Asignación y disponibilidad' },
};

const ALL_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, visible: PERMISSIONS.canViewDashboard },
  { to: '/assets', label: 'Activos', icon: Cpu, visible: () => true },
  { to: '/work-orders', label: 'Órdenes', icon: ClipboardList, visible: () => true },
  { to: '/crews', label: 'Cuadrillas', icon: Users, visible: () => true },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pageInfo = PAGE_INFO[location.pathname] || { title: 'ORION', subtitle: '' };

  useEffect(() => {
    if (user?.role === 'TECHNICIAN' && location.pathname === '/') {
      navigate('/work-orders', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

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
          {ALL_NAV_ITEMS.filter((item) => item.visible(user?.role)).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Sistema operativo
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">{pageInfo.title}</div>
              <div className="topbar-subtitle">{pageInfo.subtitle}</div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="ghost icon-only" aria-label="Notificaciones">
              <Bell size={16} />
            </button>
            <div className="topbar-avatar" title={user?.name || 'Usuario'}>
              {initials}
            </div>
            <button
              className="ghost icon-only"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}