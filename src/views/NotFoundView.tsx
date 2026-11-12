import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.js';

export function NotFoundView() {
  return (
    <div className="grid">
      <PageHeader titulo="Página no encontrada" />
      <section className="widget span-12">
        <p className="total">404</p>
        <p className="meta">Esa pantalla no existe.</p>
        <p style={{ marginTop: 12 }}>
          <Link to="/" className="boton">
            Volver al dashboard
          </Link>
        </p>
      </section>
    </div>
  );
}
