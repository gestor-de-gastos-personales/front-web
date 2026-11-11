import { Link } from 'react-router-dom';

export function NotFoundView() {
  return (
    <div className="grid">
      <section className="widget span-12">
        <h1 className="total">404</h1>
        <p className="mono">Esa pantalla no existe.</p>
        <p style={{ marginTop: 12 }}>
          <Link to="/" className="boton">
            Volver al dashboard
          </Link>
        </p>
      </section>
    </div>
  );
}
