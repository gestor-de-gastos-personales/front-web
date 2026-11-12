import type { ReactNode } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { Logo } from './Logo.js';

const ICONOS: Record<string, ReactNode> = {
  panel: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  lista: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="3.5" cy="18" r="1" />
    </>
  ),
  etiqueta: (
    <>
      <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  objetivo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  usuario: (
    <>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </>
  ),
};

const ENLACES = [
  { a: '/', texto: 'Dashboard', fin: true, icono: 'panel' },
  { a: '/gastos', texto: 'Gastos', icono: 'lista' },
  { a: '/categorias', texto: 'Categorías', icono: 'etiqueta' },
  { a: '/presupuestos', texto: 'Presupuestos', icono: 'objetivo' },
  { a: '/perfil', texto: 'Perfil', icono: 'usuario' },
];

function Icono({ tipo }: { tipo: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONOS[tipo]}
    </svg>
  );
}

export function Layout() {
  const usuario = useAuth((estado) => estado.usuario);
  const salir = useAuth((estado) => estado.salir);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    salir();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Mangos, inicio">
          <Logo size={30} />
          <span className="brand__name">mangos</span>
        </Link>

        <nav className="nav" aria-label="Principal">
          {ENLACES.map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              end={enlace.fin}
              className={({ isActive }) =>
                `nav__link${isActive ? ' nav__link--activo' : ''}`
              }
            >
              <Icono tipo={enlace.icono} />
              <span>{enlace.texto}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          {usuario ? (
            <div className="sidebar__user">
              <span className="sidebar__name">{usuario.nombre ?? ''}</span>
              <span className="sidebar__email">{usuario.email ?? ''}</span>
            </div>
          ) : null}
          <button
            type="button"
            className="boton boton--fantasma boton--chico"
            onClick={cerrarSesion}
          >
            Salir
          </button>
        </div>
      </aside>

      <div className="content">
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
