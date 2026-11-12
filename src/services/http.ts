const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000';

let tokenActual: string | null = null;

/** Token que se adjunta a las peticiones autenticadas. */
export function setToken(token: string | null): void {
  tokenActual = token;
}

export const API_URL = BASE;

/** Error HTTP con status y mensaje del backend. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function leerMensaje(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(', ');
    if (typeof data.message === 'string') return data.message;
  } catch {
    // El cuerpo no era JSON: se usa el status.
  }
  return `Error ${res.status}`;
}

export interface OpcionesPedido {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
}

/** Petición JSON tipada con token opcional. */
export async function pedir<T>(
  ruta: string,
  opciones: OpcionesPedido = {},
): Promise<T> {
  const url = new URL(`${BASE}${ruta}`);

  for (const [clave, valor] of Object.entries(opciones.params ?? {})) {
    if (valor !== undefined && valor !== '') {
      url.searchParams.set(clave, String(valor));
    }
  }

  const esFormData =
    typeof FormData !== 'undefined' && opciones.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (opciones.body !== undefined && !esFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (opciones.auth !== false && tokenActual) {
    headers.Authorization = `Bearer ${tokenActual}`;
  }

  const res = await fetch(url, {
    method: opciones.method ?? 'GET',
    headers,
    body:
      opciones.body === undefined
        ? undefined
        : esFormData
          ? (opciones.body as FormData)
          : JSON.stringify(opciones.body),
  });

  if (!res.ok) throw new ApiError(await leerMensaje(res), res.status);
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
