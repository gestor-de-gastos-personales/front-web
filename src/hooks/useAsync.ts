import { useCallback, useEffect, useState } from 'react';
import { mensajeDeError } from '../utils/format.js';

interface EstadoAsync<T> {
  data: T | null;
  cargando: boolean;
  error: string | null;
}

/**
 * Ejecuta una promesa al montar y cuando cambian las dependencias.
 * `recargar` fuerza una nueva ejecución.
 */
export function useAsync<T>(
  cargar: () => Promise<T>,
  deps: unknown[],
): EstadoAsync<T> & { recargar: () => void } {
  const [estado, setEstado] = useState<EstadoAsync<T>>({
    data: null,
    cargando: true,
    error: null,
  });
  const [tick, setTick] = useState(0);

  const recargar = useCallback(() => setTick((valor) => valor + 1), []);

  useEffect(() => {
    let vivo = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    cargar()
      .then((data) => {
        if (vivo) setEstado({ data, cargando: false, error: null });
      })
      .catch((error: unknown) => {
        if (vivo) setEstado({ data: null, cargando: false, error: mensajeDeError(error) });
      });

    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...estado, recargar };
}
