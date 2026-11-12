<!-- calidad:inicio -->
![Calidad](https://img.shields.io/badge/Calidad-sin%20c%C3%B3digo-lightgrey)

**Calidad de servicios:** sin código en `main` (no evaluable).
<!-- calidad:fin -->

# front-web

Cliente web de **Mangos**, el gestor de gastos personales. React + Vite +
TypeScript, con una interfaz simple y funcional y la identidad visual de la
marca.

## Requisitos

- Node 20+
- `api-gastos` corriendo en `http://localhost:3000`
- `servicio-ia` y `bot-telegram` no son necesarios para la web

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev               # http://localhost:5173
```

```bash
npm run build             # typecheck + build de producción
npm test                  # suite de tests
npm run test:cov          # tests + cobertura
```

## Funcionalidad

- **Sesión**: registro y login con JWT; el token se restaura al recargar y se
  valida contra `GET /auth/me`.
- **Dashboard**: tablero ajustable con selector global de período. Los widgets
  se pueden reordenar (arrastrar o botones), redimensionar (4/6/8/12 columnas),
  quitar y volver a agregar; el layout se guarda por usuario en el navegador.
  Widgets: total, gasto por categoría, evolución, últimos gastos, historial y
  presupuestos.
- **Gastos**: alta, edición, borrado y listado con filtros por período y
  categoría, con paginación.
- **Categorías**: alta, renombrado y baja.
- **Presupuestos**: tope mensual por categoría y comparación contra el gasto
  real.
- **Perfil**: datos de la cuenta y cierre de sesión.

## Arquitectura

```text
src/
  views/        pantallas (login, dashboard, gastos, categorías, presupuestos, perfil)
  components/   piezas de UI (widgets, tablas, formularios, estados)
  services/     acceso HTTP a api-gastos (sin fetch en componentes)
  state/        stores de sesión y período (zustand)
  hooks/        carga de datos y estado async
  utils/        formato y cálculo de períodos
```

Capas separadas para cumplir la rúbrica: vistas, componentes, servicios,
estado y hooks. Los componentes no llaman a `fetch`/`axios` directamente.

## Contratos que consume

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /gastos?page&limit&fechaInicio&fechaFin&categoriaId` (fechas `DD-MM-YYYY`)
- `POST /gastos`, `PATCH /gastos/:id`, `DELETE /gastos/:id`
- `GET /gastos/resumen?desde&hasta`
- `GET /gastos/serie?desde&hasta&agrupacion=dia|semana|mes`
- `GET /categorias`, `POST /categorias`, `PATCH /categorias/:id`, `DELETE /categorias/:id`
- `GET /presupuestos/mios?mes&anio`, `POST /presupuestos/mios`

## Tests y cobertura

78 tests con Vitest + Testing Library. Cobertura de líneas ~95% y artefacto
publicado en `coverage/coverage-summary.json`.

## Diseño

La dirección visual, la paleta y las reglas de contenido están documentadas en
[`docs/DISENO.md`](docs/DISENO.md).

El logo es la vectorización del logo de Mangos provista por el proyecto,
recortada al área del mango y sin fondo.
