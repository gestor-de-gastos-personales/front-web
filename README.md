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
- **Dashboard**: tablero **GridStack** (12 columnas en escritorio, 1 en mobile)
  sin selector global de período y con **modo edición**: “Editar” habilita el
  arrastre, el resize nativo, agregar/restablecer y quitar; “Listo” vuelve a la
  vista de solo lectura. Los widgets se pueden repetir (por ejemplo, dos
  gráficos), reordenar arrastrando desde el encabezado de la tarjeta (las
  tarjetas se reacomodan y compactan con animación) o con los botones ←/→,
  redimensionar desde la esquina inferior derecha y quitar. Cada tipo de widget
  tiene un tamaño mínimo legible (4–8 columnas y 4–8 filas) para que el
  contenido no quede cortado. Al agregar, el picker confirma “Agregado
  correctamente”; “Restablecer” pide confirmación antes de volver al layout
  inicial. Total, gasto por categoría y evolución tienen **período propio**
  (hoy, esta semana, este mes, mes anterior, últimos 15 días, últimos 3 meses o
  este año); presupuestos e historial usan el mes actual. Los gráficos usan una
  **paleta de colores** por categoría y por punto de la serie, y el gráfico de
  evolución se adapta al alto del widget sin desbordarse al ensancharlo. El
  layout (posición, tamaño y período por widget) se guarda por usuario en el
  navegador y se migra desde el formato anterior. Widgets: total, gasto por
  categoría, evolución, presupuestos e historial.
- **Gastos**: alta, edición, borrado y listado con filtros por período,
  categoría y rango de monto (`montoMin` / `montoMax`), con paginación.
- **Categorías**: alta de categorías propias; las del sistema son de solo
  lectura y solo las propias se pueden renombrar o eliminar.
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
  widgets/      grilla GridStack, catálogo y layout persistente
  utils/        formato y cálculo de períodos
```

Capas separadas para cumplir la rúbrica: vistas, componentes, servicios,
estado y hooks. Los componentes no llaman a `fetch`/`axios` directamente.

## Contratos que consume

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /gastos?page&limit&fechaInicio&fechaFin&categoriaId&montoMin&montoMax` (fechas `DD-MM-YYYY`)
- `POST /gastos`, `PATCH /gastos/:id`, `DELETE /gastos/:id`
- `GET /gastos/resumen?desde&hasta`
- `GET /gastos/serie?desde&hasta&agrupacion=dia|semana|mes`
- `GET /categorias`, `POST /categorias`, `PATCH /categorias/:id`, `DELETE /categorias/:id`
- `GET /presupuestos/mios?mes&anio`, `POST /presupuestos/mios`

## Tests y cobertura

120 tests con Vitest + Testing Library. Cobertura de líneas ~96% (se genera
localmente con `npm run test:cov`; el artefacto no se versiona).

## Diseño

La dirección visual, la paleta y las reglas de contenido están documentadas en
[`docs/DISENO.md`](docs/DISENO.md).

El logo es la vectorización del logo de Mangos provista por el proyecto,
recortada al área del mango y sin fondo.
