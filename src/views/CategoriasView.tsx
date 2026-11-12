import { useState } from 'react';
import { useCategorias } from '../hooks/datos.js';
import { categoriasService } from '../services/categorias.service.js';
import { mensajeDeError } from '../utils/format.js';
import { Widget } from '../components/Widget.js';
import { Loading } from '../components/Loading.js';
import { ErrorState } from '../components/ErrorState.js';
import { PageHeader } from '../components/PageHeader.js';

export function CategoriasView() {
  const categorias = useCategorias();
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const crear = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nombre.trim().length < 2) {
      setError('El nombre tiene que tener al menos 2 letras.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await categoriasService.crear(nombre.trim());
      setNombre('');
      categorias.recargar();
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    } finally {
      setGuardando(false);
    }
  };

  const renombrar = async (id: number, actual: string) => {
    const nuevo = window.prompt('Nuevo nombre de la categoría', actual);
    if (!nuevo || nuevo.trim() === actual) return;
    try {
      await categoriasService.actualizar(id, nuevo.trim());
      categorias.recargar();
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    }
  };

  const eliminar = async (id: number, nombreCategoria: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) return;
    try {
      await categoriasService.eliminar(id);
      categorias.recargar();
    } catch (fallo) {
      setError(mensajeDeError(fallo));
    }
  };

  return (
    <div className="grid">
      <PageHeader titulo="Categorías" />
      <Widget titulo="Tus categorías" tag={`${categorias.data?.length ?? 0}`} className="span-12">
        {error ? (
          <p className="alerta" role="alert">
            {error}
          </p>
        ) : null}

        <form className="fila" onSubmit={crear}>
          <label className="campo" style={{ flex: 1 }}>
            <span className="campo__label">Nueva categoría</span>
            <input
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              placeholder="Ej: Mascotas"
            />
          </label>
          <button type="submit" className="boton boton--primario" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear'}
          </button>
        </form>

        <div style={{ marginTop: 18 }}>
          {categorias.cargando ? (
            <Loading />
          ) : categorias.error ? (
            <ErrorState mensaje={categorias.error} onReintentar={categorias.recargar} />
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(categorias.data ?? []).map((categoria) => (
                  <tr key={categoria.id}>
                    <td>{categoria.nombre}</td>
                    <td>
                      {categoria.default ? (
                        <span className="meta" aria-label="Categoría del sistema">
                          —
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="boton boton--chico"
                            onClick={() => renombrar(categoria.id, categoria.nombre)}
                          >
                            Renombrar
                          </button>{' '}
                          <button
                            type="button"
                            className="boton boton--chico boton--peligro"
                            onClick={() => eliminar(categoria.id, categoria.nombre)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Widget>
    </div>
  );
}
