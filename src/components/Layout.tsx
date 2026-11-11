import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { Logo } from './Logo.js';

const ENLACES = [
  { a: '/', texto: 'Dashboard', fin: true },
  { a: '/gastos', texto: 'Gastos' },
  { a: '/categorias', texto: 'Categorías' },
  { a: '/presupuestos', texto: 'Presupuestos' },
  { a: '/perfil', texto: 'Perfil' },
];

export function Layout() {
  const salir = useAuth((estado) => estado.salir);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    salir();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="brand" aria-label="Mangos, inicio">
            <Logo size={38} />
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
                {enlace.texto}
              </NavLink>
            ))}
            <button type="button" className="boton boton--chico" onClick={cerrarSesion}>
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        Mangos · gestor de gastos personales · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
